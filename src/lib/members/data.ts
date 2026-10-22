import { parseMemberFile } from "./model";

export async function loadMembers() {
  const response = await fetch(`${import.meta.env.BASE_URL}socios.json`, { cache: "no-cache" });
  if (!response.ok) throw new Error("Não foi possível carregar os cartões de sócio.");
  return parseMemberFile(await response.json());
}

export const membersQueryOptions = {
  queryKey: ["public-members"],
  queryFn: loadMembers,
  staleTime: 30_000,
  retry: 1,
};
