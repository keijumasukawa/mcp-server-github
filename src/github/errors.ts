import { RequestError } from "@octokit/request-error";

const HTTP_STATUS = {
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  unprocessableEntity: 422,
} as const;

const MILLISECONDS_PER_SECOND = 1000;

export type GithubErrorKind =
  | "rateLimit"
  | "secondaryRateLimit"
  | "authentication"
  | "invalidQuery"
  | "notFound"
  | "unknown";

export interface GithubError {
  kind: GithubErrorKind;
  message: string;
  status?: number;
  retryAfterSeconds?: number;
  resetAt?: string;
}

const toResetAt = (
  resetHeader: string | number | undefined,
): string | undefined => {
  if (resetHeader === undefined) {
    return undefined;
  }
  const epochSeconds = Number(resetHeader);
  if (Number.isNaN(epochSeconds)) {
    return undefined;
  }
  return new Date(epochSeconds * MILLISECONDS_PER_SECOND).toISOString();
};

const classifyForbidden = (error: RequestError): GithubError => {
  const headers = error.response?.headers ?? {};
  const retryAfter = headers["retry-after"];
  if (retryAfter !== undefined) {
    return {
      kind: "secondaryRateLimit",
      message: error.message,
      status: error.status,
      retryAfterSeconds: Number(retryAfter),
    };
  }
  if (headers["x-ratelimit-remaining"] === "0") {
    const resetAt = toResetAt(headers["x-ratelimit-reset"]);
    return resetAt === undefined
      ? { kind: "rateLimit", message: error.message, status: error.status }
      : {
          kind: "rateLimit",
          message: error.message,
          status: error.status,
          resetAt,
        };
  }
  return { kind: "unknown", message: error.message, status: error.status };
};

export const classifyGithubError = (error: unknown): GithubError => {
  if (!(error instanceof RequestError)) {
    const message = error instanceof Error ? error.message : String(error);
    return { kind: "unknown", message };
  }
  switch (error.status) {
    case HTTP_STATUS.unauthorized:
      return {
        kind: "authentication",
        message: error.message,
        status: error.status,
      };
    case HTTP_STATUS.forbidden:
      return classifyForbidden(error);
    case HTTP_STATUS.notFound:
      return { kind: "notFound", message: error.message, status: error.status };
    case HTTP_STATUS.unprocessableEntity:
      return {
        kind: "invalidQuery",
        message: error.message,
        status: error.status,
      };
    default:
      return { kind: "unknown", message: error.message, status: error.status };
  }
};
