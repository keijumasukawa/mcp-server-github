import { McpServer } from "@modelcontextprotocol/server";
import { describe, expect, it } from "vitest";

import { createGithubClient } from "../src/github/client.js";
import { createServer } from "../src/server.js";

describe("createServer", () => {
  it("McpServer のインスタンスを生成する", () => {
    const client = createGithubClient({ token: "dummy-token" });

    const server = createServer({ client });

    expect(server).toBeInstanceOf(McpServer);
  });
});
