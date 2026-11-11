import { useEffect, useMemo, useRef, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownLeft, ArrowUpRight, ChartNoAxesCombined, ChevronRight, CircleHelp, CreditCard, Landmark, LayoutDashboard, Search, Sparkles, Wallet, X } from 'lucide-react';
import { money, summarize, type DashboardData } from '../shared/finance';

type Period = 'day' | 'week' | 'month' | 'custom';
export function App() {
  const [data, setData] = useState<DashboardData>();
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<Period>('month');
  const [query, setQuery] = useState('');
  const [customStart, setCustomStart] = useState('2026-11-01');
  const [customEnd, setCustomEnd] = useState('2026-11-10');
  const [info, setInfo] = useState(false);
  const [reload, setReload] = useState(0);
  const installDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    const endpoint = import.meta.env.MODE === 'pages'
      ? `${import.meta.env.BASE_URL}demo/dashboard.json`
      : '/api/demo/dashboard';
    fetch(endpoint, { signal: controller.signal, cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('The sample dashboard could not load. Check your connection and try again.'); return r.json(); })
      .then((result: DashboardData) => { setData(result); setError(''); })
      .catch((e: Error) => { if (e.name !== 'AbortError') setError(e.message); });
    return () => controller.abort();
  }, [reload]);
  const end = period === 'custom' ? customEnd : data?.asOf ?? '2026-11-10';
  const start = period === 'custom' ? customStart : period === 'day' ? end : period === 'week'
    ? new Date(Date.parse(`${end}T12:00:00Z`) - 6 * 86400000).toISOString().slice(0, 10) : `${end.slice(0, 7)}-01`;
  const invalidRange = !start || !end || start > end || (data !== undefined && end > data.asOf);
  const summary = data && !invalidRange ? summarize(data, start, end) : undefined;
  const transactions = data?.transactions.filter(t => t.date >= start && t.date <= end) ?? [];
  const visible = transactions.filter(t => `${t.description} ${t.category}`.toLowerCase().includes(query.toLowerCase()));
  const chart = useMemo(() => {
    if (!data || invalidRange) return [];
    const dates = [...new Set([...data.transactions.map(t => t.date), ...data.earnings.map(e => e.date)])]
      .filter(d => d >= start && d <= end).sort();
    return dates.map(date => {
      const day = summarize(data, date, date);
      return { date: date.slice(5), deposits: day.depositedCents / 100, spending: day.expenseCents / 100 };
    });
  }, [data, start, end, invalidRange]);
  const categories = [...new Set(transactions.filter(t => !t.pending && ['expense', 'refund'].includes(t.kind)).map(t => t.category))]
    .map(name => ({ name, cents: -transactions.filter(t => t.category === name && !t.pending && ['expense', 'refund'].includes(t.kind)).reduce((n, t) => n + t.cents, 0) }))
    .sort((a, b) => b.cents - a.cents);

  return <div className="shell">
    <aside className="sidebar">
      <a className="brand" href="#"><span className="brand-mark"><ChartNoAxesCombined size={22} /></span>ledger<span className="brand-dot">.</span></a>
      <div className="workspace"><span className="avatar">JL</span><div><strong>Personal workspace</strong><small>Sample account</small></div></div>
      <p className="nav-label">YOUR FINANCES</p>
      <nav aria-label="Main navigation">
        <a className="active" href="#overview"><LayoutDashboard size={18} />Overview</a>
        <a href="#transactions"><CreditCard size={18} />Transactions</a>
        <button onClick={() => setInfo(true)}><Landmark size={18} />Connections<span className="nav-count">0</span></button>
      </nav>
      <div className="sidebar-bottom"><div className="private-icon"><Wallet size={19} /></div><strong>A little more clarity.</strong><p>One place for your income,<br />spending, and what's next.</p><button onClick={() => setInfo(true)}><CircleHelp size={16} />About this demo</button></div>
    </aside>
    <main id="overview">
      <header className="topbar"><span>Workspace <ChevronRight size={14} /> <strong>Overview</strong></span><span className="topbar-actions"><button className="install-trigger" onClick={() => installDialog.current?.showModal()}>Install app</button><span className="demo-pill"><span />Demo workspace</span></span></header>
      <div className="content">
        <div className="page-heading"><div><p className="eyebrow">YOUR MONEY, AT A GLANCE</p><h1>A clearer picture.</h1><p>Know where you stand. Make room for what's next.</p></div><button className="outline-button" onClick={() => setInfo(true)}><Landmark size={16} />Manage connections</button></div>
        <div className="demo-banner"><Sparkles size={18} /><span><strong>A preview of your finances.</strong> All figures are fictional. No bank or Outlier account is connected.</span><button onClick={() => setInfo(true)}>Learn more <ArrowUpRight size={14} /></button></div>
        <div className="period-row"><div className="segmented" aria-label="Reporting period">{(['day', 'week', 'month', 'custom'] as const).map(p => <button key={p} aria-pressed={p === period} className={p === period ? 'selected' : ''} onClick={() => setPeriod(p)}>{p === 'custom' ? 'Custom' : `This ${p}`}</button>)}</div><span className="date-label">{start} — {end}</span></div>
        {period === 'custom' && <div className="custom-dates"><label>From <input type="date" value={customStart} max={data?.asOf} onChange={e => setCustomStart(e.target.value)} /></label><label>To <input type="date" value={customEnd} max={data?.asOf} onChange={e => setCustomEnd(e.target.value)} /></label></div>}
        {error && <div className="message" role="alert">{error} <button onClick={() => setReload(n => n + 1)}>Retry</button></div>}
        {!data && !error && <p role="status">Loading your demo workspace…</p>}
        {invalidRange && <p role="alert">Choose a valid range ending on or before the sample snapshot date.</p>}
        {data && summary && <>
          <section className="stats" aria-label="Financial summary">
            <Stat label="Available balance" value={money(data.availableCents)} note={`Sample bank snapshot · ${data.asOf}`} featured />
            <Stat label="Earned in period" value={money(summary.earnedCents)} note="Outlier earnings · sample data" />
            <Stat label="Spent in period" value={money(summary.expenseCents)} note="Posted expenses, less refunds" />
            <Stat label="Net cash flow" value={money(summary.netCents)} note="Deposited income minus expenses" />
            <Stat label="Awaiting payment" value={money(summary.awaitingCents)} note="All unpaid earnings as of snapshot" />
            <Stat label="Projected balance" value={money(summary.projectedCents)} note="Estimate · available + unpaid earnings" />
          </section>
          <div className="charts-grid">
            <section className="panel cashflow"><div className="panel-heading"><div><h2>Money in, money out</h2><p>Posted bank activity for the selected period</p></div><span className="subtle-icon"><ChartNoAxesCombined size={18} /></span></div><div className="chart-legend"><span><i className="green-dot" />Deposited income</span><span><i className="purple-dot" />Spending</span></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#209477" stopOpacity={0.16} /><stop offset="100%" stopColor="#209477" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#eceff1" /><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#818994', fontSize: 11 }} dy={8} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#818994', fontSize: 11 }} tickFormatter={v => `$${v}`} width={54} /><Tooltip formatter={value => money(Math.round(Number(value) * 100))} /><Area isAnimationActive={false} name="Deposited income" type="linear" dataKey="deposits" stroke="#209477" strokeWidth={2.5} fill="url(#incomeFill)" /><Area isAnimationActive={false} name="Spending" type="linear" dataKey="spending" stroke="#9586c8" strokeWidth={2} fill="transparent" /></AreaChart></ResponsiveContainer></div></section>
            <section className="panel"><div className="panel-heading"><div><h2>Where it went</h2><p>Spending by category</p></div></div><div className="category-total">{money(summary.expenseCents)}<span>total spent</span></div><div className="category-list">{categories.map((c, i) => <div key={c.name}><div className="category-label"><span><i style={{ background: ['#258b73', '#9385ba', '#e0ad62', '#7299b2', '#bb8d94'][i % 5] }} />{c.name}</span><strong>{money(c.cents)}</strong></div><div className="bar-track"><div style={{ width: `${Math.max(0, Math.min(100, c.cents / Math.max(summary.expenseCents, 1) * 100))}%`, background: ['#258b73', '#9385ba', '#e0ad62', '#7299b2', '#bb8d94'][i % 5] }} /></div></div>)}{!categories.length && <p>No posted spending in this period.</p>}</div></section>
          </div>
          <section className="panel transactions" id="transactions"><div className="panel-heading"><div><h2>Recent transactions</h2><p>A closer look at your day-to-day</p></div><label className="search"><Search size={16} /><input aria-label="Search transactions" placeholder="Search transactions…" value={query} onChange={e => setQuery(e.target.value)} /></label></div><div className="table-scroll"><table><thead><tr><th>Transaction</th><th>Category</th><th>Date</th><th>Status</th><th className="amount">Amount</th></tr></thead><tbody>{visible.map(t => <tr key={t.id}><td><span className={`transaction-icon ${t.cents > 0 ? 'income' : ''}`}>{t.cents > 0 ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</span><strong>{t.description}</strong></td><td>{t.category}</td><td>{t.date.slice(5)}</td><td><span className={t.pending ? 'status pending' : 'status'}>{t.pending ? 'Pending' : 'Posted'}</span></td><td className={`amount ${t.cents > 0 ? 'positive' : ''}`}>{t.cents > 0 ? '+' : ''}{money(t.cents)}</td></tr>)}</tbody></table>{!visible.length && <p className="empty-state">No transactions match this view.</p>}</div><div className="table-footer">{visible.length} transactions · transfers and pending charges excluded from cash flow</div></section>
          <footer>USD · Synthetic snapshot as of {data.asOf}<span><span className="tiny-dot" />No live synchronization</span></footer>
        </>}
      </div>
    </main>
    {info && <div className="modal-backdrop" onClick={() => setInfo(false)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="info-title" onClick={e => e.stopPropagation()} onKeyDown={e => { if (e.key === 'Escape') setInfo(false); }}><button autoFocus className="close" aria-label="Close" onClick={() => setInfo(false)}><X size={20} /></button><Landmark size={28} /><h2 id="info-title">Your connections, clearly labeled.</h2><p>This workspace contains fictional data only. Synovus and Outlier are not connected.</p><ul><li><strong>Synovus:</strong> current Plaid institution support, product access, pricing, and production authorization still need verification.</li><li><strong>Outlier:</strong> no authorized contributor earnings API has been verified. No scraping or browser automation is enabled.</li><li><strong>Before real data:</strong> implement authentication, encrypted token storage, and secure connection controls.</li></ul><p>Available balance is a bank snapshot. Projected balance includes unpaid earnings and is not spendable cash.</p><button className="primary-button" onClick={() => setInfo(false)}>Back to overview</button></section></div>}
    <dialog className="install-dialog" ref={installDialog} aria-labelledby="install-title">
      <form method="dialog"><button className="close" aria-label="Close install instructions"><X size={20} /></button></form>
      <Wallet size={28} /><h2 id="install-title">Keep Ledger on your Home Screen.</h2>
      <p>On your iPhone:</p><ol><li>Open this website in <strong>Safari</strong>.</li><li>Tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.</li><li>Keep <strong>Open as Web App</strong> enabled if shown, then tap <strong>Add</strong>.</li></ol>
      <p>On Android, open the browser menu and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>
      <p>The app uses sample data and needs an internet connection. Your computer does not need to stay on once the website is hosted.</p>
    </dialog>
  </div>;
}

function Stat({ label, value, note, featured = false }: { label: string; value: string; note: string; featured?: boolean }) {
  return <article className={`stat ${featured ? 'featured' : ''}`}><p>{label}{featured && <Wallet size={17} />}</p><strong>{value}</strong><small>{note}</small></article>;
}
