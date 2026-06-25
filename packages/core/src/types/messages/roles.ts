import { Type, type Static } from "typebox";

/**
 * The role of a message in a conversation.
 *
 * - `user`: A message from user.
 * - `assistant`: A message from AI model.
 *
 * **Note:**
 * Unlike Claude, we use `tool` to indicate that the message is a tool call.
 */
export const MessageRole = Type.Union([
  Type.Literal("user"),
  Type.Literal("assistant"),
]);
export type MessageRole = Static<typeof MessageRole>;
