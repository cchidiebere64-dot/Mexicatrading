import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ArrowLeft, Upload, CheckCircle, Clock, XCircle, Camera, CreditCard } from "lucide-react";

const API_URL = "https://mexicatradingbackend.onrender.com";

export default function KYC() {
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [idType, setIdType] = useState("passport");
  const [idFront, setIdFront] = useState(null);
  const [idFrontPreview, setIdFrontPreview] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [countdown, setCountdown] = useState(5);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchKYCStatus();
  }, []);

  // ── Auto-redirect countdown after successful submission ───────────────────
  useEffect(() => {
    if (!submitted) return;
    if (countdown === 0) {
      navigate("/dashboard");
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
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

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: "File size must be less than 5MB.", type: "error" });
      return;
    }
    const preview = URL.createObjectURL(file);
    if (type === "front") { setIdFront(file); setIdFrontPreview(preview); }
    else { setSelfie(file); setSelfiePreview(preview); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idFront || !selfie) {
      setMessage({ text: "Please upload both your ID and selfie.", type: "error" });
      return;
    }
    setSubmitting(true);
    setMessage({ text: "", type: "" });
    try {
      const idFrontBase64 = await toBase64(idFront);
      const selfieBase64 = await toBase64(selfie);
      await axios.post(
        `${API_URL}/api/user/kyc-submit`,
        { idType, idFrontImage: idFrontBase64, selfieImage: selfieBase64 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Submission failed. Please try again.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#080c18]">
      <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
    </div>
  );

  const status = kycStatus?.status || "none";

  // ── Success screen after submission ──────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#080c18] text-white flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white/[0.04] border border-white/10 rounded-3xl p-10 text-center shadow-2xl">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5 text-4xl">
            ✅
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Documents Submitted!</h2>
          <p className="text-white/50 text-sm leading-relaxed mb-6">
            Your identity documents have been received and are now under review by our team. You will receive an email once the review is complete — usually within 24 hours.
          </p>
          <div className="p-4 rounded-xl bg-yellow-500/8 border border-yellow-500/20 mb-6">
            <p className="text-yellow-400 text-sm font-semibold">⏳ KYC Status: Under Review</p>
          </div>
          <p className="text-white/30 text-xs mb-5">
            Redirecting to dashboard in <span className="text-emerald-400 font-bold">{countdown}</span> seconds...
          </p>
          <button onClick={() => navigate("/dashboard")}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-all font-semibold text-sm text-white flex items-center justify-center gap-2">
            <ShieldCheck size={16} /> Go to Dashboard Now
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c18] text-white pb-20">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[600px] h-[600px] bg-purple-500/6 blur-[150px] rounded-full top-[-200px] left-[-200px]" />
        <div className="absolute w-[500px] h-[500px] bg-emerald-500/4 blur-[140px] rounded-full bottom-[-200px] right-[-200px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-24">

        <button onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition mb-6">
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-medium tracking-widest uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Identity Verification
          </div>
          <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
          <p className="text-white/40 text-sm">Verify your identity to unlock full withdrawal access</p>
        </div>

        {/* APPROVED */}
        {status === "approved" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={36} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Identity Verified ✅</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              Your identity has been verified successfully. You have full access to all withdrawal features.
            </p>
            <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20 mb-5">
              <p className="text-emerald-400 text-sm font-semibold">🎉 KYC Status: Approved</p>
              <p className="text-white/40 text-xs mt-1">
                Verified on {kycStatus?.reviewedAt ? new Date(kycStatus.reviewedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "N/A"}
              </p>
            </div>
            <button onClick={() => navigate("/dashboard")}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition font-semibold text-sm text-white">
              Back to Dashboard
            </button>
          </motion.div>
        )}

        {/* PENDING */}
        {status === "pending" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-5">
              <Clock size={36} className="text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Under Review ⏳</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              Your documents are being reviewed by our team. This usually takes less than 24 hours.
            </p>
            <div className="p-4 rounded-xl bg-yellow-500/8 border border-yellow-500/20 mb-5">
              <p className="text-yellow-400 text-sm font-semibold">⏳ KYC Status: Under Review</p>
              <p className="text-white/40 text-xs mt-1">
                Submitted on {kycStatus?.submittedAt ? new Date(kycStatus.submittedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "N/A"}
              </p>
            </div>
            <p className="text-white/30 text-xs mb-5">You will receive an email once your verification is complete.</p>
            <button onClick={() => navigate("/dashboard")}
              className="w-full py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition text-sm text-white/50 hover:text-white font-semibold">
              Back to Dashboard
            </button>
          </motion.div>
        )}

        {/* REJECTED banner */}
        {status === "rejected" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white/[0.04] border border-red-500/20 rounded-3xl p-6 text-center mb-6">
            <XCircle size={28} className="text-red-400 mx-auto mb-3" />
            <p className="text-white font-bold mb-1">Verification Rejected ❌</p>
            <p className="text-white/40 text-sm">Please resubmit clear, readable photos below.</p>
            {kycStatus?.rejectionReason && (
              <div className="mt-3 p-3 rounded-xl bg-red-500/8 border border-red-500/20">
                <p className="text-red-400 text-xs">Reason: {kycStatus.rejectionReason}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* FORM — none or rejected */}
        {(status === "none" || status === "rejected") && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 shadow-2xl">

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: "📄", title: "ID Photo", desc: "Clear front photo" },
                { icon: "🤳", title: "Selfie", desc: "Holding your ID" },
                { icon: "⚡", title: "24 Hours", desc: "Review time" },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/8 text-center">
                  <p className="text-xl mb-1">{item.icon}</p>
                  <p className="text-white text-xs font-semibold">{item.title}</p>
                  <p className="text-white/30 text-xs mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {message.text && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`mb-5 p-4 rounded-xl text-sm text-center font-medium border ${
                    message.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}>
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* ID Type */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Document Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "passport", label: "Passport", icon: "🛂" },
                    { value: "national_id", label: "National ID", icon: "🪪" },
                    { value: "drivers_license", label: "Driver's License", icon: "🚗" },
                  ].map((doc) => (
                    <button key={doc.value} type="button" onClick={() => setIdType(doc.value)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        idType === doc.value
                          ? "border-purple-500/50 bg-purple-500/10 text-purple-400"
                          : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20"
                      }`}>
                      <p className="text-lg mb-1">{doc.icon}</p>
                      <p className="text-xs font-semibold">{doc.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* ID Front */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <CreditCard size={12} /> ID Photo (Front)
                </label>
                <label className={`block w-full rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                  idFrontPreview ? "border-purple-500/40" : "border-white/15 hover:border-white/30"
                }`}>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "front")} className="hidden" />
                  {idFrontPreview ? (
                    <div className="relative">
                      <img src={idFrontPreview} alt="ID" className="w-full h-44 object-cover rounded-xl" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 hover:opacity-100 transition-all">
                        <p className="text-white text-xs font-semibold">Click to change</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 gap-2">
                      <Upload size={20} className="text-white/30" />
                      <p className="text-white/40 text-sm">Click to upload ID photo</p>
                      <p className="text-white/20 text-xs">JPG, PNG — max 5MB</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Selfie */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <Camera size={12} /> Selfie Holding Your ID
                </label>
                <label className={`block w-full rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                  selfiePreview ? "border-purple-500/40" : "border-white/15 hover:border-white/30"
                }`}>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "selfie")} className="hidden" />
                  {selfiePreview ? (
                    <div className="relative">
                      <img src={selfiePreview} alt="Selfie" className="w-full h-44 object-cover rounded-xl" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 hover:opacity-100 transition-all">
                        <p className="text-white text-xs font-semibold">Click to change</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 gap-2">
                      <Camera size={20} className="text-white/30" />
                      <p className="text-white/40 text-sm">Click to upload selfie</p>
                      <p className="text-white/20 text-xs">Hold your ID clearly visible — max 5MB</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Tips */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8">
                <p className="text-white/50 text-xs font-semibold mb-2">📋 Tips for approval:</p>
                <div className="space-y-1">
                  <p className="text-white/35 text-xs">• Make sure all text on your ID is clearly readable</p>
                  <p className="text-white/35 text-xs">• Use good lighting — avoid shadows and glare</p>
                  <p className="text-white/35 text-xs">• Hold your ID next to your face in the selfie</p>
                  <p className="text-white/35 text-xs">• Do not crop or edit the photos</p>
                </div>
              </div>

              <button type="submit" disabled={submitting || !idFront || !selfie}
                className="w-full py-3.5 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm text-white flex items-center justify-center gap-2 shadow-xl shadow-purple-500/20">
                {submitting ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                ) : (
                  <><ShieldCheck size={16} /> Submit for Verification</>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
