import type { NextRequest } from "next/server";

/** An error carrying an explicit HTTP status (e.g. request validation). */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}

function jsonError(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

/** Map any thrown value to a JSON error Response. */
export function toErrorResponse(err: unknown): Response {
  if (err instanceof HttpError) return jsonError(err.status, err.message);
  if (err instanceof Error) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return jsonError(404, err.message);
    if (code === "EEXIST" || code === "ENOTEMPTY")
      return jsonError(409, err.message);
    if (err.message.includes("escapes the storage root"))
      return jsonError(403, err.message);
    return jsonError(500, err.message);
  }
  return jsonError(500, "Internal server error");
}

/**
 * Wrap a route handler: run it and JSON-encode the result, or convert any
 * thrown error into a JSON error Response. A handler returning `undefined`
 * yields `{ ok: true }`.
 */
export function route<T>(handler: (req: NextRequest) => Promise<T>) {
  return async (req: NextRequest): Promise<Response> => {
    try {
      return Response.json((await handler(req)) ?? { ok: true });
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}

/** Assert a value is a string, else throw an HttpError 400. */
export function requireString(value: unknown, name: string): string {
  if (typeof value !== "string") {
    throw new HttpError(400, `Missing or invalid "${name}".`);
  }
  return value;
}
