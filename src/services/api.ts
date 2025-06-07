import { BASE_URL } from "./constant";

export interface Suggestion { id: string; name: string; category: string; value: number | string; }

export async function fetchSuggestions(): Promise<Suggestion[]> {
  const res = await fetch(`${BASE_URL}/autocomplete`);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
}