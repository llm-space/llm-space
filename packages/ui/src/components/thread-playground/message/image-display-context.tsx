import { createContext, useContext } from "react";

export interface ImageDisplayContextValue {
  /**
   * Render image attachments as compact `[Image #N]` placeholders (that still
   * open the preview on click) instead of inline thumbnails. Used by the shared
   * viewer when embedded or on narrow viewports.
   */
  compact: boolean;
  /** 1-based number of the image at (messageId, contentIndex), for its label. */
  numberOf: (messageId: string, contentIndex: number) => number;
}

const ImageDisplayContext = createContext<ImageDisplayContextValue | null>(null);

export const ImageDisplayProvider = ImageDisplayContext.Provider;

/** Image display options; defaults to full (non-compact) rendering. */
export function useImageDisplay(): ImageDisplayContextValue {
  return (
    useContext(ImageDisplayContext) ?? { compact: false, numberOf: () => 0 }
  );
}
