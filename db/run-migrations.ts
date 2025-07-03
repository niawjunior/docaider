import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Database connection string from environment variables
const connectionString = process.env.DATABASE_URL || "";

// Connection options
const connectionOptions = {
  max: 1, // Use a single connection for migrations
  ssl: process.env.NODE_ENV === "production",
};

// Run migrations
async function runMigrations() {
  console.log("Connecting to database...");
  const migrationClient = postgres(connectionString, connectionOptions);
  const db = drizzle(migrationClient);

  try {
    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    // Always close the migration client
    await migrationClient.end();
  }
}

// Execute migrations
runMigrations();
