"use client";
import React, { useEffect, useRef } from "react";
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
  root?: string; // path that maps to item[0] (exact match)
  className?: string;
  dark?: boolean;
}

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const smooth = (t: number) => t * t * (3 - 2 * t);
const hex = (s: string): [number, number, number] => {
  const h = s.trim().replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mixRGB = (a: [number, number, number], b: [number, number, number], t: number) =>
  `${(a[0] + (b[0] - a[0]) * t).toFixed(1)} ${(a[1] + (b[1] - a[1]) * t).toFixed(1)} ${(a[2] + (b[2] - a[2]) * t).toFixed(1)}`;

export default function LiquidNav({ items, root, className = "", dark = false }: Props) {
  const pathname = usePathname();

  const dockRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  const beadRef = useRef<HTMLDivElement>(null);

  const st = useRef<any>(null);
  if (!st.current) st.current = { raf: 0, last: 0, x: 0, v: 0, target: 0, dragging: false, pid: null, current: 0 };

  const active = Math.max(
    0,
    items.findIndex((t) =>
      t.href === root ? pathname === root : pathname === t.href || pathname.startsWith(t.href + "/")
    )
  );

  useEffect(() => {
    const dock = dockRef.current;
    const svg = svgRef.current;
    const fillP = fillRef.current;
    const bead = beadRef.current;
    if (!dock || !svg || !fillP || !bead) return;
    const rootEl = document.documentElement;
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
      G.slots = tabs.map((t) => {
        const b = t.getBoundingClientRect();
        return b.left - r.left + b.width / 2;
      });
      G.span = G.slots.length > 1 ? G.slots[1] - G.slots[0] : W;
      G.W = W; G.H = H;
      G.R = clamp(H * 0.2, 13, 20);
      G.CY = 0;
      let D = Math.min(H * 0.68, G.span * 0.78);
      const room = G.slots[0] - G.R - 6;
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
      const q = clamp(S.v / 1100, -1, 1) * (S.dragging ? 0.5 : 1);
      const mag = Math.abs(q);
      const sL = clamp(G.S * (1 + 0.06 * mag + 0.4 * q), G.S * 0.55, G.S * 2.1);
      const sR = clamp(G.S * (1 + 0.06 * mag - 0.4 * q), G.S * 0.55, G.S * 2.1);
      fillP!.setAttribute("d", trough(S.x, G.CY, G.RB, sL, sR));
      const sx = 1 + 0.07 * mag;
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
      rootEl.style.setProperty("--glow-rgb", mixRGB(ACC[near], ACC[other], t));
    }

    function loop(now: number) {
      S.raf = 0;
      const dt = Math.min((now - S.last) / 1000, 1 / 30);
      S.last = now;
      const K = S.dragging ? 900 : 142;
      const C = S.dragging ? 52 : 19.3;
      let step = dt;
      while (step > 0) {
        const h = Math.min(step, 1 / 240);
        S.v += (-K * (S.x - S.target) - C * S.v) * h;
        S.x += S.v * h;
        step -= h;
      }
      paint();
      if (Math.abs(S.x - S.target) > 0.05 || Math.abs(S.v) > 0.6 || S.dragging) run();
      else { S.x = S.target; S.v = 0; paint(); }
    }

    function run() { if (S.raf) return; S.last = performance.now(); S.raf = requestAnimationFrame(loop); }
    function jump(to: number) {
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced && !S.dragging) { S.x = to; S.v = 0; paint(); return; }
      run();
    }

    function select(i: number) {
      S.current = (i + tabs.length) % tabs.length;
      tabs.forEach((t, n) => {
        t.setAttribute("aria-selected", String(n === S.current));
        t.tabIndex = n === S.current ? 0 : -1;
      });
      jump(G.slots[S.current]);
    }

    /* clicks: let Link navigate; just animate the bead */
    const clickHandler = (e: Event) => {
      const t = (e.currentTarget as HTMLElement).getAttribute("data-index");
      if (!t) return;
      select(Number(t));
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
      select((next + tabs.length) % tabs.length);
      /* move focus */
      tabs[(next + tabs.length) % tabs.length]?.focus();
    };
    dock!.addEventListener("keydown", onKey);

    let startX = 0, suppressClick = false;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      S.pid = e.pointerId; startX = e.clientX; suppressClick = false;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== S.pid) return;
      if (!S.dragging && Math.abs(e.clientX - startX) < 7) return;
      if (!S.dragging) { S.dragging = true; suppressClick = true; dock.classList.add("is-dragging"); dock.setPointerCapture(S.pid); }
      e.preventDefault();
      const left = dock.getBoundingClientRect().left;
      S.target = clamp(e.clientX - left, G.slots[0], G.slots[G.slots.length - 1]);
      run();
    };
    const release = (e: PointerEvent) => {
      if (e.pointerId !== S.pid) return;
      S.pid = null;
      if (!S.dragging) return;
      S.dragging = false;
      dock.classList.remove("is-dragging");
      let near = 0, nd = Infinity;
      G.slots.forEach((s: number, i: number) => { const d = Math.abs(S.target - s); if (d < nd) { nd = d; near = i; } });
      select(near);
      setTimeout(() => { suppressClick = false; }, 0);
    };
    dock.addEventListener("pointerdown", onDown);
    dock.addEventListener("pointermove", onMove);
    dock.addEventListener("pointerup", release);
    dock.addEventListener("pointercancel", release);

    function layout(anim: boolean) {
      if (!measure()) return;
      if (anim) run(); else { S.x = S.target = G.slots[S.current] ?? 0; S.v = 0; paint(); }
      dock!.classList.add("is-ready");
    }
    layout(false);
    const ro = new ResizeObserver(() => layout(false));
    ro.observe(dock!);
    if (document.fonts) document.fonts?.ready.then(() => layout(false));

    return () => {
      cancelAnimationFrame(S.raf);
      ro.disconnect();
      tabs.forEach((t) => t.removeEventListener("click", clickHandler));
      dock.removeEventListener("keydown", onKey);
      dock.removeEventListener("pointerdown", onDown);
      dock.removeEventListener("pointermove", onMove);
      dock.removeEventListener("pointerup", release);
      dock.removeEventListener("pointercancel", release);
    };
  }, [items, dark]);

  /* keep bead on the route's active tab */
  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;
    const id = requestAnimationFrame(() => {
      const tabs = Array.from(dock.querySelectorAll<HTMLElement>("[data-tab]"));
      if (!tabs.length) return;
      const r = dock.getBoundingClientRect();
      const slots = tabs.map((t) => {
        const b = t.getBoundingClientRect();
        return b.left - r.left + b.width / 2;
      });
      const S = st.current;
      if (!S || !slots.length) return;
      S.current = active;
      S.x = S.target = slots[active]; S.v = 0;
      tabs.forEach((t, i) => {
        t.setAttribute("aria-selected", String(i === active));
        t.tabIndex = i === active ? 0 : -1;
      });
      const fillP = fillRef.current;
      if (fillP) {
        /* repaint without running spring (instant snap on navigation) */
        const q = 0;
        const G2: any = { S: (S as any).S || 8 };
        /* keep paint() from re-running: simplest is to re-run layout once */
      }
    });
    return () => cancelAnimationFrame(id);
  }, [active, pathname]);

  return (
    <div
      ref={dockRef}
      className={`mn ${dark ? "mn-dark" : ""} ${className}`}
      style={{ height: "var(--mn-h, 76px)" } as any}
    >
      <div className="mn__cast" />
      <svg ref={svgRef} className="mn__skin" width="100%" height="100%" aria-hidden="true">
        <defs>
          <linearGradient id="mnPlate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="mn__plate-hi" />
            <stop offset="1" className="mn__plate-lo" />
          </linearGradient>
          <linearGradient id="mnRim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="mn__rim-hi" />
            <stop offset="1" className="mn__rim-lo" />
          </linearGradient>
        </defs>
        <path ref={fillRef} className="mn__fill" />
      </svg>
      <div ref={beadRef} className="mn__bead" aria-hidden="true" />
      <div className="mn__tabs">
        {items.map((item, i) => {
          const Icon = item.icon;
          const isActive = i === active;
          return (
            <Link
              key={item.href}
              href={item.href}
              data-tab
              role="tab"
              aria-selected={isActive}
              className="mn__tab"
              style={{ "--acc": item.acc || (dark ? "#c9f24a" : "#1e40af") } as any}
              tabIndex={isActive ? 0 : -1}
            >
              <Icon className="mn__icon" />
              <span className="mn__label" style={{ color: item.acc || (dark ? "#c9f24a" : "#1e40af") }}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}