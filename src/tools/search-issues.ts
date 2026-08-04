import type { CallToolResult, McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

import type { GithubClient } from "../github/client.js";
import { createErrorResult } from "./error-result.js";
import { orderSchema, paginationShape, querySchema } from "./shared-schema.js";

const inputSchema = z.object({
  q: querySchema,
  sort: z
    .enum([
      "comments",
      "reactions",
      "reactions-+1",
      "reactions--1",
      "reactions-smile",
      "reactions-thinking_face",
      "reactions-heart",
      "reactions-tada",
      "interactions",
      "created",
      "updated",
    ])
    .optional()
    .describe("並び替え基準。未指定は関連度順"),
  order: orderSchema,
  advanced_search: z
    .string()
    .optional()
    .describe("高度な検索を利用する場合は true を指定する"),
  search_type: z
    .enum(["semantic", "hybrid"])
    .optional()
    .describe("検索方式。指定時はレート制限が 10 リクエスト毎分になる"),
  ...paginationShape,
});

export const createSearchIssuesHandler =
  (client: GithubClient) =>
  async (input: z.infer<typeof inputSchema>): Promise<CallToolResult> => {
    try {
      const result = await client.rest.search.issuesAndPullRequests(input);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result.data) }],
      };
    } catch (error) {
      return createErrorResult(error);
    }
  };

export const createSearchIssuesTool = (
  server: McpServer,
  client: GithubClient,
): void => {
  server.registerTool(
    "search_issues",
    {
      description: "GitHub の Issue とプルリクエストを検索する",
      inputSchema,
    },
    createSearchIssuesHandler(client),
  );
};
