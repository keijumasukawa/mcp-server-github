import { RequestError } from "@octokit/request-error";
import { describe, expect, it } from "vitest";

import { classifyGithubError } from "../src/github/errors.js";

const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const HTTP_UNPROCESSABLE_ENTITY = 422;
const HTTP_INTERNAL_SERVER_ERROR = 500;
const RETRY_AFTER_SECONDS = 60;
const RESET_EPOCH_SECONDS = 1754265600;
const MILLISECONDS_PER_SECOND = 1000;

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

describe("classifyGithubError", () => {
  it("401 を認証エラーに分類する", () => {
    const result = classifyGithubError(createRequestError(HTTP_UNAUTHORIZED));

    expect(result.kind).toBe("authentication");
    expect(result.status).toBe(HTTP_UNAUTHORIZED);
  });

  it("403 かつ retry-after ヘッダありを二次レート制限に分類する", () => {
    const result = classifyGithubError(
      createRequestError(HTTP_FORBIDDEN, {
        "retry-after": String(RETRY_AFTER_SECONDS),
      }),
    );

    expect(result.kind).toBe("secondaryRateLimit");
    expect(result.retryAfterSeconds).toBe(RETRY_AFTER_SECONDS);
  });

  it("403 かつ残量ゼロを一次レート制限に分類し解除時刻を含める", () => {
    const result = classifyGithubError(
      createRequestError(HTTP_FORBIDDEN, {
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": String(RESET_EPOCH_SECONDS),
      }),
    );

    expect(result.kind).toBe("rateLimit");
    expect(result.resetAt).toBe(
      new Date(RESET_EPOCH_SECONDS * MILLISECONDS_PER_SECOND).toISOString(),
    );
  });

  it("403 でレート制限ヘッダがなければ不明に分類する", () => {
    const result = classifyGithubError(createRequestError(HTTP_FORBIDDEN));

    expect(result.kind).toBe("unknown");
  });

  it("404 を未検出に分類する", () => {
    const result = classifyGithubError(createRequestError(HTTP_NOT_FOUND));

    expect(result.kind).toBe("notFound");
  });

  it("422 をクエリ不正に分類する", () => {
    const result = classifyGithubError(
      createRequestError(HTTP_UNPROCESSABLE_ENTITY),
    );

    expect(result.kind).toBe("invalidQuery");
  });

  it("その他のステータスを不明に分類する", () => {
    const result = classifyGithubError(
      createRequestError(HTTP_INTERNAL_SERVER_ERROR),
    );

    expect(result.kind).toBe("unknown");
    expect(result.status).toBe(HTTP_INTERNAL_SERVER_ERROR);
  });

  it("RequestError 以外の Error はメッセージを保持して不明に分類する", () => {
    const result = classifyGithubError(new Error("network failure"));

    expect(result.kind).toBe("unknown");
    expect(result.message).toBe("network failure");
    expect(result.status).toBeUndefined();
  });
});
