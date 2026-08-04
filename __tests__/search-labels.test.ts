import { describe, expect, it, vi } from "vitest";

import { createSearchLabelsHandler } from "../src/tools/search-labels.js";
import {
  createClientMock,
  createRequestError,
  HTTP_FORBIDDEN,
  HTTP_NOT_FOUND,
  HTTP_UNPROCESSABLE_ENTITY,
  RATE_LIMIT_HEADERS,
  readText,
} from "./test-support.js";

const REPOSITORY_ID = 1296269;

const baseInput = {
  repository_id: REPOSITORY_ID,
  q: "bug",
  per_page: 10,
  page: 1,
};

const createHandler = (labels: unknown) =>
  createSearchLabelsHandler(createClientMock("labels", labels));

describe("createSearchLabelsHandler", () => {
  it("GitHub の応答をそのまま JSON テキストで返す", async () => {
    const data = { total_count: 1, items: [{ name: "bug" }] };
    const handler = createHandler(vi.fn().mockResolvedValue({ data }));

    const result = await handler(baseInput);

    expect(result.isError).toBeUndefined();
    expect(readText(result)).toBe(JSON.stringify(data));
  });

  it("検証済みの入力をそのまま GitHub へ渡す", async () => {
    const labels = vi.fn().mockResolvedValue({ data: {} });
    const handler = createHandler(labels);
    const input = {
      repository_id: REPOSITORY_ID,
      q: "bug",
      sort: "created" as const,
      order: "asc" as const,
      per_page: 5,
      page: 2,
    };

    await handler(input);

    expect(labels).toHaveBeenCalledWith(input);
  });

  it("リポジトリ未検出を isError 付きの日本語文言で返す", async () => {
    const handler = createHandler(
      vi.fn().mockRejectedValue(createRequestError(HTTP_NOT_FOUND)),
    );

    const result = await handler(baseInput);

    expect(result.isError).toBe(true);
    expect(readText(result)).toContain("対象が見つかりません");
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
