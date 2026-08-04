import { describe, expect, it, vi } from "vitest";

import { createSearchUsersHandler } from "../src/tools/search-users.js";
import {
  createClientMock,
  createRequestError,
  HTTP_FORBIDDEN,
  HTTP_UNPROCESSABLE_ENTITY,
  RATE_LIMIT_HEADERS,
  readText,
} from "./test-support.js";

const baseInput = { q: "location:japan", per_page: 10, page: 1 };

const createHandler = (users: unknown) =>
  createSearchUsersHandler(createClientMock("users", users));

describe("createSearchUsersHandler", () => {
  it("GitHub の応答をそのまま JSON テキストで返す", async () => {
    const data = { total_count: 1, items: [{ login: "octocat" }] };
    const handler = createHandler(vi.fn().mockResolvedValue({ data }));

    const result = await handler(baseInput);

    expect(result.isError).toBeUndefined();
    expect(readText(result)).toBe(JSON.stringify(data));
  });

  it("検証済みの入力をそのまま GitHub へ渡す", async () => {
    const users = vi.fn().mockResolvedValue({ data: {} });
    const handler = createHandler(users);
    const input = {
      q: "language:typescript followers:>100",
      sort: "followers" as const,
      order: "asc" as const,
      per_page: 5,
      page: 2,
    };

    await handler(input);

    expect(users).toHaveBeenCalledWith(input);
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
