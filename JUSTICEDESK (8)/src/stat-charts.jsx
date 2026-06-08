// ─── Statistics page — chart primitives ─────────────────────────────────────
// Restrained, judicial-register charts: muted earthy inks, mono numerals,
// no gradients. Built to match the dashboard's visual vocabulary.

// Categorical palette — derived from the deep-teal accent + warm court hues.
const STAT_PALETTE = [
  "#1f3a3d", // accent teal-ink
  "#5a4a1f", // warm ochre-ink
  "#3a3a30", // graphite
  "#6b4630", // umber
  "#2d5a3d", // forest
  "#7a5a5a", // muted rose-brown
  "#3d4a6b", // slate blue
  "#5a3a52", // plum
  "#4a5a2d", // olive
  "#8b6914", // brass (warn)
];

// ── KPI tile ────────────────────────────────────────────────────────────────
const StatTile = ({ label, value, sub, accent, onClick }) => (
  <button onClick={onClick} disabled={!onClick} style={{
    background: "var(--paper)", border: "1px solid var(--line)",
    borderRadius: 10, padding: "15px 16px",
    display: "flex", flexDirection: "column", gap: 5,
    textAlign: "left", font: "inherit", color: "inherit",
    cursor: onClick ? "pointer" : "default",
    transition: "border-color .12s",
  }}
  onMouseEnter={(e) => { if (onClick) e.currentTarget.style.borderColor = "var(--line-2)"; }}
  onMouseLeave={(e) => { if (onClick) e.currentTarget.style.borderColor = "var(--line)"; }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {accent && <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent }}/>}
      <span style={{ fontSize: 10.5, color: "var(--text-3)", letterSpacing: "0.06em",
        textTransform: "uppercase", fontWeight: 500 }}>{label}</span>
    </div>
    <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1 }}>
      {value}
    </div>
    {sub && <div style={{ fontSize: 11, color: "var(--text-3)" }}>{sub}</div>}
  </button>
);

// ── Card wrapper with title for a chart ──────────────────────────────────────
const ChartCard = ({ title, hint, right, children, style = {} }) => (
  <div style={{
    background: "var(--paper)", border: "1px solid var(--line)",
    borderRadius: 10, padding: "16px 18px", ...style,
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      marginBottom: 14, gap: 12 }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.005em" }}>{title}</div>
        {hint && <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{hint}</div>}
      </div>
      {right}
    </div>
    {children}
  </div>
);

// ── Horizontal bar list ──────────────────────────────────────────────────────
// data: [{ label, value, color? }]
const BarList = ({ data, total, colored = false, unit = "" }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  const sum = total ?? data.reduce((a, d) => a + d.value, 0);
  if (data.length === 0) {
    return <div style={{ fontSize: 12, color: "var(--text-3)", fontStyle: "italic", padding: "6px 0" }}>No data.</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {data.map((d, i) => {
        const pct = Math.round((d.value / max) * 100);
        const share = sum ? Math.round((d.value / sum) * 100) : 0;
        const color = d.color || (colored ? STAT_PALETTE[i % STAT_PALETTE.length] : "var(--ink)");
        return (
          <div key={d.label}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
              marginBottom: 5, gap: 10 }}>
              <span style={{ fontSize: 12.5, color: "var(--text)", overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</span>
              <span style={{ display: "flex", alignItems: "baseline", gap: 6, flexShrink: 0 }}>
                <span className="mono" style={{ fontSize: 12.5, fontWeight: 500 }}>{d.value}{unit}</span>
                {sum > 0 && <span style={{ fontSize: 10.5, color: "var(--text-3)", minWidth: 30,
                  textAlign: "right" }}>{share}%</span>}
              </span>
            </div>
            <div style={{ height: 6, background: "var(--paper-3)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3,
                transition: "width .4s ease" }}/>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Donut chart ──────────────────────────────────────────────────────────────
// data: [{ label, value, color }]
const Donut = ({ data, size = 132, thickness = 18, centerLabel, centerValue }) => {
  const sum = data.reduce((a, d) => a + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke="var(--paper-3)" strokeWidth={thickness}/>
          {data.map((d, i) => {
            const frac = d.value / sum;
            const len = frac * c;
            const seg = (
              <circle key={d.label} cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={d.color || STAT_PALETTE[i % STAT_PALETTE.length]} strokeWidth={thickness}
                strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset}
                strokeLinecap="butt"/>
            );
            offset += len;
            return seg;
          })}
        </g>
        <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: 26, fontWeight: 500, fill: "var(--text)", letterSpacing: "-0.03em" }}
          className="mono">{centerValue}</text>
        <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: 9.5, fill: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {centerLabel}</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {data.map((d, i) => {
          const share = Math.round((d.value / sum) * 100);
          return (
            <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, flexShrink: 0,
                background: d.color || STAT_PALETTE[i % STAT_PALETTE.length] }}/>
              <span style={{ fontSize: 12, color: "var(--text-2)", flex: 1 }}>{d.label}</span>
              <span className="mono" style={{ fontSize: 12, fontWeight: 500 }}>{d.value}</span>
              <span style={{ fontSize: 10.5, color: "var(--text-3)", minWidth: 30, textAlign: "right" }}>{share}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Column chart (time series) ───────────────────────────────────────────────
// data: [{ label, value }]
const ColumnChart = ({ data, height = 120, color = "var(--ink)" }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height,
        borderBottom: "1px solid var(--line)", paddingBottom: 0 }}>
        {data.map((d, i) => {
          const h = Math.max(2, (d.value / max) * (height - 18));
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "flex-end", gap: 4, minWidth: 0 }}>
              <span className="mono" style={{ fontSize: 10, color: "var(--text-3)",
                opacity: d.value ? 1 : 0 }}>{d.value}</span>
              <div title={`${d.label}: ${d.value}`} style={{
                width: "100%", maxWidth: 34, height: h, background: color,
                borderRadius: "2px 2px 0 0", transition: "height .4s ease",
              }}/>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: "var(--text-3)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Mini progress row (targets) ──────────────────────────────────────────────
const ProgressRow = ({ label, current, metric, sub }) => {
  const pct = Math.min(100, Math.round((current / (metric || 1)) * 100));
  const color = pct >= 80 ? "var(--success)" : pct >= 50 ? "var(--ink)" : "var(--warn)";
  return (
    <div style={{ padding: "10px 0", borderTop: "1px solid var(--line-soft)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, fontWeight: 500 }}>{label}</span>
        <span style={{ display: "flex", alignItems: "baseline", gap: 8, flexShrink: 0 }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>{current}/{metric}</span>
          <span style={{ fontSize: 13, fontWeight: 500, color, minWidth: 38, textAlign: "right" }}>{pct}%</span>
        </span>
      </div>
      <div style={{ height: 5, background: "var(--paper-3)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3 }}/>
      </div>
      {sub && <div style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 5 }}>{sub}</div>}
    </div>
  );
};

Object.assign(window, { STAT_PALETTE, StatTile, ChartCard, BarList, Donut, ColumnChart, ProgressRow });
