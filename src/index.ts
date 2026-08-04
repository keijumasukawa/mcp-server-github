#!/usr/bin/env node
import { serveStdio } from "@modelcontextprotocol/server/stdio";

import { loadEnvFileIfExists, resolveProjectEnvFilePath } from "./env-file.js";
import { createGithubClient } from "./github/client.js";
import { createEnvTokenProvider } from "./github/token-provider.js";
import { createServer } from "./server.js";

try {
  loadEnvFileIfExists(resolveProjectEnvFilePath(import.meta.url));
  const token = await createEnvTokenProvider(process.env).resolve();
  const client = createGithubClient({ token });
  serveStdio(() => createServer({ client }));
  console.error("mcp-server-github を stdio で起動しました");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
