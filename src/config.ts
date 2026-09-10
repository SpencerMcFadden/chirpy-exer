process.loadEnvFile();

type APIConfig = {
  dbURL: string;
  fileserverHits: number;
};

export const config: APIConfig = {
  dbURL: envOrThrow("DB_URL"),
  fileserverHits: 0,
};

function envOrThrow(key: string) {
  const env = process.env[key];
  if (!env) {
    throw new Error(`Environment variable ${key} failed to load`);
  }
  return env;
}
