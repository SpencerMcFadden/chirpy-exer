import { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();

type Config = {
  api: APIConfig;
  db: DBConfig;
};

type APIConfig = {
  fileserverHits: number;
  port: string;
};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./db/migrations/",
};

export const config: Config = {
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig: migrationConfig,
  },
  api: {
    fileserverHits: 0,
    port: envOrThrow("PORT"),
  },
};

function envOrThrow(key: string) {
  const env = process.env[key];
  if (!env) {
    throw new Error(`Environment variable ${key} failed to load`);
  }
  return env;
}
