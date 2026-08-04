/** Design page size used by HTMLFlipBook / sheet scale canvas. */
export const PAGE_WIDTH = 520;
export const PAGE_HEIGHT = 720;
export const PAGE_ASPECT = PAGE_WIDTH / PAGE_HEIGHT;
export const SPREAD_ASPECT = (PAGE_WIDTH * 2) / PAGE_HEIGHT;

/** After contain(spread) into the viewport, each page must be at least this wide. */
export const MIN_READABLE_PAGE_WIDTH = 290;

/** Reserved gutter when leftover space is too tight for the marker rail / bands. */
export const SIDE_GUTTER_MIN = 112;
export const BAND_GUTTER_MIN = 112;

export type ConstrainedBy = "width" | "height";
export type MarkerAxis = "sides" | "bands";

/**
 * With showCover, page 0 stands alone; later pages pair as (1|2), (3|4), …
 * Used so a marker click on the right page of a spread stays highlighted
 * even when page-flip reports the left index.
 */
export function sameMagazineSpread(
  a: number,
  b: number,
  portrait: boolean,
): boolean {
  if (portrait || a === b) return a === b;
  if (a === 0 || b === 0) return a === b;
  return Math.floor((a - 1) / 2) === Math.floor((b - 1) / 2);
}

export type ContainFit = {
  width: number;
  height: number;
  constrainedBy: ConstrainedBy;
};

export type BookLayout = {
  useSpread: boolean;
  bookAspect: number;
  fit: ContainFit;
  constrainedBy: ConstrainedBy;
  markerAxis: MarkerAxis;
};

/** object-fit: contain for a rectangle of the given aspect into vw×vh. */
export function containFit(
  aspect: number,
  vw: number,
  vh: number,
): ContainFit {
  if (vw <= 0 || vh <= 0 || aspect <= 0) {
    return { width: 0, height: 0, constrainedBy: "width" };
  }

  const viewportAspect = vw / vh;

  if (viewportAspect > aspect) {
    // Viewport wider than book → height-constrained (pillarbox sides).
    return {
      width: vh * aspect,
      height: vh,
      constrainedBy: "height",
    };
  }

  // Viewport taller/narrower → width-constrained (letterbox top/bottom).
  return {
    width: vw,
    height: vw / aspect,
    constrainedBy: "width",
  };
}

/**
 * Choose 1-page vs 2-page mode from geometry only, then contain the chosen
 * book into the available rect (always reserving a marker gutter on the
 * leftover axis so book + chrome fit the stage grid).
 */
export function chooseBookMode(vw: number, vh: number): BookLayout {
  const spreadProbe = containFit(SPREAD_ASPECT, vw, vh);
  const useSpread = spreadProbe.width / 2 >= MIN_READABLE_PAGE_WIDTH;
  const bookAspect = useSpread ? SPREAD_ASPECT : PAGE_ASPECT;

  // Probe without chrome to learn which axis gets the leftover.
  let probe = containFit(bookAspect, vw, vh);
  let markerAxis: MarkerAxis =
    probe.constrainedBy === "height" ? "sides" : "bands";

  let availableW = vw;
  let availableH = vh;

  // Reserve gutter on the marker axis, then contain for real.
  // If that flips the constraint axis, reserve for the new axis instead.
  for (let i = 0; i < 2; i++) {
    availableW = vw;
    availableH = vh;
    if (markerAxis === "sides") {
      availableW = Math.max(1, vw - SIDE_GUTTER_MIN);
    } else {
      availableH = Math.max(1, vh - BAND_GUTTER_MIN);
    }
    probe = containFit(bookAspect, availableW, availableH);
    const nextAxis: MarkerAxis =
      probe.constrainedBy === "height" ? "sides" : "bands";
    if (nextAxis === markerAxis) break;
    markerAxis = nextAxis;
  }

  return {
    useSpread,
    bookAspect,
    fit: {
      width: Math.max(0, probe.width),
      height: Math.max(0, probe.height),
      constrainedBy: probe.constrainedBy,
    },
    constrainedBy: probe.constrainedBy,
    markerAxis,
  };
}
