import { Type, type Static } from "typebox";

import { JSONSchema } from "../shared";

/**
 * The type of the response from the model.
 */
export const ResponseType = Type.Union([
  Type.Object({ type: Type.Literal("text") }),
  Type.Object({ type: Type.Literal("json_object") }),
  Type.Object({
    type: Type.Literal("json_schema"),
    jsonSchema: JSONSchema,
  }),
]);
export type ResponseType = Static<typeof ResponseType>;
