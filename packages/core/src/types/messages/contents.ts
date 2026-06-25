import { Type, type Static } from "typebox";

/**
 * The text type content of a message.
 */
export const TextContent = Type.Object({
  /**
   * The type of the content.
   */
  type: Type.Literal("text"),

  /**
   * The text of the content.
   */
  text: Type.String(),
});
export type TextContent = Static<typeof TextContent>;

export const ImageDataContent = Type.Object({
  /**
   * The type of the content.
   */
  type: Type.Literal("image_data"),

  /**
   * The MIME type of the image.
   *
   * **Examples:**
   * `image/png`, `image/jpeg`, `image/gif`, `image/webp`, etc.
   */
  mimeType: Type.String({ pattern: /^image\/\w+$/ }),

  /**
   * The base64 encoded image data of the image.
   */
  data: Type.String(),
});

export type ImageDataContent = Static<typeof ImageDataContent>;

/**
 * The union type of the content of a message.
 */
export const MessageContent = Type.Union([TextContent, ImageDataContent]);
export type MessageContent = TextContent | ImageDataContent;
