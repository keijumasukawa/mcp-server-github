import type { CallToolResult, McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

import type { GithubClient } from "../github/client.js";
import { createErrorResult } from "./error-result.js";
import { orderSchema, paginationShape, querySchema } from "./shared-schema.js";

const inputSchema = z.object({
  q: querySchema,
  sort: z
    .enum(["followers", "repositories", "joined"])
    .optional()
    .describe("並び替え基準。未指定は関連度順"),
  order: orderSchema,
  ...paginationShape,
});

export const createSearchUsersHandler =
  (client: GithubClient) =>
  async (input: z.infer<typeof inputSchema>): Promise<CallToolResult> => {
    try {
      const result = await client.rest.search.users(input);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result.data) }],
      };
    } catch (error) {
      return createErrorResult(error);
    }
  };

export const createSearchUsersTool = (
  server: McpServer,
  client: GithubClient,
): void => {
  server.registerTool(
    "search_users",
    {
      description: "GitHub のユーザーと組織を検索する",
      inputSchema,
    },
    createSearchUsersHandler(client),
  );
};
