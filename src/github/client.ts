import { retry } from "@octokit/plugin-retry";
import { throttling } from "@octokit/plugin-throttling";
import { Octokit } from "@octokit/rest";

const MAX_RATE_LIMIT_RETRIES = 1;

const MyOctokit = Octokit.plugin(retry, throttling);

export type GithubClient = InstanceType<typeof MyOctokit>;

export interface GithubClientOptions {
  token: string;
}

export const createGithubClient = ({
  token,
}: GithubClientOptions): GithubClient =>
  new MyOctokit({
    auth: token,
    throttle: {
      onRateLimit: (_retryAfter, options, octokit, retryCount) => {
        octokit.log.warn(
          `Request quota exhausted for request ${options.method} ${options.url}`,
        );
        return retryCount < MAX_RATE_LIMIT_RETRIES;
      },
      onSecondaryRateLimit: (_retryAfter, options, octokit) => {
        octokit.log.warn(
          `SecondaryRateLimit detected for request ${options.method} ${options.url}`,
        );
      },
    },
  });
