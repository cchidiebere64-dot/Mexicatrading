import { T, ThemeStyles } from "../pages/system.jsx";

const c = T.color;

export default function PageLoader({ label = "Loading" }) {
  return (
    <div className="ui"
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(14,16,19,.82)",
        backdropFilter: "blur(6px)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16,
      }}>
      <ThemeStyles />

      <span
        style={{
          width: 26, height: 26,
          border: "2px solid rgba(255,255,255,.14)",
          borderTopColor: c.gain,
          borderRadius: "50%",
          animation: "pl-spin .8s linear infinite",
        }} />

      <p className="mono" style={{
        fontSize: T.size.xs,
        letterSpacing: ".24em",
        textTransform: "uppercase",
        color: c.text3,
      }}>
        {label}
      </p>

      <style>{`
        @keyframes pl-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          [style*="pl-spin"] { animation-duration: 2.4s !important; }
        }
      `}</style>
    </div>
  );
}
