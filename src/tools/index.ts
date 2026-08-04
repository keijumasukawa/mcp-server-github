import type { McpServer } from "@modelcontextprotocol/server";

import type { GithubClient } from "../github/client.js";
import { createSearchCodeTool } from "./search-code.js";
import { createSearchCommitsTool } from "./search-commits.js";
import { createSearchIssuesTool } from "./search-issues.js";
import { createSearchLabelsTool } from "./search-labels.js";
import { createSearchRepositoriesTool } from "./search-repositories.js";
import { createSearchTopicsTool } from "./search-topics.js";
import { createSearchUsersTool } from "./search-users.js";

export const createSearchTools = (
  server: McpServer,
  client: GithubClient,
): void => {
  createSearchRepositoriesTool(server, client);
  createSearchCommitsTool(server, client);
  createSearchIssuesTool(server, client);
  createSearchUsersTool(server, client);
  createSearchCodeTool(server, client);
  createSearchLabelsTool(server, client);
  createSearchTopicsTool(server, client);
};
