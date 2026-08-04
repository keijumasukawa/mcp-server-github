import { McpServer } from "@modelcontextprotocol/server";

import type { GithubClient } from "./github/client.js";
import { readPackageVersion } from "./package-info.js";
import { createSearchTools } from "./tools/index.js";

const SERVER_NAME = "mcp-server-github";

export interface ServerDependencies {
  client: GithubClient;
}

export const createServer = ({ client }: ServerDependencies): McpServer => {
  const server = new McpServer({
    name: SERVER_NAME,
    version: readPackageVersion(import.meta.url),
  });
  createSearchTools(server, client);
  return server;
};
