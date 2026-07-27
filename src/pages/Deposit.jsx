import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  DollarSign, CreditCard, Hash, Copy, Check, ChevronDown, X,
  AlertTriangle, Bitcoin, ExternalLink, Info,
} from "lucide-react";
import {
  T, PageShell, Panel, SectionHead, Button, Field, inputStyle,
  StatusPill, Spinner, Banner,
} from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";

/* Flutterwave payment link (USD, customer enters amount) */
const CARD_PAYMENT_LINK = "https://flutterwave.com/pay/mexicatrading";
const MERCHANT_NAME = "PROWAVE GLOBAL VENTURE";

const c = T.color;

export default function Deposit() {
  const { t } = useTranslation();
  const [payMethod, setPayMethod] = useState("crypto"); // "crypto" | "card"
  const [amount, setAmount] = useState("");
  const [txid, setTxid] = useState("");
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [paymentOpened, setPaymentOpened] = useState(false);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/wallets/public/all`);
        setWallets(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch wallets:", err);
      }
    };
    fetchWallets();
  }, []);

  const handleSelectWallet = (wallet) => {
    setSelectedWallet(wallet);
    setSelectModalOpen(false);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!selectedWallet?.address) return;
    try {
      await navigator.clipboard.writeText(selectedWallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const openCardPayment = () => {
    window.open(CARD_PAYMENT_LINK, "_blank", "noopener,noreferrer");
    setPaymentOpened(true);
  };

  const switchMethod = (m) => {
    setPayMethod(m);
    setMessage("");
    setPaymentOpened(false);
    setSelectedWallet(null);
    setTxid("");
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setMessage("You must be logged in to deposit.");
        setMessageType("error"); setLoading(false); return;
      }
      if (!amount || parseFloat(amount) <= 0) {
        setMessage("Please enter a valid deposit amount.");
        setMessageType("error"); setLoading(false); return;
      }
      if (payMethod === "crypto" && !selectedWallet) {
        setMessage("Please select a payment method.");
        setMessageType("error"); setLoading(false); return;
      }

      const method = payMethod === "card" ? "Card (Flutterwave)" : selectedWallet.name;

      const res = await axios.post(`${API_URL}/api/deposits`,
        { amount: parseFloat(amount), method, txid: txid || "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message || "Deposit submitted successfully!");
      setMessageType("success");
      setAmount(""); setTxid(""); setSelectedWallet(null); setPaymentOpened(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Deposit failed. Try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const tabStyle = (active) => ({
    flex: 1,
    padding: "14px 0",
    fontFamily: "'IBM Plex Mono',monospace",
    fontSize: T.size.tiny,
    letterSpacing: ".16em",
    textTransform: "uppercase",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: active ? "rgba(63,143,95,.1)" : "transparent",
    color: active ? c.gain : c.text3,
    borderBottom: `2px solid ${active ? c.gain : "transparent"}`,
    transition: "color .2s, background .2s",
  });

  return (
    <PageShell width={560}>

      {/* ── Header ── */}
      <div style={{ marginBottom: T.space.xl }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Add funds</p>
        <h1 className="display" style={{ fontSize: T.size.xxl, lineHeight: 1.05 }}>
          {t("deposit.title", "Deposit")}
        </h1>
        <p style={{ fontSize: T.size.sm, color: c.text3, marginTop: 8 }}>
          {t("deposit.subtitle", "Fund your account to start investing.")}
        </p>
      </div>

      {/* ── Result message ── */}
      {message && (
        <div style={{ marginBottom: T.space.lg }}>
          <Banner
            tone={messageType === "success" ? "gain" : "loss"}
            title={message}
          />
        </div>
      )}

      <Panel pad={false}>

        {/* ── Method tabs ── */}
        <div className="flex" style={{ borderBottom: `1px solid ${c.line}` }}>
          <button type="button" onClick={() => switchMethod("crypto")} style={tabStyle(payMethod === "crypto")}>
            <Bitcoin size={14} /> Crypto
          </button>
          <button type="button" onClick={() => switchMethod("card")} style={tabStyle(payMethod === "card")}>
            <CreditCard size={14} /> Card
          </button>
        </div>

        <form onSubmit={handleDeposit} style={{ padding: T.space.xl }}>

          {/* ── Amount ── */}
          <Field label={t("deposit.amount", "Amount")}>
            <div style={{ position: "relative" }}>
              <span className="mono" style={{
                position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                color: c.text3, fontSize: T.size.base,
              }}>$</span>
              <input
                type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00"
                value={amount} onChange={(e) => setAmount(e.target.value)}
                required
                className="mono tabular"
                style={{ ...inputStyle, paddingLeft: 30, fontSize: T.size.lg }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(63,143,95,.5)")}
                onBlur={(e) => (e.target.style.borderColor = c.line)}
              />
            </div>
          </Field>

          {/* ═══════════ CARD ═══════════ */}
          {payMethod === "card" && (
            <>
              {/* Steps */}
              <div style={{ border: `1px solid ${c.line}`, marginBottom: T.space.lg }}>
                <p className="eyebrow" style={{ padding: `${T.space.md}px ${T.space.lg}px`, borderBottom: `1px solid ${c.lineSoft}` }}>
                  How it works
                </p>
                {[
                  ["Enter the amount above, then open the payment page"],
                  ["Pay the same amount with your card"],
                  ["Return here and submit so our team can confirm it"],
                ].map(([step], i, arr) => (
                  <div key={i} className="flex gap-3"
                    style={{
                      padding: `${T.space.md}px ${T.space.lg}px`,
                      borderBottom: i < arr.length - 1 ? `1px solid ${c.lineSoft}` : "none",
                    }}>
                    <span className="mono tabular" style={{ fontSize: T.size.xs, color: c.gain, minWidth: 16 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ fontSize: T.size.sm, color: c.text2, lineHeight: 1.6 }}>{step}</span>
                  </div>
                ))}
              </div>

              <Button type="button" variant="primary" full onClick={openCardPayment}
                icon={<CreditCard size={14} />} style={{ marginBottom: T.space.md }}>
                Open payment page <ExternalLink size={12} style={{ opacity: .7 }} />
              </Button>

              {paymentOpened && (
                <p className="mono" style={{ fontSize: T.size.xs, color: c.gain, textAlign: "center", marginBottom: T.space.lg }}>
                  Payment page opened — submit below once you've paid
                </p>
              )}

              {/* Notes */}
              <div style={{ background: c.fill, border: `1px solid ${c.line}`, padding: T.space.lg, marginBottom: T.space.lg }}>
                <div className="flex gap-2.5">
                  <Info size={13} style={{ color: c.text4, flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: T.size.xs, color: c.text3, lineHeight: 1.7 }}>
                    <p style={{ marginBottom: 8 }}>
                      Your statement will show <span style={{ color: c.text2 }}>{MERCHANT_NAME}</span> — our registered payment merchant.
                    </p>
                    <p style={{ marginBottom: 8 }}>
                      Charged in <span style={{ color: c.text2 }}>USD</span>. If your card is in another currency your bank converts it, so the amount on your statement may differ slightly and your bank may add its own fee.
                    </p>
                    <p>
                      Use the <span style={{ color: c.text2 }}>same email</span> as your MexicaTrading account so we can match the payment.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══════════ CRYPTO ═══════════ */}
          {payMethod === "crypto" && (
            <>
              <Field label={t("deposit.method", "Currency")}>
                <button type="button" onClick={() => setSelectModalOpen(true)}
                  className="w-full flex items-center justify-between"
                  style={{ ...inputStyle, textAlign: "left" }}>
                  <span style={{ color: selectedWallet ? c.text : c.text4, fontSize: T.size.sm }}>
                    {selectedWallet ? selectedWallet.name : t("deposit.selectMethod", "Select currency")}
                  </span>
                  <ChevronDown size={15} style={{ color: c.text4 }} />
                </button>
              </Field>

              {selectedWallet && (
                <div style={{ marginBottom: T.space.lg }}>
                  <div style={{ background: "rgba(192,138,62,.07)", borderLeft: `2px solid ${c.brass}`, padding: T.space.lg, marginBottom: 2 }}>
                    <div className="flex gap-2.5">
                      <AlertTriangle size={14} style={{ color: c.brass, flexShrink: 0, marginTop: 2 }} />
                      <p style={{ fontSize: T.size.xs, color: c.text2, lineHeight: 1.7 }}>
                        Send only <span style={{ color: c.text }}>{selectedWallet.name}</span> to this address. Any other asset will be lost permanently.
                      </p>
                    </div>
                  </div>

                  <div style={{ border: `1px solid ${c.line}`, padding: T.space.lg }}>
                    <p className="eyebrow" style={{ marginBottom: 10 }}>{t("deposit.walletAddress", "Wallet address")}</p>
                    <p className="mono" style={{ fontSize: T.size.xs, color: c.text2, wordBreak: "break-all", lineHeight: 1.7, marginBottom: T.space.md }}>
                      {selectedWallet.address}
                    </p>
                    <Button type="button" variant={copied ? "outline" : "quiet"} onClick={handleCopy}
                      icon={copied ? <Check size={12} /> : <Copy size={12} />}>
                      {copied ? t("deposit.copied", "Copied") : t("deposit.copy", "Copy address")}
                    </Button>
                    {selectedWallet.caution && (
                      <p style={{ fontSize: T.size.xs, color: c.text4, marginTop: T.space.md, lineHeight: 1.6 }}>
                        {selectedWallet.caution}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Reference ── */}
          <Field
            label={payMethod === "card" ? "Payment reference" : t("deposit.txid", "Transaction ID")}
            hint="Optional — helps us confirm your payment faster">
            <div style={{ position: "relative" }}>
              <Hash size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.text4 }} />
              <input
                type="text"
                placeholder={payMethod === "card" ? "From your payment receipt" : t("deposit.txidPlaceholder", "Paste transaction hash")}
                value={txid} onChange={(e) => setTxid(e.target.value)}
                className="mono"
                style={{ ...inputStyle, paddingLeft: 36, fontSize: T.size.xs }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(63,143,95,.5)")}
                onBlur={(e) => (e.target.style.borderColor = c.line)}
              />
            </div>
          </Field>

          <Button type="submit" variant="primary" full disabled={loading}
            icon={loading ? <Spinner size={14} tone="#fff" /> : null}>
            {loading ? t("deposit.submitting", "Submitting") : t("deposit.submit", "Submit deposit")}
          </Button>
        </form>
      </Panel>

      {/* ── Trust strip ── */}
      <div className="flex items-center justify-center gap-5 mono"
        style={{ marginTop: T.space.xl, fontSize: T.size.micro, letterSpacing: ".14em", textTransform: "uppercase", color: c.text4 }}>
        <span>SSL secured</span>
        <span>·</span>
        <span>Manual review</span>
        <span>·</span>
        <span>24/7 support</span>
      </div>

      {/* ══ CURRENCY MODAL ══ */}
      {selectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: "rgba(8,9,11,.86)" }}>
          <div className="absolute inset-0" onClick={() => setSelectModalOpen(false)} />
          <div className="relative w-full sm:max-w-md z-10 flex flex-col"
            style={{ background: c.panel, border: `1px solid ${c.line}`, maxHeight: "85vh" }}>

            <div className="flex items-center justify-between"
              style={{ padding: T.space.xl, borderBottom: `1px solid ${c.line}` }}>
              <div>
                <p className="eyebrow" style={{ marginBottom: 4 }}>Deposit</p>
                <h3 className="display" style={{ fontSize: T.size.lg }}>Select currency</h3>
              </div>
              <button onClick={() => setSelectModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center"
                style={{ background: c.fill, color: c.text3 }}>
                <X size={14} />
              </button>
            </div>

            <div className="overflow-auto flex-1">
              {wallets.length === 0 ? (
                <p style={{ padding: T.space.xxxl, textAlign: "center", fontSize: T.size.sm, color: c.text3 }}>
                  No deposit currencies available right now.
                </p>
              ) : (
                wallets.map((w, i) => (
                  <button key={w._id || w.name} onClick={() => handleSelectWallet(w)}
                    className="w-full text-left hover-fill transition"
                    style={{
                      padding: T.space.lg,
                      borderBottom: i < wallets.length - 1 ? `1px solid ${c.lineSoft}` : "none",
                    }}>
                    <p style={{ fontSize: T.size.sm, color: c.text, marginBottom: 3 }}>{w.name}</p>
                    <p className="mono truncate" style={{ fontSize: T.size.tiny, color: c.text4 }}>{w.address}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
