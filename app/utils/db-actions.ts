// This file contains server-only database actions
'use server';

import { db } from "../../db/config";
import { userConfig } from "../../db/schema";
import { eq } from "drizzle-orm";

/**
 * Fetch user configuration from the database
 * @param userId The user ID to fetch configuration for
 * @returns The user configuration or null if not found
 */
export async function getUserConfig(userId: string) {
  try {
    const config = await db
      .select()
      .from(userConfig)
      .where(eq(userConfig.id, userId))
      .limit(1);

    return config.length > 0 ? config[0] : null;
  } catch (error) {
    console.error("Error fetching user config:", error);
    throw new Error("Failed to fetch user configuration");
  }
}

/**
 * Update user configuration in the database
 * @param userId The user ID to update configuration for
 * @param updates The configuration updates to apply
 * @returns The updated user configuration
 */
export async function updateUserConfig(userId: string, updates: any) {
  try {
    await db
      .update(userConfig)
      .set(updates)
      .where(eq(userConfig.id, userId));

    // Fetch the updated config
    const updatedConfig = await db
      .select()
      .from(userConfig)
      .where(eq(userConfig.id, userId))
      .limit(1);

    return updatedConfig.length > 0 ? updatedConfig[0] : null;
  } catch (error) {
    console.error("Error updating user config:", error);
    throw new Error("Failed to update user configuration");
  }
}
