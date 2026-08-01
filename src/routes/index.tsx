import { createFileRoute } from "@tanstack/react-router";
import HTMLFlipBook from "react-pageflip";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copy, ExternalLink, X } from "lucide-react";
import { site, t, type Locale } from "@/content/site";
import { useI18n } from "@/lib/i18n";
import { SiteNav, type NavItem } from "@/components/SiteNav";
import logoWhiteAsset from "@/assets/641-logo-white.png";
import sixDigitAsset from "@/assets/six6.png";
import fourDigitAsset from "@/assets/four4.png";
import oneDigitAsset from "@/assets/one1.png";
import emailIconSvg from "@/assets/email-icon.svg?raw";
import phoneIconSvg from "@/assets/phone-icon.svg?raw";
import locationIconSvg from "@/assets/location-icon.svg?raw";
import instaIconSvg from "@/assets/insta-icon.svg?raw";
import whatsappIconSvg from "@/assets/whatsapp-icon.svg?raw";
import discordIconSvg from "@/assets/discord-icon.svg?raw";
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
/* Headline cutout palette — punk collage: magenta family plus mustard,
 * teal, torn-poster orange, dusty blue, kraft and newsprint black, so
 * headlines read like letters ripped from different magazines. */
const CUTOUT_PALETTE = [
  // magenta / pink core
  "bg-brand-pink-soft text-brand-black",
  "bg-brand-pink text-brand-black",
  "bg-brand-magenta text-brand-pink-soft",
  "bg-brand-pink-soft text-brand-magenta-ink",
  "bg-brand-magenta-ink text-brand-pink-soft",
  "bg-brand-pink-deep text-brand-pink-soft",
  "bg-brand-magenta text-white",
  // punk accents
  "bg-brand-accent text-brand-black",
  "bg-brand-accent text-brand-magenta-ink",
  "bg-brand-teal text-brand-black",
  "bg-brand-teal text-brand-paper",
  "bg-brand-orange text-brand-black",
  "bg-brand-orange text-brand-paper",
  "bg-brand-blue text-brand-paper",
  "bg-brand-kraft text-brand-black",
  "bg-brand-paper text-brand-black",
  "bg-brand-paper text-brand-magenta",
  "bg-brand-black text-brand-pink",
  "bg-brand-black text-brand-accent",
  "bg-brand-black text-brand-paper",
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
/* Print-style textures layered over each cutout: halftone dots,
 * newsprint lines, photocopy grain, graph grid… (background-image so
 * they tint with each swatch). */
const CUTOUT_TEXTURES = [
  "cutout-tex-halftone",
  "cutout-tex-lines",
  "cutout-tex-grain",
  "cutout-tex-grid",
  "cutout-tex-stripes",
  "cutout-tex-grain",
  "cutout-tex-halftone",
  "", // some letters stay flat
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
  gap = "gap-0",
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
        if (/^\s+$/.test(w)) return <span key={wi} className="w-1.5 sm:w-2" />;
        return (
          <span key={wi} className={`inline-flex items-end ${gap}`}>
            {Array.from(w).map((ch, ci) => {
              const seed = hash(`${w}-${wi}-${ci}`);
              const bg = CUTOUT_PALETTE[seed % CUTOUT_PALETTE.length];
              const font = CUTOUT_FONTS[(seed >> 3) % CUTOUT_FONTS.length];
              const tex = CUTOUT_TEXTURES[(seed >> 13) % CUTOUT_TEXTURES.length];
              const rot = ((seed % 11) - 5) * 1.6; // -8 .. 8 deg
              const yOff = ((seed >> 5) % 9) - 4; // -4 .. 4 px
              // Pull letters together; occasionally a light overlap
              const overlap =
                ci === 0
                  ? 0
                  : (seed >> 17) % 3 === 0
                  ? -5 - ((seed >> 19) % 3) // light overlap: -5..-7px
                  : -1 - ((seed >> 19) % 3); // snug: -1..-3px
              const z = 10 + (ci % 5) + ((seed >> 21) % 3);
              const padX = (seed >> 7) % 2 === 0 ? "px-2" : "px-2.5";
              const padY = (seed >> 9) % 2 === 0 ? "py-0.5" : "py-1";
              // A few letters get a rough staple/border, like taped scraps
              const border =
                (seed >> 15) % 5 === 0
                  ? "border-2 border-brand-black"
                  : (seed >> 15) % 7 === 0
                  ? "border border-white/60"
                  : "";
              // Every other letter uses an irregular torn-paper clip-path
              const clips = [
                "polygon(3% 8%, 12% 0%, 32% 6%, 55% 0%, 78% 5%, 96% 0%, 100% 24%, 97% 55%, 100% 82%, 92% 100%, 68% 96%, 42% 100%, 18% 96%, 2% 100%, 0% 74%, 3% 42%, 0% 18%)",
                "polygon(0% 6%, 22% 0%, 48% 8%, 72% 0%, 100% 10%, 96% 40%, 100% 72%, 88% 100%, 60% 94%, 32% 100%, 8% 92%, 0% 68%, 4% 34%)",
                "polygon(6% 0%, 30% 6%, 60% 0%, 92% 8%, 100% 32%, 94% 62%, 100% 92%, 74% 100%, 44% 94%, 14% 100%, 0% 78%, 6% 46%, 0% 20%)",
                "polygon(0% 14%, 10% 2%, 28% 8%, 46% 0%, 66% 8%, 84% 2%, 100% 12%, 95% 38%, 100% 60%, 94% 86%, 100% 100%, 70% 95%, 48% 100%, 24% 94%, 6% 100%, 0% 76%, 5% 48%)",
                "polygon(2% 0%, 40% 4%, 70% 0%, 100% 6%, 96% 30%, 100% 55%, 96% 78%, 100% 100%, 62% 96%, 30% 100%, 0% 94%, 4% 66%, 0% 38%, 5% 16%)",
              ];
              const clip = clips[(seed >> 11) % clips.length];
              return (
                <span
                  key={ci}
                  className={`relative inline-block paper-tex ${tex} ${border} ${bg} ${font} ${size} ${padX} ${padY} leading-none`}
                  style={{
                    marginLeft: overlap,
                    zIndex: z,
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
  magenta: "washi-magenta-img",
  yellow: "washi-yellow-img",
  teal: "washi-teal-img",
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
      className={`pointer-events-none absolute z-10 select-none font-bold leading-none text-brand-accent ${className}`}
      style={{
        fontSize: size * 0.85,
        transform: `rotate(${rotate}deg)`,
        filter:
          "drop-shadow(0 0 5px rgba(244,193,77,0.75)) drop-shadow(2px 3px 3px rgba(0,0,0,0.35))",
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
      className={`zine-page relative w-full overflow-hidden zine-noise ${sectionId ? "scroll-mt-14" : ""} ${bgCls} ${className}`}
    >
      <div className="zine-page-inner relative mx-auto flex w-full max-w-4xl flex-col px-5 py-10 sm:px-6 sm:py-12">
        {children}
      </div>
    </Tag>
  );
}

/* ------------------------------------------------------------------ *
 * CoverDigits — stacked collage numerals 6 → 4 → 1.
 * ------------------------------------------------------------------ */
function CoverDigits() {
  return (
    <div className="cover-digits" aria-hidden="true">
      <img src={sixDigitAsset} alt="" className="cover-digit cover-digit-6" />
      <img src={fourDigitAsset} alt="" className="cover-digit cover-digit-4" />
      <img src={oneDigitAsset} alt="" className="cover-digit cover-digit-1" />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * SiteLogoDrift — full-viewport background rows of the white 641 logo
 * scrolling in alternating directions behind the whole site.
 * ------------------------------------------------------------------ */
function SiteLogoDrift({
  driftRef,
}: {
  driftRef: React.RefObject<HTMLDivElement | null>;
}) {
  const rows = [
    { dir: "left" as const, speed: 1, size: "h-10" },
    { dir: "right" as const, speed: 0.82, size: "h-8" },
    { dir: "left" as const, speed: 1.18, size: "h-12" },
    { dir: "right" as const, speed: 0.74, size: "h-7" },
    { dir: "left" as const, speed: 0.95, size: "h-9" },
    { dir: "right" as const, speed: 1.08, size: "h-11" },
    { dir: "left" as const, speed: 0.88, size: "h-8" },
    { dir: "right" as const, speed: 1.12, size: "h-10" },
  ];

  return (
    <div ref={driftRef} className="site-logo-drift" aria-hidden="true">
      {rows.map((row, i) => {
        return (
          <div key={i} className={`site-logo-drift-row site-logo-drift-${row.dir}`}>
            <div
              className="site-logo-drift-track"
              data-drift-speed={row.speed * (row.dir === "left" ? 1 : -1)}
            >
              {Array.from({ length: 20 }).map((_, j) => (
                <img
                  key={j}
                  src={logoWhiteAsset}
                  alt=""
                  className={`site-logo-drift-item ${row.size}`}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Cover({ locale, sectionId }: { locale: Locale; sectionId?: string }) {
  return (
    <ZPage bg="dark" className="ink-stain" sectionId={sectionId}>
      <WashiTape variant="yellow" className="left-4 top-2 h-4 w-32 -rotate-3" />
      <WashiTape variant="teal" className="right-16 top-6 h-4 w-24 rotate-6" />
      <StarSticker className="left-[6%] top-[38%]" size={40} rotate={-18} />
      <StarSticker className="right-[10%] top-[16%]" size={48} rotate={22} />
      <div className="magazine-cover-layout">
        <div className="cover-hero-cluster">
          <h1 className="cover-title leading-[1]">
            <CutoutText size="text-2xl sm:text-3xl">
              {t(site.hero.title, locale)}
            </CutoutText>
          </h1>
          <span className="sr-only">641</span>
          <CoverDigits />
        </div>
        <p className="cover-tagline-line">
          {locale === "pt" ? "DESDE 2025" : "SINCE 2025"}
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

const CONTACT_DIRECT_REDIRECT_IDS = new Set(["instagram", "whatsapp", "discord"]);

function ContactosPage({
  locale,
  sectionId,
  isVisible = true,
}: {
  locale: Locale;
  sectionId?: string;
  isVisible?: boolean;
}) {
  const c = site.contactos;
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isVisible) {
      setActiveChannelId(null);
    }
  }, [isVisible]);

  useEffect(() => {
    setCopied(false);
    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }
  }, [activeChannelId]);

  useEffect(
    () => () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    },
    [],
  );

  const activeChannel = c.channels.find((ch) => ch.id === activeChannelId);

  const closePopup = () => {
    setActiveChannelId(null);
  };

  const handleSelect = (id: string, href: string) => {
    if (CONTACT_DIRECT_REDIRECT_IDS.has(id)) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    if (activeChannelId === id) {
      closePopup();
      return;
    }
    setActiveChannelId(id);
  };

  const handleCopy = async () => {
    if (!activeChannel) return;

    try {
      await navigator.clipboard.writeText(activeChannel.value);
      setCopied(true);
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => {
        setCopied(false);
        copyTimeoutRef.current = null;
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <ZPage bg="paper" sectionId={sectionId} className="contactos-page">
      <div className="contactos-layout flex h-full min-h-full w-full flex-col items-center justify-center text-center">
        <div className="contactos-icon-column" role="toolbar" aria-label={t(c.kicker, locale)}>
          {c.channels.map((channel) => (
            <ContactChannelIcon
              key={channel.id}
              icon={channel.icon}
              label={t(channel.label, locale)}
              active={activeChannelId === channel.id}
              onSelect={() => handleSelect(channel.id, channel.href)}
            />
          ))}
        </div>

        {activeChannel && (
          <div className="contactos-popup-layer">
            <button
              type="button"
              className="contactos-popup-backdrop"
              aria-label={locale === "pt" ? "fechar" : "close"}
              onClick={closePopup}
              onMouseDown={(event) => event.stopPropagation()}
              onTouchStart={(event) => event.stopPropagation()}
            />
            <div
              className="contactos-popup"
              role="dialog"
              aria-labelledby="contactos-popup-value"
              aria-live="polite"
              onMouseDown={(event) => event.stopPropagation()}
              onTouchStart={(event) => event.stopPropagation()}
            >
            <button
              type="button"
              className="contactos-popup-close"
              aria-label={locale === "pt" ? "fechar" : "close"}
              onClick={closePopup}
            >
              <X className="contactos-popup-close-icon" aria-hidden="true" />
            </button>
            <p id="contactos-popup-value" className="contactos-detail-value">
              {activeChannel.value}
            </p>
            <div className="contactos-popup-actions">
              <button
                type="button"
                className={`contactos-detail-action contactos-detail-copy ${copied ? "is-copied" : ""}`}
                onClick={handleCopy}
              >
                <Copy className="contactos-detail-action-icon" aria-hidden="true" />
                <span>{copied ? (locale === "pt" ? "copiado!" : "copied!") : locale === "pt" ? "copiar" : "copy"}</span>
              </button>
              <a
                href={activeChannel.href}
                target={activeChannel.href.startsWith("http") ? "_blank" : undefined}
                rel={activeChannel.href.startsWith("http") ? "noreferrer" : undefined}
                className="contactos-detail-action contactos-detail-link"
              >
                <span>{t(activeChannel.cta, locale)}</span>
                <ExternalLink className="contactos-detail-action-icon" aria-hidden="true" />
              </a>
            </div>
            </div>
          </div>
        )}
      </div>
    </ZPage>
  );
}

const CONTACT_ICON_SVGS: Record<string, string> = {
  email: emailIconSvg,
  phone: phoneIconSvg,
  location: locationIconSvg,
  instagram: instaIconSvg,
  whatsapp: whatsappIconSvg,
  discord: discordIconSvg,
};

function prepareContactIconSvg(svg: string, prefix: string) {
  let out = svg
    .replace(/\bid="([^"]+)"/g, `id="${prefix}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${prefix}-$1)`)
    .replace(/xlink:href="#([^"]+)"/g, `xlink:href="#${prefix}-$1"`);

  // These exports have width/height but no viewBox — force a proper viewport so CSS sizing works
  out = out.replace(/<svg\b([^>]*)>/i, (_match, attrs: string) => {
    const width = attrs.match(/\bwidth="(\d+(?:\.\d+)?)"/i)?.[1];
    const height = attrs.match(/\bheight="(\d+(?:\.\d+)?)"/i)?.[1];
    let next = attrs
      .replace(/\swidth="[^"]*"/gi, "")
      .replace(/\sheight="[^"]*"/gi, "")
      .replace(/\soverflow="[^"]*"/gi, "");

    if (width && height && !/\bviewBox=/i.test(attrs)) {
      next += ` viewBox="0 0 ${width} ${height}"`;
    }

    next += ' width="100%" height="100%" overflow="visible" preserveAspectRatio="xMidYMid meet"';
    return `<svg${next}>`;
  });

  return out;
}

function ContactChannelIcon({
  icon,
  label,
  active,
  onSelect,
}: {
  icon: string;
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  const svgHostRef = useRef<HTMLSpanElement>(null);
  const rawSvg = CONTACT_ICON_SVGS[icon] ?? "";
  const svgMarkup = useMemo(
    () => prepareContactIconSvg(rawSvg, `contact-${icon}`),
    [icon, rawSvg],
  );

  const replayStroke = useCallback(() => {
    const host = svgHostRef.current;
    if (!host) return;
    host.querySelectorAll<SVGPathElement>("path").forEach((path) => {
      const length = path.getTotalLength();
      if (length <= 0) return;
      path.style.transition = "none";
      path.style.strokeDashoffset = `${length}`;
      void path.getBoundingClientRect();
      path.style.transition = "stroke-dashoffset 0.55s ease";
      path.style.strokeDashoffset = "0";
    });
  }, []);

  useEffect(() => {
    const host = svgHostRef.current;
    if (!host) return;

    const setupPaths = () => {
      host.querySelectorAll<SVGPathElement>("path").forEach((path) => {
        const length = path.getTotalLength();
        if (length <= 0) return;
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = "0";
      });
    };

    requestAnimationFrame(() => requestAnimationFrame(setupPaths));
  }, [svgMarkup]);

  useEffect(() => {
    if (active) {
      replayStroke();
    }
  }, [active, replayStroke]);

  return (
    <button
      type="button"
      className={`contact-channel-icon contact-channel-icon--${icon} ${active ? "is-active" : ""}`}
      aria-label={label}
      aria-pressed={active}
      onClick={onSelect}
      onMouseEnter={replayStroke}
      onFocus={replayStroke}
    >
      <span
        ref={svgHostRef}
        className="contact-channel-icon-graphic pointer-events-none"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
    </button>
  );
}

type FlipBookHandle = {
  pageFlip: () => {
    flipNext: (corner?: "top" | "bottom") => void;
    flipPrev: (corner?: "top" | "bottom") => void;
    flip: (page: number, corner?: "top" | "bottom") => void;
    turnToPage: (page: number) => void;
  };
};

type MagazinePage = {
  key: string;
  label: string;
  content: React.ReactNode;
  hard?: boolean;
};

type MagazineMarkerItem = NavItem & {
  page: number;
  keys: string[];
};

const MagazineSheet = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    number: number;
    hard?: boolean;
  }
>(function MagazineSheet({ children, number, hard = false }, ref) {
  // Cover has an external flip hint; other pages keep the page number
  const footer = number === 1 ? null : `- ${number} -`;

  return (
    <div
      ref={ref}
      className={`magazine-sheet ${hard ? "magazine-sheet-hard" : ""}`}
      data-density={hard ? "hard" : "soft"}
    >
      <div className="magazine-sheet-face">
        {children}
        {footer && <span className="magazine-page-number">{footer}</span>}
      </div>
    </div>
  );
});

function SobrePhotoPage({ locale }: { locale: Locale }) {
  return (
    <ZPage bg="paper">
      <WashiTape variant="teal" className="left-6 top-2 h-4 w-28 -rotate-6" />
      <WashiTape variant="yellow" className="right-8 top-4 h-4 w-24 rotate-6" />
      <div className="magazine-index-page flex h-full flex-col">
        <h2 className="mb-4 -rotate-1">
          <CutoutText size="text-2xl sm:text-3xl">{locale === "pt" ? "sobre" : "about"}</CutoutText>
        </h2>
        <Polaroid
          label={locale === "pt" ? "ensaio na rua" : "street rehearsal"}
          src="/street-rehearsal.jpg"
          aspect="aspect-[16/10]"
          rotate="-rotate-1"
          className="about-photo-card w-full"
        />
        <div className="mt-5 grid gap-3 text-[14px] leading-relaxed">
          <ScrapPaper color="pink" rotate="rotate-1" className="about-lead">
            {locale === "pt"
              ? "Antes da 641, ensaiava-se onde dava: na rua, com cabos no chão, instrumentos às costas e vontade a mais para ficar em silêncio."
              : "Before 641, rehearsals happened wherever they could: on the street, with cables on the ground, instruments on shoulders and too much will to stay quiet."}
          </ScrapPaper>
          <p>
            <RichText>
              {locale === "pt"
                ? "A associação nasce para transformar essa energia improvisada num lugar acessível, técnico e aberto a quem está a começar."
                : "The association turns that improvised energy into an accessible, supported place for people who are just starting out."}
            </RichText>
          </p>
        </div>
      </div>
    </ZPage>
  );
}

function SobreOriginPage({ locale }: { locale: Locale }) {
  const blocks = locale === "pt"
    ? [
        {
          title: "O problema",
          body: "Há bandas novas, instrumentos e vontade. O que costuma faltar é o mais simples e mais caro: um espaço para ensaiar.",
        },
        {
          title: "A rua",
          body: "Sem garagens nem salas acessíveis, a rua serviu de sala de ensaio improvisada. Divertido, sim. Sustentável, nem por isso.",
        },
        {
          title: "A resposta",
          body: "A 641 existe para que ninguém em Oeiras perca música por não ter onde experimentar, errar, repetir e crescer.",
        },
      ]
    : [
        {
          title: "The problem",
          body: "There are new bands, instruments and ambition. What is usually missing is the simplest and most expensive thing: a rehearsal room.",
        },
        {
          title: "The street",
          body: "With no garages or affordable rooms, the street became an improvised rehearsal space. Fun, yes. Sustainable, not really.",
        },
        {
          title: "The answer",
          body: "641 exists so nobody in Oeiras loses music because they have nowhere to try, fail, repeat and grow.",
        },
      ];

  return (
    <ZPage bg="paper">
      <WashiTape variant="yellow" className="left-8 top-3 h-4 w-24 -rotate-3" />
      <StarSticker className="right-10 top-16" size={34} rotate={12} />
      <div className="flex h-full flex-col">
        <h2 className="mb-5 -rotate-1">
          <CutoutText size="text-2xl sm:text-3xl">{locale === "pt" ? "origem" : "origin"}</CutoutText>
        </h2>
        <div className="about-blocks">
          {blocks.map((block, index) => (
            <article key={block.title} className={`about-block ${index % 2 ? "about-block-alt" : ""}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{block.title}</h3>
                <p>{block.body}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-auto pt-4">
          <ScrapPaper color="pink" rotate="-rotate-1" className="text-sm">
            {t(site.sobre.highlight, locale)}
          </ScrapPaper>
        </div>
      </div>
    </ZPage>
  );
}

function BackCoverPage({ locale }: { locale: Locale }) {
  return (
    <ZPage bg="cream" className="back-cover-page">
      <StarSticker className="left-[18%] top-[20%]" size={46} rotate={-14} />
      <StarSticker className="right-[22%] bottom-[26%]" size={52} rotate={18} />
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="back-cover-logo paper-tex">
          <span>641</span>
        </div>
        <p className="mt-7 font-hand text-2xl font-bold text-brand-accent sm:text-3xl">
          {t(site.footer.tagline, locale)}
        </p>
        <p className="mt-7 font-mono-zine text-[10px] uppercase tracking-[0.28em] text-brand-magenta/70">
          Associação 641 · 2026 · Oeiras, PT
        </p>
      </div>
    </ZPage>
  );
}

function MagazineMarkers({
  items,
  activeKey,
  onNavigate,
  showFlipHint = false,
  flipHintLabel,
}: {
  items: MagazineMarkerItem[];
  activeKey?: string;
  onNavigate: (item: MagazineMarkerItem) => void;
  showFlipHint?: boolean;
  flipHintLabel?: string;
}) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const activeMarkerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    const marker = activeMarkerRef.current;
    if (!list || !marker) return;

    marker.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [activeKey]);

  return (
    <div className="magazine-markers" aria-label="Índice da revista">
      <div className="magazine-marker-list" ref={listRef}>
        {items.map((item) => {
          const isActive = Boolean(activeKey && item.keys.includes(activeKey));
          return (
          <button
            key={item.key}
            type="button"
            onClick={() => onNavigate(item)}
            ref={isActive ? activeMarkerRef : undefined}
            className={`magazine-marker ${isActive ? "is-active" : ""}`}
          >
            <span>{item.label}</span>
          </button>
          );
        })}
      </div>
      <div className="magazine-lang-stack">
        {showFlipHint && flipHintLabel && (
          <span className="magazine-flip-hint-external" aria-hidden="true">
            {flipHintLabel}
          </span>
        )}
        <LangToggle className="magazine-lang" />
      </div>
    </div>
  );
}

function MagazineIndex() {
  const { locale } = useI18n();
  const bookRef = useRef<FlipBookHandle | null>(null);
  const wheelLocked = useRef(false);
  const wheelRemainder = useRef(0);
  const logoDriftRef = useRef<HTMLDivElement | null>(null);
  const logoDriftOffset = useRef(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [showFlipHint, setShowFlipHint] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  const [usePortrait, setUsePortrait] = useState(true);
  const flipDurationMs = 900;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const syncLayout = () => {
      setUsePortrait(media.matches);
      window.requestAnimationFrame(() => {
        bookRef.current?.pageFlip().update();
      });
    };

    syncLayout();
    media.addEventListener("change", syncLayout);
    return () => media.removeEventListener("change", syncLayout);
  }, []);

  const flipTo = useCallback((page: number) => {
    // flip() only advances one spread; turnToPage jumps directly (markers + in-book hash links)
    bookRef.current?.pageFlip().turnToPage(page);
    setCurrentPage(page);
    if (page !== 0) setShowFlipHint(false);
  }, []);

  const flipPrev = useCallback(() => {
    bookRef.current?.pageFlip().flipPrev("bottom");
  }, []);

  const flipNext = useCallback(() => {
    bookRef.current?.pageFlip().flipNext("bottom");
  }, []);

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLElement>) => {
      event.preventDefault();
      const delta = event.deltaY;
      logoDriftOffset.current += delta * 0.35;
      logoDriftRef.current
        ?.querySelectorAll<HTMLElement>("[data-drift-speed]")
        .forEach((track) => {
          const speed = Number(track.dataset.driftSpeed) || 0;
          track.style.transform = `translate3d(${logoDriftOffset.current * speed}px, 0, 0)`;
        });

      // Ignore further page flips while an animation is playing
      if (wheelLocked.current) return;

      wheelRemainder.current += delta;
      // Trigger mid-scroll once intent is clear (not after a big backlog)
      if (Math.abs(wheelRemainder.current) < 48) return;

      const direction = wheelRemainder.current;
      wheelRemainder.current = 0;
      wheelLocked.current = true;
      setShowFlipHint(false);

      if (direction > 0) {
        flipNext();
      } else {
        flipPrev();
      }

      // Stay locked for the full flip so leftover scroll can't fire a delayed turn
      window.setTimeout(() => {
        wheelLocked.current = false;
        wheelRemainder.current = 0;
      }, flipDurationMs + 100);
    },
    [flipDurationMs, flipNext, flipPrev],
  );

  const handleFlipStateChange = useCallback((event: { data?: unknown }) => {
    const state = String(event.data ?? "");
    // Hide as soon as the page starts moving (fold / flip), not only when it lands
    if (
      state === "user_fold" ||
      state === "fold_corner" ||
      state === "flipping"
    ) {
      setShowFlipHint(false);
      setIsFlipping(true);
      return;
    }
    if (state === "read") {
      setIsFlipping(false);
      // Restore only if we're still/back on the cover (after cancel or flip home)
      window.requestAnimationFrame(() => {
        const page =
          bookRef.current?.pageFlip()?.getCurrentPageIndex?.() ?? 0;
        setShowFlipHint(page === 0);
      });
    }
  }, []);

  const magazinePages: MagazinePage[] = useMemo(() => {
    return [
      {
        key: "cover",
        label: locale === "pt" ? "Capa" : "Cover",
        hard: true,
        content: <Cover locale={locale} sectionId="inicio" />,
      },
      {
        key: "sobre",
        label: locale === "pt" ? "Sobre" : "About",
        content: <SobrePhotoPage locale={locale} />,
      },
      {
        key: "origem",
        label: locale === "pt" ? "Origem" : "Origin",
        content: <SobreOriginPage locale={locale} />,
      },
      {
        key: "porque-b",
        label: locale === "pt" ? "Razões" : "Reasons",
        content: <SobreB locale={locale} />,
      },
      {
        key: "servicos",
        label: locale === "pt" ? "Fazemos" : "Services",
        content: <ServicesPage locale={locale} />,
      },
      {
        key: "noticias",
        label: t(site.nav.noticias, locale),
        content: (
          <NewsPage
            locale={locale}
            items={site.news}
            title={locale === "pt" ? "notícias" : "news"}
            sectionId="noticias"
          />
        ),
      },
      {
        key: "ajudar",
        label: locale === "pt" ? "Ajudar" : "Support",
        content: <AjudarPage locale={locale} sectionId="junta" />,
      },
      {
        key: "junta",
        label: locale === "pt" ? "Junta-te" : "Join us",
        content: <JuntaPage locale={locale} />,
      },
      {
        key: "banda",
        label: t(site.nav.banda, locale),
        content: <BandaPage locale={locale} sectionId="banda" />,
      },
      {
        key: "concurso",
        label: locale === "pt" ? "Concurso" : "Contest",
        content: <ConcursoPage locale={locale} sectionId="concurso" />,
      },
      {
        key: "contactos",
        label: t(site.nav.contactos, locale),
        content: null,
      },
      {
        key: "parceiros",
        label: t(site.nav.parceiros, locale),
        content: <ParceirosPage locale={locale} sectionId="parceiros" />,
      },
      {
        key: "back",
        label: locale === "pt" ? "Fim" : "End",
        hard: true,
        content: <BackCoverPage locale={locale} />,
      },
    ];
  }, [locale]);

  const markerItems: MagazineMarkerItem[] = useMemo(
    () =>
      magazinePages.map((page, index) => ({
        key: `${page.key}-marker`,
        label: page.label,
        sectionId: page.key,
        page: index,
        keys: [page.key],
      })),
    [magazinePages],
  );

  useEffect(() => {
    const handleBookHashLink = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest(
        ".magazine-book a[href^='#']",
      ) as HTMLAnchorElement | null;
      if (!link?.hash || link.hash.length < 2) return;

      const key = decodeURIComponent(link.hash.slice(1));
      const pageIndex = magazinePages.findIndex((page) => page.key === key);
      if (pageIndex < 0) return;

      event.preventDefault();
      flipTo(pageIndex);
    };

    document.addEventListener("click", handleBookHashLink);
    return () => document.removeEventListener("click", handleBookHashLink);
  }, [flipTo, magazinePages]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-zine-dark font-sans text-brand-pink selection:bg-brand-magenta selection:text-white">
      <SiteLogoDrift driftRef={logoDriftRef} />
      <main className="magazine-stage" onWheel={handleWheel}>
        <div className="magazine-book-wrap">
          {showFlipHint && (
            <span className="magazine-flip-hint-desktop" aria-hidden="true">
              {locale === "pt" ? "* folheia-me -> *" : "* flip me -> *"}
            </span>
          )}
          <HTMLFlipBook
            ref={bookRef}
            className="magazine-book"
            style={{}}
            startPage={0}
            size="stretch"
            width={520}
            height={720}
            minWidth={285}
            maxWidth={440}
            minHeight={380}
            maxHeight={2000}
            drawShadow
            flippingTime={900}
            usePortrait={usePortrait}
            startZIndex={10}
            autoSize
            maxShadowOpacity={0.65}
            showCover
            mobileScrollSupport
            clickEventForward
            useMouseEvents
            swipeDistance={24}
            showPageCorners
            disableFlipByClick
            onChangeState={handleFlipStateChange}
            onFlip={(event) => {
              const page = Number(event.data) || 0;
              setCurrentPage(page);
              setShowFlipHint(page === 0);
            }}
          >
            {magazinePages.map((page, index) => (
              <MagazineSheet
                key={page.key}
                number={index + 1}
                hard={page.hard}
              >
                <div id={page.key} className="h-full">
                  {page.key === "contactos" ? (
                    <ContactosPage
                      locale={locale}
                      sectionId="contactos"
                      isVisible={currentPage === index && !isFlipping}
                    />
                  ) : (
                    page.content
                  )}
                </div>
              </MagazineSheet>
            ))}
          </HTMLFlipBook>
        </div>
        <MagazineMarkers
          items={markerItems}
          onNavigate={(item) => flipTo(item.page)}
          activeKey={magazinePages[currentPage]?.key}
          showFlipHint={showFlipHint}
          flipHintLabel={locale === "pt" ? "* folheia-me *" : "* flip me *"}
        />
      </main>
    </div>
  );
}

function Index() {
  // placeholder — real body below
  return <MagazineIndex />;
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
          items={site.news}
          title={locale === "pt" ? "notícias" : "news"}
          sectionId="noticias"
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
