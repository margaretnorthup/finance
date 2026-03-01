import { useState, useEffect, useRef, useCallback } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const RAW_TRANSACTIONS = [
  { id: 1, date: "2024-01-03", description: "Whole Foods Market", category: "Groceries", amount: -87.43 },
  { id: 2, date: "2024-01-05", description: "Netflix", category: "Entertainment", amount: -15.99 },
  { id: 3, date: "2024-01-05", description: "Salary Deposit", category: "Income", amount: 3200.00 },
  { id: 4, date: "2024-01-08", description: "Shell Gas Station", category: "Transport", amount: -54.20 },
  { id: 5, date: "2024-01-10", description: "Chipotle", category: "Dining", amount: -13.75 },
  { id: 6, date: "2024-01-12", description: "Amazon", category: "Shopping", amount: -132.99 },
  { id: 7, date: "2024-01-15", description: "Planet Fitness", category: "Health", amount: -24.99 },
  { id: 8, date: "2024-01-18", description: "Spotify", category: "Entertainment", amount: -9.99 },
  { id: 9, date: "2024-01-20", description: "Trader Joe's", category: "Groceries", amount: -64.12 },
  { id: 10, date: "2024-01-22", description: "Uber", category: "Transport", amount: -22.50 },
  { id: 11, date: "2024-01-24", description: "CVS Pharmacy", category: "Health", amount: -38.45 },
  { id: 12, date: "2024-01-26", description: "Sweetgreen", category: "Dining", amount: -16.50 },
  { id: 13, date: "2024-01-28", description: "Electric Bill", category: "Utilities", amount: -94.00 },
  { id: 14, date: "2024-01-30", description: "Freelance Payment", category: "Income", amount: 850.00 },
  { id: 15, date: "2024-02-01", description: "Rent", category: "Housing", amount: -1450.00 },
  { id: 16, date: "2024-02-03", description: "Whole Foods Market", category: "Groceries", amount: -91.20 },
  { id: 17, date: "2024-02-05", description: "Salary Deposit", category: "Income", amount: 3200.00 },
  { id: 18, date: "2024-02-07", description: "Movie Theater", category: "Entertainment", amount: -28.00 },
  { id: 19, date: "2024-02-10", description: "Cheesecake Factory", category: "Dining", amount: -67.40 },
  { id: 20, date: "2024-02-12", description: "Target", category: "Shopping", amount: -88.30 },
  { id: 21, date: "2024-02-14", description: "Uber", category: "Transport", amount: -18.75 },
  { id: 22, date: "2024-02-17", description: "Trader Joe's", category: "Groceries", amount: -72.80 },
  { id: 23, date: "2024-02-19", description: "Internet Bill", category: "Utilities", amount: -59.99 },
  { id: 24, date: "2024-02-21", description: "Starbucks", category: "Dining", amount: -6.75 },
  { id: 25, date: "2024-02-23", description: "Apple App Store", category: "Entertainment", amount: -4.99 },
  { id: 26, date: "2024-02-25", description: "Shell Gas Station", category: "Transport", amount: -61.00 },
  { id: 27, date: "2024-02-28", description: "Freelance Payment", category: "Income", amount: 1200.00 },
  { id: 28, date: "2024-03-01", description: "Rent", category: "Housing", amount: -1450.00 },
  { id: 29, date: "2024-03-04", description: "Costco", category: "Groceries", amount: -143.50 },
  { id: 30, date: "2024-03-05", description: "Salary Deposit", category: "Income", amount: 3200.00 },
  { id: 31, date: "2024-03-08", description: "Concert Tickets", category: "Entertainment", amount: -120.00 },
  { id: 32, date: "2024-03-10", description: "Nobu Restaurant", category: "Dining", amount: -189.00 },
  { id: 33, date: "2024-03-12", description: "Nike.com", category: "Shopping", amount: -145.00 },
  { id: 34, date: "2024-03-15", description: "Doctor Copay", category: "Health", amount: -30.00 },
  { id: 35, date: "2024-03-18", description: "Metro Card", category: "Transport", amount: -33.00 },
  { id: 36, date: "2024-03-20", description: "Whole Foods Market", category: "Groceries", amount: -79.65 },
  { id: 37, date: "2024-03-23", description: "Water Bill", category: "Utilities", amount: -42.00 },
  { id: 38, date: "2024-03-25", description: "Hulu", category: "Entertainment", amount: -17.99 },
  { id: 39, date: "2024-03-28", description: "Side Project Income", category: "Income", amount: 600.00 },
  { id: 40, date: "2024-03-30", description: "Gym Equipment", category: "Health", amount: -220.00 },
];

const CATEGORY_COLORS = {
  Groceries:     "#34d399",
  Entertainment: "#a78bfa",
  Transport:     "#60a5fa",
  Dining:        "#fb923c",
  Shopping:      "#f472b6",
  Health:        "#4ade80",
  Utilities:     "#facc15",
  Housing:       "#94a3b8",
  Income:        "#2dd4bf",
};

const MONTHS = ["January", "February", "March"];

// ─── UTILITIES ────────────────────────────────────────────────────────────────
function getMonth(dateStr) {
  return new Date(dateStr).getMonth(); // 0=Jan, 1=Feb, 2=Mar
}

function formatCurrency(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Math.abs(n));
}

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

// ─── ANIMATED NUMBER ─────────────────────────────────────────────────────────
function AnimatedStat({ value, prefix = "$", suffix = "" }) {
  const animated = useCountUp(Math.abs(value));
  return (
    <span>
      {prefix}{animated.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{suffix}
    </span>
  );
}

// ─── CUSTOM TOOLTIP ──────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(15,17,23,0.95)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10,
      padding: "10px 16px",
      fontSize: 13,
      fontFamily: "'DM Sans', sans-serif",
      color: "#e2e8f0",
      backdropFilter: "blur(8px)",
    }}>
      <div style={{ marginBottom: 4, opacity: 0.6, fontSize: 11 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#fff" }}>
          {p.name}: <strong>${Math.abs(p.value).toFixed(2)}</strong>
        </div>
      ))}
    </div>
  );
}

// ─── CARD WRAPPER ─────────────────────────────────────────────────────────────
function Card({ children, style = {}, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16,
      padding: 24,
      transition: "opacity 0.6s ease, transform 0.6s ease",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(18px)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, positive, delay }) {
  return (
    <Card delay={delay} style={{ flex: 1, minWidth: 160 }}>
      <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Sora', sans-serif", color: color || "#f1f5f9" }}>
        <AnimatedStat value={value} />
      </div>
    </Card>
  );
}

// ─── MONTH FILTER ─────────────────────────────────────────────────────────────
function MonthFilter({ selected, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {["All", ...MONTHS].map((m) => {
        const active = selected === m;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            style={{
              padding: "7px 16px",
              borderRadius: 100,
              border: active ? "1px solid #34d399" : "1px solid rgba(255,255,255,0.1)",
              background: active ? "rgba(52,211,153,0.12)" : "transparent",
              color: active ? "#34d399" : "rgba(255,255,255,0.5)",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.2s ease",
              letterSpacing: "0.02em",
            }}
          >
            {m}
          </button>
        );
      })}
    </div>
  );
}

// ─── CATEGORY FILTER ─────────────────────────────────────────────────────────
function CategoryFilter({ selected, onChange, categories }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {["All", ...categories].map((c) => {
        const active = selected === c;
        const color = CATEGORY_COLORS[c] || "#94a3b8";
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            style={{
              padding: "6px 14px",
              borderRadius: 100,
              border: `1px solid ${active ? color : "rgba(255,255,255,0.08)"}`,
              background: active ? `${color}18` : "transparent",
              color: active ? color : "rgba(255,255,255,0.4)",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.2s ease",
            }}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}

// ─── AREA CHART: Spending Over Time ──────────────────────────────────────────
function SpendingTrendChart({ transactions }) {
  const byDay = {};
  transactions.filter(t => t.amount < 0).forEach(t => {
    const day = t.date.slice(5); // MM-DD
    byDay[day] = (byDay[day] || 0) + Math.abs(t.amount);
  });
  const data = Object.entries(byDay).sort().map(([day, total]) => ({ day, total: parseFloat(total.toFixed(2)) }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="total" name="Spent" stroke="#34d399" strokeWidth={2} fill="url(#spendGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── BAR CHART: Spending by Category ─────────────────────────────────────────
function CategoryBarChart({ transactions }) {
  const byCat = {};
  transactions.filter(t => t.amount < 0 && t.category !== "Income").forEach(t => {
    byCat[t.category] = (byCat[t.category] || 0) + Math.abs(t.amount);
  });
  const data = Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, total]) => ({ cat, total: parseFloat(total.toFixed(2)), color: CATEGORY_COLORS[cat] }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey="cat" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="total" name="Amount" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color || "#60a5fa"} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── PIE CHART: Category Breakdown ───────────────────────────────────────────
function CategoryPieChart({ transactions }) {
  const byCat = {};
  transactions.filter(t => t.amount < 0 && t.category !== "Income").forEach(t => {
    byCat[t.category] = (byCat[t.category] || 0) + Math.abs(t.amount);
  });
  const data = Object.entries(byCat).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3}>
            {data.map((entry, i) => (
              <Cell key={i} fill={CATEGORY_COLORS[entry.name] || "#64748b"} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.sort((a,b) => b.value - a.value).slice(0,5).map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: CATEGORY_COLORS[d.name] || "#64748b", flexShrink: 0 }} />
            <span style={{ minWidth: 90 }}>{d.name}</span>
            <span style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Sora', sans-serif", fontSize: 11 }}>${d.value.toFixed(0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── INSIGHT CARD ─────────────────────────────────────────────────────────────
function InsightPill({ emoji, label, value, color }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 16px",
      borderRadius: 12,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <span style={{ fontSize: 20 }}>{emoji}</span>
      <div>
        <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: color || "#f1f5f9", fontFamily: "'Sora', sans-serif" }}>{value}</div>
      </div>
    </div>
  );
}

// ─── TRANSACTION ROW ──────────────────────────────────────────────────────────
function TransactionRow({ tx, index }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 40);
    return () => clearTimeout(t);
  }, [index]);
  const isIncome = tx.amount > 0;
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 0",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      transition: "opacity 0.4s ease, transform 0.4s ease",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateX(0)" : "translateX(-12px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `${CATEGORY_COLORS[tx.category] || "#64748b"}18`,
          border: `1px solid ${CATEGORY_COLORS[tx.category] || "#64748b"}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          flexShrink: 0,
        }}>
          {isIncome ? "💸" : getCategoryEmoji(tx.category)}
        </div>
        <div>
          <div style={{ fontSize: 13, color: "#e2e8f0", marginBottom: 2 }}>{tx.description}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontSize: 10,
              color: CATEGORY_COLORS[tx.category] || "#94a3b8",
              background: `${CATEGORY_COLORS[tx.category] || "#64748b"}18`,
              padding: "2px 8px",
              borderRadius: 100,
            }}>{tx.category}</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{tx.date}</span>
          </div>
        </div>
      </div>
      <div style={{
        fontSize: 14,
        fontWeight: 700,
        fontFamily: "'Sora', sans-serif",
        color: isIncome ? "#34d399" : "#f1f5f9",
      }}>
        {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
      </div>
    </div>
  );
}

function getCategoryEmoji(cat) {
  const map = { Groceries: "🛒", Entertainment: "🎬", Transport: "🚗", Dining: "🍽️", Shopping: "🛍️", Health: "💊", Utilities: "⚡", Housing: "🏠" };
  return map[cat] || "💳";
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function FinanceDashboard() {
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered = RAW_TRANSACTIONS.filter(tx => {
    const monthMatch = selectedMonth === "All" || MONTHS[getMonth(tx.date)] === selectedMonth;
    const catMatch = selectedCategory === "All" || tx.category === selectedCategory;
    return monthMatch && catMatch;
  });

  const totalIncome = filtered.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalSpent = filtered.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const netSavings = totalIncome - totalSpent;

  // Insights
  const byCat = {};
  filtered.filter(t => t.amount < 0 && t.category !== "Income").forEach(t => {
    byCat[t.category] = (byCat[t.category] || 0) + Math.abs(t.amount);
  });
  const topCategory = Object.entries(byCat).sort((a,b)=>b[1]-a[1])[0];
  const biggestTx = filtered.filter(t => t.amount < 0).sort((a,b) => a.amount - b.amount)[0];
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(0) : 0;

  const categories = [...new Set(RAW_TRANSACTIONS.map(t => t.category))].filter(c => c !== "Income");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0c10",
      color: "#e2e8f0",
      fontFamily: "'DM Sans', sans-serif",
      padding: "32px 24px",
      boxSizing: "border-box",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        button { transition: all 0.2s ease; }
        button:hover { opacity: 0.85; transform: translateY(-1px); }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399" }} />
            <span style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
              Finance Dashboard
            </span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, fontFamily: "'Sora', sans-serif", margin: 0, letterSpacing: "-0.02em" }}>
            Your Money, <span style={{ color: "#34d399" }}>Visualized.</span>
          </h1>
        </div>

        {/* Filters */}
        <Card delay={0} style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 14, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Filter by Month</div>
          <MonthFilter selected={selectedMonth} onChange={setSelectedMonth} />
          <div style={{ marginTop: 16, marginBottom: 14, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Filter by Category</div>
          <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} categories={categories} />
        </Card>

        {/* Stat Cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <StatCard label="Total Income" value={totalIncome} color="#34d399" delay={100} />
          <StatCard label="Total Spent" value={totalSpent} color="#fb923c" delay={180} />
          <StatCard label="Net Savings" value={Math.abs(netSavings)} color={netSavings >= 0 ? "#60a5fa" : "#f87171"} delay={260} />
        </div>

        {/* Insights Row */}
        <Card delay={300} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>Insights</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {topCategory && <InsightPill emoji="📈" label="Top Spending Category" value={`${topCategory[0]} · $${topCategory[1].toFixed(0)}`} color="#fb923c" />}
            {biggestTx && <InsightPill emoji="💸" label="Largest Expense" value={biggestTx.description} color="#f472b6" />}
            <InsightPill emoji="🏦" label="Savings Rate" value={`${savingsRate}% of income`} color={savingsRate >= 20 ? "#34d399" : "#facc15"} />
            <InsightPill emoji="🔢" label="Transactions" value={`${filtered.length} total`} color="#a78bfa" />
          </div>
        </Card>

        {/* Charts Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 24 }}>
          <Card delay={350}>
            <div style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>Spending Trend</div>
            <SpendingTrendChart transactions={filtered} />
          </Card>
          <Card delay={420}>
            <div style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>By Category</div>
            <CategoryBarChart transactions={filtered} />
          </Card>
          <Card delay={490}>
            <div style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>Breakdown</div>
            <CategoryPieChart transactions={filtered} />
          </Card>
        </div>

        {/* Transactions */}
        <Card delay={550}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
              Transactions
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{filtered.length} records</span>
          </div>
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.2)", fontSize: 14 }}>
                No transactions match this filter.
              </div>
            ) : (
              filtered.sort((a,b) => new Date(b.date) - new Date(a.date)).map((tx, i) => (
                <TransactionRow key={tx.id} tx={tx} index={i} />
              ))
            )}
          </div>
        </Card>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 32, fontSize: 11, color: "rgba(255,255,255,0.15)", letterSpacing: "0.06em" }}>
          Built with React · TypeScript · Recharts · Portfolio Project
        </div>
      </div>
    </div>
  );
}
