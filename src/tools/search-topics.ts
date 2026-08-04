import type { CallToolResult, McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

import type { GithubClient } from "../github/client.js";
import { createErrorResult } from "./error-result.js";
import { paginationShape, querySchema } from "./shared-schema.js";

const inputSchema = z.object({
  q: querySchema,
  ...paginationShape,
});

export const createSearchTopicsHandler =
  (client: GithubClient) =>
  async (input: z.infer<typeof inputSchema>): Promise<CallToolResult> => {
    try {
      const result = await client.rest.search.topics(input);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result.data) }],
      };
    } catch (error) {
      return createErrorResult(error);
    }
  };

export const createSearchTopicsTool = (
  server: McpServer,
  client: GithubClient,
): void => {
  server.registerTool(
    "search_topics",
    {
      description: "GitHub のトピックを検索する",
      inputSchema,
    },
    createSearchTopicsHandler(client),
  );
};
