import type { McpServer } from "@modelcontextprotocol/server";

import type { GithubClient } from "../github/client.js";
import { createSearchCommitsTool } from "./search-commits.js";
import { createSearchIssuesTool } from "./search-issues.js";
import { createSearchRepositoriesTool } from "./search-repositories.js";

export const createSearchTools = (
  server: McpServer,
  client: GithubClient,
): void => {
  createSearchRepositoriesTool(server, client);
  createSearchCommitsTool(server, client);
  createSearchIssuesTool(server, client);
};
