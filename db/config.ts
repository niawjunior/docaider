import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Next.js automatically loads .env files
// This file is only used in server-side contexts, not in Edge Runtime

// Database connection string from environment variables
const connectionString = process.env.DATABASE_URL || "";

// Connection options
const connectionOptions = {
  max: 10,
  ssl: process.env.NODE_ENV === "production",
};

// Create a query client (for normal queries)
const queryClient = postgres(connectionString, connectionOptions);

// Create a Drizzle ORM instance with our schema
export const db = drizzle(queryClient, { schema });

// Export the schema for use in other parts of the application
export { schema };
