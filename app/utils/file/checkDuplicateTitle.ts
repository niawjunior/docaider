import { db } from "../../../db/config";
import { documents } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Check if a document with the same title already exists for a user
 * @param title Document title to check
 * @param userId User ID
 * @returns Boolean indicating if the title already exists
 */
export async function checkDuplicateTitle(
  title: string,
  userId: string
): Promise<boolean> {
  try {
    // Query the database for documents with the same title and user ID
    const existingDocuments = await db
      .select({ id: documents.id })
      .from(documents)
      .where(
        and(
          eq(documents.title, title),
          eq(documents.userId, userId),
          eq(documents.active, true)
        )
      )
      .limit(1);

    // Return true if any documents were found (title exists), false otherwise
    return existingDocuments.length > 0;
  } catch (error) {
    console.error("Error checking for duplicate title:", error);
    throw new Error("Failed to check for duplicate title");
  }
}
