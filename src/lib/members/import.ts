import {
  MAX_MEMBERS,
  normalize,
  parseDuesStatus,
  parseNumber,
  parseValidity,
  type Member,
} from "./model.ts";
import { createPasswordCheck } from "./password.ts";

export type Spreadsheet = { name: string; headers: string[]; rows: unknown[][] };
export type ColumnMapping = {
  number: string;
  name: string;
  status: string;
  validity: string;
  password: string;
};
export type DraftMember = {
  row: number;
  number: string;
  name: string;
  status: unknown;
  validity: unknown;
  password?: unknown;
};

export function inferMapping(headers: string[]): ColumnMapping {
  const find = (aliases: string[]) => {
    const index = headers.findIndex((header) => aliases.includes(normalize(header)));
    return index < 0 ? "" : String(index);
  };
  return {
    number: find([
      "numero de socio",
      "numero socio",
      "n socio",
      "n de socio",
      "numero",
      "socio",
      "n",
    ]),
    name: find(["nome", "nome completo", "nome do socio"]),
    status: find([
      "estado quotas",
      "estado cotas",
      "estado das cotas",
      "estado das quotas",
      "cotas",
      "quotas",
    ]),
    validity: find(["validade", "valido ate", "validade das quotas", "validade das cotas"]),
    password: find(["pass", "password", "palavra passe", "palavra pass", "senha"]),
  };
}

export function makeDrafts(sheet: Spreadsheet, mapping: ColumnMapping): DraftMember[] {
  return sheet.rows.flatMap((row, index) => {
    if (row.every((cell) => cell == null || String(cell).trim() === "")) return [];
    const read = (column: string) => (column === "" ? "" : row[Number(column)]);
    return [
      {
        row: index + 2,
        number: String(read(mapping.number) ?? "").trim(),
        name: String(read(mapping.name) ?? "")
          .trim()
          .replace(/\s+/g, " "),
        status: read(mapping.status),
        validity: read(mapping.validity),
        password: read(mapping.password ?? ""),
      },
    ];
  });
}

export function validateDrafts(drafts: DraftMember[], { requirePasswords = false } = {}) {
  const errors: string[] = [];
  const members: Member[] = [];
  if (!drafts.length) errors.push("O ficheiro não contém inscrições.");
  if (drafts.length > MAX_MEMBERS) errors.push(`O limite é de ${MAX_MEMBERS} sócios.`);
  const seen = new Set<number>();
  for (const draft of drafts) {
    const number = parseNumber(draft.number);
    const status = parseDuesStatus(draft.status);
    const validity = parseValidity(draft.validity);
    const issues: string[] = [];
    if (!number) issues.push("indica um número de sócio válido");
    else if (seen.has(number)) issues.push(`o número ${number} está repetido`);
    else seen.add(number);
    if (!draft.name || draft.name.length > 160)
      issues.push("nome em falta ou com mais de 160 caracteres");
    if (!status)
      issues.push("estado de quotas desconhecido; usa Pago, Por pagar, Por confirmar ou Isento");
    if (validity === undefined) issues.push("validade inválida; usa dia/mês/ano");
    if (
      requirePasswords &&
      ((typeof draft.password !== "string" && typeof draft.password !== "number") ||
        !String(draft.password ?? "").trim() ||
        String(draft.password).length > 256)
    )
      issues.push("indica uma Pass com até 256 caracteres");
    if (issues.length) errors.push(`Linha ${draft.row}: ${issues.join("; ")}.`);
    else
      members.push({
        number: number!,
        name: draft.name,
        duesStatus: status!,
        validUntil: validity!,
      });
  }
  return { members, errors };
}

export async function addPasswordChecks(
  members: Member[],
  drafts: DraftMember[],
): Promise<Member[]> {
  const byNumber = new Map(drafts.map((draft) => [parseNumber(draft.number), draft]));
  const result: Member[] = [];
  for (const member of members) {
    const password = byNumber.get(member.number)?.password;
    if (typeof password !== "string" && typeof password !== "number")
      throw new Error(`Falta a Pass do sócio ${member.number}.`);
    result.push({ ...member, passwordCheck: await createPasswordCheck(String(password)) });
  }
  return result;
}

export function assignMissingNumbers(drafts: DraftMember[], existing: Member[]) {
  const used = new Set([
    ...existing.map((member) => member.number),
    ...drafts
      .map((draft) => parseNumber(draft.number))
      .filter((number): number is number => number !== null),
  ]);
  let next = Math.max(0, ...used) + 1;
  return drafts.map((draft) => {
    if (draft.number) return draft;
    const matches = existing.filter((member) => normalize(member.name) === normalize(draft.name));
    // Ambiguous names require a human number; never silently pick one of them.
    if (matches.length > 1) return draft;
    const number = matches.length === 1 ? matches[0].number : next++;
    return { ...draft, number: String(number) };
  });
}

export async function readSpreadsheet(file: File): Promise<Spreadsheet[]> {
  if (!/\.(xlsx|xls|csv)$/i.test(file.name))
    throw new Error("Escolhe um ficheiro .xlsx, .xls ou .csv.");
  if (file.size > 5 * 1024 * 1024) throw new Error("O limite do ficheiro é de 5 MB.");
  const XLSX = await import("xlsx");
  let workbook;
  try {
    workbook = XLSX.read(await file.arrayBuffer(), {
      type: "array",
      raw: true,
      ...(/\.csv$/i.test(file.name) ? { codepage: 65001 } : {}),
      sheetRows: MAX_MEMBERS + 2,
      cellDates: true,
      cellFormula: false,
    });
  } catch {
    throw new Error(
      "Não foi possível abrir o Excel. Confirma que não está protegido por palavra-passe.",
    );
  }
  if (!workbook.SheetNames.length) throw new Error("O ficheiro não tem folhas.");
  return workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    const range = XLSX.utils.decode_range(sheet["!fullref"] ?? sheet["!ref"] ?? "A1");
    if (range.e.r > MAX_MEMBERS || range.e.c >= 100)
      throw new Error("Uma folha excede o limite de 5000 linhas ou 100 colunas.");
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: "",
      raw: true,
      blankrows: true,
    });
    return {
      name,
      headers: (matrix[0] ?? []).map((cell, index) => String(cell || `Coluna ${index + 1}`)),
      rows: matrix.slice(1),
    };
  });
}
