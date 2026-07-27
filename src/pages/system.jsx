/* ═══════════════════════════════════════════════════════════════════════════
   src/ui/system.jsx — MexicaTrading design system

   One place that defines how the whole product looks. Every page imports
   from here instead of writing its own colours, spacing and card styles.
   That consistency is what makes an app feel like a team built it.

   USAGE
     import { T, ThemeStyles, PageShell, Panel, SectionHead, LedgerRow,
              Button, StatusPill, EmptyState, Money, Banner } from "../ui/system.jsx";

   Mount <ThemeStyles /> once per page (PageShell does it for you).
   ═══════════════════════════════════════════════════════════════════════ */

import React from "react";

/* ─── TOKENS ───────────────────────────────────────────────────────────────
   Direction: "Ledger" — printed statements, ruled lines, tabular figures.
   Colour is semantic. Green means gain. Rust means loss. Brass means
   attention. Nothing is coloured for decoration.                           */
export const T = {
  color: {
    ink:      "#0E1013",  // app background — warm-neutral, not blue-black
    panel:    "#16191E",  // raised surfaces
    panelAlt: "#1B1F26",  // nested surfaces
    paper:    "#EDE9E1",  // the printed statement
    paperInk: "#0E1013",  // text on paper

    gain:     "#3F8F5F",  // profit, success, brand
    gainDeep: "#2F6E48",  // gain text on paper
    loss:     "#B4553F",  // losses, errors, destructive
    brass:    "#C08A3E",  // needs attention, premium

    text:     "rgba(255,255,255,.92)",
    text2:    "rgba(255,255,255,.55)",
    text3:    "rgba(255,255,255,.35)",
    text4:    "rgba(255,255,255,.22)",

    line:     "rgba(255,255,255,.08)",
    lineSoft: "rgba(255,255,255,.05)",
    lineInk:  "rgba(14,16,19,.12)",   // rules on paper
    fill:     "rgba(255,255,255,.04)",
  },

  /* 4px base. Use these rather than arbitrary numbers so rhythm holds. */
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 },

  /* Type scale. display = Fraunces, ui = Archivo, mono = IBM Plex Mono */
  size: { micro: 9, tiny: 10, xs: 11, sm: 13, base: 15, lg: 18, xl: 24, xxl: 34 },

  /* Corners stay square. It's a deliberate part of the identity — the only
     rounded things in the product are avatars and status dots.            */
  radius: 0,
};

const c = T.color;

/* ─── GLOBAL STYLES ──────────────────────────────────────────────────────── */
export function ThemeStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

      .display { font-family:'Fraunces',Georgia,serif; font-optical-sizing:auto; letter-spacing:-.01em; font-weight:300; }
      .ui      { font-family:'Archivo',system-ui,-apple-system,sans-serif; }
      .mono    { font-family:'IBM Plex Mono',ui-monospace,SFMono-Regular,monospace; }
      .tabular { font-variant-numeric: tabular-nums; }

      /* eyebrow label — used above every section title */
      .eyebrow {
        font-family:'IBM Plex Mono',monospace;
        font-size:9px; letter-spacing:.24em; text-transform:uppercase;
        color:${c.text3};
      }

      .hover-fill:hover { background:rgba(255,255,255,.03); }

      /* visible keyboard focus everywhere */
      :focus-visible { outline:2px solid ${c.gain}; outline-offset:2px; }

      ::selection { background:${c.gain}; color:#fff; }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation:none !important; transition:none !important; }
      }
    `}</style>
  );
}

/* ─── PAGE SHELL ─────────────────────────────────────────────────────────── */
export function PageShell({ children, width = 900, pt = 80 }) {
  return (
    <div className="ui min-h-screen pb-16" style={{ background: c.ink, color: c.text }}>
      <ThemeStyles />
      <main className="px-4 mx-auto" style={{ maxWidth: width, paddingTop: pt }}>
        {children}
      </main>
    </div>
  );
}

/* ─── PANEL — the standard surface. Square, ruled, no shadow. ───────────── */
export function Panel({ children, pad = true, alt, style = {}, ...rest }) {
  return (
    <div
      style={{
        background: alt ? c.panelAlt : c.panel,
        border: `1px solid ${c.line}`,
        padding: pad ? T.space.xl : 0,
        ...style,
      }}
      {...rest}>
      {children}
    </div>
  );
}

/* ─── PAPER — the printed statement. Use sparingly: one per page at most. ─ */
export function Paper({ children, accent = c.gain, style = {}, ...rest }) {
  return (
    <div style={{ background: c.paper, color: c.paperInk, position: "relative", ...style }} {...rest}>
      <div style={{ height: 3, background: accent }} />
      <div style={{ padding: T.space.xl + 8 }}>{children}</div>
    </div>
  );
}

/* ─── SECTION HEAD ───────────────────────────────────────────────────────── */
export function SectionHead({ label, title, action, style = {} }) {
  return (
    <div className="flex items-end justify-between gap-3" style={{ marginBottom: T.space.md, ...style }}>
      <div>
        {label && <p className="eyebrow" style={{ marginBottom: 4 }}>{label}</p>}
        <h3 className="display" style={{ fontSize: T.size.lg, color: c.text }}>{title}</h3>
      </div>
      {action && (
        <button onClick={action.onClick}
          className="mono flex items-center gap-1 transition"
          style={{ fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase", color: action.tone || c.gain }}>
          {action.label}
        </button>
      )}
    </div>
  );
}

/* ─── LEDGER ROW — label left, figure right, hairline below ─────────────── */
export function LedgerRow({ label, value, accent, onPaper, last, small }) {
  return (
    <div className="flex items-baseline justify-between"
      style={{
        paddingTop: small ? 10 : 12,
        paddingBottom: small ? 10 : 12,
        borderBottom: last ? "none" : `1px solid ${onPaper ? c.lineInk : c.lineSoft}`,
      }}>
      <span style={{ fontSize: small ? T.size.xs : T.size.sm, color: onPaper ? "rgba(14,16,19,.5)" : c.text3 }}>
        {label}
      </span>
      <span className="mono tabular"
        style={{ fontSize: T.size.sm, color: accent || (onPaper ? c.paperInk : c.text) }}>
        {value}
      </span>
    </div>
  );
}

/* ─── BUTTON ─────────────────────────────────────────────────────────────
   variant: primary | outline | quiet | danger                            */
export function Button({ children, variant = "primary", full, icon, style = {}, ...rest }) {
  const base = {
    fontFamily: "'IBM Plex Mono',monospace",
    fontSize: T.size.tiny,
    letterSpacing: ".14em",
    textTransform: "uppercase",
    padding: "14px 22px",
    width: full ? "100%" : undefined,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "opacity .2s, background .2s",
    cursor: "pointer",
  };
  const variants = {
    primary: { background: c.gain, color: "#fff", border: `1px solid ${c.gain}` },
    outline: { background: "transparent", color: c.gain, border: `1px solid rgba(63,143,95,.4)` },
    quiet:   { background: "transparent", color: c.text2, border: `1px solid ${c.line}` },
    danger:  { background: "transparent", color: c.loss, border: `1px solid rgba(180,85,63,.4)` },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...style }} {...rest}>
      {icon}{children}
    </button>
  );
}

/* ─── STATUS PILL ────────────────────────────────────────────────────────
   tone: gain | loss | brass | neutral                                    */
export function StatusPill({ children, tone = "neutral", icon }) {
  const tones = {
    gain:    { bg: "rgba(63,143,95,.12)",  fg: c.gain },
    loss:    { bg: "rgba(180,85,63,.12)",  fg: c.loss },
    brass:   { bg: "rgba(192,138,62,.12)", fg: c.brass },
    neutral: { bg: "rgba(255,255,255,.06)", fg: c.text2 },
  }[tone];
  return (
    <span className="mono inline-flex items-center gap-1.5"
      style={{
        fontSize: T.size.micro, letterSpacing: ".16em", textTransform: "uppercase",
        padding: "4px 8px", background: tones.bg, color: tones.fg,
      }}>
      {icon}{children}
    </span>
  );
}

/* ─── BANNER — annotation, not alert-spam. 2px left rule. ───────────────── */
export function Banner({ title, text, tone = "brass", onClick, right }) {
  const fg = { gain: c.gain, loss: c.loss, brass: c.brass }[tone] || c.brass;
  const bg = { gain: "rgba(63,143,95,.07)", loss: "rgba(180,85,63,.07)", brass: "rgba(192,138,62,.07)" }[tone];
  const Tag = onClick ? "button" : "div";
  return (
    <Tag onClick={onClick}
      className="w-full text-left flex items-center justify-between gap-3"
      style={{ background: bg, borderLeft: `2px solid ${fg}`, padding: T.space.lg }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: T.size.sm, color: c.text, fontWeight: 500 }} className="truncate">{title}</p>
        {text && <p style={{ fontSize: T.size.xs, color: c.text3, marginTop: 2 }} className="truncate">{text}</p>}
      </div>
      {right && <span style={{ color: fg, flexShrink: 0 }}>{right}</span>}
    </Tag>
  );
}

/* ─── EMPTY STATE — an invitation to act, not a shrug ───────────────────── */
export function EmptyState({ icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2"
      style={{ border: `1px solid ${c.line}`, padding: `${T.space.xxxl}px ${T.space.xl}px` }}>
      {icon && <div style={{ color: c.text4 }}>{icon}</div>}
      <p className="display" style={{ fontSize: T.size.base, color: c.text, marginTop: 4 }}>{title}</p>
      {text && <p style={{ fontSize: T.size.xs, color: c.text3, maxWidth: 320 }}>{text}</p>}
      {action && (
        <Button variant="outline" onClick={action.onClick} style={{ marginTop: T.space.md }}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

/* ─── MONEY — always tabular so columns line up ─────────────────────────── */
export function Money({ value, sign, accent, size = T.size.sm, hide }) {
  const n = Number(value || 0);
  const text = hide
    ? "••••••"
    : `${sign === "+" ? "+" : sign === "−" ? "−" : ""}$${Math.abs(n).toLocaleString(undefined, {
        minimumFractionDigits: 2, maximumFractionDigits: 2,
      })}`;
  return <span className="mono tabular" style={{ fontSize: size, color: accent || c.text }}>{text}</span>;
}

/* ─── FIELD — labelled input, used across deposit/withdraw/kyc ──────────── */
export function Field({ label, hint, error, children }) {
  return (
    <div style={{ marginBottom: T.space.lg }}>
      {label && <p className="eyebrow" style={{ marginBottom: 6 }}>{label}</p>}
      {children}
      {hint && !error && <p style={{ fontSize: T.size.xs, color: c.text4, marginTop: 6 }}>{hint}</p>}
      {error && <p style={{ fontSize: T.size.xs, color: c.loss, marginTop: 6 }}>{error}</p>}
    </div>
  );
}

export const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  background: c.fill,
  border: `1px solid ${c.line}`,
  color: c.text,
  fontSize: T.size.sm,
  fontFamily: "'Archivo',system-ui,sans-serif",
  outline: "none",
};

/* ─── DIVIDER ────────────────────────────────────────────────────────────── */
export function Rule({ space = T.space.xl }) {
  return <div style={{ borderBottom: `1px solid ${c.line}`, marginTop: space, marginBottom: space }} />;
}

/* ─── SPINNER ────────────────────────────────────────────────────────────── */
export function Spinner({ size = 20, tone = c.gain }) {
  return (
    <span className="inline-block rounded-full animate-spin"
      style={{ width: size, height: size, border: `2px solid rgba(255,255,255,.15)`, borderTopColor: tone }} />
  );
}

/* ─── LOADING / ERROR PAGES — same everywhere ───────────────────────────── */
export function LoadingPage({ label = "Loading" }) {
  return (
    <div className="ui flex flex-col justify-center items-center h-screen gap-4" style={{ background: c.ink }}>
      <ThemeStyles />
      <Spinner size={30} />
      <p className="mono" style={{ fontSize: T.size.xs, letterSpacing: ".2em", textTransform: "uppercase", color: c.text3 }}>
        {label}
      </p>
    </div>
  );
}

export function ErrorPage({ message, onRetry, retryLabel = "Try again" }) {
  return (
    <div className="ui flex flex-col justify-center items-center h-screen gap-4 px-6 text-center" style={{ background: c.ink }}>
      <ThemeStyles />
      <p style={{ fontSize: T.size.sm, color: c.loss }}>{message}</p>
      {onRetry && <Button variant="outline" onClick={onRetry}>{retryLabel}</Button>}
    </div>
  );
}
