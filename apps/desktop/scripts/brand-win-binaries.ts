/**
 * electrobun postBuild step (Windows only): brand the bundled binaries before
 * they are tarred, so the edits land identically in the installer payload,
 * the update feed tarball, and the delta-patch chain (postBuild runs before
 * electrobun's createTar/hash — nothing downstream ever sees unbranded bytes).
 *
 * Why:
 * - bun.exe ships with ProductName/FileDescription "Bun"/"Oven", and it is
 *   the process that listens on electrobun's RPC socket — so the first-run
 *   Windows Firewall prompt is attributed to "Bun". Rebrand its VERSIONINFO
 *   so the prompt (and Task Manager) say "LLM Space". The prompt itself is
 *   upstream behavior (electrobun#362-adjacent).
 * - bun.exe also owns the app window (libNativeWrapper via FFI) but ships
 *   DPI-unaware, so the UI is bitmap-stretched (blurry) at >100% scaling.
 *   Embed a PerMonitorV2 manifest (installer/win-app.manifest — stock bun
 *   manifest + DPI declarations).
 * - launcher.exe ships with no resources at all (no icon/version/manifest);
 *   give it the same treatment best-effort — it creates no windows, so this
 *   is cosmetic (Explorer/file-properties identity) and non-fatal on error.
 *
 * Invoked by scripts/post-build.ts with electrobun's hook env; a bun.exe
 * branding failure fails the build (the smoke test asserts the result).
 */
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

import { rcedit } from "rcedit";

const APP_DISPLAY_NAME = "LLM Space";
const PUBLISHER = "DeerFlow";

if (process.env.ELECTROBUN_OS !== "win") {
  process.exit(0);
}

const buildDir = process.env.ELECTROBUN_BUILD_DIR;
const bundleName = process.env.ELECTROBUN_APP_NAME;
const version = process.env.ELECTROBUN_APP_VERSION ?? "0.0.0";
if (!buildDir || !bundleName) {
  console.error("brand-win-binaries: missing ELECTROBUN_BUILD_DIR/APP_NAME");
  process.exit(1);
}

const binDir = join(buildDir, bundleName, "bin");
const desktopDir = resolve(import.meta.dir, "..");
const manifest = join(desktopDir, "installer", "win-app.manifest");
const icon = join(desktopDir, "icon.ico");
// VS_FIXEDFILEINFO versions must be numeric x.y.z.w; strip any prerelease tag.
const numeric = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
const productVersion = numeric
  ? `${numeric[1]}.${numeric[2]}.${numeric[3]}.0`
  : "0.0.0.0";

for (const path of [binDir, manifest, icon]) {
  if (!existsSync(path)) {
    console.error(`brand-win-binaries: missing ${path}`);
    process.exit(1);
  }
}

// The window-owning, socket-listening process: branding it is the point.
try {
  await rcedit(join(binDir, "bun.exe"), {
    "version-string": {
      ProductName: APP_DISPLAY_NAME,
      FileDescription: APP_DISPLAY_NAME,
      CompanyName: PUBLISHER,
    },
    "product-version": productVersion,
    "application-manifest": manifest,
  });
  console.info("brand-win-binaries: bun.exe — branded (VERSIONINFO + PerMonitorV2 manifest)");
} catch (error) {
  console.error(`brand-win-binaries: bun.exe branding failed: ${String(error)}`);
  process.exit(1);
}

// launcher.exe has no resource section at all; rescle may or may not be able
// to create one. Cosmetic either way (it spawns bun.exe and exits the UI
// path), so best-effort.
try {
  await rcedit(join(binDir, "launcher.exe"), {
    "version-string": {
      ProductName: APP_DISPLAY_NAME,
      FileDescription: APP_DISPLAY_NAME,
      CompanyName: PUBLISHER,
    },
    "product-version": productVersion,
    icon,
    "application-manifest": manifest,
  });
  console.info("brand-win-binaries: launcher.exe — branded (icon + VERSIONINFO + manifest)");
} catch (error) {
  console.warn(
    `brand-win-binaries: launcher.exe branding skipped (non-fatal): ${String(error)}`
  );
}
