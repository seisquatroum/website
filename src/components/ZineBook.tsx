import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  type ReactNode,
} from "react";

/* ---------------------------------------------------------------- *
 * ZineBook — wraps sections in a page-flip magazine.
 * Uses react-pageflip, dynamically loaded on the client to avoid
 * SSR window access.
 * ---------------------------------------------------------------- */

type ZineNavCtx = {
  goTo: (i: number) => void;
  next: () => void;
  prev: () => void;
  current: number;
  total: number;
};
const ZineNavContext = createContext<ZineNavCtx | null>(null);
export const useZineNav = () => useContext(ZineNavContext);

type PageProps = { children: ReactNode; number?: number };
const Page = forwardRef<HTMLDivElement, PageProps>(function Page(
  { children, number },
  ref,
) {
  return (
    <div
      ref={ref}
      className="bg-brand-paper paper-tex relative overflow-hidden"
      style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.25)" }}
    >
      <div className="absolute inset-0 overflow-hidden">
        {children}
      </div>
      {number != null && (
        <div className="pointer-events-none absolute right-3 bottom-2 font-mono text-[10px] tracking-widest text-brand-black/60">
          — {number} —
        </div>
      )}
    </div>
  );
});

export type ZinePage = { key: string; label: string; node: ReactNode };

export function ZineBook({
  pages,
  header,
}: {
  pages: ZinePage[];
  header?: ReactNode;
}) {
  const [Flip, setFlip] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  const bookRef = useRef<any>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 520, h: 720, portrait: false });

  useEffect(() => {
    let alive = true;
    import("react-pageflip").then((m) => {
      if (alive) setFlip(() => m.default);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const portrait = vw < 900;
      const availW = Math.min(vw - 24, 1400);
      // leave room for the sticky top menu + page counter row
      const availH = Math.min(vh - (portrait ? 132 : 124), 1300);
      // Real magazine ratio ≈ A4 (1:1.414). Use ~1.4 portrait, ~1.38 spread.
      const ratio = portrait ? 1.414 : 1.38;
      let pageW = portrait ? availW : Math.min(availW / 2, 560);
      let pageH = pageW * ratio;
      if (pageH > availH) {
        pageH = availH;
        pageW = pageH / ratio;
      }
      setDims({ w: Math.round(pageW), h: Math.round(pageH), portrait });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const goTo = (i: number) => bookRef.current?.pageFlip()?.flip(i);
  const next = () => bookRef.current?.pageFlip()?.flipNext();
  const prev = () => bookRef.current?.pageFlip()?.flipPrev();

  /* Scroll (wheel / trackpad / touch drag) flips pages instead of scrolling. */
  const lockRef = useRef(false);
  const accRef = useRef(0);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const trigger = (dir: 1 | -1) => {
      if (lockRef.current) return;
      lockRef.current = true;
      accRef.current = 0;
      if (dir > 0) next();
      else prev();
      window.setTimeout(() => {
        lockRef.current = false;
      }, 900);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (lockRef.current) return;
      accRef.current += e.deltaY + e.deltaX;
      if (Math.abs(accRef.current) > 40) trigger(accRef.current > 0 ? 1 : -1);
    };

    let startY = 0;
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dy = startY - e.touches[0].clientY;
      if (Math.abs(dy) > 50) trigger(dy > 0 ? 1 : -1);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <ZineNavContext.Provider
      value={{ goTo, next, prev, current, total: pages.length }}
    >
      <div
        ref={wrapRef}
        className="relative flex h-screen w-full flex-col overflow-hidden overscroll-none"
      >
        {header}
        {/* Sticky top menu — jump straight to any section */}
        <nav className="shrink-0 border-b border-brand-pink/25 bg-black/40 backdrop-blur">
          <div className="flex gap-3 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {pages.map((p, i) => (
              <button
                key={p.key}
                type="button"
                onClick={() => goTo(i)}
                className={`shrink-0 whitespace-nowrap px-1 font-mono-zine text-[10px] uppercase tracking-[0.2em] transition-colors ${
                  current === i
                    ? "text-brand-accent underline decoration-wavy underline-offset-4"
                    : "text-brand-pink/70 hover:text-brand-pink"
                }`}
                style={{ fontFamily: "'Special Elite','Courier Prime',monospace" }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </nav>
        <div className="flex min-h-0 flex-1 flex-col justify-center py-2">
        {!Flip ? (
          <div
            style={{ height: dims.h }}
            className="mx-auto grid max-w-[1100px] place-items-center rounded bg-brand-paper/10 font-marker text-2xl text-brand-pink"
          >
            a folhear…
          </div>
        ) : (
          <div className="mx-auto" style={{ maxWidth: dims.portrait ? dims.w : dims.w * 2 }}>
            <Flip
              ref={bookRef}
              key={`${dims.w}x${dims.h}x${dims.portrait ? "p" : "l"}`}
              width={dims.w}
              height={dims.h}
              size="fixed"
              minWidth={280}
              maxWidth={640}
              minHeight={380}
              maxHeight={1300}
              showCover
              usePortrait={dims.portrait}
              flippingTime={800}
              drawShadow
              maxShadowOpacity={0.45}
              mobileScrollSupport={false}
              className="mx-auto"
              startZIndex={0}
              autoSize={false}
              clickEventForward
              useMouseEvents
              swipeDistance={30}
              showPageCorners
              disableFlipByClick={false}
              startPage={0}
              style={{}}
              onFlip={(e: any) => setCurrent(e.data)}
            >
              {pages.map((p, i) => (
                <Page key={p.key} number={i}>
                  {p.node}
                </Page>
              ))}
            </Flip>
          </div>
        )}

        {/* Controls — hand-scribbled arrows */}
        <div className="mt-2 flex shrink-0 flex-wrap items-center justify-center gap-6 px-4">
          <button
            type="button"
            onClick={prev}
            aria-label="anterior"
            className="group inline-flex items-center gap-2 text-brand-pink transition-transform hover:-translate-x-1"
          >
            <ScribbleArrow direction="left" size={56} />
          </button>
          <span
            className="font-typewriter text-[11px] uppercase tracking-[0.25em] text-brand-paper/80"
            style={{ fontFamily: "'Special Elite','Courier Prime',monospace" }}
          >
            pág {current + 1} / {pages.length}
          </span>
          <button
            type="button"
            onClick={next}
            aria-label="seguinte"
            className="group inline-flex items-center gap-2 text-brand-pink transition-transform hover:translate-x-1"
          >
            <ScribbleArrow direction="right" size={56} />
          </button>
        </div>
        </div>
      </div>
    </ZineNavContext.Provider>
  );
}

/* Hand-scribbled arrow SVG — mirrors the pink marker arrow reference.
 * Rough double-stroke with an open arrowhead. */
function ScribbleArrow({
  direction = "right",
  size = 76,
}: {
  direction?: "left" | "right";
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size * 0.5}
      viewBox="0 0 160 80"
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: direction === "left" ? "scaleX(-1)" : undefined,
        filter: "drop-shadow(2px 3px 0 rgba(0,0,0,0.45))",
      }}
      aria-hidden
    >
      {/* Main shaft — wobbly hand-drawn line */}
      <path d="M8 44 C 30 36, 58 50, 86 40 S 128 34, 148 40" />
      {/* Second sketch stroke slightly offset */}
      <path
        d="M10 48 C 34 42, 60 54, 90 46 S 130 40, 146 44"
        strokeWidth={3}
        opacity={0.7}
      />
      {/* Open arrowhead */}
      <path d="M120 18 C 132 28, 144 36, 150 42" />
      <path d="M122 66 C 134 58, 144 50, 150 42" />
      <path
        d="M124 22 C 134 30, 144 38, 148 42"
        strokeWidth={3}
        opacity={0.6}
      />
    </svg>
  );
}