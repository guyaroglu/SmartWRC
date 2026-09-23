"use server";

import { requireUser } from "@/lib/current-user";
import { searchVisible, type SearchHit } from "@/lib/search";

export async function searchAction(query: string): Promise<SearchHit[]> {
  const user = await requireUser();
  return searchVisible(user, query);
}
