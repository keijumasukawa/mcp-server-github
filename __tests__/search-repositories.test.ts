import { RequestError } from "@octokit/request-error";
import { describe, expect, it, vi } from "vitest";

import type { GithubClient } from "../src/github/client.js";
import { createSearchRepositoriesHandler } from "../src/tools/search-repositories.js";

const HTTP_FORBIDDEN = 403;
const HTTP_UNPROCESSABLE_ENTITY = 422;

const createClientMock = (repos: unknown): GithubClient =>
  ({ rest: { search: { repos } } }) as unknown as GithubClient;

const createRequestError = (
  status: number,
  headers: Record<string, string> = {},
): RequestError =>
  new RequestError("test message", status, {
    request: {
      method: "GET",
      url: "https://api.github.com/search/repositories",
      headers: {},
    },
    response: {
      status,
      url: "https://api.github.com/search/repositories",
      headers,
      data: {},
      retryCount: 0,
    },
  });

const baseInput = { q: "mcp", per_page: 10, page: 1 };

describe("createSearchRepositoriesHandler", () => {
  it("GitHub の応答をそのまま JSON テキストで返す", async () => {
    const data = { total_count: 1, items: [{ full_name: "octocat/hello" }] };
    const repos = vi.fn().mockResolvedValue({ data });
    const handler = createSearchRepositoriesHandler(createClientMock(repos));

    const result = await handler(baseInput);

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toBe(JSON.stringify(data));
  });

  it("検証済みの入力をそのまま GitHub へ渡す", async () => {
    const repos = vi.fn().mockResolvedValue({ data: {} });
    const handler = createSearchRepositoriesHandler(createClientMock(repos));
    const input = {
      q: "mcp language:typescript",
      sort: "stars" as const,
      per_page: 5,
      page: 2,
    };

    await handler(input);

    expect(repos).toHaveBeenCalledWith(input);
  });

  it("レート制限エラーを isError 付きの日本語文言で返す", async () => {
    const repos = vi.fn().mockRejectedValue(
      createRequestError(HTTP_FORBIDDEN, {
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": "1754265600",
      }),
    );
    const handler = createSearchRepositoriesHandler(createClientMock(repos));

    const result = await handler(baseInput);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("一次レート制限");
  });

  it("クエリ不正を isError 付きの日本語文言で返す", async () => {
    const repos = vi
      .fn()
      .mockRejectedValue(createRequestError(HTTP_UNPROCESSABLE_ENTITY));
    const handler = createSearchRepositoriesHandler(createClientMock(repos));

    const result = await handler(baseInput);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("検索クエリが不正");
  });
});
