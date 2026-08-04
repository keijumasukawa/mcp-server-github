# mcp-server-github

GitHub 検索 MCP サーバー

## 概要

GitHub REST API の Search カテゴリを Model Context Protocol (MCP) のツールとして提供するサーバー。MCP ホストから GitHub の公開情報を検索できる。

- Search カテゴリの全 7 エンドポイントに対応
- レート制限の検知と一時的な障害の再試行に対応
- GitHub の応答をそのまま返却
- stdio による通信

| ツール                | 説明                           | 必須パラメータ       |
| --------------------- | ------------------------------ | -------------------- |
| `search_repositories` | リポジトリの検索               | `q`                  |
| `search_commits`      | コミットの検索                 | `q`                  |
| `search_issues`       | Issue とプルリクエストの検索   | `q`                  |
| `search_users`        | ユーザーと組織の検索           | `q`                  |
| `search_code`         | コードの検索                   | `q`                  |
| `search_labels`       | 特定リポジトリ内のラベルの検索 | `repository_id`, `q` |
| `search_topics`       | トピックの検索                 | `q`                  |

いずれも `per_page` と `page` を指定できる。`per_page` の既定値は 10 とする。

GitHub 側の制約として、検索結果は 1,000 件が上限、レート制限は認証時で毎分 30 リクエスト、コードの検索のみ毎分 10 リクエストとなる。

## 技術スタック

| 分類                | 技術                         | バージョン |
| ------------------- | ---------------------------- | ---------- |
| ランタイム          | Node.js                      | 24 以上    |
| 言語                | TypeScript                   | 6.x        |
| MCP SDK             | @modelcontextprotocol/server | 2.x        |
| GitHub クライアント | @octokit/rest                | 22.x       |
| スキーマ定義        | Zod                          | 4.x        |
| テスト              | Vitest                       | 4.x        |
| 静的検査            | ESLint                       | 10.x       |
| 整形                | Prettier                     | 3.x        |
| パッケージ管理      | pnpm                         | 11.x       |

## アーキテクチャ

サーバーの生成をトランスポートから分離し、エントリのみが通信方式に依存する構成とする。GitHub API との通信は専用の層に集約し、ツールは入力の検証と応答の組み立てに専念する。

```
MCP ホスト
    │ stdio (JSON-RPC)
    ▼
src/index.ts     エントリ。環境変数の読み込みとトランスポートの組み立て
    │
    ▼
src/server.ts    MCP サーバーの生成。トランスポートに依存しない
    │
    ▼
src/tools/       検索ツール。入力の検証と応答の組み立て
    │
    ▼
src/github/      クライアントの生成、トークンの解決、エラーの分類
    │ HTTPS
    ▼
GitHub REST API
```

## ディレクトリ構成

```
.
├── src/
│   ├── github/        # クライアントの生成、トークンの解決、エラーの分類
│   ├── tools/         # 検索ツールの定義とハンドラ
│   ├── env-file.ts    # 環境変数ファイルの読み込み
│   ├── index.ts       # stdio のエントリ
│   └── server.ts      # MCP サーバーの生成
├── __tests__/         # 単体テスト
└── .env.example       # 環境変数の見本
```

## セットアップ

```bash
pnpm install   # 依存関係の取得
pnpm build     # dist の生成
```

環境変数は `.env` に設定する。

| 変数名         | 説明                                          |
| -------------- | --------------------------------------------- |
| `GITHUB_TOKEN` | GitHub API の認証に使う Personal Access Token |

## 利用方法

MCP ホストの設定ファイルに次を記載する。パスは絶対パスとする。

```json
{
  "mcpServers": {
    "mcp-server-github": {
      "command": "node",
      "args": ["<リポジトリの絶対パス>/dist/index.js"]
    }
  }
}
```

設定の変更後はホストを再起動する。

トークンはホスト設定の `env` でも指定できる。両方に指定した場合はホスト設定が優先される。

## 開発コマンド

すべてリポジトリルートで実行する。

| コマンド            | 説明               |
| ------------------- | ------------------ |
| `pnpm build`        | ビルド             |
| `pnpm lint`         | 静的検査           |
| `pnpm lint:fix`     | 静的検査と自動修正 |
| `pnpm format`       | 整形の適用         |
| `pnpm format:check` | 整形の検査         |
| `pnpm typecheck`    | 型検査             |
| `pnpm test`         | 単体テスト         |
