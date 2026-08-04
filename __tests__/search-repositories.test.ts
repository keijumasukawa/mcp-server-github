import { describe, expect, it, vi } from "vitest";

import { createSearchRepositoriesHandler } from "../src/tools/search-repositories.js";
import {
  createClientMock,
  createRequestError,
  HTTP_FORBIDDEN,
  HTTP_UNPROCESSABLE_ENTITY,
  RATE_LIMIT_HEADERS,
  readText,
} from "./test-support.js";

const baseInput = { q: "mcp", per_page: 10, page: 1 };

const createHandler = (repos: unknown) =>
  createSearchRepositoriesHandler(createClientMock("repos", repos));

describe("createSearchRepositoriesHandler", () => {
  it("GitHub の応答をそのまま JSON テキストで返す", async () => {
    const data = { total_count: 1, items: [{ full_name: "octocat/hello" }] };
    const handler = createHandler(vi.fn().mockResolvedValue({ data }));

    const result = await handler(baseInput);

    expect(result.isError).toBeUndefined();
    expect(readText(result)).toBe(JSON.stringify(data));
  });

  it("検証済みの入力をそのまま GitHub へ渡す", async () => {
    const repos = vi.fn().mockResolvedValue({ data: {} });
    const handler = createHandler(repos);
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
    const handler = createHandler(
      vi
        .fn()
        .mockRejectedValue(
          createRequestError(HTTP_FORBIDDEN, RATE_LIMIT_HEADERS),
        ),
    );

    const result = await handler(baseInput);

    expect(result.isError).toBe(true);
    expect(readText(result)).toContain("一次レート制限");
  });

  it("クエリ不正を isError 付きの日本語文言で返す", async () => {
    const handler = createHandler(
      vi.fn().mockRejectedValue(createRequestError(HTTP_UNPROCESSABLE_ENTITY)),
    );

    const result = await handler(baseInput);

    expect(result.isError).toBe(true);
    expect(readText(result)).toContain("検索クエリが不正");
  });
});
