import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Pencil, Trash2, X, RefreshCw, AlertTriangle } from "lucide-react";
import { T, ThemeStyles, Button, Spinner, EmptyState, Banner, inputStyle, LedgerRow } from "./system.jsx";

const API_URL = "https://mexicatradingbackend.onrender.com";
const c = T.color;

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [form, setForm] = useState({ name: "", min: "", max: "", profit: "", duration: "", description: "" });

  const token = sessionStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/plans`, { headers });
      setPlans(Array.isArray(res.data) ? res.data : []);
    } catch {
      showMessage("Failed to load plans.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = () => {
    setEditPlan(null);
    setForm({ name: "", min: "", max: "", profit: "", duration: "", description: "" });
    setShowModal(true);
  };

  const openEdit = (plan) => {
    setEditPlan(plan);
    setForm({
      name: plan.name || "",
      min: plan.minAmount || "",
      max: plan.maxAmount || "",
      profit: plan.profitRate || "", // stored as the rate (e.g. 25 means 25%)
      duration: plan.duration || "",
      description: plan.description || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editPlan) {
        await axios.put(`${API_URL}/api/plans/${editPlan._id}`, form, { headers });
        showMessage("Plan updated successfully.");
      } else {
        await axios.post(`${API_URL}/api/plans`, form, { headers });
        showMessage("Plan created successfully.");
      }
      setShowModal(false);
      fetchPlans();
    } catch {
      showMessage("Failed to save plan.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const deletePlan = async (id) => {
    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/api/plans/${id}`, { headers });
      showMessage("Plan deleted successfully.");
      setConfirmDelete(null);
      fetchPlans();
    } catch {
      showMessage("Failed to delete plan.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const money = (v) => Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

  /* Live preview of what a user will actually see */
  const previewMin = Number(form.min) || 0;
  const previewRate = Number(form.profit) || 0;
  const previewProfit = (previewMin * previewRate) / 100;
  const canPreview = previewMin > 0 && previewRate > 0;

  if (loading) return (
    <div className="ui flex flex-col items-center justify-center gap-4" style={{ height: 260 }}>
      <ThemeStyles />
      <Spinner size={26} />
      <p className="mono" style={{ fontSize: T.size.xs, letterSpacing: ".2em", textTransform: "uppercase", color: c.text3 }}>
        Loading
      </p>
    </div>
  );

  const field = (label, key, ph, type = "text", hint) => (
    <div style={{ marginBottom: T.space.lg }}>
      <p className="eyebrow" style={{ marginBottom: 6 }}>{label}</p>
      <input type={type} value={form[key]} placeholder={ph}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className={type === "number" ? "mono tabular" : ""}
        style={inputStyle} />
      {hint && <p style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 6 }}>{hint}</p>}
    </div>
  );

  return (
    <div className="ui" style={{ color: c.text }}>
      <ThemeStyles />

      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-3" style={{ marginBottom: T.space.xl }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Products</p>
          <h1 className="display" style={{ fontSize: T.size.xl, lineHeight: 1.1 }}>Investment plans</h1>
          <p className="mono" style={{ fontSize: T.size.xs, color: c.text3, marginTop: 6 }}>
            {plans.length} live on the plans page
          </p>
        </div>
        <div className="flex items-center shrink-0" style={{ gap: 8 }}>
          <button onClick={fetchPlans} aria-label="Refresh"
            className="flex items-center justify-center"
            style={{ width: 36, height: 36, background: c.fill, border: `1px solid ${c.line}`, color: c.text3 }}>
            <RefreshCw size={14} />
          </button>
          <Button onClick={openCreate} icon={<Plus size={13} />}>New plan</Button>
        </div>
      </div>

      {/* ── Standing note ── */}
      <div style={{ marginBottom: T.space.xl }}>
        <Banner tone="brass"
          title="Changes go live immediately"
          text="Editing a plan doesn't alter investments already running — those keep the terms they were opened on." />
      </div>

      {message.text && (
        <div style={{ marginBottom: T.space.lg }}>
          <Banner tone={message.type === "success" ? "gain" : "loss"} title={message.text} />
        </div>
      )}

      {/* ── List ── */}
      {plans.length === 0 ? (
        <EmptyState icon={<Package size={20} />}
          title="No plans yet"
          text="Users can't invest until you publish at least one plan."
          action={{ label: "Create your first plan", onClick: openCreate }} />
      ) : (
        <div style={{ border: `1px solid ${c.line}` }}>
          {plans.map((p, i) => {
            const minProfit = (Number(p.minAmount) * Number(p.profitRate)) / 100;
            return (
              <div key={p._id}
                style={{
                  padding: T.space.lg,
                  borderBottom: i < plans.length - 1 ? `1px solid ${c.lineSoft}` : "none",
                  borderLeft: editPlan?._id === p._id ? `2px solid ${c.gain}` : "2px solid transparent",
                }}>

                <div className="flex items-start justify-between gap-3" style={{ marginBottom: T.space.md }}>
                  <div style={{ minWidth: 0 }}>
                    <div className="flex items-baseline gap-2.5" style={{ marginBottom: 3 }}>
                      <span className="mono tabular" style={{ fontSize: T.size.tiny, color: c.text4 }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="display" style={{ fontSize: T.size.lg, color: c.text }}>{p.name}</span>
                    </div>
                    {p.description && (
                      <p style={{ fontSize: T.size.xs, color: c.text4, lineHeight: 1.6 }}>{p.description}</p>
                    )}
                  </div>

                  <div className="flex shrink-0" style={{ gap: 6 }}>
                    <button onClick={() => openEdit(p)} aria-label="Edit"
                      className="flex items-center justify-center"
                      style={{ width: 30, height: 30, background: c.fill, border: `1px solid ${c.line}`, color: c.text3 }}>
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => setConfirmDelete(p)} aria-label="Delete"
                      className="flex items-center justify-center"
                      style={{ width: 30, height: 30, background: c.fill, border: `1px solid rgba(180,85,63,.25)`, color: c.loss }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${c.lineSoft}`, paddingTop: T.space.md }}>
                  <div className="grid grid-cols-3" style={{ gap: T.space.md }}>
                    {[
                      ["Range", `$${money(p.minAmount)} – $${money(p.maxAmount)}`, c.text2],
                      ["Return", `${p.profitRate}%`, c.gain],
                      ["Duration", `${p.duration} days`, c.text2],
                    ].map(([label, value, tone], j) => (
                      <div key={j}>
                        <p className="eyebrow" style={{ marginBottom: 4 }}>{label}</p>
                        <p className="mono tabular truncate" style={{ fontSize: T.size.xs, color: tone }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  <p className="mono" style={{ fontSize: T.size.tiny, color: c.text4, marginTop: T.space.md }}>
                    A user investing ${money(p.minAmount)} receives{" "}
                    <span className="tabular" style={{ color: c.gain }}>
                      ${money(Number(p.minAmount) + minProfit)}
                    </span>{" "}
                    after {p.duration} days
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ CREATE / EDIT SHEET ══ */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ background: "rgba(8,9,11,.88)" }}>
            <div className="absolute inset-0" onClick={() => setShowModal(false)} />

            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              transition={{ duration: .3, ease: [.22, 1, .36, 1] }}
              className="relative w-full sm:max-w-md z-10"
              style={{ background: c.panel, border: `1px solid ${c.line}`, maxHeight: "92vh", display: "flex", flexDirection: "column" }}>

              <div className="flex items-start justify-between gap-3"
                style={{ padding: T.space.xl, borderBottom: `1px solid ${c.line}` }}>
                <div>
                  <p className="eyebrow" style={{ marginBottom: 4 }}>{editPlan ? "Editing" : "New"}</p>
                  <h3 className="display" style={{ fontSize: T.size.xl }}>
                    {editPlan ? editPlan.name : "Create a plan"}
                  </h3>
                </div>
                <button onClick={() => setShowModal(false)} aria-label="Close"
                  className="flex items-center justify-center shrink-0"
                  style={{ width: 32, height: 32, background: c.fill, color: c.text3 }}>
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: T.space.xl, overflowY: "auto", flex: 1 }}>

                {field("Plan name", "name", "e.g. Premium", "text",
                  "Starter, Basic, Premium, Elite and VIP get matching colours on the plans page.")}

                <div className="grid grid-cols-2" style={{ gap: T.space.md }}>
                  {field("Minimum ($)", "min", "500", "number")}
                  {field("Maximum ($)", "max", "1999", "number")}
                </div>

                <div className="grid grid-cols-2" style={{ gap: T.space.md }}>
                  {field("Return (%)", "profit", "12", "number")}
                  {field("Duration (days)", "duration", "5", "number")}
                </div>

                {field("Description", "description", "One short line users will read", "text")}

                {/* Live preview */}
                {canPreview && (
                  <div style={{ border: `1px solid ${c.line}`, padding: T.space.lg, marginBottom: T.space.lg }}>
                    <p className="eyebrow" style={{ marginBottom: T.space.md }}>What the user will see</p>
                    <div style={{ borderTop: `1px solid ${c.lineSoft}` }}>
                      <LedgerRow small label="They invest" value={`$${money(previewMin)}`} />
                      <LedgerRow small label="They earn" value={`+$${money(previewProfit)}`} accent={c.gain} />
                      <LedgerRow small label="Returned at maturity"
                        value={`$${money(previewMin + previewProfit)}`} last />
                    </div>
                    <p className="mono" style={{ fontSize: T.size.tiny, color: c.text4, marginTop: 10 }}>
                      after {form.duration || "—"} days
                    </p>
                  </div>
                )}

                <div className="flex" style={{ gap: 8 }}>
                  <Button type="button" variant="quiet" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={actionLoading}
                    style={{ flex: 1, opacity: actionLoading ? .6 : 1 }}
                    icon={actionLoading ? <Spinner size={12} tone="#fff" /> : null}>
                    {actionLoading ? "Saving" : editPlan ? "Save changes" : "Create plan"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ DELETE CONFIRM ══ */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
            style={{ background: "rgba(8,9,11,.9)" }}>
            <div className="absolute inset-0" onClick={() => setConfirmDelete(null)} />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="relative w-full z-10"
              style={{ maxWidth: 380, background: c.panel, border: `1px solid ${c.line}`, borderLeft: `2px solid ${c.loss}`, padding: T.space.xl }}>

              <p className="mono" style={{ fontSize: T.size.micro, letterSpacing: ".24em", textTransform: "uppercase", color: c.loss, marginBottom: 8 }}>
                Confirm removal
              </p>
              <h3 className="display" style={{ fontSize: T.size.xl, marginBottom: 10 }}>
                Remove {confirmDelete.name}?
              </h3>
              <p style={{ fontSize: T.size.sm, color: c.text3, lineHeight: 1.7, marginBottom: T.space.lg }}>
                It disappears from the plans page immediately. Investments already running on this plan
                continue and pay out normally.
              </p>

              <div style={{ border: `1px solid ${c.line}`, padding: `0 ${T.space.lg}px`, marginBottom: T.space.xl }}>
                <LedgerRow small label="Range"
                  value={`$${money(confirmDelete.minAmount)} – $${money(confirmDelete.maxAmount)}`} />
                <LedgerRow small label="Return" value={`${confirmDelete.profitRate}%`} />
                <LedgerRow small label="Duration" value={`${confirmDelete.duration} days`} last />
              </div>

              <div className="grid grid-cols-2" style={{ gap: 8 }}>
                <Button variant="quiet" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                <Button variant="danger" onClick={() => deletePlan(confirmDelete._id)}
                  disabled={actionLoading}
                  icon={actionLoading ? <Spinner size={12} tone={c.loss} /> : <Trash2 size={12} />}>
                  Remove
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
