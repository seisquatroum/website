export type Locale = "pt" | "en";

export type NewsPost = {
  slug: string;
  date: string;
  tag: string;
  title: string;
  body: string;
  href?: string;
  image?: string;
};

type NewsFrontmatter = {
  date?: string;
  tag?: string;
  title?: string;
  href?: string;
};

/**
 * Minimal YAML frontmatter parser for our flat news fields.
 * Avoids gray-matter/Buffer so this module is safe in the browser bundle.
 */
function parseFrontmatter(raw: string): { data: NewsFrontmatter; content: string } {
  const text = raw.replace(/^\uFEFF/, "");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, content: text.trim() };
  }

  const data: NewsFrontmatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const sep = trimmed.indexOf(":");
    if (sep === -1) continue;
    const key = trimmed.slice(0, sep).trim();
    let value = trimmed.slice(sep + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key === "date" || key === "tag" || key === "title" || key === "href") {
      data[key] = value;
    }
  }

  return { data, content: match[2].trim() };
}

function asRawString(mod: unknown): string {
  if (typeof mod === "string") return mod;
  if (mod && typeof mod === "object" && "default" in mod) {
    const value = (mod as { default: unknown }).default;
    if (typeof value === "string") return value;
  }
  return "";
}

const ptModules = import.meta.glob("./**/pt.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, unknown>;

const enModules = import.meta.glob("./**/en.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, unknown>;

const coverModules = import.meta.glob("./**/cover.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function slugFromPath(path: string) {
  const match = path.match(/^\.\/([^/]+)\//);
  return match?.[1] ?? path;
}

function coverForSlug(slug: string) {
  const entry = Object.entries(coverModules).find(([path]) =>
    path.startsWith(`./${slug}/cover.`),
  );
  return entry?.[1];
}

function parseLocalePosts(modules: Record<string, unknown>): NewsPost[] {
  return Object.entries(modules)
    .map(([path, mod]) => {
      const slug = slugFromPath(path);
      const raw = asRawString(mod);
      const { data, content } = parseFrontmatter(raw);
      return {
        slug,
        date: String(data.date ?? ""),
        tag: String(data.tag ?? ""),
        title: String(data.title ?? slug),
        body: content.trim(),
        href: data.href ? String(data.href) : undefined,
        image: coverForSlug(slug),
      } satisfies NewsPost;
    })
    .filter((post) => post.title.length > 0)
    .sort((a, b) => b.slug.localeCompare(a.slug));
}

const newsByLocale: Record<Locale, NewsPost[]> = {
  pt: parseLocalePosts(ptModules),
  en: parseLocalePosts(enModules),
};

export function getNews(locale: Locale): NewsPost[] {
  return newsByLocale[locale] ?? newsByLocale.pt;
}
