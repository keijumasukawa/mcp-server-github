import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ENV_FILE_NAME = ".env";

export const resolveProjectEnvFilePath = (moduleUrl: string): string =>
  join(dirname(fileURLToPath(moduleUrl)), "..", ENV_FILE_NAME);

export const loadEnvFileIfExists = (filePath: string): boolean => {
  if (!existsSync(filePath)) {
    return false;
  }
  process.loadEnvFile(filePath);
  return true;
};
