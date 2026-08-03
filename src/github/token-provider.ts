export interface TokenProvider {
  resolve(): Promise<string>;
}

export const createEnvTokenProvider = (
  env: NodeJS.ProcessEnv,
): TokenProvider => ({
  resolve: () => {
    const token = env.GITHUB_TOKEN;
    if (token === undefined || token === "") {
      return Promise.reject(
        new Error("環境変数 GITHUB_TOKEN が設定されていません"),
      );
    }
    return Promise.resolve(token);
  },
});
