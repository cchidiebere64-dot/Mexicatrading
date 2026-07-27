import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { T, PageShell } from "./system.jsx";

const c = T.color;

/* Keep in sync with Terms.jsx and the landing page */
const REGISTERED_ADDRESS = "Mexico City, CDMX, Mexico";
const SUPPORT_EMAIL = "support@mexicatrading.com";

export default function Privacy() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const sections = [
    { title: t("privacy.s1Title"),  content: t("privacy.s1Content") },
    { title: t("privacy.s2Title"),  content: t("privacy.s2Content") },
    { title: t("privacy.s3Title"),  content: t("privacy.s3Content") },
    { title: t("privacy.s4Title"),  content: t("privacy.s4Content") },
    { title: t("privacy.s5Title"),  content: t("privacy.s5Content") },
    { title: t("privacy.s6Title"),  content: t("privacy.s6Content") },
    { title: t("privacy.s7Title"),  content: t("privacy.s7Content") },
    { title: t("privacy.s8Title"),  content: t("privacy.s8Content") },
    { title: t("privacy.s9Title"),  content: t("privacy.s9Content") },
    { title: t("privacy.s10Title"), content: t("privacy.s10Content") },
    { title: t("privacy.s11Title"), content: t("privacy.s11Content") },
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
          {t("privacy.title", "Privacy Policy")}
        </h1>

        <div className="flex flex-wrap mono" style={{ gap: "6px 20px", marginTop: T.space.lg }}>
          <span style={{ fontSize: T.size.tiny, color: c.text3 }}>
            {t("privacy.lastUpdated", "Last updated")}{" "}
            <span style={{ color: c.text2 }}>{t("common.updatedDate", "—")}</span>
          </span>
          <span style={{ fontSize: T.size.tiny, color: c.text3 }}>
            {t("privacy.effectiveDate", "Effective")}{" "}
            <span style={{ color: c.text2 }}>{t("common.updatedDate", "—")}</span>
          </span>
        </div>

        <p style={{ fontSize: T.size.sm, color: c.text3, lineHeight: 1.75, marginTop: T.space.lg, maxWidth: 560 }}>
          {t("privacy.subtitle", "")}
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
          {t("privacy.commitment", "We handle your data carefully and share it only where required.")}
        </p>

        <div style={{ border: `1px solid ${c.line}` }}>
          <div className="flex items-baseline justify-between"
            style={{ padding: T.space.lg, borderBottom: `1px solid ${c.lineSoft}` }}>
            <span className="eyebrow">Terms</span>
            <Link to="/terms" className="mono" style={{ fontSize: T.size.xs, color: c.gain }}>
              {t("privacy.termsLink", "Terms of Service")} →
            </Link>
          </div>

          <div className="flex items-baseline justify-between"
            style={{ padding: T.space.lg, borderBottom: `1px solid ${c.lineSoft}` }}>
            <span className="eyebrow">Data requests</span>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="mono" style={{ fontSize: T.size.xs, color: c.gain }}>
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
          To request a copy of your data, or ask us to delete it, email {SUPPORT_EMAIL} from the address
          registered to your account.
        </p>
      </div>
    </PageShell>
  );
}
