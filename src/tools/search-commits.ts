import type { CallToolResult, McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

import type { GithubClient } from "../github/client.js";
import { createErrorResult } from "./error-result.js";
import { orderSchema, paginationShape, querySchema } from "./shared-schema.js";

const inputSchema = z.object({
  q: querySchema,
  sort: z
    .enum(["author-date", "committer-date"])
    .optional()
    .describe("並び替え基準。未指定は関連度順"),
  order: orderSchema,
  ...paginationShape,
});

export const createSearchCommitsHandler =
  (client: GithubClient) =>
  async (input: z.infer<typeof inputSchema>): Promise<CallToolResult> => {
    try {
      const result = await client.rest.search.commits(input);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result.data) }],
      };
    } catch (error) {
      return createErrorResult(error);
    }
  };

export const createSearchCommitsTool = (
  server: McpServer,
  client: GithubClient,
): void => {
  server.registerTool(
    "search_commits",
    {
      description: "GitHub のコミットを検索する",
      inputSchema,
    },
    createSearchCommitsHandler(client),
  );
};
