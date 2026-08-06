import regulamentoRaw from "./Regulamento_OpenCall641.md?raw";

export type RegulamentoDoc = {
  title: string;
  markdown: string;
};

function asRawString(mod: unknown): string {
  if (typeof mod === "string") return mod;
  if (mod && typeof mod === "object" && "default" in mod) {
    const value = (mod as { default: unknown }).default;
    if (typeof value === "string") return value;
  }
  return "";
}

/** Load the Open Call regulation markdown (PT source of truth). */
export function getOpenCallRegulamento(): RegulamentoDoc {
  const markdown = asRawString(regulamentoRaw).replace(/^\uFEFF/, "").trim();
  const titleMatch = markdown.match(/^#\s+\**(.+?)\**\s*$/m);
  const title = (titleMatch?.[1] ?? "Regulamento Open Call 641").replace(
    /\*+/g,
    "",
  );
  return { title, markdown };
}
