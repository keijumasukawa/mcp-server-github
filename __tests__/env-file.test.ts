import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

import {
  loadEnvFileIfExists,
  resolveProjectEnvFilePath,
} from "../src/env-file.js";

const PRESET_KEY = "MCP_SERVER_GITHUB_TEST_PRESET";
const LOADED_KEY = "MCP_SERVER_GITHUB_TEST_LOADED";

const createEnvFile = (contents: string): { path: string; dir: string } => {
  const dir = mkdtempSync(join(tmpdir(), "mcp-server-github-"));
  const path = join(dir, ".env");
  writeFileSync(path, contents);
  return { path, dir };
};

afterEach(() => {
  delete process.env[PRESET_KEY];
  delete process.env[LOADED_KEY];
});

describe("resolveProjectEnvFilePath", () => {
  it("モジュールの1つ上の階層の .env を指す", () => {
    const moduleUrl = pathToFileURL(join(tmpdir(), "dist", "index.js")).href;

    const result = resolveProjectEnvFilePath(moduleUrl);

    expect(result).toBe(join(tmpdir(), ".env"));
  });
});

describe("loadEnvFileIfExists", () => {
  it("ファイルが存在しなければ何もせず false を返す", () => {
    const result = loadEnvFileIfExists(join(tmpdir(), "存在しない.env"));

    expect(result).toBe(false);
  });

  it("ファイルが存在すれば読み込んで true を返す", () => {
    const { path, dir } = createEnvFile(`${LOADED_KEY}=from-file\n`);

    const result = loadEnvFileIfExists(path);

    expect(result).toBe(true);
    expect(process.env[LOADED_KEY]).toBe("from-file");
    rmSync(dir, { recursive: true });
  });

  it("既存の環境変数を上書きしない", () => {
    process.env[PRESET_KEY] = "from-process";
    const { path, dir } = createEnvFile(`${PRESET_KEY}=from-file\n`);

    loadEnvFileIfExists(path);

    expect(process.env[PRESET_KEY]).toBe("from-process");
    rmSync(dir, { recursive: true });
  });
});
