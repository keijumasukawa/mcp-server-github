import type { CallToolResult, McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

import type { GithubClient } from "../github/client.js";
import { createErrorResult } from "./error-result.js";
import { orderSchema, paginationShape, querySchema } from "./shared-schema.js";

const inputSchema = z.object({
  repository_id: z.int().positive().describe("対象リポジトリの数値 ID"),
  q: querySchema,
  sort: z
    .enum(["created", "updated"])
    .optional()
    .describe("並び替え基準。未指定は関連度順"),
  order: orderSchema,
  ...paginationShape,
});

export const createSearchLabelsHandler =
  (client: GithubClient) =>
  async (input: z.infer<typeof inputSchema>): Promise<CallToolResult> => {
    try {
      const result = await client.rest.search.labels(input);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result.data) }],
      };
    } catch (error) {
      return createErrorResult(error);
    }
  };

export const createSearchLabelsTool = (
  server: McpServer,
  client: GithubClient,
): void => {
  server.registerTool(
    "search_labels",
    {
      description: "GitHub の特定リポジトリ内のラベルを検索する",
      inputSchema,
    },
    createSearchLabelsHandler(client),
  );
};
