#!/usr/bin/env bun
/**
 * Wraps electrobun's Windows build output in a proper GUI installer.
 *
 * `electrobun build` produces `artifacts/<channel>-win-x64-LLMSpace-Setup*.zip`
 * containing a console self-extractor exe plus `.installer/` payload
 * (metadata.json + tar.zst). This script unpacks that zip and compiles
 * `installer/llm-space.nsi` around the three files, emitting a channel-named
 * NSIS installer (`LLMSpace-Setup-canary.exe` / `LLMSpace-Setup.exe`) into
 * `artifacts/`. The extractor stays the install engine so the in-app
 * updater's hardcoded path contract keeps working; see the .nsi header.
 *
 * Usage: bun scripts/build-win-installer.ts --channel <canary|stable>
 * Requires makensis on PATH (or MAKENSIS env var pointing at it).
 * Runs after `bun run build:canary` / `build:stable` on the same machine —
 * CI-wise that's a Windows runner, but the script itself is cross-platform
 * so the .nsi can be compile-checked on macOS/Linux too.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { join, resolve } from "node:path";

import packageJson from "../package.json";

const APP_NAME = "LLM Space";
const APP_IDENTIFIER = "tech.deerflow.llm-space";
const PUBLISHER = "DeerFlow";

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

function parseChannel(): "canary" | "stable" {
  const index = process.argv.indexOf("--channel");
  const channel = index === -1 ? undefined : process.argv[index + 1];
  if (channel !== "canary" && channel !== "stable") {
    fail("pass --channel canary|stable");
  }
  return channel;
}

function findMakensis(): string {
  if (process.env.MAKENSIS) return process.env.MAKENSIS;
  const onPath = Bun.which("makensis");
  if (onPath) return onPath;
  // Default install locations of the NSIS Windows distribution (chocolatey
  // and the official installer both land here without touching PATH).
  const winDefaults = [
    "C:\\Program Files (x86)\\NSIS\\makensis.exe",
    "C:\\Program Files\\NSIS\\makensis.exe",
  ];
  for (const candidate of winDefaults) {
    if (existsSync(candidate)) return candidate;
  }
  fail("makensis not found — install NSIS or set MAKENSIS");
}

const channel = parseChannel();
const desktopDir = resolve(import.meta.dir, "..");
const artifactsDir = join(desktopDir, "artifacts");

// electrobun's naming: setup exe keeps spaces ("LLM Space-Setup-canary.exe"),
// the wrapping zip strips them, and the artifact gets a platform prefix.
const setupStem =
  channel === "stable" ? `${APP_NAME}-Setup` : `${APP_NAME}-Setup-${channel}`;
const zipName = `${channel}-win-x64-${setupStem.replaceAll(" ", "")}.zip`;
let zipPath = join(artifactsDir, zipName);
if (!existsSync(zipPath)) {
  // Fall back to a glob in case upstream tweaks the prefix scheme.
  const candidates = existsSync(artifactsDir)
    ? readdirSync(artifactsDir).filter(
        (name) => name.includes("-Setup") && name.endsWith(".zip")
      )
    : [];
  if (candidates.length !== 1) {
    fail(
      `expected ${zipName} in ${artifactsDir} (found: ${candidates.join(", ") || "none"}) — run \`bun run build:${channel}\` first`
    );
  }
  zipPath = join(artifactsDir, candidates[0]);
}

const stagingDir = join(desktopDir, "build", `win-installer-${channel}`);
rmSync(stagingDir, { recursive: true, force: true });
mkdirSync(stagingDir, { recursive: true });

// bsdtar (shipped with Windows 10+ and macOS) extracts zip archives.
const untar = Bun.spawnSync(["tar", "-xf", zipPath, "-C", stagingDir]);
if (untar.exitCode !== 0) {
  fail(`extracting ${zipPath} failed: ${untar.stderr.toString()}`);
}

const payload = {
  setupExe: join(stagingDir, `${setupStem}.exe`),
  metadata: join(stagingDir, ".installer", `${setupStem}.metadata.json`),
  archive: join(stagingDir, ".installer", `${setupStem}.tar.zst`),
};
for (const [kind, path] of Object.entries(payload)) {
  if (!existsSync(path)) fail(`payload ${kind} missing: ${path}`);
}

/**
 * electrobun's zig self-extractor only handles ustar entries of type normal /
 * directory / symlink; a pax extended header ('x'/'g') or GNU longname ('L')
 * aborts extraction mid-install with TarUnsupportedFileType. Those appear
 * whenever the tar is created without `--format=ustar` and any path exceeds
 * 100 chars (hashed font assets do) — CI prepends a tar shim before
 * `electrobun build` to force ustar; this guard makes any regression fail
 * here, at packaging time, instead of on end-user machines.
 */
function validateTarSupportedByExtractor(archivePath: string) {
  const tar = Bun.zstdDecompressSync(readFileSync(archivePath));
  const decoder = new TextDecoder();
  let offset = 0;
  while (offset + 512 <= tar.length) {
    const block = tar.subarray(offset, offset + 512);
    if (block.every((byte) => byte === 0)) break; // end-of-archive marker
    const typeflag = block[156];
    const supported =
      typeflag === 0 || // old-style normal file
      typeflag === 0x30 || // '0' normal file
      typeflag === 0x32 || // '2' symlink
      typeflag === 0x35; // '5' directory
    if (!supported) {
      const name = decoder.decode(block.subarray(0, 100)).split("\0")[0];
      fail(
        `payload tar has a type-'${String.fromCharCode(typeflag)}' entry ("${name}") that electrobun's self-extractor cannot parse — ` +
          `the tar must be created with --format=ustar (the Windows CI workflows prepend a tar shim before \`electrobun build\` for this)`
      );
    }
    const sizeField = decoder.decode(block.subarray(124, 136));
    const size = parseInt(sizeField.replace(/[^0-7]/g, " ").trim() || "0", 8);
    offset += 512 + Math.ceil(size / 512) * 512;
  }
}

validateTarSupportedByExtractor(payload.archive);

const version = packageJson.version;
const numericMatch = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
if (!numericMatch) fail(`cannot derive numeric version from "${version}"`);
const versionNumeric = `${numericMatch[1]}.${numericMatch[2]}.${numericMatch[3]}.0`;

const outFile = join(artifactsDir, `${setupStem.replaceAll(" ", "")}.exe`);
rmSync(outFile, { force: true });

const makensis = findMakensis();
// makensis switches use "/" on Windows and "-" elsewhere.
const sw = process.platform === "win32" ? "/" : "-";
const defines: Record<string, string> = {
  APP_NAME,
  APP_IDENTIFIER,
  CHANNEL: channel,
  VERSION: version,
  VERSION_NUMERIC: versionNumeric,
  PUBLISHER,
  PAYLOAD_SETUP_EXE: payload.setupExe,
  PAYLOAD_METADATA: payload.metadata,
  PAYLOAD_ARCHIVE: payload.archive,
  PAYLOAD_STEM: setupStem,
  ICON_FILE: join(desktopDir, "icon.ico"),
  OUT_FILE: outFile,
};
const args = [
  makensis,
  ...Object.entries(defines).map(([name, value]) => `${sw}D${name}=${value}`),
  join(desktopDir, "installer", "llm-space.nsi"),
];

console.info(`compiling NSIS installer for ${channel} (${version})...`);
const result = Bun.spawnSync(args, { stdout: "inherit", stderr: "inherit" });
if (result.exitCode !== 0 || !existsSync(outFile)) {
  fail(`makensis failed (exit ${result.exitCode})`);
}

const sizeMb = (statSync(outFile).size / 1024 / 1024).toFixed(2);
console.info(`created ${outFile} (${sizeMb} MB)`);
