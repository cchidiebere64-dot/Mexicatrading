import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiggyBank, Wallet, LineChart, Lock, Calendar, ShieldCheck, AlertTriangle, CheckCircle2, Plus, X, Settings, Rocket, Banknote, CircleDollarSign, Timer, Info } from "lucide-react";

// ============================
// Mexicatrading – Investment Prototype (Front‑End Only)
// No real payments, no real returns. Demo logic stored in localStorage.
// ============================

// ----- Types -----
const PLANS_PRESET = [
  {
    id: "starter",
    name: "Starter",
    min: 50,
    max: 999,
    durationDays: 15,
    totalReturnPct: 6, // total over duration (not APR)
    payout: "end", // "end" | "daily"
    icon: PiggyBank,
  },
  {
    id: "growth",
    name: "Growth",
    min: 1000,
    max: 4999,
    durationDays: 30,
    totalReturnPct: 14,
    payout: "daily",
    icon: LineChart,
  },
  {
    id: "premium",
    name: "Premium",
    min: 5000,
    max: 19999,
    durationDays: 60,
    totalReturnPct: 32,
    payout: "daily",
    icon: Rocket,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    min: 20000,
    max: 1000000,
    durationDays: 90,
    totalReturnPct: 75,
    payout: "weekly",
    icon: ShieldCheck,
  },
];

const STORAGE_KEY = "mexicatrading_demo_v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatCurrency(n, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function daysBetween(a, b) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// Accrual model: linear accrual of the profit portion across durationDays.
// For payout === "end", earnings are shown as accruing but only withdrawable at maturity.
function computeAccrual(investment, today = new Date()) {
  const plan = investment.plan;
  const start = new Date(investment.startDate);
  const end = addDays(start, plan.durationDays);
  const daysElapsed = clamp(daysBetween(start, today), 0, plan.durationDays);
  const totalProfit = (investment.amount * plan.totalReturnPct) / 100;
  const accruedProfit = (totalProfit * daysElapsed) / plan.durationDays;
  const principal = investment.amount;
  const totalAtMaturity = principal + totalProfit;
  const matured = today >= end;

  return {
    start,
    end,
    daysElapsed,
    totalProfit,
    accruedProfit,
    principal,
    totalAtMaturity,
    matured,
  };
}

// ----- Main App -----
export default function MexicatradingApp() {
  const [currency, setCurrency] = useState("USD");
  const [plans, setPlans] = useState(PLANS_PRESET);
  const [investments, setInvestments] = useState([]);
  const [wallet, setWallet] = useState({ available: 0, withdrawnTotal: 0, depositedTotal: 0 });
  const [activeTab, setActiveTab] = useState("home");
  const [showInvest, setShowInvest] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    const persisted = loadState();
    if (persisted) {
      setCurrency(persisted.currency || "USD");
      setPlans(persisted.plans || PLANS_PRESET);
      setInvestments(persisted.investments || []);
      setWallet(persisted.wallet || { available: 0, withdrawnTotal: 0, depositedTotal: 0 });
      setMaintenance(!!persisted.maintenance);
    }
  }, []);

  useEffect(() => {
    saveState({ currency, plans, investments, wallet, maintenance });
  }, [currency, plans, investments, wallet, maintenance]);

  const totals = useMemo(() => {
    let totalPrincipal = 0;
    let totalAccrued = 0;
    let totalAtMaturity = 0;

    investments.forEach((inv) => {
      const calc = computeAccrual(inv);
      totalPrincipal += calc.principal;
      totalAccrued += calc.accruedProfit;
      totalAtMaturity += calc.totalAtMaturity;
    });

    return { totalPrincipal, totalAccrued, totalAtMaturity };
  }, [investments]);

  function handleFakeDeposit() {
    const amount = Number(prompt("Enter amount to credit to your demo wallet:"));
    if (!Number.isFinite(amount) || amount <= 0) return;
    setWallet((w) => ({ ...w, available: w.available + amount, depositedTotal: w.depositedTotal + amount }));
  }

  function handleStartInvest(plan) {
    setSelectedPlan(plan);
    setShowInvest(true);
  }

  function createInvestment(amount, plan) {
    const id = `${plan.id}_${Date.now()}`;
    return {
      id,
      plan,
      amount,
      startDate: new Date().toISOString(),
      withdrawn: false,
    };
  }

  function handleConfirmInvest(amount) {
    if (!selectedPlan) return;
    if (maintenance) {
      alert("Investments are paused (maintenance mode).");
      return;
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt)) return;
    if (amt < selectedPlan.min || amt > selectedPlan.max) {
      alert(`Amount must be between ${formatCurrency(selectedPlan.min, currency)} and ${formatCurrency(selectedPlan.max, currency)} for the ${selectedPlan.name} plan.`);
      return;
    }
    if (amt > wallet.available) {
      alert("Insufficient demo wallet balance. Click 'Add Demo Funds' first.");
      return;
    }

    const inv = createInvestment(amt, selectedPlan);
    setInvestments((arr) => [inv, ...arr]);
    setWallet((w) => ({ ...w, available: w.available - amt }));
    setShowInvest(false);
    setSelectedPlan(null);
    setActiveTab("dashboard");
  }

  function handleWithdraw(inv) {
    const { matured, principal, totalProfit } = computeAccrual(inv);
    if (!matured) {
      alert("This investment has not matured yet.");
      return;
    }
    if (inv.withdrawn) return;

    const payout = principal + totalProfit;
    setInvestments((arr) => arr.map((i) => (i.id === inv.id ? { ...i, withdrawn: true } : i)));
    setWallet((w) => ({ ...w, available: w.available + payout, withdrawnTotal: w.withdrawnTotal + payout }));
  }

  function handleEmergencyWithdraw(inv) {
    // Demo-only: allow early exit with 20% penalty on profit (not principal)
    if (inv.withdrawn) return;
    const calc = computeAccrual(inv);
    if (calc.matured) return;
    const penalty = (calc.totalProfit - calc.accruedProfit) * 0.2; // penalize unrealized portion
    const payout = calc.principal + calc.accruedProfit - penalty;
    if (payout < 0) return;
    if (!window.confirm(`Emergency withdraw will apply a penalty of ${formatCurrency(penalty, currency)}. Proceed?`)) return;

    setInvestments((arr) => arr.filter((i) => i.id !== inv.id));
    setWallet((w) => ({ ...w, available: w.available + payout, withdrawnTotal: w.withdrawnTotal + payout }));
  }

  function resetAll() {
    if (!window.confirm("Reset demo data? This will clear plans, wallet and investments.")) return;
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100">
      <TopBar maintenance={maintenance} setMaintenance={setMaintenance} onDeposit={handleFakeDeposit} onReset={resetAll} />

      <main className="max-w-6xl mx-auto px-4 pb-24">
        <Hero setActiveTab={setActiveTab} />

        <NavTabs active={activeTab} setActive={setActiveTab} />

        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.section
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-8"
            >
              <WhyUs />
              <PlansGrid plans={plans} currency={currency} onInvest={handleStartInvest} />
            </motion.section>
          )}

          {activeTab === "plans" && (
            <motion.section key="plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8">
              <PlansGrid plans={plans} currency={currency} onInvest={handleStartInvest} detailed />
            </motion.section>
          )}

          {activeTab === "dashboard" && (
            <motion.section key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8">
              <Dashboard investments={investments} wallet={wallet} currency={currency} onWithdraw={handleWithdraw} onEmergency={handleEmergencyWithdraw} totals={totals} />
            </motion.section>
          )}

          {activeTab === "admin" && (
            <motion.section key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8">
              <AdminPanel plans={plans} setPlans={setPlans} currency={currency} setCurrency={setCurrency} maintenance={maintenance} setMaintenance={setMaintenance} />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <InvestModal
        open={showInvest}
        onClose={() => setShowInvest(false)}
        plan={selectedPlan}
        currency={currency}
        onConfirm={handleConfirmInvest}
      />

      <Footer />
      <Disclaimer />
    </div>
  );
}

function TopBar({ onDeposit, onReset, maintenance, setMaintenance }) {
  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <CircleDollarSign className="w-6 h-6 text-emerald-400" />
        <span className="font-semibold tracking-wide">Mexicatrading</span>
        <span className="text-xs text-slate-400">Demo Prototype</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={onDeposit} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Demo Funds
          </button>
          <button onClick={() => setMaintenance((m) => !m)} className={`px-3 py-1.5 rounded-xl border text-sm flex items-center gap-2 ${maintenance ? "bg-amber-500/10 border-amber-400/40 text-amber-300" : "bg-slate-800/50 border-white/10 text-slate-300"}`}>
            <Settings className="w-4 h-4" /> {maintenance ? "Maintenance: ON" : "Maintenance: OFF"}
          </button>
          <button onClick={onReset} className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-white/10 text-slate-300 text-sm">Reset</button>
        </div>
      </div>
    </div>
  );
}

function Hero({ setActiveTab }) {
  return (
    <section className="pt-10">
      <div className="rounded-3xl p-6 md:p-10 bg-[radial-gradient(ellipse_at_top_right,rgba(30,64,175,0.35),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.25),transparent_50%)] border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-semibold leading-tight">Invest with clarity on <span className="text-emerald-300">Mexicatrading</span></h1>
            <p className="mt-3 text-slate-300 max-w-prose">This is a <strong>front-end demo</strong> showing how plans, accruals, and withdrawals could look. Use <em>Add Demo Funds</em> to credit your wallet, pick a plan, and watch earnings accrue over time.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setActiveTab("plans")} className="px-4 py-2 rounded-2xl bg-emerald-500 text-slate-900 font-semibold shadow">View Plans</button>
              <button onClick={() => setActiveTab("dashboard")} className="px-4 py-2 rounded-2xl bg-slate-800 border border-white/10">Open Dashboard</button>
            </div>
          </div>
          <div className="w-full md:w-80">
            <StatsCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsCard() {
  return (
    <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-5">
      <div className="flex items-center gap-2 text-slate-300"><Banknote className="w-4 h-4" /> Demo Metrics</div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-slate-400">Mock AUM</div>
          <div className="text-xl font-semibold">$1.2M</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Active Investors</div>
          <div className="text-xl font-semibold">3,421</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Avg. Plan Yield</div>
          <div className="text-xl font-semibold">+17%</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Uptime (demo)</div>
          <div className="text-xl font-semibold">99.9%</div>
        </div>
      </div>
    </div>
  );
}

function NavTabs({ active, setActive }) {
  const tabs = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "plans", label: "Plans", icon: LineChart },
    { id: "dashboard", label: "Dashboard", icon: Wallet },
    { id: "admin", label: "Admin (Demo)", icon: Settings },
  ];

  return (
    <div className="mt-8 flex gap-2 p-1 bg-slate-900/70 border border-white/10 rounded-2xl w-full overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setActive(t.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap ${active === t.id ? "bg-slate-800 text-emerald-300" : "text-slate-300 hover:bg-slate-800/50"}`}
        >
          <t.icon className="w-4 h-4" /> {t.label}
        </button>
      ))}
    </div>
  );
}

function HomeIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${props.className || ""}`}>
      <path d="M2.25 12l9-7.5L20.25 12V21a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5h-3v4.5a.75.75 0 01-.75.75H3a.75.75 0 01-.75-.75V12z" />
    </svg>
  );
}

function WhyUs() {
  const perks = [
    { icon: ShieldCheck, title: "Security-first design", desc: "Modern front-end patterns, role-based access placeholders, and safe demo storage." },
    { icon: Timer, title: "Clear durations", desc: "Plans display lock periods and how earnings accrue over time." },
    { icon: Calendar, title: "Maturity logic", desc: "Withdraw buttons unlock at maturity in this demo." },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {perks.map((p, i) => (
        <div key={i} className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 text-emerald-300"><p.icon className="w-4 h-4" /> {p.title}</div>
          <p className="mt-2 text-sm text-slate-300">{p.desc}</p>
        </div>
      ))}
    </div>
  );
}

function PlansGrid({ plans, currency, onInvest, detailed = false }) {
  return (
    <div className="mt-6 grid md:grid-cols-2 xl:grid-cols-4 gap-4">
      {plans.map((p) => (
        <div key={p.id} className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 flex flex-col">
          <div className="flex items-center gap-2 text-emerald-300">
            <p.icon className="w-5 h-5" />
            <h3 className="text-lg font-semibold">{p.name}</h3>
          </div>
          <div className="mt-2 text-2xl font-bold">{p.totalReturnPct}% <span className="text-sm font-normal text-slate-400">total</span></div>
          <div className="mt-1 text-slate-300 text-sm flex items-center gap-2"><Lock className="w-4 h-4" /> {p.durationDays} days lock</div>
          <div className="mt-1 text-slate-300 text-sm">Range: {formatCurrency(p.min, currency)} – {formatCurrency(p.max, currency)}</div>
          <div className="mt-1 text-slate-400 text-xs">Payout: {p.payout}</div>

          {detailed && (
            <div className="mt-3 text-xs text-slate-400">
              Earnings accrue linearly in this demo. Real platforms may use compounding, hurdle rates, fees, and risk disclosures.
            </div>
          )}

          <div className="mt-4 p-3 rounded-2xl bg-slate-800/60 border border-white/10">
            <PlanCalculator plan={p} currency={currency} />
          </div>

          <button onClick={() => onInvest(p)} className="mt-4 px-4 py-2 rounded-2xl bg-emerald-500 text-slate-900 font-semibold shadow hover:brightness-95">Invest in {p.name}</button>
        </div>
      ))}
    </div>
  );
}

function PlanCalculator({ plan, currency }) {
  const [amount, setAmount] = useState(plan.min);
  const totalProfit = (amount * plan.totalReturnPct) / 100;
  const totalPayout = amount + totalProfit;

  return (
    <div>
      <label className="text-xs text-slate-400">Amount</label>
      <input
        type="number"
        min={plan.min}
        max={plan.max}
        value={amount}
        onChange={(e) => setAmount(clamp(Number(e.target.value || 0), plan.min, plan.max))}
        className="mt-1 w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400/40"
      />
      <div className="mt-2 text-sm text-slate-300 flex items-center gap-2"><Info className="w-4 h-4" /> Est. Payout at {plan.durationDays}d: <span className="font-semibold">{formatCurrency(totalPayout, currency)}</span> (<span className="text-emerald-300">+{formatCurrency(totalProfit, currency)}</span>)</div>
    </div>
  );
}

function Dashboard({ investments, wallet, currency, onWithdraw, onEmergency, totals }) {
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 text-emerald-300"><Wallet className="w-4 h-4" /> Wallet</div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryTile label="Available" value={formatCurrency(wallet.available, currency)} />
            <SummaryTile label="Total Deposited" value={formatCurrency(wallet.depositedTotal, currency)} />
            <SummaryTile label="Total Withdrawn" value={formatCurrency(wallet.withdrawnTotal, currency)} />
            <SummaryTile label="Projected @ Maturity" value={formatCurrency(totals.totalAtMaturity, currency)} />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 text-emerald-300"><LineChart className="w-4 h-4" /> Investments</div>
          {investments.length === 0 ? (
            <div className="mt-4 text-slate-400 text-sm">No investments yet. Add demo funds and choose a plan.</div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-400">
                  <tr>
                    <th className="py-2">Plan</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Start</th>
                    <th className="py-2">Maturity</th>
                    <th className="py-2">Accrued</th>
                    <th className="py-2">Total @ End</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((inv) => {
                    const c = computeAccrual(inv);
                    return (
                      <tr key={inv.id} className="border-t border-white/5">
                        <td className="py-2">{inv.plan.name}</td>
                        <td className="py-2">{formatCurrency(inv.amount, currency)}</td>
                        <td className="py-2">{new Date(inv.startDate).toLocaleDateString()}</td>
                        <td className="py-2">{c.end.toLocaleDateString()}</td>
                        <td className="py-2 text-emerald-300">{formatCurrency(c.accruedProfit, currency)}</td>
                        <td className="py-2">{formatCurrency(c.totalAtMaturity, currency)}</td>
                        <td className="py-2">
                          {inv.withdrawn ? (
                            <span className="text-emerald-300 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Paid</span>
                          ) : c.matured ? (
                            <span className="text-emerald-300">Matured</span>
                          ) : (
                            <span className="text-slate-400">In progress</span>
                          )}
                        </td>
                        <td className="py-2">
                          {!inv.withdrawn && (
                            <div className="flex gap-2">
                              <button onClick={() => onWithdraw(inv)} disabled={!c.matured}
                                className={`px-3 py-1.5 rounded-xl text-sm ${c.matured ? "bg-emerald-500 text-slate-900" : "bg-slate-800 text-slate-400 cursor-not-allowed"}`}>Withdraw</button>
                              {!c.matured && (
                                <button onClick={() => onEmergency(inv)} className="px-3 py-1.5 rounded-xl text-sm bg-amber-500/20 text-amber-200 border border-amber-400/30">Emergency</button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 text-emerald-300"><AlertTriangle className="w-4 h-4" /> Demo Notice</div>
          <p className="mt-2 text-sm text-slate-300">This dashboard simulates accruals locally in your browser for demonstration. It is not financial advice and does not process real transactions.</p>
        </div>
        <KpiCard label="Total Principal" value={formatCurrency(totals.totalPrincipal, currency)} />
        <KpiCard label="Accrued Profit (to date)" value={formatCurrency(totals.totalAccrued, currency)} />
        <KpiCard label="Projected @ Maturity" value={formatCurrency(totals.totalAtMaturity, currency)} />
      </div>
    </div>
  );
}

function SummaryTile({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-800/60 border border-white/10 p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function KpiCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function InvestModal({ open, onClose, plan, currency, onConfirm }) {
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    if (plan) setAmount(plan.min);
  }, [plan]);

  return (
    <AnimatePresence>
      {open && plan && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="w-full max-w-md rounded-3xl bg-slate-900 border border-white/10 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300"><plan.icon className="w-5 h-5" /> Invest in {plan.name}</div>
              <button onClick={onClose} className="p-1 rounded-xl hover:bg-slate-800"><X className="w-4 h-4" /></button>
            </div>
            <div className="mt-3 text-sm text-slate-300">Range: {formatCurrency(plan.min, currency)} – {formatCurrency(plan.max, currency)} · Lock: {plan.durationDays} days</div>
            <div className="mt-4">
              <label className="text-xs text-slate-400">Amount</label>
              <input type="number" value={amount} min={plan.min} max={plan.max}
                     onChange={(e) => setAmount(clamp(Number(e.target.value || 0), plan.min, plan.max))}
                     className="mt-1 w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400/40" />
              <div className="mt-2 text-sm">Est. Profit: <span className="text-emerald-300 font-semibold">{formatCurrency((amount * plan.totalReturnPct) / 100, currency)}</span></div>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => onConfirm(amount)} className="flex-1 px-4 py-2 rounded-2xl bg-emerald-500 text-slate-900 font-semibold">Confirm</button>
              <button onClick={onClose} className="px-4 py-2 rounded-2xl bg-slate-800 border border-white/10">Cancel</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AdminPanel({ plans, setPlans, currency, setCurrency, maintenance, setMaintenance }) {
  const [drafts, setDrafts] = useState(plans);
  useEffect(() => setDrafts(plans), [plans]);

  function updateDraft(id, field, value) {
    setDrafts((arr) => arr.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }

  function saveDrafts() {
    setPlans(drafts);
  }

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-slate-900/60 p-5">
        <div className="flex items-center gap-2 text-emerald-300"><Settings className="w-4 h-4" /> Plan Editor</div>
        <div className="mt-4 flex flex-col gap-4">
          {drafts.map((p) => (
            <div key={p.id} className="rounded-2xl bg-slate-800/60 border border-white/10 p-4">
              <div className="flex items-center gap-2 text-slate-200 font-semibold"><p.icon className="w-4 h-4" /> {p.name}</div>
              <div className="mt-3 grid md:grid-cols-5 gap-3 text-sm">
                <LabeledInput label="Min" type="number" value={p.min} onChange={(v) => updateDraft(p.id, "min", Number(v))} />
                <LabeledInput label="Max" type="number" value={p.max} onChange={(v) => updateDraft(p.id, "max", Number(v))} />
                <LabeledInput label="Duration (days)" type="number" value={p.durationDays} onChange={(v) => updateDraft(p.id, "durationDays", Number(v))} />
                <LabeledInput label="Total Return %" type="number" value={p.totalReturnPct} onChange={(v) => updateDraft(p.id, "totalReturnPct", Number(v))} />
                <LabeledSelect label="Payout" value={p.payout} onChange={(v) => updateDraft(p.id, "payout", v)} options={["end", "daily", "weekly"]} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={saveDrafts} className="px-4 py-2 rounded-2xl bg-emerald-500 text-slate-900 font-semibold">Save Plans</button>
          <button onClick={() => setDrafts(PLANS_PRESET)} className="px-4 py-2 rounded-2xl bg-slate-800 border border-white/10">Reset to Preset</button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
        <div className="flex items-center gap-2 text-emerald-300"><Settings className="w-4 h-4" /> Platform Settings</div>
        <div className="mt-4 flex flex-col gap-3 text-sm">
          <LabeledSelect label="Currency" value={currency} onChange={setCurrency} options={["USD", "EUR", "GBP", "NGN", "MXN"]} />
          <div className="flex items-center justify-between bg-slate-800/60 border border-white/10 rounded-2xl p-3">
            <div>
              <div className="text-slate-200">Maintenance Mode</div>
              <div className="text-xs text-slate-400">Pause new investments</div>
            </div>
            <button onClick={() => setMaintenance((m) => !m)} className={`px-3 py-1.5 rounded-xl text-sm ${maintenance ? "bg-amber-500/20 text-amber-200 border border-amber-400/30" : "bg-slate-800 border border-white/10"}`}>{maintenance ? "ON" : "OFF"}</button>
          </div>
          <div className="rounded-2xl bg-slate-800/60 border border-white/10 p-3 text-xs text-slate-300">
            <strong>Note:</strong> This is a front‑end demo. Real deployments require KYC/AML, licensing, audited returns logic, payment rails, and security hardening.
          </div>
        </div>
      </div>
    </div>
  );
}

function LabeledInput({ label, type = "text", value, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-slate-400">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="rounded-xl bg-slate-950 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400/40" />
    </label>
  );
}

function LabeledSelect({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-slate-400">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-xl bg-slate-950 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400/40">
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
  );
}

function Footer() {
  return (
    <footer className="mt-16 text-center text-xs text-slate-500">
      © {new Date().getFullYear()} Mexicatrading — Demo UI. All numbers are illustrative.
    </footer>
  );
}

function Disclaimer() {
  return (
    <div className="fixed bottom-4 right-4 max-w-sm rounded-2xl bg-slate-900/90 border border-white/10 p-3 shadow-xl">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-300" />
        <div className="text-xs text-slate-300">
          <strong>Important:</strong> This is a <em>front‑end prototype</em> for demonstration. It does not accept real deposits, does not provide investment advice, and includes no licensing or compliance features.
        </div>
      </div>
    </div>
  );
}






