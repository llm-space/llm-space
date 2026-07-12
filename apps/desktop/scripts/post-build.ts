/**
 * electrobun `postBuild` hook dispatcher — runs each platform step as its own
 * process so every step keeps its own early-exit/platform-guard semantics.
 * (`postWrap` still points straight at fix-x64-headerpad.ts; the branding
 * step must run only in postBuild, before the bundle is tarred and hashed.)
 */
const STEPS = ["scripts/fix-x64-headerpad.ts", "scripts/brand-win-binaries.ts"];

for (const step of STEPS) {
  const result = Bun.spawnSync([process.execPath, step], {
    stdio: ["ignore", "inherit", "inherit"],
    env: process.env,
  });
  if (result.exitCode !== 0) {
    console.error(`post-build: ${step} failed (exit ${result.exitCode})`);
    process.exit(result.exitCode ?? 1);
  }
}
