import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ArrowLeft, Check, Clock, Camera,
  CreditCard, ChevronRight, ChevronLeft, Landmark, IdCard, BookUser, Car, RefreshCw,
} from "lucide-react";
import { T, ThemeStyles, Button, Spinner, Banner, inputStyle, LedgerRow } from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const c = T.color;

const DOC_METHODS = [
  { value: "passport",        label: "Passport",         icon: BookUser, desc: "International passport" },
  { value: "national_id",     label: "National ID",      icon: IdCard,   desc: "Government issued ID card" },
  { value: "drivers_license", label: "Driver's licence", icon: Car,      desc: "Valid driving permit" },
  { value: "bank",            label: "Bank details",     icon: Landmark, desc: "Verify using your bank account" },
];

/* These are the usual reasons a submission gets rejected */
const PHOTO_RULES = [
  "All four corners visible",
  "Text sharp and readable",
  "No glare or shadow across the document",
  "Original document, not a photocopy",
];

const SELFIE_RULES = [
  "Good, even lighting on your face",
  "No hat, mask or sunglasses",
  "Document held steady and readable",
];

export default function KYC() {
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [countdown, setCountdown] = useState(5);

  const [stage, setStage] = useState(0);
  const [method, setMethod] = useState(null);

  const [idFront, setIdFront] = useState(null);
  const [idFrontPreview, setIdFrontPreview] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [idBackPreview, setIdBackPreview] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);

  const [bank, setBank] = useState({ bankName: "", accountName: "", accountNumber: "", routingNumber: "" });

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchKYCStatus();
  }, []);

  useEffect(() => {
    if (!submitted) return;
    if (countdown === 0) { navigate("/dashboard"); return; }
    const timer = setTimeout(() => setCountdown(n => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [submitted, countdown]);

  const fetchKYCStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/user/kyc-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKycStatus(res.data.kyc);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  const handleFileChange = (e, which) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: "File size must be less than 5MB.", type: "error" });
      return;
    }
    setMessage({ text: "", type: "" });
    const preview = URL.createObjectURL(file);
    if (which === "front") { setIdFront(file); setIdFrontPreview(preview); }
    if (which === "back") { setIdBack(file); setIdBackPreview(preview); }
    if (which === "selfie") { setSelfie(file); setSelfiePreview(preview); }
  };

  const resetAll = () => {
    setMethod(null); setStage(0);
    setIdFront(null); setIdFrontPreview(null);
    setIdBack(null); setIdBackPreview(null);
    setSelfie(null); setSelfiePreview(null);
    setBank({ bankName: "", accountName: "", accountNumber: "", routingNumber: "" });
    setMessage({ text: "", type: "" });
  };

  const isBank = method === "bank";
  const docSteps = ["method", "front", "back", "selfie", "review"];
  const bankSteps = ["method", "bank", "review"];
  const steps = isBank ? bankSteps : docSteps;
  const totalSteps = steps.length - 1;
  const remaining = Math.max(totalSteps - stage, 0);

  const pickMethod = (m) => {
    setMethod(m);
    setStage(1);
    setMessage({ text: "", type: "" });
  };

  const next = () => {
    const cur = steps[stage];
    if (cur === "front" && !idFront) return setMessage({ text: "Upload the front of your document.", type: "error" });
    if (cur === "back" && !idBack) return setMessage({ text: "Upload the back of your document.", type: "error" });
    if (cur === "selfie" && !selfie) return setMessage({ text: "Upload a selfie holding your document.", type: "error" });
    if (cur === "bank") {
      if (!bank.bankName.trim()) return setMessage({ text: "Enter your bank name.", type: "error" });
      if (!bank.accountName.trim()) return setMessage({ text: "Enter the account holder name.", type: "error" });
      if (!bank.accountNumber.trim()) return setMessage({ text: "Enter your account number.", type: "error" });
    }
    setMessage({ text: "", type: "" });
    setStage(s => s + 1);
  };

  const back = () => {
    setMessage({ text: "", type: "" });
    if (stage === 0) return;
    setStage(s => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setMessage({ text: "", type: "" });
    try {
      let payload;
      if (isBank) {
        payload = { method: "bank", ...bank };
      } else {
        const [f, b, s] = await Promise.all([toBase64(idFront), toBase64(idBack), toBase64(selfie)]);
        payload = { method: "document", idType: method, idFrontImage: f, idBackImage: b, selfieImage: s };
      }
      await axios.post(`${API_URL}/api/user/kyc-submit`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmitted(true);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Submission failed. Please try again.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const Shell = ({ children }) => (
    <div className="ui min-h-screen pb-20" style={{ background: c.ink, color: c.text }}>
      <ThemeStyles />
      <div className="mx-auto" style={{ maxWidth: 480, padding: "80px 20px 0" }}>
        <button onClick={() => navigate("/dashboard")}
          className="mono flex items-center gap-2"
          style={{ fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase", color: c.text3, marginBottom: T.space.xl }}>
          <ArrowLeft size={12} /> Dashboard
        </button>

        <div style={{ marginBottom: T.space.xl }}>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Identity verification</p>
          <h1 className="display" style={{ fontSize: "clamp(30px,6vw,40px)", lineHeight: 1.05 }}>
            Verify your identity
          </h1>
          <p style={{ fontSize: T.size.sm, color: c.text3, marginTop: 10, lineHeight: 1.7 }}>
            Required to withdraw larger amounts. Reviewed within 24 hours.
          </p>
        </div>

        {children}

        <div className="flex items-center justify-center gap-4 mono"
          style={{ marginTop: T.space.xl, fontSize: T.size.micro, letterSpacing: ".14em", textTransform: "uppercase", color: c.text4 }}>
          <span>Encrypted</span>
          <span>·</span>
          <span>Reviewed by our team</span>
          <span>·</span>
          <span>24h</span>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="ui min-h-screen flex items-center justify-center" style={{ background: c.ink }}>
      <ThemeStyles />
      <Spinner size={26} />
    </div>
  );

  const status = kycStatus?.status || "none";
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "—";

  /* ══ SUBMITTED ══ */
  if (submitted) return (
    <Shell>
      <div style={{ background: c.paper, color: c.paperInk }}>
        <div style={{ height: 3, background: "#A8752F" }} />
        <div style={{ padding: T.space.xxl }}>
          <div className="flex items-start justify-between" style={{ marginBottom: T.space.lg }}>
            <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(14,16,19,.5)" }}>
              Received
            </p>
            <Clock size={19} style={{ color: "#A8752F" }} />
          </div>
          <h2 className="display" style={{ fontSize: 30, lineHeight: 1.05, marginBottom: T.space.md }}>
            Documents submitted
          </h2>
          <p style={{ fontSize: T.size.sm, color: "rgba(14,16,19,.65)", lineHeight: 1.75 }}>
            Your verification is with our team. We'll email you once it's reviewed — usually within 24 hours.
          </p>
        </div>
      </div>

      <p className="mono" style={{ fontSize: T.size.xs, color: c.text4, textAlign: "center", margin: `${T.space.lg}px 0` }}>
        Returning to dashboard in {countdown}
      </p>

      <Button full onClick={() => navigate("/dashboard")}>Go to dashboard now</Button>
    </Shell>
  );

  /* ══ APPROVED ══ */
  if (status === "approved") return (
    <Shell>
      <div style={{ background: c.paper, color: c.paperInk }}>
        <div style={{ height: 3, background: c.gain }} />
        <div style={{ padding: T.space.xxl }}>
          <div className="flex items-start justify-between" style={{ marginBottom: T.space.lg }}>
            <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(14,16,19,.5)" }}>
              Verified
            </p>
            <Check size={20} style={{ color: c.gainDeep }} />
          </div>
          <h2 className="display" style={{ fontSize: 30, lineHeight: 1.05, marginBottom: T.space.md }}>
            Identity confirmed
          </h2>
          <p style={{ fontSize: T.size.sm, color: "rgba(14,16,19,.65)", lineHeight: 1.75, paddingBottom: T.space.lg, borderBottom: "1px solid rgba(14,16,19,.12)" }}>
            You have full withdrawal access.
          </p>
          <div className="flex items-baseline justify-between" style={{ paddingTop: T.space.md }}>
            <span className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(14,16,19,.45)" }}>
              Verified on
            </span>
            <span className="mono" style={{ fontSize: T.size.xs, color: c.paperInk }}>{fmtDate(kycStatus?.reviewedAt)}</span>
          </div>
        </div>
      </div>

      <Button full onClick={() => navigate("/dashboard")} style={{ marginTop: T.space.lg }}>
        Back to dashboard
      </Button>
    </Shell>
  );

  /* ══ PENDING ══ */
  if (status === "pending") return (
    <Shell>
      <div style={{ border: `1px solid ${c.line}`, borderLeft: `2px solid ${c.brass}`, padding: T.space.xxl }}>
        <div className="flex items-start justify-between" style={{ marginBottom: T.space.lg }}>
          <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".24em", textTransform: "uppercase", color: c.brass }}>
            Under review
          </p>
          <Clock size={18} style={{ color: c.brass }} />
        </div>
        <h2 className="display" style={{ fontSize: 28, lineHeight: 1.05, marginBottom: T.space.md }}>
          We're checking your documents
        </h2>
        <p style={{ fontSize: T.size.sm, color: c.text3, lineHeight: 1.75, marginBottom: T.space.lg }}>
          This usually takes less than 24 hours. You'll get an email as soon as it's done.
        </p>
        <div style={{ borderTop: `1px solid ${c.line}` }}>
          <LedgerRow label="Submitted" value={fmtDate(kycStatus?.submittedAt)} last />
        </div>
      </div>

      <Button variant="quiet" full onClick={() => navigate("/dashboard")} style={{ marginTop: T.space.lg }}>
        Back to dashboard
      </Button>
    </Shell>
  );

  /* ── Upload box ── */
  const UploadBox = ({ preview, onChange, icon: Icon, title, hint }) => (
    <label className="block w-full cursor-pointer"
      style={{ border: `1px dashed ${preview ? "rgba(63,143,95,.45)" : "rgba(255,255,255,.16)"}` }}>
      <input type="file" accept="image/*" onChange={onChange} className="hidden" />
      {preview ? (
        <div style={{ position: "relative" }}>
          <img src={preview} alt={title} style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
          <div style={{
            position: "absolute", top: 10, right: 10, width: 24, height: 24,
            background: c.gain, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Check size={14} color="#fff" />
          </div>
          <p className="mono" style={{
            position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 12px",
            background: "rgba(14,16,19,.85)", fontSize: T.size.micro,
            letterSpacing: ".14em", textTransform: "uppercase", color: c.text2,
          }}>
            Tap to replace
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2.5" style={{ height: 170 }}>
          <Icon size={20} style={{ color: c.text4 }} />
          <p style={{ fontSize: T.size.sm, color: c.text2 }}>{title}</p>
          <p className="mono" style={{ fontSize: T.size.tiny, color: c.text4 }}>{hint}</p>
        </div>
      )}
    </label>
  );

  const RuleList = ({ items }) => (
    <div style={{ border: `1px solid ${c.line}`, marginTop: T.space.lg }}>
      <p className="eyebrow" style={{ padding: `10px ${T.space.lg}px`, borderBottom: `1px solid ${c.lineSoft}` }}>
        For a quick approval
      </p>
      {items.map((r, i) => (
        <div key={i} className="flex items-start gap-2.5"
          style={{ padding: `9px ${T.space.lg}px`, borderBottom: i < items.length - 1 ? `1px solid ${c.lineSoft}` : "none" }}>
          <Check size={12} style={{ color: c.gain, flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: T.size.xs, color: c.text3 }}>{r}</span>
        </div>
      ))}
    </div>
  );

  /* ══ WIZARD ══ */
  return (
    <Shell>
      {status === "rejected" && (
        <div style={{ marginBottom: T.space.lg }}>
          <Banner tone="loss"
            title="Previous submission rejected"
            text={kycStatus?.rejectionReason || "Try again below using the same or a different method."} />
        </div>
      )}

      {stage > 0 && (
        <div style={{ marginBottom: T.space.xl }}>
          <div className="flex items-baseline justify-between" style={{ marginBottom: 8 }}>
            <span className="mono" style={{ fontSize: T.size.tiny, letterSpacing: ".18em", textTransform: "uppercase", color: c.text3 }}>
              Step {stage} of {totalSteps}
            </span>
            <span className="mono" style={{ fontSize: T.size.tiny, color: c.gain }}>
              {remaining === 0 ? "Final step" : `${remaining} to go`}
            </span>
          </div>
          <div style={{ height: 2, background: c.line }}>
            <motion.div style={{ height: "100%", background: c.gain }}
              animate={{ width: `${(stage / totalSteps) * 100}%` }}
              transition={{ duration: .5, ease: [.22, 1, .36, 1] }} />
          </div>
        </div>
      )}

      {message.text && (
        <div style={{ marginBottom: T.space.lg }}>
          <Banner tone={message.type === "success" ? "gain" : "loss"} title={message.text} />
        </div>
      )}

      <AnimatePresence mode="wait">

        {stage === 0 && (
          <motion.div key="method" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: .3 }}>
            <p className="eyebrow" style={{ marginBottom: T.space.md }}>Choose a method</p>
            <div style={{ border: `1px solid ${c.line}` }}>
              {DOC_METHODS.map((m, i) => {
                const Icon = m.icon;
                return (
                  <button key={m.value} type="button" onClick={() => pickMethod(m.value)}
                    className="w-full flex items-center gap-3.5 text-left hover-fill"
                    style={{
                      padding: T.space.lg,
                      borderBottom: i < DOC_METHODS.length - 1 ? `1px solid ${c.lineSoft}` : "none",
                      transition: "background .2s",
                    }}>
                    <Icon size={16} style={{ color: c.text3, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: T.size.sm, color: c.text }}>{m.label}</p>
                      <p style={{ fontSize: T.size.xs, color: c.text4, marginTop: 2 }}>{m.desc}</p>
                    </div>
                    <ChevronRight size={14} style={{ color: c.text4 }} />
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: T.size.xs, color: c.text4, lineHeight: 1.7, marginTop: T.space.lg }}>
              Your documents are encrypted and seen only by our verification team. We will never ask for card
              numbers, CVV codes, PINs or passwords.
            </p>
          </motion.div>
        )}

        {steps[stage] === "front" && (
          <motion.div key="front" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: .3 }}>
            <p className="eyebrow" style={{ marginBottom: 6 }}>Document · front</p>
            <h2 className="display" style={{ fontSize: T.size.xl, marginBottom: 6 }}>Front of your document</h2>
            <p style={{ fontSize: T.size.xs, color: c.text3, marginBottom: T.space.lg, lineHeight: 1.7 }}>
              A clear photo of the side showing your photo and details.
            </p>
            <UploadBox preview={idFrontPreview} onChange={(e) => handleFileChange(e, "front")}
              icon={CreditCard} title="Upload front" hint="JPG or PNG · max 5MB" />
            <RuleList items={PHOTO_RULES} />
          </motion.div>
        )}

        {steps[stage] === "back" && (
          <motion.div key="back" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: .3 }}>
            <p className="eyebrow" style={{ marginBottom: 6 }}>Document · back</p>
            <h2 className="display" style={{ fontSize: T.size.xl, marginBottom: 6 }}>Back of the same document</h2>
            <p style={{ fontSize: T.size.xs, color: c.text3, marginBottom: T.space.lg, lineHeight: 1.7 }}>
              Turn it over and photograph the reverse side.
            </p>
            <UploadBox preview={idBackPreview} onChange={(e) => handleFileChange(e, "back")}
              icon={CreditCard} title="Upload back" hint="JPG or PNG · max 5MB" />
            <RuleList items={PHOTO_RULES} />
          </motion.div>
        )}

        {steps[stage] === "selfie" && (
          <motion.div key="selfie" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: .3 }}>
            <p className="eyebrow" style={{ marginBottom: 6 }}>Confirmation</p>
            <h2 className="display" style={{ fontSize: T.size.xl, marginBottom: 6 }}>Selfie holding your document</h2>
            <p style={{ fontSize: T.size.xs, color: c.text3, marginBottom: T.space.lg, lineHeight: 1.7 }}>
              Hold the document beside your face. Both must be clearly visible.
            </p>
            <UploadBox preview={selfiePreview} onChange={(e) => handleFileChange(e, "selfie")}
              icon={Camera} title="Upload selfie" hint="Face and document visible · max 5MB" />
            <RuleList items={SELFIE_RULES} />
          </motion.div>
        )}

        {steps[stage] === "bank" && (
          <motion.div key="bank" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: .3 }}>
            <p className="eyebrow" style={{ marginBottom: 6 }}>Bank verification</p>
            <h2 className="display" style={{ fontSize: T.size.xl, marginBottom: 6 }}>Your bank details</h2>
            <p style={{ fontSize: T.size.xs, color: c.text3, marginBottom: T.space.lg, lineHeight: 1.7 }}>
              The account must be in the same name as your MexicaTrading account.
            </p>

            {[
              ["Bank name", "bankName", "e.g. Standard Bank"],
              ["Account holder name", "accountName", "As it appears on the account"],
              ["Account number", "accountNumber", "Your account number"],
              ["Routing / SWIFT — optional", "routingNumber", "If your bank uses one"],
            ].map(([label, key, ph], i) => (
              <div key={i} style={{ marginBottom: T.space.md }}>
                <p className="eyebrow" style={{ marginBottom: 6 }}>{label}</p>
                <input value={bank[key]} placeholder={ph}
                  onChange={(e) => { setMessage({ text: "", type: "" }); setBank(b => ({ ...b, [key]: e.target.value })); }}
                  style={inputStyle} />
              </div>
            ))}

            <p style={{ fontSize: T.size.xs, color: c.text4, lineHeight: 1.7, marginTop: T.space.md }}>
              We use these details to confirm your identity only. We never request card numbers, CVV codes or PINs.
            </p>
          </motion.div>
        )}

        {steps[stage] === "review" && (
          <motion.div key="review" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: .3 }}>
            <p className="eyebrow" style={{ marginBottom: 6 }}>Final check</p>
            <h2 className="display" style={{ fontSize: T.size.xl, marginBottom: T.space.lg }}>Review and submit</h2>

            {isBank ? (
              <div style={{ border: `1px solid ${c.line}`, padding: `0 ${T.space.lg}px` }}>
                <LedgerRow label="Method" value="Bank details" />
                <LedgerRow label="Bank" value={bank.bankName} />
                <LedgerRow label="Account name" value={bank.accountName} />
                <LedgerRow label="Account number" value={bank.accountNumber} last={!bank.routingNumber} />
                {bank.routingNumber && <LedgerRow label="Routing / SWIFT" value={bank.routingNumber} last />}
              </div>
            ) : (
              <>
                <div style={{ border: `1px solid ${c.line}`, padding: `0 ${T.space.lg}px`, marginBottom: T.space.lg }}>
                  <LedgerRow label="Document" value={DOC_METHODS.find(m => m.value === method)?.label} last />
                </div>
                <div className="grid grid-cols-3" style={{ gap: 6 }}>
                  {[["Front", idFrontPreview], ["Back", idBackPreview], ["Selfie", selfiePreview]].map(([label, src], i) => (
                    <div key={i}>
                      <img src={src} alt={label}
                        style={{ width: "100%", height: 74, objectFit: "cover", border: `1px solid ${c.line}`, display: "block" }} />
                      <p className="mono" style={{
                        fontSize: T.size.micro, letterSpacing: ".14em", textTransform: "uppercase",
                        color: c.text4, textAlign: "center", marginTop: 5,
                      }}>
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            <Button full onClick={handleSubmit} disabled={submitting}
              style={{ marginTop: T.space.xl, opacity: submitting ? .6 : 1 }}
              icon={submitting ? <Spinner size={13} tone="#fff" /> : <ShieldCheck size={14} />}>
              {submitting ? "Submitting" : "Submit for verification"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {stage > 0 && steps[stage] !== "review" && (
        <div className="flex" style={{ gap: 8, marginTop: T.space.xl }}>
          <Button variant="quiet" onClick={back} icon={<ChevronLeft size={13} />}>Back</Button>
          <Button onClick={next} style={{ flex: 1 }}>Continue <ChevronRight size={13} /></Button>
        </div>
      )}

      {stage > 0 && (
        <button onClick={resetAll}
          className="mono w-full flex items-center justify-center gap-2"
          style={{
            marginTop: T.space.lg, padding: 8,
            fontSize: T.size.tiny, letterSpacing: ".14em", textTransform: "uppercase", color: c.text4,
          }}>
          <RefreshCw size={11} /> Change method
        </button>
      )}
    </Shell>
  );
}
