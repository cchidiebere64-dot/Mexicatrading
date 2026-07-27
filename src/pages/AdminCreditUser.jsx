import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, CreditCard, AlertTriangle } from "lucide-react";
import { T, ThemeStyles, Button, Spinner, Banner, inputStyle, LedgerRow } from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const c = T.color;

export default function AdminCreditUser() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("credit");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [confirming, setConfirming] = useState(false);

  const token = sessionStorage.getItem("adminToken");

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const review = (e) => {
    e.preventDefault();
    if (!email.trim()) return showMessage("Enter the member's email address.", "error");
    if (!amount || parseFloat(amount) <= 0) return showMessage("Enter a valid amount.", "error");
    setMessage({ text: "", type: "" });
    setConfirming(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/admin/credit-user`,
        { email, amount: parseFloat(amount), type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMessage(res.data?.message || "Balance updated successfully!");
      setEmail("");
      setAmount("");
      setConfirming(false);
    } catch (error) {
      showMessage(error.response?.data?.error || "Failed to update balance. Try again.", "error");
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  };

  const money = (v) => Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const isCredit = type === "credit";

  const tabStyle = (active, tone) => ({
    flex: 1,
    padding: "13px 0",
    fontFamily: "'IBM Plex Mono',monospace",
    fontSize: T.size.tiny,
    letterSpacing: ".16em",
    textTransform: "uppercase",
    background: active ? (tone === "gain" ? "rgba(63,143,95,.1)" : "rgba(180,85,63,.1)") : "transparent",
    color: active ? (tone === "gain" ? c.gain : c.loss) : c.text3,
    borderBottom: `2px solid ${active ? (tone === "gain" ? c.gain : c.loss) : "transparent"}`,
    transition: "color .2s, background .2s",
  });

  return (
    <div className="ui" style={{ color: c.text }}>
      <ThemeStyles />

      {/* ── Header ── */}
      <div style={{ marginBottom: T.space.xl }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Manual adjustment</p>
        <h1 className="display" style={{ fontSize: T.size.xl, lineHeight: 1.1 }}>Credit or deduct</h1>
        <p style={{ fontSize: T.size.sm, color: c.text3, marginTop: 8, lineHeight: 1.7, maxWidth: 420 }}>
          Adjust a member's balance directly by email address.
        </p>
      </div>

      <div style={{ maxWidth: 460 }}>

        {message.text && (
          <div style={{ marginBottom: T.space.lg }}>
            <Banner tone={message.type === "success" ? "gain" : "loss"} title={message.text} />
          </div>
        )}

        {/* ══ CONFIRM ══ */}
        {confirming ? (
          <div style={{
            border: `1px solid ${c.line}`,
            borderLeft: `2px solid ${isCredit ? c.gain : c.loss}`,
            padding: T.space.xl,
          }}>
            <p className="mono" style={{
              fontSize: T.size.micro, letterSpacing: ".24em", textTransform: "uppercase",
              color: isCredit ? c.gain : c.loss, marginBottom: 8,
            }}>
              Confirm adjustment
            </p>
            <h3 className="display" style={{ fontSize: T.size.xl, marginBottom: T.space.lg }}>
              {isCredit ? "Add" : "Remove"} ${money(amount)}
            </h3>

            <div style={{ borderTop: `1px solid ${c.line}`, marginBottom: T.space.lg }}>
              <LedgerRow label="Member" value={email} />
              <LedgerRow label="Action" value={isCredit ? "Credit" : "Deduct"}
                accent={isCredit ? c.gain : c.loss} />
              <LedgerRow label="Amount" value={`$${money(amount)}`} last />
            </div>

            <div className="flex items-start gap-2.5"
              style={{ background: "rgba(192,138,62,.06)", borderLeft: `2px solid ${c.brass}`, padding: T.space.md, marginBottom: T.space.xl }}>
              <AlertTriangle size={13} style={{ color: c.brass, flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: T.size.xs, color: c.text3, lineHeight: 1.65 }}>
                Check the email carefully. This moves real money and can't be undone from here — you'd have to
                reverse it manually.
              </p>
            </div>

            <div className="grid grid-cols-2" style={{ gap: 8 }}>
              <Button variant="quiet" onClick={() => setConfirming(false)} disabled={loading}>
                Back
              </Button>
              <Button variant={isCredit ? "primary" : "danger"} onClick={handleSubmit} disabled={loading}
                icon={loading ? <Spinner size={12} tone={isCredit ? "#fff" : c.loss} /> : null}>
                {loading ? "Working" : isCredit ? "Credit" : "Deduct"}
              </Button>
            </div>
          </div>

        /* ══ FORM ══ */
        ) : (
          <div style={{ border: `1px solid ${c.line}` }}>

            {/* type tabs */}
            <div className="flex" style={{ borderBottom: `1px solid ${c.line}` }}>
              <button type="button" onClick={() => setType("credit")} style={tabStyle(isCredit, "gain")}>
                Credit
              </button>
              <button type="button" onClick={() => setType("deduct")} style={tabStyle(!isCredit, "loss")}>
                Deduct
              </button>
            </div>

            <form onSubmit={review} style={{ padding: T.space.xl }}>

              <div style={{ marginBottom: T.space.lg }}>
                <p className="eyebrow" style={{ marginBottom: 6 }}>Member email</p>
                <div style={{ position: "relative" }}>
                  <Mail size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="member@example.com" required
                    className="mono"
                    style={{ ...inputStyle, paddingLeft: 38, fontSize: T.size.xs }} />
                </div>
                <p style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 6 }}>
                  Must match their registered address exactly.
                </p>
              </div>

              <div style={{ marginBottom: T.space.xl }}>
                <p className="eyebrow" style={{ marginBottom: 6 }}>Amount</p>
                <div style={{ position: "relative" }}>
                  <span className="mono" style={{
                    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                    color: c.text3, fontSize: T.size.base,
                  }}>$</span>
                  <input type="number" step="0.01" min="0" value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00" required
                    className="mono tabular"
                    style={{ ...inputStyle, paddingLeft: 30, fontSize: T.size.lg }} />
                </div>
              </div>

              <Button type="submit" full variant={isCredit ? "primary" : "danger"}
                icon={<CreditCard size={13} />}>
                Review {isCredit ? "credit" : "deduction"} <ArrowRight size={13} />
              </Button>
            </form>
          </div>
        )}

        <p style={{ fontSize: T.size.xs, color: c.text4, lineHeight: 1.7, marginTop: T.space.lg }}>
          For adjustments tied to a specific member you already have open, the Users page has the same
          controls without needing to retype an email.
        </p>
      </div>
    </div>
  );
}
