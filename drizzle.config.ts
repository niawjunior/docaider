import type { Config } from "drizzle-kit";
import { config } from "dotenv";

config();

// Define the configuration
export default {
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  dialect: "postgresql",
  verbose: true,
  strict: true,
} satisfies Config;
