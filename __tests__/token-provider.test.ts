import { describe, expect, it } from "vitest";

import { createEnvTokenProvider } from "../src/github/token-provider.js";

describe("createEnvTokenProvider", () => {
  it("環境変数にトークンがあれば解決する", async () => {
    const provider = createEnvTokenProvider({ GITHUB_TOKEN: "dummy-token" });

    await expect(provider.resolve()).resolves.toBe("dummy-token");
  });

  it("環境変数が未設定なら拒否する", async () => {
    const provider = createEnvTokenProvider({});

    await expect(provider.resolve()).rejects.toThrow("GITHUB_TOKEN");
  });

  it("環境変数が空文字なら拒否する", async () => {
    const provider = createEnvTokenProvider({ GITHUB_TOKEN: "" });

    await expect(provider.resolve()).rejects.toThrow("GITHUB_TOKEN");
  });
});
