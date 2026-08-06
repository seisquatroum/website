import HTMLFlipBook from "react-pageflip";
import {
  forwardRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronLeft, ChevronRight, Copy, ExternalLink, Trash2, X } from "lucide-react";
import { site, t, type Locale } from "@/content/site";
import { getNews } from "@/content/news/loadNews";
import { useI18n } from "@/lib/i18n";
import {
  chooseBookMode,
  sameMagazineSpread,
  type MarkerAxis,
} from "@/lib/magazineLayout";
import { type NavItem } from "@/components/SiteNav";
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
import spotifyIconSvg from "@/assets/spotify-logo.svg?raw";
import youtubeIconSvg from "@/assets/youtube-icon.svg?raw";
import fundacaoEdpLogo from "@/assets/partners-logos/fundacao-edp.jpg";
import cmlLogo from "@/assets/partners-logos/camara-municipal-de-lisboa-logo.png";
import oeirasLogo from "@/assets/partners-logos/municipio_de_oeiras_logo.jpg";
import hackerSchoolLogo from "@/assets/partners-logos/Imagem3.png";
import circleDrawingSvg from "@/assets/circle-drawing.svg?raw";
import arrowDrawingSvg from "@/assets/arrow-drawing.svg?raw";
import cameraSvg from "@/assets/camera.svg?raw";
import oeirasDrawingSvg from "@/assets/oeiras.svg?raw";
import mixerDrawingSvg from "@/assets/mixer.svg?raw";
import jblDrawingSvg from "@/assets/jbl.svg?raw";
import vizinhosDrawingSvg from "@/assets/vizinhos.svg?raw";
import exercicioAsset from "@/assets/exercicio.png";
import madameGPhoto from "@/assets/madame-g.png";
import studioPhoto from "@/assets/studio.jpeg";
import startingPhoto from "@/assets/starting.jpg";
import mixingPhoto from "@/assets/mixing.jpg";
import communityPhoto from "@/assets/community.jpeg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  size = "mp-3xl",
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
    size = "mp-lg",
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
  // Dense enough that short landscape viewports still show full logos
  // (sparse space-evenly rows looked "cut" at the screen edges).
  const sizes = ["h-7", "h-8", "h-9", "h-10", "h-11", "h-8", "h-12", "h-9"] as const;
  const rows = Array.from({ length: 22 }, (_, i) => ({
    dir: (i % 2 === 0 ? "left" : "right") as "left" | "right",
    speed: 0.72 + ((i * 17) % 50) / 100,
    size: sizes[i % sizes.length],
  }));
  // Two identical tiles — each carries its own trailing gap so the seam matches.
  // A repeat tile must be wider than the 160vw row; otherwise translating it
  // by almost one tile width exposes empty space on the right.
  const logosPerTile = 30;

  return (
    <div className="site-logo-drift" aria-hidden="true">
      <div ref={driftRef} className="site-logo-drift-inner">
        {rows.map((row, i) => {
          const tile = (copy: number) => (
            <div key={copy} className="site-logo-drift-tile">
              {Array.from({ length: logosPerTile }, (_, j) => (
                <img
                  key={j}
                  src={logoWhiteAsset}
                  alt=""
                  className={`site-logo-drift-item ${row.size}`}
                />
              ))}
            </div>
          );

          return (
            <div key={i} className={`site-logo-drift-row site-logo-drift-${row.dir}`}>
              <div
                className="site-logo-drift-track"
                data-drift-speed={row.speed * (row.dir === "left" ? 1 : -1)}
              >
                {tile(0)}
                {tile(1)}
              </div>
            </div>
          );
        })}
      </div>
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
            <CutoutText size="mp-2xl">
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
          <CutoutText size="mp-2xl">
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

const OQUE_PHOTOS: Record<string, string> = {
  studio: studioPhoto,
  starting: startingPhoto,
  recording: mixingPhoto,
  community: communityPhoto,
};

const OQUE_ROTATES = ["-rotate-2", "rotate-2", "rotate-1", "-rotate-1"] as const;

function OQuePolaroid({
  src,
  title,
  hoverText,
  rotate,
}: {
  src: string;
  title: string;
  hoverText: string;
  rotate: string;
}) {
  return (
    <div className={`oque-polaroid relative ${rotate}`}>
      <div className="absolute left-1/2 top-[-10px] z-10 h-5 w-16 -translate-x-1/2 -rotate-6 bg-brand-accent/80 shadow-sm" />
      <div className="oque-polaroid-frame border-4 border-white bg-white p-1.5 sticker-shadow">
        <div
          className="oque-polaroid-photo aspect-[4/3] bg-cover bg-center"
          style={{ backgroundImage: `url(${src})` }}
        >
          <span className="oque-polaroid-hover-text">{hoverText}</span>
        </div>
        <p className="oque-polaroid-caption">{title}</p>
      </div>
    </div>
  );
}

function OQuePage({ locale }: { locale: Locale }) {
  return (
    <ZPage bg="magenta" className="oque-page">
      <WashiTape variant="yellow" className="left-8 top-2 h-4 w-24 -rotate-3" />
      <div className="oque-page-layout">
        <h3 className="oque-page-title -rotate-1">
          <CutoutText size="mp-xl">
            {t(site.oQue.title, locale)}
          </CutoutText>
        </h3>
        <div className="oque-polaroid-grid">
          {site.oQue.items.map((item, index) => (
            <OQuePolaroid
              key={item.key}
              src={OQUE_PHOTOS[item.key]}
              title={t(item.title, locale)}
              hoverText={t(item.hover, locale)}
              rotate={OQUE_ROTATES[index % OQUE_ROTATES.length]}
            />
          ))}
        </div>
      </div>
    </ZPage>
  );
}

/** Camera LCD screen path in viewport space (viewBox 0 0 2139 1298). */
const NEWS_CAMERA_SCREEN_PATH =
  "M134 268.81C134 259.53 141.525 252 150.809 252L1486.19 252C1495.47 252 1503 259.53 1503 268.81L1503 1201.19C1503 1210.47 1495.47 1218 1486.19 1218L150.809 1218C141.525 1218 134 1210.47 134 1201.19Z";

/** Only touch the root <svg> tag — avoid rewriting the huge embedded PNG payload. */
function prepareCameraSvg(svg: string) {
  return svg.replace(/<svg\b([^>]*)>/i, (_match, attrs: string) => {
    const width = attrs.match(/\bwidth="(\d+(?:\.\d+)?)"/i)?.[1] ?? "2139";
    const height = attrs.match(/\bheight="(\d+(?:\.\d+)?)"/i)?.[1] ?? "1298";
    let next = attrs
      .replace(/\swidth="[^"]*"/gi, "")
      .replace(/\sheight="[^"]*"/gi, "")
      .replace(/\soverflow="[^"]*"/gi, "")
      .replace(/\sviewBox="[^"]*"/gi, "");

    /* none: fill the stage exactly so % overlays never drift vs letterboxed "meet" */
    next += ` viewBox="0 0 ${width} ${height}" width="100%" height="100%" overflow="hidden" preserveAspectRatio="none"`;
    return `<svg${next}>`;
  });
}

/** Slug prefix `YYYY-MM-DD-...` → matrix overlay `DD-MM-YYYY`. */
function newsMatrixDate(slug: string) {
  const match = slug.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return "";
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function NewsPage({
  locale,
  title,
  sectionId,
}: {
  locale: Locale;
  title?: string;
  sectionId?: string;
}) {
  const items = useMemo(() => getNews(locale), [locale]);
  const [index, setIndex] = useState(0);
  const [cameraMode, setCameraMode] = useState<"photo" | "menu">("photo");
  const clipId = useId().replace(/:/g, "");
  const cameraMarkup = useMemo(() => prepareCameraSvg(cameraSvg), []);

  useEffect(() => {
    setIndex(0);
    setCameraMode("photo");
  }, [locale]);

  const active = items[index] ?? null;
  const count = items.length;

  const goPrev = useCallback(() => {
    if (count === 0) return;
    setIndex((current) => (current - 1 + count) % count);
  }, [count]);

  const goNext = useCallback(() => {
    if (count === 0) return;
    setIndex((current) => (current + 1) % count);
  }, [count]);

  const openCameraMenu = useCallback(() => {
    if (count === 0) return;
    setCameraMode("menu");
  }, [count]);

  const openSelectedNews = useCallback(() => {
    if (count === 0) return;
    setCameraMode("photo");
  }, [count]);

  const menuStart =
    count <= 5 ? 0 : Math.min(Math.max(index - 2, 0), count - 5);
  const menuItems = items.slice(menuStart, menuStart + 5);

  const stopFlip = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  const handleCameraStagePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("button,a")) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    if (x >= 0.84 && y >= 0.72) {
      event.preventDefault();
      event.stopPropagation();
      openCameraMenu();
    }
  };

  return (
    <ZPage bg="dark" sectionId={sectionId}>
      <WashiTape variant="magenta" className="left-6 top-2 h-4 w-32 -rotate-3" />
      <StarSticker className="right-[8%] top-[6%]" size={36} rotate={16} />
      <div className="flex min-h-0 flex-1 flex-col">
        {title && (
          <h2 className="mb-2 shrink-0 -rotate-1">
            <CutoutText size="mp-xl">{title}</CutoutText>
          </h2>
        )}

        {active ? (
          <div
            className="news-camera min-h-0 flex-1"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                goPrev();
              } else if (event.key === "ArrowRight") {
                event.preventDefault();
                goNext();
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                goPrev();
              } else if (event.key === "ArrowDown") {
                event.preventDefault();
                goNext();
              } else if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                if (cameraMode === "menu") openSelectedNews();
                else openCameraMenu();
              } else if (event.key === "Escape") {
                event.preventDefault();
                setCameraMode("photo");
              }
            }}
          >
            <div
              className="news-camera-stage"
              onPointerDownCapture={handleCameraStagePointer}
            >
              <span
                className="news-camera-body pointer-events-none"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: cameraMarkup }}
              />

              <svg
                className={`news-camera-lcd pointer-events-none ${
                  cameraMode === "menu" ? "is-menu" : ""
                }`}
                viewBox="0 0 2139 1298"
                aria-hidden="true"
              >
                <defs>
                  <clipPath id={clipId}>
                    <path d={NEWS_CAMERA_SCREEN_PATH} />
                  </clipPath>
                </defs>
                {cameraMode === "menu" ? (
                  <>
                    <path d={NEWS_CAMERA_SCREEN_PATH} fill="#d9decf" opacity="0.98" />
                    <path
                      d="M135 252 H1503 V364 H135 Z"
                      fill="#a51d22"
                      clipPath={`url(#${clipId})`}
                    />
                    <text
                      x="214"
                      y="328"
                      fill="#fff8ea"
                      fontFamily="Courier New, monospace"
                      fontSize="44"
                      fontWeight="700"
                      letterSpacing="4"
                      clipPath={`url(#${clipId})`}
                    >
                      STORAGE
                    </text>
                    <text
                      x="1302"
                      y="328"
                      fill="#fff8ea"
                      fontFamily="Courier New, monospace"
                      fontSize="46"
                      fontWeight="700"
                      clipPath={`url(#${clipId})`}
                    >
                      {index + 1}/{count}
                    </text>
                    {menuItems.map((item, itemIndex) => {
                      const absoluteIndex = menuStart + itemIndex;
                      const selected = absoluteIndex === index;
                      const y = 452 + itemIndex * 122;
                      return (
                        <g key={item.slug} clipPath={`url(#${clipId})`}>
                          {selected ? (
                            <rect
                              x="188"
                              y={y - 62}
                              width="814"
                              height="88"
                              fill="#dfb836"
                              opacity="0.96"
                            />
                          ) : null}
                          <text
                            x="226"
                            y={y}
                            fill={selected ? "#1a0a10" : "#253136"}
                            fontFamily="Courier New, monospace"
                            fontSize="39"
                            fontWeight="700"
                          >
                            {item.title.slice(0, 25)}
                          </text>
                        </g>
                      );
                    })}
                    {active.image ? (
                      <image
                        href={active.image}
                        x={1040}
                        y={428}
                        width={340}
                        height={255}
                        preserveAspectRatio="xMidYMid slice"
                        clipPath={`url(#${clipId})`}
                      />
                    ) : null}
                    <rect
                      x="1040"
                      y="428"
                      width="340"
                      height="255"
                      fill="none"
                      stroke="#1a0a10"
                      strokeWidth="10"
                      clipPath={`url(#${clipId})`}
                    />
                    <text
                      x="204"
                      y="1136"
                      fill="#fff8ea"
                      fontFamily="Courier New, monospace"
                      fontSize="48"
                      fontWeight="700"
                      clipPath={`url(#${clipId})`}
                    >
                      SELECT &lt;&gt;
                    </text>
                    <text
                      x="1094"
                      y="1136"
                      fill="#fff8ea"
                      fontFamily="Courier New, monospace"
                      fontSize="48"
                      fontWeight="700"
                      clipPath={`url(#${clipId})`}
                    >
                      ENTER SET
                    </text>
                  </>
                ) : active.image ? (
                  <image
                    href={active.image}
                    x={134}
                    y={252}
                    width={1369}
                    height={966}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#${clipId})`}
                  />
                ) : (
                  <rect
                    x={134}
                    y={252}
                    width={1369}
                    height={966}
                    fill="#1a0a10"
                    clipPath={`url(#${clipId})`}
                  />
                )}
              </svg>

              <span className="news-camera-date">
                {cameraMode === "menu" ? "" : newsMatrixDate(active.slug) || active.date}
              </span>

              <button
                type="button"
                className="news-camera-arrow news-camera-arrow--prev"
                aria-label={locale === "pt" ? "notícia anterior" : "previous news"}
                onClick={goPrev}
                onMouseDown={stopFlip}
                onTouchStart={stopFlip}
              >
                <ChevronLeft className="news-camera-arrow-icon" aria-hidden="true" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                className="news-camera-arrow news-camera-arrow--next"
                aria-label={locale === "pt" ? "próxima notícia" : "next news"}
                onClick={goNext}
                onMouseDown={stopFlip}
                onTouchStart={stopFlip}
              >
                <ChevronRight className="news-camera-arrow-icon" aria-hidden="true" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                className="news-camera-set-button"
                aria-label={
                  locale === "pt" ? "abrir notícia selecionada" : "open selected news"
                }
                onClick={openSelectedNews}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  openSelectedNews();
                }}
                onMouseDown={stopFlip}
                onTouchStart={stopFlip}
              />
              <button
                type="button"
                className="news-camera-menu-button"
                aria-label={
                  locale === "pt" ? "abrir menu da câmara" : "open camera menu"
                }
                onClick={openCameraMenu}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  openCameraMenu();
                }}
                onMouseDown={stopFlip}
                onTouchStart={stopFlip}
              />
            </div>

            <div className="news-camera-caption">
              <p className="news-camera-caption-tag">{active.tag || "\u00a0"}</p>
              <h3 className="news-camera-caption-title">{active.title}</h3>
              <p className="news-camera-caption-body">
                {active.body ? <RichText>{active.body}</RichText> : "\u00a0"}
              </p>
              <div className="news-camera-caption-link">
                {active.href ? (
                  <a
                    href={active.href}
                    target="_blank"
                    rel="noreferrer"
                    className="news-item-link"
                    onMouseDown={stopFlip}
                    onTouchStart={stopFlip}
                  >
                    {locale === "pt" ? "saber mais" : "learn more"}
                    <ExternalLink aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <p className="font-hand text-sm text-brand-pink-soft">
            {locale === "pt" ? "Sem notícias por agora." : "No news yet."}
          </p>
        )}
      </div>
    </ZPage>
  );
}

function JuntaPage({ locale, sectionId }: { locale: Locale; sectionId?: string }) {
  return (
    <ZPage bg="magenta" sectionId={sectionId}>
      <WashiTape variant="yellow" className="right-6 top-2 h-4 w-24 rotate-6" />
      <div className="flex flex-col">
        <h3 className="-rotate-1">
          <CutoutText size="mp-xl">
            {locale === "pt" ? "Junta-te!" : "Join us!"}
          </CutoutText>
        </h3>
        <p className="mt-3 text-xs leading-relaxed text-brand-pink-soft/95 sm:text-sm">
          {locale === "pt"
            ? "Torna-te sócix, dá uma mão em eventos, oferece competências, equipamento ou espaço."
            : "Become a member, lend a hand at events, share skills, gear or space."}
        </p>
        <div className="mt-9 flex flex-col items-start gap-6">
          <CutoutButton
            href="#contactos"
            variant="accent"
            size="mp-xs"
            className="!gap-1 !px-2.5 !py-1.5 !shadow-[3px_3px_0_0_#1a1a1a] sm:!px-3 sm:!py-1.5 [&>span:last-child]:!text-sm"
          >
            {locale === "pt" ? "FALA CONNOSCO" : "GET IN TOUCH"}
          </CutoutButton>
          <CutoutButton
            href={site.sobre.regulamentoUrl}
            target="_blank"
            rel="noreferrer"
            variant="black"
            size="mp-xs"
            className="!gap-1 !px-2 !py-1.5 !shadow-[3px_3px_0_0_#1a1a1a] sm:!px-2.5 sm:!py-1.5 [&>span:last-child]:!text-xs"
          >
            {t(site.sobre.regulamentoLabel, locale)}
          </CutoutButton>
        </div>
        <p className="mt-8 text-xs leading-relaxed text-brand-pink-soft/95 sm:text-sm">
          <RichText>{t(site.ajudar.intro, locale)}</RichText>
        </p>
        <div className="mx-auto mt-3 w-full max-w-[220px] rotate-2 border-[3px] border-brand-black bg-brand-magenta halftone p-4 text-center text-white shadow-[6px_6px_0_0_#000]">
          <span className="font-mono text-[10px] uppercase tracking-widest">MB WAY</span>
          <div className="mt-1.5 font-marker text-xl tracking-wide sm:text-2xl">
            {site.ajudar.mbwayNumber}
          </div>
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
          <CutoutText size="mp-lg">{t(site.banda.kicker, locale)}</CutoutText>
        </h2>
        <div className="banda-hero-row mt-3 flex items-start gap-3">
          <div className="inline-block max-w-full shrink-0 -rotate-2">
            <img
              src={madameGPhoto}
              alt=""
              className="banda-photo block object-contain sticker-shadow"
              loading="lazy"
            />
          </div>
          <div className="banda-side-column min-w-0 pt-1">
            <h3 className="banda-name font-poppins font-semibold lowercase text-brand-black">
              {site.banda.name}
            </h3>
            <p className="mt-1 font-hand text-sm leading-snug text-brand-magenta-ink/80">
              {t(site.banda.photoBy, locale)}
            </p>
            <div className="banda-link-row">
              {BANDA_LINK_ORDER.map((key) => (
                <BandaLinkIcon
                  key={key}
                  icon={key}
                  href={site.banda.links[key]}
                  label={key}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="mt-8 border-l-4 border-brand-magenta pl-3 text-xs italic leading-relaxed sm:mt-10 sm:text-sm">
          “{t(site.banda.quote, locale)}”
        </p>
        <p className="banda-coming-soon mt-12 font-hand text-xs uppercase tracking-wide text-brand-magenta-ink/75 sm:mt-16 md:mt-20">
          {t(site.banda.comingSoon, locale)}
        </p>
      </div>
    </ZPage>
  );
}

function ConcursoPage({ locale, sectionId }: { locale: Locale; sectionId?: string }) {
  const c = site.concurso;
  const [showComingSoon, setShowComingSoon] = useState(false);

  const revealComingSoon = () => {
    setShowComingSoon(true);
  };

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
          <CutoutText size="mp-xl">{t(c.title, locale)}</CutoutText>
        </h3>
        <p className="mt-3 font-mono-zine text-[10px] uppercase tracking-widest text-brand-accent">
          {t(c.deadline, locale)}
        </p>
        <p className="mt-2 font-serif-display text-xs italic leading-relaxed text-brand-pink/95 sm:text-sm">
          {c.body[locale][0]}
        </p>
        <div className="mt-auto flex flex-col items-start gap-3 pt-10">
          <Dialog onOpenChange={(open) => { if (!open) setShowComingSoon(false); }}>
            <DialogTrigger asChild>
              <CutoutButton variant="accent" size="mp-lg">
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
                        <CutoutText size="mp-2xl">{t(c.title, locale)}</CutoutText>
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
                    <CutoutButton onClick={revealComingSoon} variant="magenta">
                      {t(c.formLabel, locale)}
                    </CutoutButton>
                    {c.rulesUrl && (
                      <a
                        href={c.rulesUrl}
                        className="font-hand text-lg underline decoration-brand-magenta decoration-2 underline-offset-4 hover:text-brand-magenta"
                      >
                        {t(c.rulesLabel, locale)} →
                      </a>
                    )}
                  </div>
                  {showComingSoon && (
                    <p
                      className="concurso-coming-soon-notice mt-4 font-hand text-lg leading-snug text-brand-magenta-ink"
                      role="status"
                      aria-live="polite"
                    >
                      {t(c.comingSoonNotice, locale)}
                    </p>
                  )}
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

const PARTNER_LOGO_SRC: Record<string, string> = {
  "fundacao-edp": fundacaoEdpLogo,
  cml: cmlLogo,
  oeiras: oeirasLogo,
  "hacker-school": hackerSchoolLogo,
};

function prepareContactIconSvg(
  svg: string,
  prefix: string,
  options?: { strokeWidth?: string },
) {
  let out = svg
    .replace(/\bid="([^"]+)"/g, `id="${prefix}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${prefix}-$1)`)
    .replace(/xlink:href="#([^"]+)"/g, `xlink:href="#${prefix}-$1"`);

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

  if (options?.strokeWidth) {
    out = out.replace(/\bstroke-width="[^"]*"/gi, `stroke-width="${options.strokeWidth}"`);
  }

  return out;
}

const CONTACT_STROKE_BASE_MS: Record<string, number> = {
  instagram: 5200,
  phone: 5200,
  location: 4500,
};
const CONTACT_STROKE_DEFAULT_MS = 3800;
const CONTACT_STROKE_MIN_MS = 3200;

function contactStrokeDurationMs(length: number, maxLength: number, icon: string) {
  const base = CONTACT_STROKE_BASE_MS[icon] ?? CONTACT_STROKE_DEFAULT_MS;
  if (maxLength <= 0) return base;
  const scaled = Math.round((length / maxLength) * base);
  return Math.max(CONTACT_STROKE_MIN_MS, scaled);
}

function PartnerLogoSlot({
  partner,
  logoSrc,
}: {
  partner: (typeof site.parceiros.list)[number];
  logoSrc: string;
}) {
  const svgHostRef = useRef<HTMLSpanElement>(null);
  const strokeRunRef = useRef(0);
  const svgMarkup = useMemo(
    () => prepareContactIconSvg(circleDrawingSvg, `partner-ring-${partner.logo}`),
    [partner.logo],
  );

  const resetPaths = useCallback(() => {
    const host = svgHostRef.current;
    if (!host) return;
    host.querySelectorAll<SVGPathElement>("path").forEach((path) => {
      const length = path.getTotalLength();
      if (length <= 0) return;
      path.style.transition = "none";
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = "0";
    });
  }, []);

  const stopStroke = useCallback(() => {
    strokeRunRef.current += 1;
    resetPaths();
  }, [resetPaths]);

  const replayStroke = useCallback(() => {
    const host = svgHostRef.current;
    if (!host) return;

    const runId = ++strokeRunRef.current;
    const paths = Array.from(host.querySelectorAll<SVGPathElement>("path")).filter(
      (path) => path.getTotalLength() > 0,
    );
    if (paths.length === 0) return;

    const maxLength = Math.max(...paths.map((path) => path.getTotalLength()));

    paths.forEach((path) => {
      const length = path.getTotalLength();
      path.style.transition = "none";
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (runId !== strokeRunRef.current) return;
        paths.forEach((path) => {
          const length = path.getTotalLength();
          const durationMs = contactStrokeDurationMs(length, maxLength, "ring");
          path.style.transition = `stroke-dashoffset ${durationMs}ms ease-in-out`;
          path.style.strokeDashoffset = "0";
        });
      });
    });
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(resetPaths));
  }, [svgMarkup, resetPaths]);

  return (
    <a
      href={partner.href}
      target="_blank"
      rel="noreferrer"
      className={`parceiros-logo-slot ${partner.logo === "cml" ? "parceiros-logo-slot--cml" : ""}`}
      aria-label={partner.name}
      onMouseEnter={replayStroke}
      onMouseLeave={stopStroke}
      onMouseDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
    >
      <img src={logoSrc} alt="" className="parceiros-logo" loading="lazy" />
      <span
        ref={svgHostRef}
        className="parceiros-logo-ring"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
    </a>
  );
}

function ParceirosPage({ locale, sectionId }: { locale: Locale; sectionId?: string }) {
  return (
    <ZPage bg="magenta" sectionId={sectionId} className="parceiros-page">
      <div className="parceiros-page-layout flex h-full min-h-0 flex-col">
        <h2 className="mb-4 -rotate-1">
          <CutoutText size="mp-xl">
            {t(site.parceiros.kicker, locale)}
          </CutoutText>
        </h2>
        <div className="parceiros-logo-row">
          {site.parceiros.list.map((partner) => {
            const logoSrc = partner.logo ? PARTNER_LOGO_SRC[partner.logo] : undefined;
            if (!logoSrc || !partner.href) return null;
            return <PartnerLogoSlot key={partner.name} partner={partner} logoSrc={logoSrc} />;
          })}
        </div>
        <p className="parceiros-outro">{t(site.parceiros.outro, locale)}</p>
      </div>
    </ZPage>
  );
}

const DRAWING_STORAGE_KEY = "assoc641-magazine-drawing";

function applyDrawStrokeStyle(ctx: CanvasRenderingContext2D) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#c41958";
  ctx.fillStyle = "#c41958";
  ctx.lineWidth = 3.5;
}

function DrawMagazinePage({
  locale,
  onFlipPrev,
  onFlipNext,
}: {
  locale: Locale;
  onFlipPrev: (corner: "top" | "bottom") => void;
  onFlipNext: (corner: "top" | "bottom") => void;
}) {
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const logicalSizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const layout = canvasWrapRef.current?.closest(".draw-page-layout");
    if (!layout) return;

    const blockFlipStart = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".draw-page-flip-zone")) return;
      event.stopPropagation();
    };

    layout.addEventListener("mousedown", blockFlipStart);
    layout.addEventListener("touchstart", blockFlipStart, { passive: false });

    return () => {
      layout.removeEventListener("mousedown", blockFlipStart);
      layout.removeEventListener("touchstart", blockFlipStart);
    };
  }, []);

  const saveDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width <= 0 || canvas.height <= 0) return;

    try {
      localStorage.setItem(DRAWING_STORAGE_KEY, canvas.toDataURL("image/png"));
    } catch {
      // ignore quota / private mode errors
    }
  }, []);

  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current !== null) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(() => {
      saveDrawing();
      saveTimeoutRef.current = null;
    }, 250);
  }, [saveDrawing]);

  const getDrawContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width <= 0 || canvas.height <= 0) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    applyDrawStrokeStyle(ctx);
    return ctx;
  }, []);

  useEffect(() => {
    const wrap = canvasWrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const sync = () => {
      // Layout size (pre CSS transform) — parent .magazine-sheet-scale uses scale().
      const width = Math.floor(wrap.clientWidth);
      const height = Math.floor(wrap.clientHeight);
      if (width <= 0 || height <= 0) return;

      const dpr = window.devicePixelRatio || 1;

      if (
        logicalSizeRef.current.width === width &&
        logicalSizeRef.current.height === height
      ) {
        return;
      }

      const snapshot =
        logicalSizeRef.current.width > 0
          ? canvas.toDataURL("image/png")
          : localStorage.getItem(DRAWING_STORAGE_KEY);

      logicalSizeRef.current = { width, height };
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      // Keep CSS size at 100% of wrap so parent scale() is applied once.
      canvas.style.width = "100%";
      canvas.style.height = "100%";

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      applyDrawStrokeStyle(ctx);

      if (!snapshot) return;

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        applyDrawStrokeStyle(ctx);
      };
      img.src = snapshot;
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(wrap);
    // Flip-book pages often get their real size a frame later
    const raf = window.requestAnimationFrame(sync);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = canvasWrapRef.current;
    if (!canvas || !wrap) return;

    const pointFrom = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      // Map screen coords through CSS transform scale into layout/canvas space.
      const scaleX = canvas.clientWidth / Math.max(rect.width, 0.001);
      const scaleY = canvas.clientHeight / Math.max(rect.height, 0.001);
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    };

    const bootIfNeeded = () => {
      if (canvas.width > 0 && canvas.height > 0) return getDrawContext();
      const width = Math.floor(wrap.clientWidth);
      const height = Math.floor(wrap.clientHeight);
      if (width <= 0 || height <= 0) return null;
      const dpr = window.devicePixelRatio || 1;
      logicalSizeRef.current = { width, height };
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      applyDrawStrokeStyle(ctx);
      return ctx;
    };

    const onPointerDown = (event: PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const ctx = bootIfNeeded();
      const point = pointFrom(event);
      if (!ctx || !point) return;

      drawingRef.current = true;
      lastPointRef.current = point;
      canvas.setPointerCapture(event.pointerId);

      ctx.beginPath();
      ctx.arc(point.x, point.y, 1.75, 0, Math.PI * 2);
      ctx.fill();
      scheduleSave();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!drawingRef.current) return;
      event.preventDefault();
      event.stopPropagation();

      const ctx = getDrawContext();
      const point = pointFrom(event);
      const last = lastPointRef.current;
      if (!ctx || !point || !last) return;

      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      lastPointRef.current = point;
      scheduleSave();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!drawingRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      drawingRef.current = false;
      lastPointRef.current = null;
      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch {
        // already released
      }
      saveDrawing();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [getDrawContext, saveDrawing, scheduleSave]);

  const clearDrawing = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      applyDrawStrokeStyle(ctx);
    }

    drawingRef.current = false;
    lastPointRef.current = null;

    try {
      localStorage.removeItem(DRAWING_STORAGE_KEY);
    } catch {
      // ignore private mode errors
    }
  };

  const triggerFlip = (
    event: React.MouseEvent<HTMLButtonElement>,
    direction: "prev" | "next",
    corner: "top" | "bottom",
  ) => {
    event.stopPropagation();
    event.preventDefault();
    if (direction === "prev") onFlipPrev(corner);
    else onFlipNext(corner);
  };

  return (
    <ZPage bg="paper" className="draw-page">
      <div
        className="draw-page-layout"
        onMouseDown={(event) => {
          if (
            (event.target as HTMLElement).closest(
              ".draw-page-flip-zone, .draw-page-clear, .draw-page-corner-shield",
            )
          ) {
            return;
          }
          event.stopPropagation();
        }}
        onTouchStart={(event) => {
          if (
            (event.target as HTMLElement).closest(
              ".draw-page-flip-zone, .draw-page-clear, .draw-page-corner-shield",
            )
          ) {
            return;
          }
          event.stopPropagation();
        }}
      >
        <button
          type="button"
          className="draw-page-clear"
          aria-label={locale === "pt" ? "limpar desenho" : "clear drawing"}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={clearDrawing}
        >
          <Trash2 aria-hidden="true" />
        </button>
        <button
          type="button"
          className="draw-page-corner-shield draw-page-corner-shield--tl"
          tabIndex={-1}
          aria-hidden="true"
          onMouseDown={(event) => {
            event.stopPropagation();
            event.preventDefault();
          }}
          onTouchStart={(event) => event.stopPropagation()}
        />
        <button
          type="button"
          className="draw-page-corner-shield draw-page-corner-shield--tr"
          tabIndex={-1}
          aria-hidden="true"
          onMouseDown={(event) => {
            event.stopPropagation();
            event.preventDefault();
          }}
          onTouchStart={(event) => event.stopPropagation()}
        />
        <button
          type="button"
          className="draw-page-flip-zone draw-page-flip-zone--bl"
          onMouseDown={(event) => triggerFlip(event, "prev", "bottom")}
        />
        <button
          type="button"
          className="draw-page-flip-zone draw-page-flip-zone--br"
          onMouseDown={(event) => triggerFlip(event, "next", "bottom")}
        />
        <div className="draw-page-canvas-wrap" ref={canvasWrapRef}>
          <img
            src={exercicioAsset}
            alt=""
            className="draw-page-exercise"
            draggable={false}
          />
          <canvas
            ref={canvasRef}
            className="draw-page-canvas"
            aria-label={locale === "pt" ? "área de desenho" : "drawing area"}
          />
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
        <div className="contactos-hint" aria-hidden="true">
          <span className="contactos-hint-text">{t(c.hint, locale)}</span>
          <span
            className="contactos-hint-arrow"
            dangerouslySetInnerHTML={{ __html: arrowDrawingSvg }}
          />
        </div>
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
  spotify: spotifyIconSvg,
  youtube: youtubeIconSvg,
};

const BANDA_LINK_ORDER = ["instagram", "spotify", "youtube", "discord"] as const;

function isStrokeDrawPath(path: SVGPathElement) {
  const stroke = path.getAttribute("stroke");
  if (!stroke || stroke.toLowerCase() === "none") return false;
  const fill = path.getAttribute("fill");
  return !fill || fill.toLowerCase() === "none";
}

function useStrokeIconAnimation(
  icon: string,
  rawSvg: string,
  idPrefix: string,
  options?: { strokeWidth?: string; strokesOnly?: boolean },
) {
  const svgHostRef = useRef<HTMLSpanElement>(null);
  const strokeRunRef = useRef(0);
  const strokeWidth = options?.strokeWidth;
  const strokesOnly = options?.strokesOnly ?? false;
  const svgMarkup = useMemo(
    () => prepareContactIconSvg(rawSvg, idPrefix, { strokeWidth }),
    [idPrefix, rawSvg, strokeWidth],
  );

  const collectPaths = useCallback(() => {
    const host = svgHostRef.current;
    if (!host) return [] as SVGPathElement[];
    return Array.from(host.querySelectorAll<SVGPathElement>("path")).filter((path) => {
      if (path.getTotalLength() <= 0) return false;
      return strokesOnly ? isStrokeDrawPath(path) : true;
    });
  }, [strokesOnly]);

  const resetPaths = useCallback(() => {
    collectPaths().forEach((path) => {
      const length = path.getTotalLength();
      path.style.transition = "none";
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = "0";
    });
  }, [collectPaths]);

  const stopStroke = useCallback(() => {
    strokeRunRef.current += 1;
    resetPaths();
  }, [resetPaths]);

  const setupPaths = useCallback(() => {
    resetPaths();
  }, [resetPaths]);

  const replayStroke = useCallback(() => {
    const host = svgHostRef.current;
    if (!host) return;

    const runId = ++strokeRunRef.current;
    const paths = collectPaths();
    if (paths.length === 0) return;

    const maxLength = Math.max(...paths.map((path) => path.getTotalLength()));

    paths.forEach((path) => {
      const length = path.getTotalLength();
      path.style.transition = "none";
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (runId !== strokeRunRef.current) return;
        paths.forEach((path) => {
          const length = path.getTotalLength();
          const durationMs = contactStrokeDurationMs(length, maxLength, icon);
          path.style.transition = `stroke-dashoffset ${durationMs}ms ease-in-out`;
          path.style.strokeDashoffset = "0";
        });
      });
    });
  }, [collectPaths, icon]);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(setupPaths));
  }, [svgMarkup, setupPaths]);

  return { svgHostRef, svgMarkup, replayStroke, stopStroke };
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
  const rawSvg = CONTACT_ICON_SVGS[icon] ?? "";
  const { svgHostRef, svgMarkup, replayStroke, stopStroke } = useStrokeIconAnimation(
    icon,
    rawSvg,
    `contact-${icon}`,
  );

  return (
    <button
      type="button"
      className={`contact-channel-icon contact-channel-icon--${icon} ${active ? "is-active" : ""}`}
      aria-label={label}
      aria-pressed={active}
      onClick={onSelect}
      onMouseEnter={replayStroke}
      onMouseLeave={stopStroke}
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

function BandaLinkIcon({
  icon,
  label,
  href,
}: {
  icon: (typeof BANDA_LINK_ORDER)[number];
  label: string;
  href: string;
}) {
  const rawSvg = CONTACT_ICON_SVGS[icon] ?? "";
  const { svgHostRef, svgMarkup, replayStroke, stopStroke } = useStrokeIconAnimation(
    icon,
    rawSvg,
    `banda-${icon}`,
    { strokeWidth: "3.2" },
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`banda-link-icon banda-link-icon--${icon}`}
      aria-label={label}
      onMouseEnter={replayStroke}
      onMouseLeave={stopStroke}
    >
      <span
        ref={svgHostRef}
        className="banda-link-icon-graphic pointer-events-none"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
    </a>
  );
}

function StrokeArt({
  name,
  rawSvg,
  className = "",
  label,
  strokeWidth,
}: {
  name: string;
  rawSvg: string;
  className?: string;
  label: string;
  strokeWidth?: string;
}) {
  const { svgHostRef, svgMarkup, replayStroke, stopStroke } = useStrokeIconAnimation(
    name,
    rawSvg,
    `origem-${name}`,
    { strokesOnly: true, strokeWidth },
  );

  return (
    <span
      className={`origem-stroke-art origem-stroke-art--${name} ${className}`}
      role="img"
      aria-label={label}
      onMouseEnter={replayStroke}
      onMouseLeave={stopStroke}
      onMouseDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
    >
      <span
        ref={svgHostRef}
        className="origem-stroke-art-graphic pointer-events-none"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
    </span>
  );
}

function OrigemArtLine({
  name,
  rawSvg,
  label,
  color,
  imageFirst = false,
  art,
}: {
  name: string;
  rawSvg?: string;
  label: string;
  color: string;
  imageFirst?: boolean;
  art?: React.ReactNode;
}) {
  const graphic =
    art ??
    (rawSvg ? (
      <StrokeArt
        name={name}
        rawSvg={rawSvg}
        label={label}
        className={`origem-art-inline origem-art-inline--${name}`}
      />
    ) : null);
  const text = (
    <span className="origem-art-line-label" style={{ color }}>
      {label}
    </span>
  );

  return (
    <p className={`origem-art-line origem-art-line--${name}`}>
      {imageFirst ? (
        <>
          {graphic}
          {text}
        </>
      ) : (
        <>
          {text}
          {graphic}
        </>
      )}
    </p>
  );
}

function OrigemMixerStack({ locale }: { locale: Locale }) {
  return (
    <span className="origem-mixer-stack" aria-hidden="true">
      <StrokeArt
        name="mixer"
        rawSvg={mixerDrawingSvg}
        label={t(site.sobre.origem.lineMixer, locale)}
        className="origem-art-inline origem-art-inline--mixer"
      />
      {/* Sibling (not under mixer) so mixer hover z-index doesn't pull JBL above vizinhos */}
      <StrokeArt
        name="jbl"
        rawSvg={jblDrawingSvg}
        label={t(site.sobre.origem.lineSetup, locale)}
        className="origem-art-inline origem-art-inline--jbl origem-art-inline--jbl-overlay"
        strokeWidth="2.2"
      />
    </span>
  );
}

type FlipBookHandle = {
  pageFlip: () => {
    flipNext: (corner?: "top" | "bottom") => void;
    flipPrev: (corner?: "top" | "bottom") => void;
    flip: (page: number, corner?: "top" | "bottom") => void;
    turnToPage: (page: number) => void;
    getSettings: () => { showPageCorners: boolean };
    userStop: (
      point: { x: number; y: number },
      isSwipe?: boolean,
    ) => void;
  };
};

type MagazinePage = {
  key: string;
  label: string;
  content: React.ReactNode;
  hard?: boolean;
  hidden?: boolean;
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
  const footer = hard ? null : `- ${number} -`;

  return (
    <div
      ref={ref}
      className={`magazine-sheet ${hard ? "magazine-sheet-hard" : ""}`}
      data-density={hard ? "hard" : "soft"}
    >
      <div className="magazine-sheet-face">
        {/* Fixed design canvas (440×~610) scaled to the live sheet — keeps
            type/images in proportion and beats browser min font-size. */}
        <div className="magazine-sheet-scale">{children}</div>
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
          <CutoutText size="mp-2xl">{locale === "pt" ? "Porquê?" : "Why?"}</CutoutText>
        </h2>
        <div className="mb-5 grid gap-3 text-[14px] leading-relaxed">
          <p>
            {locale === "pt"
              ? "Ensaiar na rua é divertido. Excepto claro, quando nos mandam calar."
              : "Rehearsing on the street is fun. Except, of course, when they tell us to shut up."}
          </p>
          <p>
            {locale === "pt"
              ? "Foi assim que começámos. Tínhamos tudo para o sucesso: sonhos, um nome, instrumentos. Só que depois percebemos que nos faltava o mais importante: um espaço para ensaiar."
              : "That's how we started. We had everything for success: dreams, a name, instruments. Then we realised we were missing the most important thing: a place to rehearse."}
          </p>
        </div>
        <Polaroid
          label=""
          src={`${import.meta.env.BASE_URL}street-rehearsal.jpg`}
          aspect="aspect-[16/10]"
          rotate="-rotate-1"
          className="about-photo-card mx-auto w-[82%] max-w-[340px]"
        />
      </div>
    </ZPage>
  );
}

function SobreOriginPage({ locale }: { locale: Locale }) {
  return (
    <ZPage bg="paper" className="origem-page">
      <div className="origem-page-layout">
        <p className="origem-copy">{t(site.sobre.origem.p1, locale)}</p>

        <StrokeArt
          name="oeiras"
          rawSvg={oeirasDrawingSvg}
          label="Oeiras"
          className="origem-art-oeiras"
          strokeWidth="1.35"
        />

        <p className="origem-copy">{t(site.sobre.origem.p2, locale)}</p>

        <div className="origem-art-lines">
          <OrigemArtLine
            name="mixer"
            label={t(site.sobre.origem.lineMixer, locale)}
            color="#FFFF00"
            art={<OrigemMixerStack locale={locale} />}
          />
          <OrigemArtLine
            name="lame-setup"
            label={t(site.sobre.origem.lineSetup, locale)}
            color="#D86ECC"
          />
          <OrigemArtLine
            name="vizinhos"
            rawSvg={vizinhosDrawingSvg}
            label={t(site.sobre.origem.lineVizinhos, locale)}
            color="#002060"
          />
        </div>

        <p className="origem-copy">{t(site.sobre.origem.p3, locale)}</p>
      </div>
    </ZPage>
  );
}

function ThankYouCover() {
  return (
    <ZPage bg="dark" className="ink-stain">
      <div className="magazine-cover-layout magazine-back-cover-layout">
        <p className="magazine-back-cover-credits">
          obrigado à bia, góis, armando e lameiras
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
              onClick={(event) => {
                onNavigate(item);
                // Drop sticky :hover/focus on touch so only .is-active paints.
                event.currentTarget.blur();
              }}
              ref={isActive ? activeMarkerRef : undefined}
              className={`magazine-marker ${isActive ? "is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
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

/** URL segment → magazine page (+ optional locale for EN share links). */
export type MagazineSectionAlias = {
  pageKey: string;
  /** Only set on English aliases — forces EN toggle on entry. */
  locale?: Locale;
};

export const MAGAZINE_SECTION_ALIASES: Record<string, MagazineSectionAlias> = {
  // PT canonic
  opencall: { pageKey: "concurso" },
  bandas: { pageKey: "banda" },
  noticias: { pageKey: "noticias" },
  contactos: { pageKey: "contactos" },
  parceiros: { pageKey: "parceiros" },
  "junta-te": { pageKey: "junta" },
  porque: { pageKey: "sobre" },
  "o-que": { pageKey: "o-que" },
  "desenha-me": { pageKey: "blank-contactos-pad" },
  // EN aliases (same pages, English locale on entry)
  "join-us": { pageKey: "junta", locale: "en" },
  contacts: { pageKey: "contactos", locale: "en" },
  partners: { pageKey: "parceiros", locale: "en" },
  news: { pageKey: "noticias", locale: "en" },
  bands: { pageKey: "banda", locale: "en" },
  why: { pageKey: "sobre", locale: "en" },
  what: { pageKey: "o-que", locale: "en" },
  "draw-me": { pageKey: "blank-contactos-pad", locale: "en" },
};

/** Preferred shareable path (PT canonic) for a magazine page key. */
export const MAGAZINE_PAGE_TO_PATH: Record<string, string> = {
  cover: "/",
  sobre: "/porque",
  origem: "/porque",
  "o-que": "/o-que",
  junta: "/junta-te",
  banda: "/bandas",
  concurso: "/opencall",
  noticias: "/noticias",
  parceiros: "/parceiros",
  contactos: "/contactos",
  "blank-contactos-pad": "/desenha-me",
};

export function sectionFromPath(
  pathname: string,
): MagazineSectionAlias | undefined {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (clean === "/") return undefined;
  const segment = clean.replace(/^\//, "").toLowerCase();
  return MAGAZINE_SECTION_ALIASES[segment];
}

export function pathFromPageKey(pageKey: string): string | undefined {
  return MAGAZINE_PAGE_TO_PATH[pageKey];
}

export function MagazineIndex({
  initialSection,
  onSharePathChange,
}: {
  initialSection?: string;
  /** Keep the address bar in sync while flipping (replaceState, no remount). */
  onSharePathChange?: (path: string) => void;
} = {}) {
  const { locale } = useI18n();
  const bookRef = useRef<FlipBookHandle | null>(null);
  const initialSectionAppliedRef = useRef(false);
  const bookWrapRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const compactTurnLocked = useRef(false);
  const compactSwipeRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    time: number;
  } | null>(null);
  const wheelLocked = useRef(false);
  const wheelRemainder = useRef(0);
  const logoDriftRef = useRef<HTMLDivElement | null>(null);
  const logoDriftOffset = useRef(0);
  const logoDriftFrame = useRef<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeMarkerKey, setActiveMarkerKey] = useState("cover");
  const pinnedMarkerPageRef = useRef<number | null>(null);
  const applyPageChangeRef = useRef<(page: number) => void>(() => {});
  const [showFlipHint, setShowFlipHint] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  const [usePortrait, setUsePortrait] = useState(true);
  const [markerAxis, setMarkerAxis] = useState<MarkerAxis>("bands");
  const [bookSize, setBookSize] = useState({ w: 320, h: 443 });
  const flipDurationMs = usePortrait ? 440 : 720;
  const bookLayoutKey = `${locale}-${usePortrait ? "portrait" : "spread"}`;
  const markersOnBands = markerAxis === "bands";
  const layoutPortraitRef = useRef(usePortrait);
  const layoutMarkerRef = useRef(markerAxis);
  const layoutSizeRef = useRef(bookSize);
  const syncRafRef = useRef<number | null>(null);
  const flipUpdateTimerRef = useRef<number | null>(null);
  const measureGeometryRef = useRef<() => void>(() => {});
  const FLIP_UPDATE_DEBOUNCE_MS = 160;

  const refreshBookLayout = useCallback(() => {
    window.requestAnimationFrame(() => {
      try {
        bookRef.current?.pageFlip()?.update();
      } catch {
        /* ignore */
      }
    });
  }, []);

  const scheduleFlipUpdate = useCallback(() => {
    if (flipUpdateTimerRef.current !== null) {
      window.clearTimeout(flipUpdateTimerRef.current);
    }
    flipUpdateTimerRef.current = window.setTimeout(() => {
      flipUpdateTimerRef.current = null;
      refreshBookLayout();
    }, FLIP_UPDATE_DEBOUNCE_MS);
  }, [refreshBookLayout]);

  const measureAndApplyGeometry = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const styles = window.getComputedStyle(stage);
    const padX =
      (parseFloat(styles.paddingLeft) || 0) +
      (parseFloat(styles.paddingRight) || 0);
    const padY =
      (parseFloat(styles.paddingTop) || 0) +
      (parseFloat(styles.paddingBottom) || 0);
    // Prefer visualViewport/inner — stage 100svh can lag on orientation change.
    const vv = window.visualViewport;
    const viewportW = vv?.width ?? window.innerWidth;
    const viewportH = vv?.height ?? window.innerHeight;
    const vw = Math.max(1, viewportW - padX);
    const vh = Math.max(1, viewportH - padY);
    const layout = chooseBookMode(vw, vh);
    const nextPortrait = !layout.useSpread;
    const nextW = Math.round(layout.fit.width * 100) / 100;
    const nextH = Math.round(layout.fit.height * 100) / 100;

    const prevPortrait = layoutPortraitRef.current;
    const prevMarkers = layoutMarkerRef.current;
    const prevSize = layoutSizeRef.current;
    const modeChanged = prevPortrait !== nextPortrait;
    const markersChanged = prevMarkers !== layout.markerAxis;
    const sizeChanged =
      Math.abs(prevSize.w - nextW) >= 0.5 || Math.abs(prevSize.h - nextH) >= 0.5;
    const largeJump =
      sizeChanged &&
      (Math.abs(prevSize.w - nextW) > Math.max(40, prevSize.w * 0.12) ||
        Math.abs(prevSize.h - nextH) > Math.max(40, prevSize.h * 0.12));

    // Cheap path: CSS custom properties every frame (no page-flip).
    if (sizeChanged) {
      stage.style.setProperty("--magazine-book-w", `${nextW}px`);
      stage.style.setProperty("--magazine-book-h", `${nextH}px`);
      layoutSizeRef.current = { w: nextW, h: nextH };
      setBookSize({ w: nextW, h: nextH });
    }

    // Mode / marker chrome — only when geometry decision changes.
    if (modeChanged) {
      layoutPortraitRef.current = nextPortrait;
      setUsePortrait(nextPortrait);
    }
    if (markersChanged) {
      layoutMarkerRef.current = layout.markerAxis;
      setMarkerAxis(layout.markerAxis);
      // Stage border-box often stays 100svh — ResizeObserver won't see the
      // padding/grid change. Remeasure once after styles apply.
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          measureGeometryRef.current();
        });
      });
    }

    // Expensive path: skip no-ops. Large jumps (rotate) update flip immediately;
    // small drag resizes debounce so we don't thrash page-flip.
    // Mode remount (bookLayoutKey) already rebuilds the flipbook.
    if ((sizeChanged || markersChanged) && !modeChanged) {
      if (largeJump) {
        refreshBookLayout();
      }
      scheduleFlipUpdate();
    }
  }, [refreshBookLayout, scheduleFlipUpdate]);

  measureGeometryRef.current = measureAndApplyGeometry;

  const requestGeometrySync = useCallback(() => {
    if (syncRafRef.current !== null) return;
    syncRafRef.current = window.requestAnimationFrame(() => {
      syncRafRef.current = null;
      measureGeometryRef.current();
    });
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    measureAndApplyGeometry();
    const observer = new ResizeObserver(requestGeometrySync);
    observer.observe(stage);
    window.addEventListener("resize", requestGeometrySync);
    window.addEventListener("orientationchange", requestGeometrySync);
    window.visualViewport?.addEventListener("resize", requestGeometrySync);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", requestGeometrySync);
      window.removeEventListener("orientationchange", requestGeometrySync);
      window.visualViewport?.removeEventListener("resize", requestGeometrySync);
      if (syncRafRef.current !== null) {
        window.cancelAnimationFrame(syncRafRef.current);
        syncRafRef.current = null;
      }
      if (flipUpdateTimerRef.current !== null) {
        window.clearTimeout(flipUpdateTimerRef.current);
        flipUpdateTimerRef.current = null;
      }
    };
  }, [measureAndApplyGeometry, requestGeometrySync]);

  const flipTo = useCallback((page: number) => {
    // flip() only advances one spread; turnToPage jumps directly (markers + in-book hash links)
    bookRef.current?.pageFlip().turnToPage(page);
    setCurrentPage(page);
    if (page !== 0) setShowFlipHint(false);
    refreshBookLayout();
  }, [refreshBookLayout]);

  const flipPrev = useCallback(() => {
    bookRef.current?.pageFlip().flipPrev("bottom");
  }, []);

  const flipNext = useCallback(() => {
    bookRef.current?.pageFlip().flipNext("bottom");
  }, []);

  const turnCompactPage = useCallback(
    (delta: -1 | 1) => {
      if (compactTurnLocked.current) return;

      const flip = bookRef.current?.pageFlip();
      if (!flip) return;

      const api = flip as {
        getPageCount?: () => number;
        getCurrentPageIndex?: () => number;
        getState?: () => string;
        flip?: (page: number, corner?: "top" | "bottom") => void;
        flipPrev: (corner?: "top" | "bottom") => void;
        flipNext: (corner?: "top" | "bottom") => void;
        turnToPage?: (page: number) => void;
        update?: () => void;
      };
      const page = api.getCurrentPageIndex?.() ?? currentPage;
      const pageCount = api.getPageCount?.() ?? Number.POSITIVE_INFINITY;
      const targetPage = Math.max(0, Math.min(pageCount - 1, page + delta));
      if (targetPage === page && (delta > 0 || currentPage <= 0)) return;

      compactTurnLocked.current = true;
      setIsFlipping(true);
      setShowFlipHint(false);

      if (api.flip) {
        api.flip(targetPage, "bottom");
      } else if (delta < 0) {
        api.flipPrev("bottom");
      } else {
        api.flipNext("bottom");
      }

      window.setTimeout(() => {
        const pageFlip = bookRef.current?.pageFlip() as typeof api | undefined;
        if (!pageFlip || pageFlip.getState?.() !== "read") return;

        const visiblePage = pageFlip.getCurrentPageIndex?.() ?? currentPage;
        if (visiblePage !== page) return;

        const fallbackPage =
          delta < 0
            ? Math.max(0, Math.min(visiblePage, currentPage) - 1)
            : Math.min(pageCount - 1, visiblePage + 1);
        if (fallbackPage === visiblePage) return;

        pageFlip.turnToPage?.(fallbackPage);
        pageFlip.update?.();
        applyPageChangeRef.current(fallbackPage);
      }, Math.min(260, flipDurationMs - 80));

      window.setTimeout(() => {
        const pageFlip = bookRef.current?.pageFlip();
        pageFlip?.update();
        const landedPage = pageFlip?.getCurrentPageIndex?.();
        if (typeof landedPage === "number") {
          applyPageChangeRef.current(landedPage);
        }
        compactTurnLocked.current = false;
        setIsFlipping(false);
      }, flipDurationMs + 80);
    },
    [currentPage, flipDurationMs],
  );

  const flipPrevCorner = useCallback((corner: "top" | "bottom") => {
    bookRef.current?.pageFlip().flipPrev(corner);
  }, []);

  const flipNextCorner = useCallback((corner: "top" | "bottom") => {
    bookRef.current?.pageFlip().flipNext(corner);
  }, []);

  const isCompactSwipeTarget = useCallback(
    (target: HTMLElement | null) =>
      !target?.closest(
        [
          "a",
          "button",
          "input",
          "textarea",
          "select",
          "[role='button']",
          "[role='link']",
          ".news-camera",
          ".draw-page-layout",
          ".contactos-page",
        ].join(","),
      ),
    [],
  );

  const handleCompactBookPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!usePortrait) return;

      const target = event.target as HTMLElement | null;
      if (!isCompactSwipeTarget(target)) {
        compactSwipeRef.current = null;
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

      compactSwipeRef.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        time: window.performance.now(),
      };
    },
    [isCompactSwipeTarget, usePortrait],
  );

  const handleCompactBookPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const swipe = compactSwipeRef.current;
      compactSwipeRef.current = null;

      if (!swipe || swipe.pointerId !== event.pointerId) return;
      if (!usePortrait) return;

      const dx = event.clientX - swipe.x;
      const dy = event.clientY - swipe.y;
      const elapsed = window.performance.now() - swipe.time;
      const isHorizontalSwipe =
        Math.abs(dx) >= 44 &&
        Math.abs(dx) > Math.abs(dy) * 1.2 &&
        elapsed < 900;

      if (!isHorizontalSwipe) return;

      event.preventDefault();
      event.stopPropagation();
      turnCompactPage(dx < 0 ? 1 : -1);
    },
    [turnCompactPage, usePortrait],
  );

  const handleCompactBookPointerCancel = useCallback(() => {
    compactSwipeRef.current = null;
  }, []);

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLElement>) => {
      event.preventDefault();
      const delta = event.deltaY;
      logoDriftOffset.current += delta * 0.35;

      if (logoDriftFrame.current === null) {
        logoDriftFrame.current = window.requestAnimationFrame(() => {
          logoDriftFrame.current = null;
          logoDriftRef.current
            ?.querySelectorAll<HTMLElement>("[data-drift-speed]")
            .forEach((track) => {
              const speed = Number(track.dataset.driftSpeed) || 0;
              const tile = track.querySelector<HTMLElement>(".site-logo-drift-tile");
              const tileWidth = tile?.offsetWidth ?? track.scrollWidth / 2;
              if (tileWidth <= 0) return;
              // Wrap so the track loops instead of drifting forever off-content.
              const raw = logoDriftOffset.current * speed;
              const offset = ((raw % tileWidth) + tileWidth) % tileWidth;
              track.style.transform = `translate3d(${-offset}px, 0, 0)`;
            });
        });
      }

      // Ignore further page flips while an animation is playing
      if (wheelLocked.current || compactTurnLocked.current) return;

      wheelRemainder.current += delta;
      // Trigger mid-scroll once intent is clear (not after a big backlog)
      if (Math.abs(wheelRemainder.current) < 48) return;

      const direction = wheelRemainder.current;
      wheelRemainder.current = 0;
      wheelLocked.current = true;
      setShowFlipHint(false);

      // Portrait/compact: flipPrev/Next are unreliable (mouse events off +
      // back-flip quirks). Use the same path as swipe, with turnToPage fallback.
      if (usePortrait) {
        turnCompactPage(direction > 0 ? 1 : -1);
      } else if (direction > 0) {
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
    [flipDurationMs, flipNext, flipPrev, turnCompactPage, usePortrait],
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

  useEffect(
    () => () => {
      if (logoDriftFrame.current !== null) {
        window.cancelAnimationFrame(logoDriftFrame.current);
      }
    },
    [],
  );

  const magazinePages: MagazinePage[] = useMemo(() => {
    const pagesBeforeContactos: MagazinePage[] = [
      {
        key: "sobre",
        label: locale === "pt" ? "Porquê?" : "Why?",
        content: <SobrePhotoPage locale={locale} />,
      },
      {
        key: "origem",
        label: "",
        content: <SobreOriginPage locale={locale} />,
      },
      {
        key: "o-que",
        label: locale === "pt" ? "O quê?" : "What?",
        content: <OQuePage locale={locale} />,
      },
      {
        key: "junta",
        label: locale === "pt" ? "Junta-te!" : "Join us!",
        content: <JuntaPage locale={locale} sectionId="junta" />,
      },
      {
        key: "banda",
        label: t(site.nav.banda, locale),
        content: <BandaPage locale={locale} sectionId="banda" />,
      },
      {
        key: "concurso",
        label: "open call",
        content: <ConcursoPage locale={locale} sectionId="concurso" />,
      },
      {
        key: "noticias",
        label: t(site.nav.noticias, locale),
        content: (
          <NewsPage
            locale={locale}
            title={locale === "pt" ? "notícias" : "news"}
            sectionId="noticias"
          />
        ),
      },
      {
        key: "parceiros",
        label: t(site.nav.parceiros, locale),
        content: <ParceirosPage locale={locale} sectionId="parceiros" />,
      },
    ];

    const contactosIndexWithoutBlank = 1 + pagesBeforeContactos.length;
    const needsBlankBeforeContactos = contactosIndexWithoutBlank % 2 !== 0;

    const pages: MagazinePage[] = [
      {
        key: "cover",
        label: locale === "pt" ? "Capa" : "Cover",
        hard: true,
        content: <Cover locale={locale} sectionId="inicio" />,
      },
      ...pagesBeforeContactos,
    ];

    if (needsBlankBeforeContactos) {
      pages.push({
        key: "blank-contactos-pad",
        label: "",
        hidden: true,
        content: null,
      });
    }

    pages.push(
      {
        key: "contactos",
        label: t(site.nav.contactos, locale),
        content: null,
      },
      {
        key: "back",
        label: "",
        hard: true,
        hidden: true,
        content: <ThankYouCover />,
      },
    );

    return pages;
  }, [locale]);

  const markerItems: MagazineMarkerItem[] = useMemo(
    () =>
      magazinePages
        .map((page, index) => ({
          key: `${page.key}-marker`,
          label: page.label,
          sectionId: page.key,
          page: index,
          keys: [page.key],
        }))
        .filter((item) => item.label.length > 0),
    [magazinePages],
  );

  const applyPageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      setShowFlipHint(page === 0);
      const pinned = pinnedMarkerPageRef.current;
      if (
        pinned !== null &&
        sameMagazineSpread(pinned, page, layoutPortraitRef.current)
      ) {
        return;
      }
      pinnedMarkerPageRef.current = null;
      setActiveMarkerKey(magazinePages[page]?.key ?? "cover");
    },
    [magazinePages],
  );
  applyPageChangeRef.current = applyPageChange;

  const navigateMarker = useCallback(
    (item: MagazineMarkerItem) => {
      pinnedMarkerPageRef.current = item.page;
      setActiveMarkerKey(item.sectionId);
      flipTo(item.page);
    },
    [flipTo],
  );

  // Deep links (e.g. /opencall) open the matching magazine page once the book is ready.
  useEffect(() => {
    if (!initialSection || initialSectionAppliedRef.current) return;
    const pageKey =
      MAGAZINE_SECTION_ALIASES[initialSection.toLowerCase()]?.pageKey ??
      initialSection.toLowerCase();
    const pageIndex = magazinePages.findIndex((page) => page.key === pageKey);
    if (pageIndex < 0) return;

    initialSectionAppliedRef.current = true;
    pinnedMarkerPageRef.current = pageIndex;
    setActiveMarkerKey(pageKey);
    setCurrentPage(pageIndex);
    setShowFlipHint(pageIndex === 0);

    const open = () => {
      const flip = bookRef.current?.pageFlip?.();
      if (!flip?.turnToPage) {
        window.requestAnimationFrame(open);
        return;
      }
      flip.turnToPage(pageIndex);
      refreshBookLayout();
    };
    window.requestAnimationFrame(open);
  }, [initialSection, magazinePages, refreshBookLayout]);

  // Sync shareable URL to the active section without remounting the book.
  useEffect(() => {
    if (!onSharePathChange) return;
    if (initialSection && !initialSectionAppliedRef.current) return;
    const path = pathFromPageKey(activeMarkerKey);
    if (path) onSharePathChange(path);
  }, [activeMarkerKey, initialSection, onSharePathChange]);

  const mobileMarkerSplitIndex = Math.ceil(markerItems.length / 2);
  const mobileTopMarkerItems = markerItems.slice(0, mobileMarkerSplitIndex);
  const mobileBottomMarkerItems = markerItems.slice(mobileMarkerSplitIndex);

  const drawPageIndex = useMemo(
    () => magazinePages.findIndex((page) => page.key === "blank-contactos-pad"),
    [magazinePages],
  );

  const origemPageIndex = useMemo(
    () => magazinePages.findIndex((page) => page.key === "origem"),
    [magazinePages],
  );

  // The flip library controls corner previews per book, not per sheet. When the
  // drawing/contactos spread is open, switch that global setting according to
  // the sheet under the pointer so only contactos keeps the corner animation.
  useEffect(() => {
    const flip = bookRef.current?.pageFlip?.();
    if (!flip?.getSettings) return;

    const settings = flip.getSettings() as { showPageCorners?: boolean };
    const drawPageVisible =
      drawPageIndex >= 0 && currentPage === drawPageIndex && usePortrait;
    const drawSpreadVisible =
      drawPageIndex >= 0 &&
      (drawPageVisible ||
        (!usePortrait && Math.abs(currentPage - drawPageIndex) <= 1));

    const stopCornerPreview = () => {
      try {
        flip.userStop?.({ x: -1, y: -1 }, true);
      } catch {
        // ignore if flip API isn't ready
      }
    };

    if (!drawSpreadVisible) {
      settings.showPageCorners = true;
      return;
    }

    settings.showPageCorners = false;
    stopCornerPreview();

    if (usePortrait) return;

    const book = document.querySelector<HTMLElement>(".magazine-book");
    if (!book) return;

    const scopeCornersToSheet = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const overContactos = Boolean(target?.closest("#contactos"));
      const overDrawing = Boolean(target?.closest("#blank-contactos-pad"));
      if (!overContactos && !overDrawing) return;

      if (settings.showPageCorners === overContactos) return;
      settings.showPageCorners = overContactos;
      if (overDrawing) stopCornerPreview();
    };

    book.addEventListener("pointerover", scopeCornersToSheet, true);
    book.addEventListener("pointermove", scopeCornersToSheet, true);

    return () => {
      book.removeEventListener("pointerover", scopeCornersToSheet, true);
      book.removeEventListener("pointermove", scopeCornersToSheet, true);
      settings.showPageCorners = true;
    };
  }, [currentPage, drawPageIndex, usePortrait]);

  // Origem has illustrations near the bottom-right; shrink the library's corner
  // hit radius (default diagonal/5) so vizinhos doesn't trigger fold_corner.
  useEffect(() => {
    const flip = bookRef.current?.pageFlip?.() as
      | {
          getFlipController?: () => {
            isPointOnCorners?: (pos: { x: number; y: number }) => boolean;
          };
          getBoundsRect?: () => {
            pageWidth: number;
            height: number;
            width: number;
          };
          getRender?: () => {
            convertToBook: (pos: { x: number; y: number }) => {
              x: number;
              y: number;
            };
          };
        }
      | null
      | undefined;
    const controller = flip?.getFlipController?.();
    if (!controller?.isPointOnCorners || !flip?.getBoundsRect || !flip?.getRender) {
      return;
    }

    const origemVisible =
      origemPageIndex >= 0 &&
      (currentPage === origemPageIndex ||
        (!usePortrait && Math.abs(currentPage - origemPageIndex) <= 1));

    if (!origemVisible) return;

    const original = controller.isPointOnCorners.bind(controller);
    controller.isPointOnCorners = (globalPos: { x: number; y: number }) => {
      const rect = flip.getBoundsRect!();
      const bookPos = flip.getRender!().convertToBook(globalPos);
      // Default library radius is diagonal/5; use /12 on origem.
      const operatingDistance =
        Math.sqrt(rect.pageWidth ** 2 + rect.height ** 2) / 12;
      return (
        bookPos.x > 0 &&
        bookPos.y > 0 &&
        bookPos.x < rect.width &&
        bookPos.y < rect.height &&
        (bookPos.x < operatingDistance ||
          bookPos.x > rect.width - operatingDistance) &&
        (bookPos.y < operatingDistance ||
          bookPos.y > rect.height - operatingDistance)
      );
    };

    return () => {
      controller.isPointOnCorners = original;
    };
  }, [currentPage, origemPageIndex, usePortrait]);

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
      pinnedMarkerPageRef.current = pageIndex;
      setActiveMarkerKey(magazinePages[pageIndex]?.key ?? "cover");
      flipTo(pageIndex);
    };

    document.addEventListener("click", handleBookHashLink);
    return () => document.removeEventListener("click", handleBookHashLink);
  }, [flipTo, magazinePages]);

  return (
    <div className="relative min-h-screen bg-zine-dark font-sans text-brand-pink selection:bg-brand-magenta selection:text-white">
      <SiteLogoDrift driftRef={logoDriftRef} />
      <main
        ref={stageRef}
        className={`magazine-stage ${isFlipping ? "is-flipping" : ""}`}
        data-book-mode={usePortrait ? "portrait" : "spread"}
        data-markers={markerAxis}
        style={
          {
            "--magazine-book-w": `${bookSize.w}px`,
            "--magazine-book-h": `${bookSize.h}px`,
          } as CSSProperties
        }
        onWheel={handleWheel}
      >
        <div className="magazine-markers-mobile-top">
          {markersOnBands && (
            <MagazineMarkers
              items={mobileTopMarkerItems}
              onNavigate={navigateMarker}
              activeKey={activeMarkerKey}
            />
          )}
        </div>
        <div
          ref={bookWrapRef}
          className="magazine-book-wrap"
          onPointerDownCapture={handleCompactBookPointerDown}
          onPointerUpCapture={handleCompactBookPointerUp}
          onPointerCancel={handleCompactBookPointerCancel}
        >
          {showFlipHint && !usePortrait && (
            <span className="magazine-flip-hint-desktop" aria-hidden="true">
              {locale === "pt" ? "* folheia-me -> *" : "* flip me -> *"}
            </span>
          )}
          <HTMLFlipBook
            key={bookLayoutKey}
            ref={bookRef}
            className="magazine-book"
            style={{}}
            startPage={Math.min(currentPage, magazinePages.length - 1)}
            size="stretch"
            width={520}
            height={720}
            /* page-flip only enters portrait when parentWidth < minWidth*2
               (usePortrait means "allow", not "force"). Raise the threshold
               in compact mode so a ~400px wrap stays one-page; keep it low
               in spread mode so an ~880px wrap stays two-page. Element
               min-width/height are overridden in CSS (min-width: 0 !important). */
            minWidth={usePortrait ? 600 : 100}
            /* Allow pages larger than the 440px design canvas — live size comes
               from the geometry contain fit; sheet-scale handles type. */
            maxWidth={1200}
            minHeight={120}
            maxHeight={2000}
            drawShadow={!usePortrait}
            flippingTime={flipDurationMs}
            usePortrait={usePortrait}
            startZIndex={10}
            autoSize
            maxShadowOpacity={usePortrait ? 0.18 : 0.35}
            showCover
            mobileScrollSupport
            clickEventForward
            useMouseEvents={!usePortrait}
            swipeDistance={24}
            showPageCorners
            disableFlipByClick
            onChangeState={handleFlipStateChange}
            onFlip={(event) => {
              applyPageChange(Number(event.data) || 0);
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
                  ) : page.key === "blank-contactos-pad" ? (
                    <DrawMagazinePage
                      locale={locale}
                      onFlipPrev={flipPrevCorner}
                      onFlipNext={flipNextCorner}
                    />
                  ) : (
                    page.content
                  )}
                </div>
              </MagazineSheet>
            ))}
          </HTMLFlipBook>
        </div>
        <div className="magazine-markers-main">
          <MagazineMarkers
            items={markersOnBands ? mobileBottomMarkerItems : markerItems}
            onNavigate={navigateMarker}
            activeKey={activeMarkerKey}
            showFlipHint={showFlipHint && usePortrait}
            flipHintLabel={locale === "pt" ? "* folheia-me *" : "* flip me *"}
          />
        </div>
      </main>
    </div>
  );
}

