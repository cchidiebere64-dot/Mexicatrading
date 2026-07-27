import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { T, PageShell } from "./system.jsx";

const c = T.color;

/* Keep this in one place so Terms, Privacy and the landing page agree */
const REGISTERED_ADDRESS = "Mexico City, CDMX, Mexico";
const SUPPORT_EMAIL = "support@mexicatrading.com";

export default function Terms() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const sections = [
    { title: t("terms.s1Title"),  content: t("terms.s1Content") },
    { title: t("terms.s2Title"),  content: t("terms.s2Content") },
    { title: t("terms.s3Title"),  content: t("terms.s3Content") },
    { title: t("terms.s4Title"),  content: t("terms.s4Content") },
    { title: t("terms.s5Title"),  content: t("terms.s5Content") },
    { title: t("terms.s6Title"),  content: t("terms.s6Content") },
    { title: t("terms.s7Title"),  content: t("terms.s7Content") },
    { title: t("terms.s8Title"),  content: t("terms.s8Content") },
    { title: t("terms.s9Title"),  content: t("terms.s9Content") },
    { title: t("terms.s10Title"), content: t("terms.s10Content") },
    { title: t("terms.s11Title"), content: t("terms.s11Content") },
    { title: t("terms.s12Title"), content: t("terms.s12Content") },
  ];

  return (
    <PageShell width={720}>

      <button onClick={() => navigate(-1)}
        className="mono flex items-center gap-2"
        style={{ fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase", color: c.text3, marginBottom: T.space.xl }}>
        <ArrowLeft size={12} /> {t("common.back", "Back")}
      </button>

      {/* ── Masthead ── */}
      <div style={{ borderBottom: `1px solid ${c.line}`, paddingBottom: T.space.xl, marginBottom: T.space.xl }}>
        <p className="eyebrow" style={{ marginBottom: 8 }}>{t("common.legal", "Legal")}</p>
        <h1 className="display" style={{ fontSize: "clamp(30px,6vw,44px)", lineHeight: 1.05 }}>
          {t("terms.title", "Terms of Service")}
        </h1>

        <div className="flex flex-wrap mono" style={{ gap: "6px 20px", marginTop: T.space.lg }}>
          <span style={{ fontSize: T.size.tiny, color: c.text3 }}>
            {t("terms.lastUpdated", "Last updated")}{" "}
            <span style={{ color: c.text2 }}>{t("common.updatedDate", "—")}</span>
          </span>
          <span style={{ fontSize: T.size.tiny, color: c.text3 }}>
            {t("terms.effectiveDate", "Effective")}{" "}
            <span style={{ color: c.text2 }}>{t("common.updatedDate", "—")}</span>
          </span>
        </div>

        <p style={{ fontSize: T.size.sm, color: c.text3, lineHeight: 1.75, marginTop: T.space.lg, maxWidth: 560 }}>
          {t("terms.subtitle", "")}
        </p>
      </div>

      {/* ── Contents ── */}
      <div style={{ border: `1px solid ${c.line}`, marginBottom: T.space.xxl }}>
        <p className="eyebrow" style={{ padding: `${T.space.md}px ${T.space.lg}px`, borderBottom: `1px solid ${c.lineSoft}` }}>
          Contents
        </p>
        {sections.map((s, i) => (
          <a key={i} href={`#section-${i + 1}`}
            className="flex items-baseline gap-3 hover-fill"
            style={{
              padding: `9px ${T.space.lg}px`,
              borderBottom: i < sections.length - 1 ? `1px solid ${c.lineSoft}` : "none",
              transition: "background .2s",
            }}>
            <span className="mono tabular" style={{ fontSize: T.size.tiny, color: c.text4, minWidth: 20 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ fontSize: T.size.sm, color: c.text2 }}>{s.title}</span>
          </a>
        ))}
      </div>

      {/* ── Sections ── */}
      {sections.map((section, i) => (
        <section key={i} id={`section-${i + 1}`}
          style={{
            paddingTop: T.space.xl,
            paddingBottom: T.space.xl,
            borderTop: `1px solid ${c.lineSoft}`,
            scrollMarginTop: 90,
          }}>
          <div className="flex items-baseline gap-3" style={{ marginBottom: T.space.md }}>
            <span className="mono tabular" style={{ fontSize: T.size.tiny, color: c.gain, minWidth: 20 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <h2 className="display" style={{ fontSize: T.size.lg, color: c.text }}>{section.title}</h2>
          </div>
          <p style={{
            fontSize: T.size.sm, color: c.text3, lineHeight: 1.85,
            whiteSpace: "pre-line", paddingLeft: 32, maxWidth: 620,
          }}>
            {section.content}
          </p>
        </section>
      ))}

      {/* ── Colophon ── */}
      <div style={{ borderTop: `1px solid ${c.line}`, paddingTop: T.space.xl, marginTop: T.space.lg }}>
        <p style={{ fontSize: T.size.sm, color: c.text2, lineHeight: 1.75, marginBottom: T.space.xl, maxWidth: 560 }}>
          {t("terms.agreement", "By using MexicaTrading you agree to these terms.")}
        </p>

        <div style={{ border: `1px solid ${c.line}` }}>
          <div className="flex items-baseline justify-between"
            style={{ padding: T.space.lg, borderBottom: `1px solid ${c.lineSoft}` }}>
            <span className="eyebrow">Privacy</span>
            <Link to="/privacy" className="mono"
              style={{ fontSize: T.size.xs, color: c.gain }}>
              {t("terms.privacyLink", "Privacy Policy")} →
            </Link>
          </div>

          <div className="flex items-baseline justify-between"
            style={{ padding: T.space.lg, borderBottom: `1px solid ${c.lineSoft}` }}>
            <span className="eyebrow">Contact</span>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="mono"
              style={{ fontSize: T.size.xs, color: c.gain }}>
              {SUPPORT_EMAIL}
            </a>
          </div>

          <div style={{ padding: T.space.lg }}>
            <p className="eyebrow" style={{ marginBottom: 8 }}>Registered address</p>
            <p style={{ fontSize: T.size.xs, color: c.text3, lineHeight: 1.7 }}>
              {REGISTERED_ADDRESS}
            </p>
          </div>
        </div>

        <p style={{ fontSize: T.size.xs, color: c.text4, lineHeight: 1.7, marginTop: T.space.xl }}>
          Investing involves risk. Nothing on this site constitutes financial advice.
          Invest responsibly, and only what you can afford to lose.
        </p>
      </div>
    </PageShell>
  );
}
