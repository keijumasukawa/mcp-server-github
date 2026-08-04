import type { CallToolResult, McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

import type { GithubClient } from "../github/client.js";
import { createErrorResult } from "./error-result.js";
import { orderSchema, paginationShape, querySchema } from "./shared-schema.js";

const inputSchema = z.object({
  q: querySchema,
  sort: z
    .enum(["indexed"])
    .optional()
    .describe("並び替え基準。未指定は関連度順"),
  order: orderSchema,
  ...paginationShape,
});

export const createSearchCodeHandler =
  (client: GithubClient) =>
  async (input: z.infer<typeof inputSchema>): Promise<CallToolResult> => {
    try {
      const result = await client.rest.search.code(input);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result.data) }],
      };
    } catch (error) {
      return createErrorResult(error);
    }
  };

export const createSearchCodeTool = (
  server: McpServer,
  client: GithubClient,
): void => {
  server.registerTool(
    "search_code",
    {
      description:
        "GitHub のコードを検索する。認証が必要で、レート制限は 10 リクエスト毎分",
      inputSchema,
    },
    createSearchCodeHandler(client),
  );
};
