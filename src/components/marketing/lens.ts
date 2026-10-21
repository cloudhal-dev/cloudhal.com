/**
 * The lens hero's motion (LensHero.astro): the lens follows the pointer through critically damped
 * springs, one per depth layer, drifts on its own when the pointer is still or coarse, narrows as
 * the hero scrolls away, and steps through the activity log, taking each line's state. One rAF
 * loop per hero, stopped offscreen, on a hidden tab and once everything has settled. Nothing moves
 * at motion "none", under reduced motion or after the reader pauses it.
 */

type Vec = { x: number; y: number };
/** A depth layer: how far it travels (viewBox units at full reach) and its time constant (ms). */
type Layer = { el: SVGGraphicsElement | HTMLElement; reach: number; tau: number; pos: Vec };

const IDLE_AFTER = 2800; // ms without pointer movement before the lens drifts on its own
const STEP_EVERY = 2800; // ms per activity-log line
const HOLD_LAST = 4200; // ms the last line stays before the log starts again
const TAU_SCROLL = 160;

function still(): boolean {
  const level = document.documentElement.dataset.chMotion;
  return level === "none" || matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Frame-rate independent approach of `from` to `to` with time constant `tau`. */
const approach = (from: number, to: number, dt: number, tau: number) =>
  from + (to - from) * (1 - Math.exp(-dt / tau));

function mount(root: HTMLElement): void {
  if (still()) return;
  const q = <T extends Element>(s: string) => root.querySelector<T>(s);
  const svg = q<SVGSVGElement>(".mk-lens__svg");
  const eye = q<SVGGElement>(".mk-lens__eye");
  const iris = q<SVGGElement>(".mk-lens__iris");
  const pupil = q<SVGGElement>(".mk-lens__pupil");
  const stage = q<HTMLElement>(".mk-lens__stage");
  const toggle = q<HTMLButtonElement>("[data-lens-toggle]");
  const items = [...root.querySelectorAll<HTMLLIElement>(".mk-lens__log li")];
  if (!svg || !eye || !iris || !pupil || !stage) return;

  const layers: Layer[] = [
    { el: svg, reach: 4, tau: 300, pos: { x: 0, y: 0 } },
    { el: eye, reach: 10, tau: 200, pos: { x: 0, y: 0 } },
    { el: iris, reach: 22, tau: 120, pos: { x: 0, y: 0 } },
    { el: pupil, reach: 12, tau: 110, pos: { x: 0, y: 0 } },
  ];
  const fine = matchMedia("(pointer: fine)").matches;
  let target: Vec = { x: 0, y: 0 };
  let lastMove = -Infinity;
  let scroll = 0;
  let pupilScale = 1;
  let visible = true;
  let paused = false;
  let raf = 0;
  let last = 0;
  let step = 0;
  let timer = 0;

  root.dataset.live = "";
  if (toggle) toggle.hidden = false;

  const onPointer = (e: PointerEvent) => {
    const r = svg.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy) || 1;
    // Far pointers saturate softly instead of hitting a hard stop.
    const k = Math.tanh(d / (0.5 * Math.max(innerWidth, innerHeight))) / d;
    target = { x: dx * k, y: dy * k };
    lastMove = performance.now();
    wake();
  };

  /** Where the gaze goes when nobody is steering it: a slow Lissajous drift at 30% reach. */
  const drift = (t: number): Vec => ({
    x: 0.3 * Math.sin((t / 11000) * Math.PI * 2),
    y: 0.3 * Math.sin((t / 17000) * Math.PI * 2 + 1.3),
  });

  const stateScale = () => {
    const s = root.dataset.state;
    return s === "waiting" ? 1.16 : s === "working" ? 0.86 : 1;
  };

  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min(64, now - (last || now));
    last = now;
    const idle = !fine || now - lastMove > IDLE_AFTER;
    const goal = paused ? { x: 0, y: 0 } : idle ? drift(now) : target;
    let moving = idle && !paused;

    for (const l of layers) {
      l.pos.x = approach(l.pos.x, goal.x, dt, l.tau);
      l.pos.y = approach(l.pos.y, goal.y, dt, l.tau);
      if (Math.abs(l.pos.x - goal.x) + Math.abs(l.pos.y - goal.y) > 0.002) moving = true;
    }
    const rect = root.getBoundingClientRect();
    const exit = Math.min(1, Math.max(0, -rect.top / (rect.height * 0.85)));
    scroll = approach(scroll, exit, dt, TAU_SCROLL);
    if (Math.abs(scroll - exit) > 0.001) moving = true;
    const wantPupil = stateScale() * (1 - 0.3 * scroll);
    pupilScale = approach(pupilScale, wantPupil, dt, 220);
    if (Math.abs(pupilScale - wantPupil) > 0.002) moving = true;

    const [housing, ring, irisL, pupilL] = layers as [Layer, Layer, Layer, Layer];
    housing.el.style.transform = `translate(${housing.pos.x * housing.reach}px, ${housing.pos.y * housing.reach}px)`;
    ring.el.style.transform = `translate(${ring.pos.x * ring.reach}px, ${ring.pos.y * ring.reach}px)`;
    irisL.el.style.transform = `translate(${irisL.pos.x * irisL.reach}px, ${irisL.pos.y * irisL.reach}px)`;
    pupilL.el.style.transform = `translate(${pupilL.pos.x * pupilL.reach}px, ${pupilL.pos.y * pupilL.reach}px) scale(${pupilScale})`;
    root.style.setProperty("--lens-exit", scroll.toFixed(3));

    if (moving && visible && !document.hidden) wake();
  };

  function wake() {
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }

  /** Light the log up to `step`, give the lens that line's state, and schedule the next line. */
  const show = () => {
    items.forEach((li, i) => {
      li.classList.toggle("is-done", i < step);
      li.classList.toggle("is-on", i === step);
    });
    root.style.setProperty("--lens-progress", ((step + 1) / items.length).toFixed(3));
    const state = items[step]?.dataset.state;
    if (state) root.dataset.state = state;
    if (state === "live") {
      root.classList.remove("is-ping");
      void root.offsetWidth; // restart the one-shot ring
      root.classList.add("is-ping");
    }
    wake();
    clearTimeout(timer);
    if (paused || !visible) return;
    const lastLine = step === items.length - 1;
    timer = window.setTimeout(() => {
      step = lastLine ? 0 : step + 1;
      show();
    }, lastLine ? HOLD_LAST : STEP_EVERY);
  };

  const setPaused = (p: boolean) => {
    paused = p;
    root.toggleAttribute("data-paused", p);
    if (toggle) {
      toggle.textContent = p ? (toggle.dataset.play ?? "") : (toggle.dataset.pause ?? "");
      toggle.setAttribute("aria-pressed", String(p));
    }
    show();
  };

  toggle?.addEventListener("click", () => setPaused(!paused));
  addEventListener("pointermove", onPointer, { passive: true });
  addEventListener("scroll", wake, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearTimeout(timer);
    else show();
  });
  new IntersectionObserver(([e]) => {
    visible = Boolean(e?.isIntersecting);
    if (visible) show();
    else clearTimeout(timer);
  }).observe(root);
  show();
}

/** Starts every lens hero on the page (once each). */
export function mountLenses(): void {
  for (const root of document.querySelectorAll<HTMLElement>("[data-lens]:not([data-lens-on])")) {
    root.dataset.lensOn = "";
    mount(root);
  }
}
