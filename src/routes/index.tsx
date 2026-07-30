import { createFileRoute } from "@tanstack/react-router";
import { forwardRef } from "react";
import { site, t, type Locale } from "@/content/site";
import { useI18n } from "@/lib/i18n";
import { SiteNav, type NavItem } from "@/components/SiteNav";
import logoAsset from "@/assets/641-logo.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  component: Index,
});

/* ------------------------------------------------------------------ *
 * CutoutText — renders each character as an individual magazine
 * cutout with mixed fonts, backgrounds and rotations. Used for the
 * big scrapbook headlines and CTAs.
 * ------------------------------------------------------------------ */
/* Headline cutout palette — locked to the magenta family
 * (#C31958 magenta, #CF5D87 pink, #6A0A30 ink, #A4144D deep, #F2C4D4 soft).
 * All swatches stay within magenta/pink hues so headlines read like
 * one coherent scrapbook. */
const CUTOUT_PALETTE = [
  // Directly mirrors the reference alphabet: bold pink backgrounds with
  // black or dark-magenta letters, plus inverse magenta/cream combos.
  "bg-brand-pink-soft text-brand-black",
  "bg-brand-pink text-brand-black",
  "bg-brand-magenta text-brand-pink-soft",
  "bg-brand-pink-soft text-brand-magenta-ink",
  "bg-brand-pink text-brand-magenta-ink",
  "bg-brand-magenta-ink text-brand-pink-soft",
  "bg-brand-pink-deep text-brand-pink-soft",
  "bg-brand-pink-soft text-brand-pink-deep",
  "bg-brand-magenta text-white",
  "bg-brand-pink text-white",
];
const CUTOUT_FONTS = [
  "font-marker uppercase",
  "font-serif-display italic",
  "font-serif-display font-black",
  "font-sans font-black uppercase",
  "font-marker lowercase",
  "font-serif-display italic lowercase",
  "font-sans font-black italic",
];
// Seeded pseudo-random so SSR & client stay consistent.
function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function CutoutText({
  children,
  className = "",
  size = "text-3xl sm:text-4xl md:text-5xl",
  gap = "gap-1",
}: {
  children: string;
  className?: string;
  size?: string;
  gap?: string;
}) {
  const words = children.split(/(\s+)/);
  return (
    <span className={`inline-flex flex-wrap items-end ${gap} ${className}`}>
      {words.map((w, wi) => {
        if (/^\s+$/.test(w)) return <span key={wi} className="w-2 sm:w-3" />;
        return (
          <span key={wi} className={`inline-flex items-end ${gap}`}>
            {Array.from(w).map((ch, ci) => {
              const seed = hash(`${w}-${wi}-${ci}`);
              const bg = CUTOUT_PALETTE[seed % CUTOUT_PALETTE.length];
              const font = CUTOUT_FONTS[(seed >> 3) % CUTOUT_FONTS.length];
              const rot = ((seed % 11) - 5) * 1.6; // -8 .. 8 deg
              const yOff = ((seed >> 5) % 9) - 4; // -4 .. 4 px
              const padX = (seed >> 7) % 2 === 0 ? "px-2" : "px-2.5";
              const padY = (seed >> 9) % 2 === 0 ? "py-0.5" : "py-1";
              // Every other letter uses an irregular torn-paper clip-path
              const clips = [
                "polygon(3% 8%, 12% 0%, 32% 6%, 55% 0%, 78% 5%, 96% 0%, 100% 24%, 97% 55%, 100% 82%, 92% 100%, 68% 96%, 42% 100%, 18% 96%, 2% 100%, 0% 74%, 3% 42%, 0% 18%)",
                "polygon(0% 6%, 22% 0%, 48% 8%, 72% 0%, 100% 10%, 96% 40%, 100% 72%, 88% 100%, 60% 94%, 32% 100%, 8% 92%, 0% 68%, 4% 34%)",
                "polygon(6% 0%, 30% 6%, 60% 0%, 92% 8%, 100% 32%, 94% 62%, 100% 92%, 74% 100%, 44% 94%, 14% 100%, 0% 78%, 6% 46%, 0% 20%)",
              ];
              const clip = clips[(seed >> 11) % clips.length];
              return (
                <span
                  key={ci}
                  className={`relative inline-block paper-tex ${bg} ${font} ${size} ${padX} ${padY} leading-none`}
                  style={{
                    transform: `rotate(${rot}deg) translateY(${yOff}px)`,
                    clipPath: clip,
                    filter:
                      "drop-shadow(2px 3px 0 rgba(0,0,0,0.9)) drop-shadow(4px 6px 6px rgba(0,0,0,0.35))",
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
}

/* Cutout button — a magazine-style "torn" CTA. forwardRef so it can be
 * used as the trigger of a Radix Dialog with asChild. */
type CutoutButtonProps = {
  children: string;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
  variant?: "accent" | "magenta" | "black" | "white";
  className?: string;
  size?: string;
};
const CutoutButton = forwardRef<HTMLElement, CutoutButtonProps>(function CutoutButton(
  {
    children,
    onClick,
    href,
    target,
    rel,
    variant = "accent",
    className = "",
    size = "text-lg sm:text-xl",
    ...rest
  },
  ref,
) {
  const variants = {
    accent: "bg-brand-accent text-brand-black",
    magenta: "bg-brand-magenta text-white",
    black: "bg-brand-black text-brand-pink",
    white: "bg-white text-brand-black",
  } as const;
  const shared = `group relative inline-flex items-center gap-2 paper-tex ${variants[variant]} border-[3px] border-brand-black px-5 py-3 sm:px-6 sm:py-3.5 font-serif-display italic ${size} font-black uppercase tracking-tight shadow-[6px_6px_0_0_#1a1a1a] transition-all hover:-translate-y-1 hover:translate-x-0.5 hover:shadow-[8px_10px_0_0_#6b1038] active:translate-y-0 active:translate-x-0 active:shadow-[2px_2px_0_0_#1a1a1a] rotate-[-1.5deg] cursor-pointer ${className}`;
  const inner = (
    <>
      <span
        aria-hidden
        className="absolute -left-3 -top-3 h-4 w-10 rotate-[-14deg] tape-strip"
      />
      <span className="relative">{children}</span>
      <span aria-hidden className="relative text-xl leading-none">✷</span>
    </>
  );
  if (href) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        className={shared}
        {...rest}
      >
        {inner}
      </a>
    );
  }
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      onClick={onClick}
      className={shared}
      {...rest}
    >
      {inner}
    </button>
  );
});

/* ------------------------------------------------------------------ *
 * Utility: render simple **bold** markers inside a string as <strong>.
 * Keeps content editing in site.ts natural without a full MD parser.
 * ------------------------------------------------------------------ */
function RichText({ children }: { children: string }) {
  const parts = children.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-bold">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Scrapbook decorative primitives — washi tapes, post-its, torn
 * paper scraps, and a digital-camera photo frame.
 * ------------------------------------------------------------------ */
const WASHI_COLORS = {
  magenta: "bg-brand-magenta/85",
  yellow: "bg-brand-accent/90",
  teal: "bg-brand-teal/85",
} as const;

function WashiTape({
  variant = "magenta",
  className = "",
  style,
}: {
  variant?: keyof typeof WASHI_COLORS;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute z-20 block opacity-95 ${WASHI_COLORS[variant]} ${className}`}
      style={{
        filter: "drop-shadow(2px 3px 3px rgba(0,0,0,0.4))",
        ...style,
      }}
    />
  );
}

function PostIt({
  children,
  color = "pink",
  rotate = "-rotate-3",
  className = "",
}: {
  children: React.ReactNode;
  color?: "pink" | "yellow" | "teal" | "cream";
  rotate?: string;
  className?: string;
}) {
  const bg = {
    pink: "bg-brand-pink-soft text-brand-magenta-ink",
    yellow: "bg-brand-accent text-brand-magenta-ink",
    teal: "bg-brand-teal text-brand-paper",
    cream: "bg-brand-paper text-brand-black",
  }[color];
  return (
    <div
      className={`postit paper-tex ${bg} ${rotate} inline-block px-4 py-3 font-hand text-lg leading-tight ${className}`}
      style={{
        clipPath:
          "polygon(0 4%, 96% 0, 100% 92%, 88% 100%, 4% 96%, 0 88%)",
      }}
    >
      {children}
    </div>
  );
}

function ScrapPaper({
  children,
  color = "cream",
  rotate = "-rotate-1",
  className = "",
}: {
  children: React.ReactNode;
  color?: "cream" | "magenta" | "pink" | "yellow";
  rotate?: string;
  className?: string;
}) {
  const solid = {
    cream: "bg-brand-paper text-brand-black",
    magenta: "bg-brand-magenta text-brand-paper",
    pink: "bg-brand-pink-soft text-brand-magenta-ink",
    yellow: "bg-brand-accent text-brand-magenta-ink",
  }[color];
  return (
    <div
      className={`relative paper-tex ${solid} ${rotate} inline-block px-5 py-4 ${className}`}
      style={{
        filter:
          "drop-shadow(3px 4px 0 rgba(0,0,0,0.85)) drop-shadow(6px 8px 10px rgba(0,0,0,0.35))",
        clipPath:
          "polygon(2% 6%, 18% 0%, 42% 4%, 68% 0%, 92% 6%, 100% 22%, 96% 48%, 100% 76%, 88% 100%, 62% 96%, 34% 100%, 8% 94%, 0% 72%, 4% 42%, 0% 18%)",
      }}
    >
      {children}
    </div>
  );
}

function CameraFrame({
  children,
  className = "",
  rotate = "rotate-2",
  variant = "black",
}: {
  children: React.ReactNode;
  className?: string;
  rotate?: string;
  variant?: "black" | "pink";
}) {
  const body =
    variant === "pink"
      ? "bg-gradient-to-br from-brand-pink via-brand-magenta to-brand-magenta-ink"
      : "bg-gradient-to-br from-neutral-800 via-neutral-900 to-black";
  return (
    <div className={`relative ${rotate} ${className}`} style={{ aspectRatio: "5 / 4" }}>
      <div
        className={`relative h-full w-full rounded-md border-[3px] border-neutral-900 p-1.5 shadow-[6px_8px_0_rgba(0,0,0,0.55)] ${body}`}
      >
        <div className="absolute left-1.5 top-1/2 z-10 h-[36%] w-[20%] -translate-y-1/2 rounded-full border-2 border-neutral-600 bg-neutral-950 shadow-inner" />
        <div className="absolute bottom-[14%] left-2 h-1 w-3 rounded-full bg-neutral-700" />
        <div className="absolute right-1 top-[16%] bottom-[16%] left-[26%] overflow-hidden rounded-sm border border-neutral-600/80 bg-black">
          {children}
        </div>
      </div>
    </div>
  );
}

function StarSticker({
  className = "",
  size = 56,
  rotate = 0,
  style,
}: {
  className?: string;
  size?: number;
  rotate?: number;
  style?: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute z-10 select-none font-bold leading-none text-brand-magenta ${className}`}
      style={{
        fontSize: size * 0.85,
        transform: `rotate(${rotate}deg)`,
        filter: "drop-shadow(2px 3px 3px rgba(0,0,0,0.35))",
        ...style,
      }}
    >
      ✦
    </span>
  );
}

/* Paper-textured language toggle showing both PT and EN as little
 * flag pills side by side; click either one to switch. Mimics a
 * washi-taped sticker on the cover. */
function LangToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const pill = (code: "pt" | "en", flag: string) => {
    const active = locale === code;
    return (
      <button
        key={code}
        type="button"
        onClick={() => setLocale(code)}
        aria-label={code}
        className={`paper-tex flex items-center gap-1 border-[2.5px] border-brand-black px-2 py-1 font-marker text-xs uppercase leading-none shadow-[2px_2px_0_#000] transition-transform hover:-translate-y-0.5 ${
          active
            ? "bg-brand-magenta text-brand-paper -rotate-2"
            : "bg-brand-paper text-brand-black rotate-2 opacity-80"
        }`}
      >
        <span aria-hidden className="text-sm leading-none">{flag}</span>
        <span>{code}</span>
      </button>
    );
  };
  return (
    <div
      className={`relative flex items-center gap-1 rounded-sm px-1 py-1 ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-2 left-1/2 h-3 w-10 -translate-x-1/2 -rotate-6 tape-strip"
      />
      {pill("pt", "🇵🇹")}
      {pill("en", "🇬🇧")}
    </div>
  );
}

/* ---- Decorative sticker photo placeholder (paper polaroid look) ---- */
function Polaroid({
  label,
  className = "",
  aspect = "aspect-square",
  rotate = "rotate-2",
  tape = true,
  src,
}: {
  label: string;
  className?: string;
  aspect?: string;
  rotate?: string;
  tape?: boolean;
  src?: string;
}) {
  return (
    <div className={`relative ${rotate} ${className}`}>
      {tape && (
        <div className="absolute left-1/2 top-[-14px] z-10 h-6 w-24 -translate-x-1/2 -rotate-6 bg-brand-accent/80 shadow-sm" />
      )}
      <div className="border-4 border-white bg-white p-2 sticker-shadow">
        <div
          className={`${aspect} grid w-full place-items-center bg-gradient-to-br from-stone-200 to-stone-300 bg-cover bg-center`}
          style={src ? { backgroundImage: `url(${src})` } : undefined}
        >
          {!src && (
            <span className="px-3 text-center font-hand text-xl text-stone-500">{label}</span>
          )}
        </div>
      </div>
    </div>
  );
}
function ZPage({
  sectionId,
  children,
  bg = "paper",
  className = "",
}: {
  sectionId?: string;
  children: React.ReactNode;
  bg?: "paper" | "dark" | "magenta" | "cream";
  className?: string;
}) {
  const bgCls =
    bg === "dark"
      ? "bg-real-paper-dark text-brand-pink"
      : bg === "magenta"
      ? "bg-real-paper-magenta text-brand-pink"
      : bg === "cream"
      ? "bg-real-paper text-brand-black"
      : "bg-real-paper text-brand-black";
  const Tag = sectionId ? "section" : "div";
  return (
    <Tag
      id={sectionId}
      className={`relative w-full overflow-hidden zine-noise ${sectionId ? "scroll-mt-14" : ""} ${bgCls} ${className}`}
    >
      <div className="relative mx-auto flex w-full max-w-4xl flex-col px-5 py-10 sm:px-6 sm:py-12">
        {children}
      </div>
    </Tag>
  );
}

function Cover({ locale, sectionId }: { locale: Locale; sectionId?: string }) {
  return (
    <ZPage bg="dark" className="ink-stain min-h-svh" sectionId={sectionId}>
      <WashiTape variant="yellow" className="left-4 top-2 h-4 w-32 -rotate-3" />
      <WashiTape variant="teal" className="right-16 top-6 h-4 w-24 rotate-6" />
      <StarSticker className="left-[6%] top-[38%]" size={40} rotate={-18} />
      <StarSticker className="right-[10%] top-[16%]" size={48} rotate={22} />
      <StarSticker className="left-[42%] bottom-[8%]" size={36} rotate={12} />
      <div className="flex min-h-[70vh] flex-col items-center justify-center py-8 text-center">
        <span className="mb-3 inline-block -rotate-2 border border-brand-pink bg-brand-magenta px-2 py-0.5 font-mono-zine text-[9px] uppercase tracking-widest text-brand-pink shadow-[2px_2px_0_#000]">
          {t(site.hero.tagline, locale)}
        </span>
        <h1 className="leading-[1]">
          <CutoutText size="text-2xl sm:text-3xl" gap="gap-0.5">
            {t(site.hero.title, locale)}
          </CutoutText>
        </h1>
        <img
          src={logoAsset}
          alt="641"
          className="mt-3 h-24 w-auto rotate-1 rounded-sm bg-brand-pink px-2 py-1 drop-shadow-[4px_4px_0_#6b1038] sm:h-28"
        />
        <p className="mt-4 max-w-[85%] text-xs leading-snug text-brand-pink-soft/95 sm:text-sm">
          {t(site.hero.subtitle, locale)}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <PostIt color="yellow" rotate="-rotate-3" className="!text-sm !px-3 !py-1.5">
            Oeiras · PT
          </PostIt>
          <PostIt color="teal" rotate="rotate-2" className="!text-sm !px-3 !py-1.5">
            {locale === "pt" ? "aberto a novas bandas" : "open to new bands"}
          </PostIt>
        </div>
        <p className="mt-6 font-hand text-lg text-brand-accent">
          {locale === "pt" ? "folheia →" : "flip →"}
        </p>
      </div>
    </ZPage>
  );
}

function SobreA({ locale, sectionId }: { locale: Locale; sectionId?: string }) {
  return (
    <ZPage bg="paper" sectionId={sectionId}>
      <WashiTape variant="teal" className="left-6 top-2 h-4 w-28 -rotate-6" />
      <WashiTape variant="yellow" className="right-8 top-4 h-4 w-24 rotate-6" />
      <div className="flex flex-col">
        <h2 className="mb-3 -rotate-1">
          <CutoutText size="text-2xl sm:text-3xl">
            {t(site.sobre.kicker, locale)}
          </CutoutText>
        </h2>
        <div className="space-y-3 text-sm leading-relaxed sm:text-base">
          {site.sobre.body[locale].map((para, i) => (
            <p key={i}>
              <RichText>{para}</RichText>
            </p>
          ))}
        </div>
        <div className="mt-4 border-l-4 border-brand-magenta bg-brand-pink-soft/50 p-3 text-sm">
          <p className="font-bold">{t(site.sobre.highlight, locale)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="inline-block -rotate-3 bg-brand-black px-3 py-1 font-marker text-xs text-brand-pink shadow-[2px_2px_0_#6b1038]">
            {t(site.sobre.est, locale)}
          </span>
          <StarSticker className="relative" size={36} rotate={12} style={{ position: "relative" }} />
        </div>
      </div>
    </ZPage>
  );
}

function SobreB({ locale }: { locale: Locale }) {
  return (
    <ZPage bg="magenta">
      <WashiTape variant="yellow" className="left-8 top-2 h-4 w-24 -rotate-3" />
      <div className="flex flex-col">
        <h3 className="mb-4 flex rotate-1 justify-center">
          <CutoutText size="text-xl sm:text-2xl">
            {locale === "pt" ? "porquê a 641?" : "why 641?"}
          </CutoutText>
        </h3>
        <div className="flex flex-col justify-center gap-3">
          {site.ajudar.reasons.map((r, i) => (
            <div
              key={i}
              className={`paper-tex border-[3px] border-brand-black bg-brand-pink p-3 text-brand-black shadow-[4px_4px_0_0_#000] ${
                i % 2 === 0 ? "-rotate-1" : "rotate-1"
              }`}
            >
              <h4 className="font-serif-display text-base font-black italic uppercase text-brand-magenta-ink">
                {t(r.title, locale)}
              </h4>
              <p className="mt-1 text-xs leading-snug sm:text-sm">{t(r.body, locale)}</p>
            </div>
          ))}
        </div>
      </div>
    </ZPage>
  );
}

function ServicesPage({ locale }: { locale: Locale }) {
  return (
    <ZPage bg="dark">
      <StarSticker className="right-[8%] top-[6%]" size={40} rotate={20} />
      <div className="flex flex-col">
        <h2 className="mb-4 flex justify-center -rotate-1">
          <CutoutText size="text-xl sm:text-2xl">
            {locale === "pt" ? "O QUE FAZEMOS" : "WHAT WE DO"}
          </CutoutText>
        </h2>
        <div className="flex flex-col justify-center gap-3">
          {site.services.map((s, i) => (
            <div
              key={i}
              className={`relative border-[3px] border-brand-black bg-brand-paper p-3 text-brand-black shadow-[4px_4px_0_0_#000] ${
                i % 2 === 0 ? "-rotate-1" : "rotate-1"
              }`}
            >
              {"badge" in s && s.badge && (
                <div className="absolute -right-2 -top-2 rotate-6 border border-brand-black bg-brand-accent px-2 py-0.5 text-[9px] font-bold uppercase">
                  {t(s.badge, locale)}
                </div>
              )}
              <h3 className="font-serif-display text-base font-black italic uppercase">
                {t(s.title, locale)}
              </h3>
              <p className="mt-1 text-xs leading-snug sm:text-sm">{t(s.body, locale)}</p>
            </div>
          ))}
        </div>
      </div>
    </ZPage>
  );
}

function NewsPage({
  locale,
  items,
  title,
  sectionId,
}: {
  locale: Locale;
  items: readonly (typeof site.news)[number][];
  title?: string;
  sectionId?: string;
}) {
  return (
    <ZPage bg="dark" sectionId={sectionId}>
      <WashiTape variant="magenta" className="left-6 top-2 h-4 w-32 -rotate-3" />
      <StarSticker className="right-[8%] top-[6%]" size={36} rotate={16} />
      <div className="flex flex-col">
        {title && (
          <h2 className="mb-3 -rotate-1">
            <CutoutText size="text-xl sm:text-2xl">{title}</CutoutText>
          </h2>
        )}
        <div className="flex flex-col justify-center gap-4">
          {items.map((n, i) => {
            const tagLower = n.tag.pt.toLowerCase();
            const cameraVariant: "black" | "pink" = tagLower.includes("workshop") ? "pink" : "black";
            return (
              <div
                key={i}
                className={`grid grid-cols-[100px_1fr] items-center gap-3 ${
                  i % 2 === 0 ? "-rotate-1" : "rotate-1"
                }`}
              >
                <CameraFrame rotate="" className="w-full" variant={cameraVariant}>
                  <div
                    className={`flex h-full w-full flex-col items-center justify-center p-1 text-center ${
                      cameraVariant === "pink"
                        ? "bg-gradient-to-br from-brand-pink via-brand-magenta to-brand-magenta-ink"
                        : "bg-gradient-to-br from-brand-magenta-ink via-brand-black to-black"
                    }`}
                  >
                    <span className="font-marker text-[10px] leading-tight text-brand-pink-soft drop-shadow-[1px_1px_0_#000]">
                      {t(n.tag, locale)}
                    </span>
                    <span className="mt-0.5 font-mono-zine text-[7px] uppercase tracking-widest text-brand-accent">
                      rec ●
                    </span>
                  </div>
                </CameraFrame>
                <PostIt
                  color="cream"
                  rotate={i % 2 === 0 ? "-rotate-2" : "rotate-2"}
                  className="!py-2 !px-3"
                >
                  <p className="font-mono-zine text-[8px] uppercase tracking-widest text-brand-magenta">
                    {n.date}
                  </p>
                  <h3 className="mt-0.5 font-serif-display text-sm font-black italic leading-tight text-brand-magenta-ink">
                    {t(n.title, locale)}
                  </h3>
                  <p className="mt-1 font-hand text-xs leading-snug text-brand-black">
                    {t(n.excerpt, locale)}
                  </p>
                </PostIt>
              </div>
            );
          })}
        </div>
      </div>
    </ZPage>
  );
}

function AjudarPage({ locale, sectionId }: { locale: Locale; sectionId?: string }) {
  return (
    <ZPage bg="paper" sectionId={sectionId}>
      <StarSticker className="right-[6%] top-[8%]" size={40} rotate={16} />
      <WashiTape variant="magenta" className="left-6 top-3 h-4 w-28 -rotate-6" />
      <div className="flex flex-col">
        <h2 className="mb-3 -rotate-1">
          <CutoutText size="text-xl sm:text-2xl">
            {locale === "pt" ? "doações" : "donate"}
          </CutoutText>
        </h2>
        <p className="text-sm leading-relaxed">
          <RichText>{t(site.ajudar.intro, locale)}</RichText>
        </p>
        <div className="mx-auto mt-5 w-full max-w-[260px] rotate-2 border-[3px] border-brand-black bg-brand-magenta halftone p-5 text-center text-white shadow-[6px_6px_0_0_#000]">
          <span className="font-mono text-[10px] uppercase tracking-widest">MB WAY</span>
          <div className="mt-2 font-marker text-2xl tracking-wide sm:text-3xl">
            {site.ajudar.mbwayNumber}
          </div>
          <p className="mt-2 text-xs text-white/90">
            {locale === "pt"
              ? "qualquer valor conta — obrigado!"
              : "any amount counts — thank you!"}
          </p>
        </div>
        <p className="mt-auto pt-3 font-hand text-lg text-brand-magenta">
          {t(site.ajudar.outro, locale)}
        </p>
      </div>
    </ZPage>
  );
}

function JuntaPage({ locale }: { locale: Locale }) {
  return (
    <ZPage bg="magenta">
      <WashiTape variant="yellow" className="right-6 top-2 h-4 w-24 rotate-6" />
      <div className="flex flex-col">
        <h3 className="-rotate-1">
          <CutoutText size="text-xl sm:text-2xl">
            {locale === "pt" ? "junta-te a nós" : "join us"}
          </CutoutText>
        </h3>
        <p className="mt-3 text-xs leading-relaxed text-brand-pink-soft/95 sm:text-sm">
          {locale === "pt"
            ? "Há muitas formas de ajudar. Torna-te sócio/a, dá uma mão em eventos, oferece competências, equipamento ou espaço. A comunidade também se constrói com tempo."
            : "Many ways to help. Become a member, lend a hand at events, share skills, gear or space. Community is built with time too."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <PostIt color="yellow" rotate="-rotate-2" className="!text-sm !px-3 !py-1.5">
            {locale === "pt" ? "sócio/a" : "member"}
          </PostIt>
          <PostIt color="teal" rotate="rotate-2" className="!text-sm !px-3 !py-1.5">
            {locale === "pt" ? "voluntariado" : "volunteer"}
          </PostIt>
          <PostIt color="pink" rotate="-rotate-1" className="!text-sm !px-3 !py-1.5">
            {locale === "pt" ? "equipamento" : "gear"}
          </PostIt>
        </div>
        <div className="mt-auto flex flex-wrap gap-3 pt-4">
          <CutoutButton href="#contactos" variant="accent" size="text-sm">
            {locale === "pt" ? "FALA CONNOSCO" : "GET IN TOUCH"}
          </CutoutButton>
          <CutoutButton
            href={site.sobre.regulamentoUrl}
            target="_blank"
            rel="noreferrer"
            variant="black"
            size="text-xs"
          >
            {t(site.sobre.regulamentoLabel, locale)}
          </CutoutButton>
        </div>
      </div>
    </ZPage>
  );
}

function BandaPage({ locale, sectionId }: { locale: Locale; sectionId?: string }) {
  return (
    <ZPage bg="paper" sectionId={sectionId}>
      <WashiTape variant="magenta" className="-top-2 left-8 h-5 w-32 -rotate-6" />
      <WashiTape variant="yellow" className="-top-2 right-8 h-5 w-24 rotate-6" />
      <div className="flex flex-col">
        <h2 className="-rotate-1">
          <CutoutText size="text-lg sm:text-xl">{t(site.banda.kicker, locale)}</CutoutText>
        </h2>
        <div className="mt-3 flex items-center gap-3">
          <Polaroid
            label={site.banda.name}
            rotate="-rotate-2"
            aspect="aspect-[4/5]"
            className="w-32 shrink-0"
          />
          <h3>
            <CutoutText size="text-2xl sm:text-3xl">{site.banda.name}</CutoutText>
          </h3>
        </div>
        <p className="mt-4 border-l-4 border-brand-magenta pl-3 text-xs italic leading-relaxed sm:text-sm">
          “{t(site.banda.quote, locale)}”
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(site.banda.links).map(([name, url]) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="border-2 border-brand-black bg-brand-pink-soft px-2 py-0.5 text-[10px] font-bold uppercase text-brand-magenta-ink transition hover:bg-brand-magenta hover:text-brand-paper"
            >
              {name}
            </a>
          ))}
        </div>
        <p className="mt-auto pt-3 font-hand text-xs text-brand-magenta-ink/70">
          {site.banda.photoCredits}
        </p>
      </div>
    </ZPage>
  );
}

function ConcursoPage({ locale, sectionId }: { locale: Locale; sectionId?: string }) {
  const c = site.concurso;
  return (
    <ZPage bg="dark" sectionId={sectionId}>
      <div aria-hidden className="absolute inset-0 halftone opacity-20" />
      <div aria-hidden className="absolute -top-2 left-8 h-5 w-24 -rotate-6 tape-strip" />
      <div aria-hidden className="absolute -top-2 right-10 h-5 w-20 rotate-6 tape-strip" />
      <div className="relative flex flex-col">
        <span className="inline-block w-fit -rotate-2 border-2 border-brand-pink bg-brand-black px-2 py-0.5 font-mono-zine text-[9px] uppercase tracking-widest text-brand-accent">
          {t(c.kicker, locale)}
        </span>
        <h3 className="mt-3">
          <CutoutText size="text-xl sm:text-2xl">{t(c.title, locale)}</CutoutText>
        </h3>
        <p className="mt-3 font-serif-display text-xs italic leading-relaxed text-brand-pink/95 sm:text-sm">
          {c.body[locale][0]}
        </p>
        <p className="mt-2 font-mono-zine text-[10px] uppercase tracking-widest text-brand-accent">
          {t(c.deadline, locale)}
        </p>
        <div className="mt-auto flex flex-col items-start gap-3 pt-4">
          <Dialog>
            <DialogTrigger asChild>
              <CutoutButton variant="accent" size="text-lg">
                {t(c.ctaLabel, locale)}
              </CutoutButton>
            </DialogTrigger>
            <DialogContent className="max-w-lg border-4 border-brand-black bg-brand-pink p-0 text-brand-black">
              <div className="relative overflow-hidden">
                <div aria-hidden className="absolute -top-4 left-10 h-6 w-32 -rotate-6 tape-strip" />
                <div className="p-6 sm:p-8">
                  <DialogHeader>
                    <span className="inline-block w-fit -rotate-2 bg-brand-black px-3 py-1 font-mono-zine text-[10px] uppercase tracking-widest text-brand-accent">
                      {t(c.kicker, locale)}
                    </span>
                    <DialogTitle asChild>
                      <h4 className="mt-3 text-left">
                        <CutoutText size="text-2xl sm:text-3xl">{t(c.title, locale)}</CutoutText>
                      </h4>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-5 space-y-3 text-base leading-relaxed">
                    {c.body[locale].map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                  <p className="mt-4 border-l-4 border-brand-magenta bg-white/60 px-3 py-2 font-mono-zine text-xs uppercase tracking-widest">
                    {t(c.deadline, locale)}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <CutoutButton href={c.formUrl} target="_blank" rel="noreferrer" variant="magenta">
                      {t(c.formLabel, locale)}
                    </CutoutButton>
                    {c.rulesUrl && (
                      <a
                        href={c.rulesUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-hand text-lg underline decoration-brand-magenta decoration-2 underline-offset-4 hover:text-brand-magenta"
                      >
                        {t(c.rulesLabel, locale)} →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <p className="font-hand text-sm text-brand-accent">
            {locale === "pt"
              ? "és a próxima banda residente?"
              : "are you our next resident band?"}
          </p>
        </div>
      </div>
    </ZPage>
  );
}

function ParceirosPage({ locale, sectionId }: { locale: Locale; sectionId?: string }) {
  return (
    <ZPage bg="magenta" sectionId={sectionId}>
      <div className="flex flex-col">
        <h2 className="mb-4 -rotate-1">
          <CutoutText size="text-xl sm:text-2xl">
            {t(site.parceiros.kicker, locale)}
          </CutoutText>
        </h2>
        <div className="flex flex-col justify-center gap-3">
          {site.parceiros.list.map((p, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 border-[3px] border-brand-black bg-brand-pink p-3 text-brand-black shadow-[4px_4px_0_0_#000] ${
                i % 2 === 0 ? "-rotate-1" : "rotate-1"
              }`}
            >
              <div className="grid size-14 shrink-0 place-items-center border-2 border-brand-black bg-brand-pink-soft font-marker text-xl">
                {p.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold">{p.name}</h3>
                {p.note && <p className="mt-0.5 text-xs text-brand-black/70">{t(p.note, locale)}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ZPage>
  );
}

function ContactosPage({ locale, sectionId }: { locale: Locale; sectionId?: string }) {
  const c = site.contactos;
  return (
    <ZPage bg="dark" sectionId={sectionId}>
      <div className="flex flex-col text-center">
        <h2 className="mb-2 flex justify-center -rotate-1">
          <CutoutText size="text-2xl sm:text-3xl">{t(c.kicker, locale)}</CutoutText>
        </h2>
        <p className="font-hand text-lg text-brand-accent">
          {locale === "pt" ? "fala connosco" : "get in touch"}
        </p>
        <div className="mt-5 flex flex-col justify-center gap-3 text-left">
          <a
            href={`mailto:${c.email}`}
            className="rotate-1 border-2 border-brand-pink bg-brand-black/30 p-3 text-xs transition hover:bg-brand-pink hover:text-brand-black"
          >
            <div className="font-marker text-base">email</div>
            <div className="mt-1 break-words">{c.email}</div>
          </a>
          <a
            href={`tel:${c.phone.replace(/\s/g, "")}`}
            className="-rotate-1 border-2 border-brand-pink bg-brand-black/30 p-3 text-xs transition hover:bg-brand-pink hover:text-brand-black"
          >
            <div className="font-marker text-base">telefone</div>
            <div className="mt-1">{c.phone}</div>
          </a>
          <div className="rotate-1 border-2 border-brand-pink bg-brand-black/30 p-3 text-xs">
            <div className="font-marker text-base">
              {locale === "pt" ? "onde" : "where"}
            </div>
            <div className="mt-1">{c.city}</div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {Object.entries(c.socials).map(([name, url]) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="border-2 border-brand-pink px-2 py-1 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-accent hover:border-brand-accent hover:text-brand-black"
            >
              {name}
            </a>
          ))}
        </div>
      </div>
    </ZPage>
  );
}

function Index() {
  // placeholder — real body below
  return _Index();
}

function _Index() {
  const { locale } = useI18n();

  const navItems: NavItem[] = [
    { key: "cover", label: locale === "pt" ? "Início" : "Home", sectionId: "inicio" },
    { key: "porque", label: locale === "pt" ? "Porquê" : "Why", sectionId: "porque" },
    { key: "noticias", label: t(site.nav.noticias, locale), sectionId: "noticias" },
    { key: "junta", label: locale === "pt" ? "Junta-te" : "Join us", sectionId: "junta" },
    { key: "banda", label: t(site.nav.banda, locale), sectionId: "banda" },
    { key: "concurso", label: locale === "pt" ? "concurso" : "contest", sectionId: "concurso" },
    { key: "contactos", label: t(site.nav.contactos, locale), sectionId: "contactos" },
    { key: "parceiros", label: t(site.nav.parceiros, locale), sectionId: "parceiros" },
  ];

  return (
    <div className="relative min-h-screen bg-zine-dark font-sans text-brand-pink selection:bg-brand-magenta selection:text-white">
      <SiteNav items={navItems} trailing={<LangToggle className="!px-0 !py-0" />} />
      <main>
        <Cover locale={locale} sectionId="inicio" />
        <SobreA locale={locale} sectionId="porque" />
        <SobreB locale={locale} />
        <ServicesPage locale={locale} />
        <NewsPage
          locale={locale}
          items={site.news.slice(0, 2)}
          title={locale === "pt" ? "notícias" : "news"}
          sectionId="noticias"
        />
        <NewsPage
          locale={locale}
          items={site.news.slice(2)}
          title={locale === "pt" ? "agenda" : "agenda"}
        />
        <AjudarPage locale={locale} sectionId="junta" />
        <JuntaPage locale={locale} />
        <BandaPage locale={locale} sectionId="banda" />
        <ConcursoPage locale={locale} sectionId="concurso" />
        <ContactosPage locale={locale} sectionId="contactos" />
        <ParceirosPage locale={locale} sectionId="parceiros" />
      </main>
    </div>
  );
}
