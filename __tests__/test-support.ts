import type { CallToolResult } from "@modelcontextprotocol/server";
import { RequestError } from "@octokit/request-error";

import type { GithubClient } from "../src/github/client.js";

const REQUEST_URL = "https://api.github.com/search";

export const HTTP_FORBIDDEN = 403;
export const HTTP_UNPROCESSABLE_ENTITY = 422;

export const RATE_LIMIT_HEADERS = {
  "x-ratelimit-remaining": "0",
  "x-ratelimit-reset": "1754265600",
};

export const createClientMock = (
  method: string,
  implementation: unknown,
): GithubClient =>
  ({
    rest: { search: { [method]: implementation } },
  }) as unknown as GithubClient;

export const createRequestError = (
  status: number,
  headers: Record<string, string> = {},
): RequestError =>
  new RequestError("test message", status, {
    request: { method: "GET", url: REQUEST_URL, headers: {} },
    response: { status, url: REQUEST_URL, headers, data: {}, retryCount: 0 },
  });

export const readText = (result: CallToolResult): string => {
  const [block] = result.content;
  if (block?.type !== "text") {
    throw new Error("先頭が text ブロックではありません");
  }
  return block.text;
};
