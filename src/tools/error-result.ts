import type { CallToolResult } from "@modelcontextprotocol/server";

import type { GithubError } from "../github/errors.js";
import { classifyGithubError } from "../github/errors.js";

const describeGithubError = (error: GithubError): string => {
  switch (error.kind) {
    case "rateLimit":
      return `一次レート制限に達しました。解除予定: ${error.resetAt ?? "不明"}(${error.message})`;
    case "secondaryRateLimit":
      return `二次レート制限を検知しました。待機秒数: ${error.retryAfterSeconds?.toString() ?? "不明"}(${error.message})`;
    case "authentication":
      return `認証に失敗しました。GITHUB_TOKEN を確認してください(${error.message})`;
    case "invalidQuery":
      return `検索クエリが不正です(${error.message})`;
    case "notFound":
      return `対象が見つかりません(${error.message})`;
    case "unknown":
      return `GitHub API の呼び出しに失敗しました(${error.message})`;
  }
};

export const createErrorResult = (error: unknown): CallToolResult => ({
  content: [
    {
      type: "text" as const,
      text: describeGithubError(classifyGithubError(error)),
    },
  ],
  isError: true,
});
