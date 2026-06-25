import { Type, type Static } from "typebox";

export const JSONSchema = Type.Object({}, { additionalProperties: true });
export type JSONSchema = Static<typeof JSONSchema>;
