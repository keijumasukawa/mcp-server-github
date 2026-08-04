import type { McpServer } from "@modelcontextprotocol/server";

import type { GithubClient } from "../github/client.js";
import { createSearchRepositoriesTool } from "./search-repositories.js";

export const createSearchTools = (
  server: McpServer,
  client: GithubClient,
): void => {
  createSearchRepositoriesTool(server, client);
};
