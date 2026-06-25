import { parse } from "best-effort-json-parser";

export function parseJSON<T>(text: string): T {
  return parse(text) as T;
}

export function deepCloneJSON<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T;
}
