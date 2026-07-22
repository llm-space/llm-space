import { existsSync } from "node:fs";
import path from "node:path";

export interface WindowsEmbeddedResource {
  file: string;
  name: string;
}

export function compileWindowsGuiExecutable(options: {
  source: string;
  output: string;
  icon: string;
  resources?: WindowsEmbeddedResource[];
}): void {
  const compiler = _findCompiler();
  const resourceArguments = (options.resources ?? []).map(
    (resource) => `/resource:${resource.file},${resource.name}`
  );
  const result = Bun.spawnSync(
    [
      compiler,
      "/nologo",
      "/target:winexe",
      "/platform:x64",
      "/optimize+",
      "/reference:System.Drawing.dll",
      "/reference:System.Windows.Forms.dll",
      `/win32icon:${options.icon}`,
      `/out:${options.output}`,
      ...resourceArguments,
      options.source,
    ],
    { stdio: ["ignore", "inherit", "inherit"] }
  );
  if (result.exitCode !== 0 || !existsSync(options.output)) {
    throw new Error(
      `Windows GUI executable compilation failed with ${result.exitCode}: ${options.output}`
    );
  }
}

function _findCompiler(): string {
  const windowsDirectory = process.env.WINDIR ?? "C:\\Windows";
  const candidates = [
    path.join(
      windowsDirectory,
      "Microsoft.NET",
      "Framework64",
      "v4.0.30319",
      "csc.exe"
    ),
    path.join(
      windowsDirectory,
      "Microsoft.NET",
      "Framework",
      "v4.0.30319",
      "csc.exe"
    ),
  ];
  const compiler = candidates.find(existsSync);
  if (!compiler) {
    throw new Error(
      `Windows .NET Framework C# compiler not found: ${candidates.join(", ")}`
    );
  }
  return compiler;
}
