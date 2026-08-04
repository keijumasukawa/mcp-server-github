import * as z from "zod/v4";

const MIN_QUERY_LENGTH = 1;
const MIN_PER_PAGE = 1;
const MAX_PER_PAGE = 100;
const DEFAULT_PER_PAGE = 10;
const MIN_PAGE = 1;
const DEFAULT_PAGE = 1;

export const querySchema = z
  .string()
  .min(MIN_QUERY_LENGTH)
  .describe(
    "検索クエリ。修飾子を利用できる(例: repo:owner/name language:typescript)",
  );

export const orderSchema = z
  .enum(["desc", "asc"])
  .optional()
  .describe("並び順。sort 指定時のみ有効。未指定は desc");

export const paginationShape = {
  per_page: z
    .int()
    .min(MIN_PER_PAGE)
    .max(MAX_PER_PAGE)
    .default(DEFAULT_PER_PAGE)
    .describe(
      "1ページあたりの件数(最大 100)。GitHub の既定は 30、本ツールの既定は 10",
    ),
  page: z
    .int()
    .min(MIN_PAGE)
    .default(DEFAULT_PAGE)
    .describe("ページ番号(1 起点)"),
};
