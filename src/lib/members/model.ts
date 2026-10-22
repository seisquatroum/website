import { isPasswordCheck, type PasswordCheck } from "./password.ts";

export const DUES_LABELS = {
  paid: "Pago",
  unpaid: "Por pagar",
  unknown: "Por confirmar",
  exempt: "Isento",
} as const;

export type DuesStatus = keyof typeof DUES_LABELS;
export type Member = {
  number: number;
  name: string;
  duesStatus: DuesStatus;
  validUntil: string | null;
  passwordCheck?: PasswordCheck;
};
export type MemberFile = {
  version: 1;
  updatedAt: string | null;
  members: Member[];
};
export const MAX_MEMBERS = 5000;

export function normalize(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function parseDuesStatus(value: unknown): DuesStatus | null {
  const status = normalize(value);
  if (["pago", "paga", "pagas", "em dia", "regularizado", "regularizadas", "paid"].includes(status))
    return "paid";
  if (
    [
      "por pagar",
      "nao pago",
      "nao paga",
      "nao pagas",
      "em atraso",
      "em divida",
      "pendente",
      "unpaid",
    ].includes(status)
  )
    return "unpaid";
  if (["", "por confirmar", "a confirmar", "desconhecido", "unknown"].includes(status))
    return "unknown";
  if (["isento", "isenta", "exempt"].includes(status)) return "exempt";
  return null;
}

function calendarDate(year: number, month: number, day: number) {
  if (year < 1900 || year > 2200) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  )
    return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Excel dates are calendar days, not instants: do not apply the browser timezone.
export function parseValidity(value: unknown): string | null | undefined {
  if (value == null || String(value).trim() === "") return null;
  if (value instanceof Date)
    return Number.isNaN(value.getTime())
      ? undefined
      : (calendarDate(value.getFullYear(), value.getMonth() + 1, value.getDate()) ?? undefined);
  if (typeof value === "number") {
    const date = new Date(Date.UTC(1899, 11, 30) + Math.floor(value) * 86_400_000);
    return (
      calendarDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()) ?? undefined
    );
  }
  const text = String(value).trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:[T ].*)?$/.exec(text);
  if (iso) return calendarDate(+iso[1], +iso[2], +iso[3]) ?? undefined;
  const european = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(text);
  if (european) return calendarDate(+european[3], +european[2], +european[1]) ?? undefined;
  return undefined;
}

export function parseNumber(value: unknown) {
  const text = String(value ?? "").trim();
  const number = Number(text);
  return /^\d+$/.test(text) && Number.isSafeInteger(number) && number > 0 && number <= 999999999
    ? number
    : null;
}

export function formatNumber(number: number) {
  return String(number).padStart(3, "0");
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

export function validityExpired(date: string | null, today = new Date()) {
  const localDay = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(today);
  return date !== null && date < localDay;
}

export function parseMemberFile(value: unknown): MemberFile {
  if (!value || typeof value !== "object") throw new Error("Ficheiro de sócios inválido.");
  const file = value as Record<string, unknown>;
  if (Object.keys(file).some((key) => !["version", "updatedAt", "members"].includes(key)))
    throw new Error("O ficheiro contém campos não públicos.");
  if (file.version !== 1 || !Array.isArray(file.members) || file.members.length > MAX_MEMBERS)
    throw new Error("Formato de sócios inválido.");
  if (
    file.updatedAt !== null &&
    (typeof file.updatedAt !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T/.test(file.updatedAt) ||
      Number.isNaN(Date.parse(file.updatedAt)))
  )
    throw new Error("Data de publicação inválida.");
  const seen = new Set<number>();
  const members = file.members.map((raw: unknown): Member => {
    if (!raw || typeof raw !== "object") throw new Error("Cartão inválido.");
    const member = raw as Record<string, unknown>;
    if (
      Object.keys(member).some(
        (key) => !["number", "name", "duesStatus", "validUntil", "passwordCheck"].includes(key),
      )
    )
      throw new Error("Um cartão contém campos não públicos.");
    const number = parseNumber(member.number);
    if (typeof member.number !== "number" || !number || seen.has(number))
      throw new Error("Número de sócio inválido ou repetido.");
    seen.add(number);
    if (typeof member.name !== "string" || !member.name.trim() || member.name.length > 160)
      throw new Error("Nome de sócio inválido.");
    if (typeof member.duesStatus !== "string" || !Object.hasOwn(DUES_LABELS, member.duesStatus))
      throw new Error("Estado de quotas inválido.");
    if (
      member.validUntil !== null &&
      (typeof member.validUntil !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(member.validUntil) ||
        parseValidity(member.validUntil) !== member.validUntil)
    )
      throw new Error("Validade inválida.");
    if (member.passwordCheck !== undefined && !isPasswordCheck(member.passwordCheck))
      throw new Error("Verificador de palavra-passe inválido.");
    // Passwords themselves never belong in the published file.
    return {
      number,
      name: member.name.trim(),
      duesStatus: member.duesStatus as DuesStatus,
      validUntil: member.validUntil as string | null,
      ...(member.passwordCheck ? { passwordCheck: member.passwordCheck as PasswordCheck } : {}),
    };
  });
  return {
    version: 1,
    updatedAt: file.updatedAt as string | null,
    members: members.sort((a, b) => a.number - b.number),
  };
}

export function createMemberFile(
  members: Member[],
  existing: Member[] = [],
  now = new Date(),
): MemberFile {
  const merged = new Map(existing.map((member) => [member.number, member]));
  members.forEach((member) => merged.set(member.number, member));
  return parseMemberFile({
    version: 1,
    updatedAt: now.toISOString(),
    members: [...merged.values()].map(
      ({ number, name, duesStatus, validUntil, passwordCheck }) => ({
        number,
        name,
        duesStatus,
        validUntil,
        ...(passwordCheck ? { passwordCheck } : {}),
      }),
    ),
  });
}
