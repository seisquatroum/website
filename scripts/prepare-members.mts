import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  assignMissingNumbers,
  addPasswordChecks,
  inferMapping,
  makeDrafts,
  readSpreadsheet,
  validateDrafts,
} from "../src/lib/members/import.ts";
import { createMemberFile, parseMemberFile } from "../src/lib/members/model.ts";

const args = process.argv.slice(2);
const input = args[0];
if (!input || input.startsWith("--")) {
  console.error(
    'Uso: npm run socios:preparar -- "caminho/inscricoes.xlsx" [--atribuir-numeros] [--output .local/socios.json]',
  );
  process.exitCode = 1;
} else {
  try {
    const flagIndex = args.indexOf("--output");
    if (flagIndex >= 0 && (!args[flagIndex + 1] || args[flagIndex + 1].startsWith("--")))
      throw new Error("Indica o destino depois de --output.");
    const output = resolve(flagIndex < 0 ? ".local/socios.json" : args[flagIndex + 1]);
    if (output === resolve(input)) throw new Error("O destino não pode ser o ficheiro original.");
    const current = parseMemberFile(
      JSON.parse(await readFile(new URL("../public/socios.json", import.meta.url), "utf8")),
    );
    const buffer = await readFile(resolve(input));
    const sheets = await readSpreadsheet(new File([buffer], input));
    const sheet = sheets[0];
    const mapping = inferMapping(sheet.headers);
    if (mapping.name === "" || mapping.status === "" || mapping.password === "")
      throw new Error(
        "Escolhe as colunas de nome, Estado Quotas e Pass. Usa a ferramenta /gestao para escolher as colunas.",
      );
    let drafts = makeDrafts(sheet, mapping);
    if (args.includes("--atribuir-numeros")) drafts = assignMissingNumbers(drafts, current.members);
    const validation = validateDrafts(drafts, { requirePasswords: true });
    if (validation.errors.length) throw new Error(validation.errors.slice(0, 10).join("\n"));
    const file = createMemberFile(
      await addPasswordChecks(validation.members, drafts),
      current.members,
    );
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, `${JSON.stringify(file, null, 2)}\n`, "utf8");
    console.log(
      `${validation.members.length} cartões preparados; ${file.members.length} no ficheiro final. Destino: ${output}`,
    );
    console.log(
      "O Excel original não foi alterado. Revê o resultado antes de publicar public/socios.json.",
    );
    if (mapping.number === "")
      console.log(
        "Guarda os números atribuídos numa coluna Número de sócio do Excel para manter os endereços estáveis.",
      );
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Não foi possível preparar os cartões.");
    process.exitCode = 1;
  }
}
