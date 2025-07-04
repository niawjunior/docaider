// Client-side safe database configuration
// This file is used for client components that need to import Drizzle types and schemas
// but don't actually connect to the database

// We only need to re-export the schema for client components
// No actual database connection is needed or created here

// Re-export everything from the schema
export * from "./schema";
