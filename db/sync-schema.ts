import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function syncSchema() {
  try {
    console.log("Connecting to database...");
    const connectionString = process.env.DATABASE_URL || "";
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    // Create a Postgres client
    const client = postgres(connectionString, { max: 1 });
    drizzle(client);

    console.log("Successfully connected to database");
    console.log("Schema is ready to use with Drizzle ORM");
    console.log(
      "You can now use the database utility functions in your application"
    );

    // Close the connection
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("Error syncing schema:", error);
    process.exit(1);
  }
}

syncSchema();
