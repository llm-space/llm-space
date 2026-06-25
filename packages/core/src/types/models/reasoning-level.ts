import { Type, type Static } from "typebox";

export const ReasoningLevel = Type.Union([
  Type.Literal("off"),
  Type.Literal("minimal"),
  Type.Literal("low"),
  Type.Literal("medium"),
  Type.Literal("high"),
  Type.Literal("xhigh"),
]);
export type ReasoningLevel = Static<typeof ReasoningLevel>;
