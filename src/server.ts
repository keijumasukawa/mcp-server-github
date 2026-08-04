import { McpServer } from "@modelcontextprotocol/server";

import type { GithubClient } from "./github/client.js";
import { createSearchTools } from "./tools/index.js";

const SERVER_NAME = "mcp-server-github";
const SERVER_VERSION = "1.0.0";

export interface ServerDependencies {
  client: GithubClient;
}

export const createServer = ({ client }: ServerDependencies): McpServer => {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
  createSearchTools(server, client);
  return server;
};
