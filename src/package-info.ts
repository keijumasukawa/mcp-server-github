import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as z from "zod/v4";

const PACKAGE_JSON_NAME = "package.json";
const MIN_VERSION_LENGTH = 1;

const packageJsonSchema = z.object({
  version: z.string().min(MIN_VERSION_LENGTH),
});

export const readPackageVersion = (moduleUrl: string): string => {
  const filePath = join(
    dirname(fileURLToPath(moduleUrl)),
    "..",
    PACKAGE_JSON_NAME,
  );
  const contents: unknown = JSON.parse(readFileSync(filePath, "utf8"));
  return packageJsonSchema.parse(contents).version;
};
