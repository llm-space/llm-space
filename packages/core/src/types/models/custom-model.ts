import * as pi from "@earendil-works/pi-ai";

/**
 * A user-defined model. It is a full pi model minus the two fields the desktop
 * model manager fills in at build time: `provider` (the owning provider's id)
 * and `baseUrl` (defaults to the provider's base URL so it reuses the same
 * endpoint / `getBaseUrl`).
 */
export type CustomModel = Omit<pi.Model<pi.Api>, "provider" | "baseUrl"> & {
  provider?: string;
  baseUrl?: string;
  /**
   * A `@lobehub/icons` keyword overriding the brand icon shown for this model.
   * Absent ⇒ the icon is auto-resolved from the model id/name.
   */
  icon?: string;
};
