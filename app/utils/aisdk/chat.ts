import { generateId } from "ai";

export async function createChat(): Promise<string> {
  const id = generateId();
  return id;
}
