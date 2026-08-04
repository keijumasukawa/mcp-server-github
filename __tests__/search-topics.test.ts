import { describe, expect, it, vi } from "vitest";

import { createSearchTopicsHandler } from "../src/tools/search-topics.js";
import {
  createClientMock,
  createRequestError,
  HTTP_FORBIDDEN,
  HTTP_UNPROCESSABLE_ENTITY,
  RATE_LIMIT_HEADERS,
  readText,
} from "./test-support.js";

const baseInput = { q: "typescript", per_page: 10, page: 1 };

const createHandler = (topics: unknown) =>
  createSearchTopicsHandler(createClientMock("topics", topics));

describe("createSearchTopicsHandler", () => {
  it("GitHub の応答をそのまま JSON テキストで返す", async () => {
    const data = { total_count: 1, items: [{ name: "typescript" }] };
    const handler = createHandler(vi.fn().mockResolvedValue({ data }));

    const result = await handler(baseInput);

    expect(result.isError).toBeUndefined();
    expect(readText(result)).toBe(JSON.stringify(data));
  });

  it("検証済みの入力をそのまま GitHub へ渡す", async () => {
    const topics = vi.fn().mockResolvedValue({ data: {} });
    const handler = createHandler(topics);
    const input = { q: "typescript is:featured", per_page: 5, page: 2 };

    await handler(input);

    expect(topics).toHaveBeenCalledWith(input);
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
