import { describe, expect, it } from "vitest";

import { createGithubClient } from "./client.js";

describe("createGithubClient", () => {
  it("Search API のメソッドを備えたクライアントを生成する", () => {
    const client = createGithubClient({ token: "dummy-token" });

    expect(typeof client.rest.search.repos).toBe("function");
    expect(typeof client.rest.search.code).toBe("function");
  });
});
