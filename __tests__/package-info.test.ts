import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import { readPackageVersion } from "../src/package-info.js";

const createPackageJson = (
  contents: string,
): { moduleUrl: string; dir: string } => {
  const dir = mkdtempSync(join(tmpdir(), "mcp-server-github-"));
  writeFileSync(join(dir, "package.json"), contents);
  return { moduleUrl: pathToFileURL(join(dir, "dist", "server.js")).href, dir };
};

describe("readPackageVersion", () => {
  it("モジュールの1つ上の階層のパッケージ定義から版を読み取る", () => {
    const { moduleUrl, dir } = createPackageJson('{ "version": "9.8.7" }');

    const result = readPackageVersion(moduleUrl);

    expect(result).toBe("9.8.7");
    rmSync(dir, { recursive: true });
  });

  it("版が欠けている場合は失敗する", () => {
    const { moduleUrl, dir } = createPackageJson('{ "name": "example" }');

    expect(() => readPackageVersion(moduleUrl)).toThrow();
    rmSync(dir, { recursive: true });
  });

  it("パッケージ定義が存在しない場合は失敗する", () => {
    const moduleUrl = pathToFileURL(
      join(tmpdir(), "存在しない", "dist", "server.js"),
    ).href;

    expect(() => readPackageVersion(moduleUrl)).toThrow();
  });
});
