import { readFile } from "node:fs/promises";
import { parseMemberFile } from "../src/lib/members/model.ts";

try {
  const file = parseMemberFile(
    JSON.parse(await readFile(new URL("../public/socios.json", import.meta.url), "utf8")),
  );
  console.log(`Sócios: ${file.members.length} cartões validados. Apenas campos públicos.`);
} catch (error) {
  console.error(
    "Publicação de sócios bloqueada:",
    error instanceof Error ? error.message : "Ficheiro inválido.",
  );
  process.exitCode = 1;
}
