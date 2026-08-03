import { McpServer } from "@modelcontextprotocol/server";

import type { GithubClient } from "./github/client.js";

const SERVER_NAME = "mcp-server-github";
const SERVER_VERSION = "1.0.0";

export interface ServerDependencies {
  client: GithubClient;
}

export const createServer = (_dependencies: ServerDependencies): McpServer =>
  new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
