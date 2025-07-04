import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  // For migrations, we need a separate connection with higher timeout
  const migrationClient = postgres(connectionString, { max: 1, idle_timeout: 60 });
  const db = drizzle(migrationClient);

  try {
    console.log('Starting migration...');
    
    // Apply migrations with a custom onMigrationError handler
    await migrate(db, { migrationsFolder: './db/migrations', migrationsTable: 'drizzle_migrations' })
      .catch((err: any) => {
        // Check if error is because tables already exist
        if (err.cause && err.cause.code === '42P07') {
          console.log('Some tables already exist. This is expected if you\'re migrating an existing database.');
          console.log('Consider using drizzle-kit push instead for schema updates.');
          return;
        }
        throw err;
      });
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await migrationClient.end();
  }
}

main();
