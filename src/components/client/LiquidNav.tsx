"use client";
import React, { useEffect, useRef, useState, useId } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ============================================================
   LiquidNav — liquid bottom navigation.
   Ported from hasib41/meniscus-liquid-nav (MIT). The bar's top
   edge is an SVG path driven by one spring: the active tab is a
   bead that dents the surface, leans with velocity, and stretches
   the trailing shoulder. Icons rise into the bead as it passes.
   ============================================================ */

interface Tab {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  acc?: string;
}

interface Props {
  items: Tab[];
  root?: string;
  className?: string;
  dark?: boolean; // explicit plate theme; if undefined auto-detect
}

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const smooth = (t: number) => t * t * (3 - 2 * t);

declare global {
  interface Window { __mnReduced?: boolean; }
}
const hex = (s: string): [number, number, number] => {
  const h = s.trim().replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mixRGB = (a: [number, number, number], b: [number, number, number], t: number) =>
  `${(a[0] + (b[0] - a[0]) * t).toFixed(1)} ${(a[1] + (b[1] - a[1]) * t).toFixed(1)} ${(a[2] + (b[2] - a[2]) * t).toFixed(1)}`;

export default function LiquidNav({ items, root, className = "", dark }: Props) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState<boolean>(dark ?? false);
  const [ready, setReady] = useState(false);

  const dockRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  const beadRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ goto: (i: number) => void } | null>(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const plateId = `mnPlate-${uid}`;
  const rimId = `mnRim-${uid}`;

  const st = useRef<any>(null);
  if (!st.current)
    st.current = { raf: 0, last: 0, x: 0, v: 0, target: 0, dragging: false, pid: null, current: 0, painted: false };

  const active = Math.max(
    0,
    items.findIndex((t) =>
      t.href === root ? pathname === root : pathname === t.href || pathname.startsWith(t.href + "/")
    )
  );

  /* ---------- auto-detect dark if not given ---------- */
  useEffect(() => {
    if (dark !== undefined) return;
    const read = () =>
      document.documentElement.classList.contains("dark") ||
      document.documentElement.getAttribute("data-theme") === "dark" ||
      localStorage.getItem("theme") === "dark";
    setIsDark(read());
    const obs = new MutationObserver(() => setIsDark(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    const on = () => setIsDark(read());
    window.addEventListener("storage", on);
    return () => { obs.disconnect(); window.removeEventListener("storage", on); };
  }, [dark]);

  useEffect(() => {
    const dock = dockRef.current;
    const svg = svgRef.current;
    const fillP = fillRef.current;
    const bead = beadRef.current;
    if (!dock || !svg || !fillP || !bead) return;
    const S = st.current;

    const tabs = Array.from(dock.querySelectorAll<HTMLElement>("[data-tab]"));
    if (!tabs.length) return;
    const G: any = { W: 0, H: 0, R: 17, D: 56, RB: 35, S: 17, CY: 0, slots: [], span: 80 };
    const ACC = tabs.map((t) => hex(getComputedStyle(t).getPropertyValue("--acc") || "#1e40af"));

    const reach = (s: number, rb: number, by: number) => Math.sqrt(Math.max((s + rb) ** 2 - (s - by) ** 2, 1));

    function measure() {
      const r = dock!.getBoundingClientRect();
      const W = Math.round(r.width), H = Math.round(r.height);
      if (W < 40 || H < 30) return false;
      const slots = tabs.map((t) => {
        const b = t.getBoundingClientRect();
        return b.left - r.left + b.width / 2;
      });
      G.slots = slots;
      G.span = slots.length > 1 ? slots[1] - slots[0] : W;
      G.W = W; G.H = H;
      G.R = clamp(H * 0.2, 13, 20);
      G.CY = 0;
      let D = Math.min(H * 0.68, G.span * 0.78);
      const room = slots[0] - G.R - 6;
      for (let i = 0; i < 3; i++) {
        const hw = reach(D * 0.22, D / 2 + 6, G.CY);
        if (hw <= room) break;
        D *= room / hw;
      }
      G.D = Math.max(Math.round(D), 30);
      G.S = G.D * 0.22;
      G.RB = G.D / 2 + 6;
      svg!.setAttribute("viewBox", `0 0 ${W} ${H}`);
      dock!.style.setProperty("--dock-r", `${G.R.toFixed(1)}px`);
      dock!.style.setProperty("--bead-d", `${G.D}px`);
      dock!.style.setProperty("--bead-cy", `0px`);
      dock!.style.setProperty("--rise", `${(H / 2).toFixed(1)}px`);
      return true;
    }

    function trough(bx: number, by: number, rb: number, sL: number, sR: number) {
      const { W, H, R } = G;
      const wing = (s: number, side: number) => {
        const L = s + rb;
        const half = reach(s, rb, by);
        const sx = bx + side * half;
        return { sx, s, tx: sx + ((bx - sx) / L) * s, ty: s + ((by - s) / L) * s };
      };
      const A = wing(sL, -1);
      const B = wing(sR, +1);
      const a0 = Math.atan2(A.ty - by, A.tx - bx);
      const a1 = Math.atan2(B.ty - by, B.tx - bx);
      let sweep = ((a0 - a1) * 180) / Math.PI;
      while (sweep < 0) sweep += 360;
      const large = sweep > 180 ? 1 : 0;
      const n = (v: number) => v.toFixed(2);
      return (
        `M0 ${n(R)}` +
        `A${n(R)} ${n(R)} 0 0 1 ${n(R)} 0` +
        `L${n(clamp(A.sx, R, W - R))} 0` +
        `A${n(sL)} ${n(sL)} 0 0 1 ${n(A.tx)} ${n(A.ty)}` +
        `A${n(rb)} ${n(rb)} 0 ${large} 0 ${n(B.tx)} ${n(B.ty)}` +
        `A${n(sR)} ${n(sR)} 0 0 1 ${n(clamp(B.sx, R, W - R))} 0` +
        `L${n(W - R)} 0` +
        `A${n(R)} ${n(R)} 0 0 1 ${n(W)} ${n(R)}` +
        `L${n(W)} ${n(H - R)}` +
        `A${n(R)} ${n(R)} 0 0 1 ${n(W - R)} ${n(H)}` +
        `L${n(R)} ${n(H)}` +
        `A${n(R)} ${n(R)} 0 0 1 0 ${n(H - R)}` +
        `Z`
      );
    }

    function paint() {
      if (!G.slots.length) return;
      S.painted = true;
      const q = clamp(S.v / 1100, -1, 1) * (S.dragging ? 0.5 : 1);
      const mg = Math.abs(q);
      const sL = clamp(G.S * (1 + 0.06 * mg + 0.4 * q), G.S * 0.55, G.S * 2.1);
      const sR = clamp(G.S * (1 + 0.06 * mg - 0.4 * q), G.S * 0.55, G.S * 2.1);
      fillP!.setAttribute("d", trough(S.x, G.CY, G.RB, sL, sR));
      const sx = 1 + 0.07 * mg;
      bead!.style.transform = `translate3d(${S.x.toFixed(2)}px,0,0) scale(${sx.toFixed(3)},${(1 / sx).toFixed(3)})`;
      let near = 0, nd = Infinity;
      for (let i = 0; i < tabs.length; i++) {
        const dx = Math.abs(S.x - G.slots[i]);
        if (dx < nd) { nd = dx; near = i; }
        tabs[i].style.setProperty("--t", smooth(clamp(1 - dx / (G.span * 0.55), 0, 1)).toFixed(3));
      }
      const side = S.x >= G.slots[near] ? 1 : -1;
      const other = clamp(near + side, 0, tabs.length - 1);
      const t = other === near ? 0 : clamp(Math.abs(S.x - G.slots[near]) / G.span, 0, 1);
      document.documentElement.style.setProperty("--glow-rgb", mixRGB(ACC[near], ACC[other], t));
    }

    function loop(now: number) {
      S.raf = 0;
      const dt = Math.min((now - S.last) / 1000, 1 / 30);
      S.last = now;
      const K = S.dragging ? 900 : 210;
      const C = S.dragging ? 52 : 24;
      let step = dt;
      while (step > 0) {
        const h = Math.min(step, 1 / 60);
        S.v += (-K * (S.x - S.target) - C * S.v) * h;
        S.x += S.v * h;
        step -= h;
      }
      paint();
      if (Math.abs(S.x - S.target) > 0.03 || Math.abs(S.v) > 0.4 || S.dragging) run();
      else { S.x = S.target; S.v = 0; paint(); }
    }

    function run() { if (S.raf) return; S.last = performance.now(); S.raf = requestAnimationFrame(loop); }

    /* snap onto a slot (used on click + after navigation) */
    function goto(i: number) {
      if (!G.slots.length) return;
      const idx = clamp((i + tabs.length) % tabs.length, 0, tabs.length - 1);
      S.current = idx;
      tabs.forEach((t, n) => {
        t.setAttribute("aria-selected", String(n === idx));
        t.tabIndex = n === idx ? 0 : -1;
      });
      S.target = G.slots[idx];
      /* animate when user is watching, hard-snap otherwise */
      if (document.visibilityState === "visible" && !window.__mnReduced) run();
      else { S.x = S.target; S.v = 0; paint(); }
    }

    function runReduced() {
      window.__mnReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (window.__mnReduced) { S.x = S.target; S.v = 0; paint(); }
    }

    /* click: set the bead target to this slot (Link takes care of routing) */
    const clickHandler = (e: Event) => {
      const idxStr = (e.currentTarget as HTMLElement).getAttribute("data-index");
      if (idxStr === null) return;
      const idx = Number(idxStr);
      goto(idx);
      if (S.dragging) e.preventDefault();
    };
    tabs.forEach((t, i) => {
      t.setAttribute("data-index", String(i));
      t.addEventListener("click", clickHandler);
    });

    const onKey = (e: KeyboardEvent) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key] as number | undefined;
      let next: number | null = null;
      if (step !== undefined) next = S.current + step;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      const idx = (next + tabs.length) % tabs.length;
      goto(idx);
      tabs[idx]?.focus();
      tabs[idx]?.click();
    };
    dock!.addEventListener("keydown", onKey);

    let startX = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      S.pid = e.pointerId; startX = e.clientX;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== S.pid) return;
      if (!S.dragging && Math.abs(e.clientX - startX) < 8) return;
      if (!S.dragging) { S.dragging = true; dock!.classList.add("is-dragging"); dock!.setPointerCapture(e.pointerId); }
      e.preventDefault();
      const left = dock!.getBoundingClientRect().left;
      S.target = clamp(e.clientX - left, G.slots[0], G.slots[G.slots.length - 1]);
      run();
    };
    const release = (e: PointerEvent) => {
      if (e.pointerId !== S.pid) return;
      S.pid = null;
      if (!S.dragging) return;
      S.dragging = false;
      dock!.classList.remove("is-dragging");
      let near = 0, nd = Infinity;
      G.slots.forEach((s: number, i: number) => { const d = Math.abs(S.target - s); if (d < nd) { nd = d; near = i; } });
      goto(near);
      /* navigate to the snapped tab (like a real click) — but skip if already on it */
      const currentIdx = S.current;
      if (currentIdx === near) return;
      tabs[near]?.click();         // triggers the Link navigation
    };
    dock!.addEventListener("pointerdown", onDown);
    dock!.addEventListener("pointermove", onMove);
    dock!.addEventListener("pointerup", release);
    dock!.addEventListener("pointercancel", release);

    function layout(anim = false) {
      if (!measure()) return;
      if (anim) goto(S.current);        // re-resolve to current slot
      else { if (G.slots[S.current] != null) { S.x = S.target = G.slots[S.current]; S.v = 0; } paint(); }
      setReady(true);
    }
    layout(false);
    const ro = new ResizeObserver(() => layout(false));
    ro.observe(dock!);
    if (document.fonts) document.fonts?.ready.then(() => layout(false));

    /* expose snap api for route changes */
    apiRef.current = { goto: (i: number) => goto(i) };

    runReduced();
    const reduceMq = matchMedia("(prefers-reduced-motion: reduce)");
    reduceMq.addEventListener("change", runReduced);

    return () => {
      cancelAnimationFrame(S.raf);
      ro.disconnect();
      tabs.forEach((t) => t.removeEventListener("click", clickHandler));
      dock!.removeEventListener("keydown", onKey);
      dock!.removeEventListener("pointerdown", onDown);
      dock!.removeEventListener("pointermove", onMove);
      dock!.removeEventListener("pointerup", release);
      dock!.removeEventListener("pointercancel", release);
      reduceMq.removeEventListener("change", runReduced);
      apiRef.current = null;
    };
  }, []);

  /* ---- on route change: hard-snap the bead onto the active tab ---- */
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      apiRef.current?.goto(active);
    });
    return () => cancelAnimationFrame(id);
  }, [active, pathname]);

  const resolvedDark = dark ?? isDark;

  return (
    <div
      ref={dockRef}
      className={`mn ${resolvedDark ? "mn-dark" : ""} ${ready ? "is-ready" : ""} ${className}`}
      style={{ height: "var(--mn-h, 76px)" } as any}
      data-live
    >
      <div className="mn__cast" style={{ position: "absolute", zIndex: 0 }} />
      <svg ref={svgRef} className="mn__skin" style={{ position: "absolute", zIndex: 1 }} width="100%" height="100%" aria-hidden="true">
        <defs>
          <linearGradient id={plateId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="mn__plate-hi" />
            <stop offset="1" className="mn__plate-lo" />
          </linearGradient>
          <linearGradient id={rimId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="mn__rim-hi" />
            <stop offset="1" className="mn__rim-lo" />
          </linearGradient>
        </defs>
        <path ref={fillRef} className="mn__fill" style={{ fill: `url(#${plateId})`, stroke: `url(#${rimId})` }} />
      </svg>
      <div ref={beadRef} className="mn__bead" style={{ position: "absolute", zIndex: 2 }} aria-hidden="true" />
      <div className="mn__tabs" style={{ position: "absolute", zIndex: 3 }}>
        {items.map((item, i) => {
          const Icon = item.icon;
          const isActive = i === active;
          const acc = item.acc || (resolvedDark ? "#c9f24a" : "#1e40af");
          return (
            <Link
              key={item.label}
              href={item.href}
              data-tab
              role="tab"
              aria-selected={isActive}
              className="mn__tab"
              style={{ "--acc": acc } as any}
              tabIndex={isActive ? 0 : -1}
            >
              <Icon className="mn__icon" />
              <span className="mn__label" style={{ color: acc }}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}