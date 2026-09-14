import { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();

type Config = {
  api: APIConfig;
  db: DBConfig;
  jwt: JWTConfig;
};

type APIConfig = {
  fileserverHits: number;
  platform: string;
  polkaKey: string;
  port: string;
};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

type JWTConfig = {
  defaultDuration: number;
  refreshDuration: number;
  secret: string;
  issuer: string;
};

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations/",
};

export const config: Config = {
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig: migrationConfig,
  },
  api: {
    fileserverHits: 0,
    platform: envOrThrow("PLATFORM"),
    polkaKey: envOrThrow("POLKA_KEY"),
    port: envOrThrow("PORT"),
  },
  jwt: {
    defaultDuration: 60 * 60,
    refreshDuration: 60 * 60 * 24 * 60 * 1000,
    secret: envOrThrow("TOKEN_SECRET"),
    issuer: "chirpy",
  },
};

function envOrThrow(key: string) {
  const env = process.env[key];
  if (!env) {
    throw new Error(`Environment variable ${key} failed to load`);
  }
  return env;
}
