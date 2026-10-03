import postgres from "postgres";

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// Validate that critical fields exist
if (!DB_HOST || !DB_USER || !DB_NAME) {
  throw new Error(
    "Missing required database environment variables in .env file!",
  );
}

export const sql = postgres({
  host: DB_HOST,
  port: DB_PORT ? parseInt(DB_PORT) : 5432,
  username: DB_USER,
  password: DB_PASSWORD || "",
  database: DB_NAME,

  transform: postgres.camel, // Optional: converts snake_case db columns to camelCase JS properties
});
