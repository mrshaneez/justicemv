// ─── Command palette (global search) ────────────────────────────────────────
//
// Searches across cases, people, sections, courtroom bookings, tasks/requests,
// and pages. Triggered from the sidebar Search button or ⌘K / Ctrl-K.

const CommandPalette = ({
  open, onClose,
  cases, judges, lawyers, parties, representatives, staff, sections, bookings,
  navigate, goCase,
}) => {
  const inputRef = React.useRef(null);
  const listRef = React.useRef(null);
  const [q, setQ] = React.useState("");
  const [idx, setIdx] = React.useState(0);

  // Focus on open
  React.useEffect(() => {
    if (open) {
      setQ(""); setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Build the searchable index
  const results = React.useMemo(() => {
    if (!open) return [];
    const norm = (s) => String(s || "").toLowerCase();
    const query = norm(q.trim());

    const allItems = [];

    // Pages
    const pages = (window.NAV_ITEMS || []).filter(i =>
      ["dashboard","cases","courtrooms","targets","tasks","requests","sections",
       "judges","staff","lawyers","parties","representatives"].includes(i.id));
    for (const p of pages) {
      allItems.push({
        kind: "page", id: `page-${p.id}`,
        title: p.label, subtitle: "Navigate",
        keywords: p.label,
        action: () => navigate(p.id),
        icon: p.icon,
      });
    }

    // Cases
    for (const c of cases || []) {
      allItems.push({
        kind: "case", id: `case-${c.id}`,
        title: c.title, subtitle: `${c.id} · ${c.type} · ${c.status}`,
        keywords: `${c.title} ${c.id} ${c.type} ${c.status} ${c.presiding} ${(c.judges || []).join(" ")} ${c.petitioner?.name || ""} ${c.respondent?.name || ""}`,
        action: () => { goCase(c); },
        icon: "cases",
        badge: c.status,
      });
    }

    // Judges
    for (const j of judges || []) {
      allItems.push({
        kind: "judge", id: `judge-${j.id}`,
        title: j.name, subtitle: `${j.role} · Judge`,
        keywords: `${j.name} ${j.role} judge`,
        action: () => navigate("judges"),
        icon: "gavel",
      });
    }
    // Staff
    for (const s of staff || []) {
      allItems.push({
        kind: "staff", id: `staff-${s.id}`,
        title: s.name, subtitle: `${s.role} · ${s.department}`,
        keywords: `${s.name} ${s.role} ${s.department} staff`,
        action: () => navigate("staff"),
        icon: "users",
      });
    }
    // Lawyers
    for (const l of lawyers || []) {
      allItems.push({
        kind: "lawyer", id: `lawyer-${l.id}`,
        title: l.name, subtitle: `${l.firm || "Lawyer"} · Bar #${l.barNumber || ""}`,
        keywords: `${l.name} ${l.firm || ""} ${l.barNumber || ""} lawyer counsel`,
        action: () => navigate("lawyers"),
        icon: "scales",
      });
    }
    // Parties
    for (const p of parties || []) {
      allItems.push({
        kind: "party", id: `party-${p.id}`,
        title: p.name, subtitle: `${p.type || "Party"}`,
        keywords: `${p.name} ${p.type || ""} party`,
        action: () => navigate("parties"),
        icon: "users",
      });
    }
    // Representatives
    for (const r of representatives || []) {
      allItems.push({
        kind: "rep", id: `rep-${r.id}`,
        title: r.name, subtitle: `Represents ${r.represents || "—"}`,
        keywords: `${r.name} ${r.represents || ""} representative`,
        action: () => navigate("representatives"),
        icon: "userTag",
      });
    }
    // Sections
    for (const s of sections || []) {
      allItems.push({
        kind: "section", id: `section-${s.id}`,
        title: s.name, subtitle: `Section ${s.code} · ${s.judges?.length || 0} judges`,
        keywords: `${s.name} ${s.code} section ${(s.caseTypes || []).join(" ")}`,
        action: () => navigate("sections"),
        icon: "building",
      });
    }
    // Courtroom bookings (upcoming)
    for (const b of bookings || []) {
      allItems.push({
        kind: "booking", id: `booking-${b.id}`,
        title: b.caseTitle, subtitle: `${b.date} · ${b.timeStart}–${b.timeEnd} · ${b.courtroom}`,
        keywords: `${b.caseTitle} ${b.courtroom} ${b.date} hearing`,
        action: () => {
          const linked = (cases || []).find(c => c.id === b.caseId) ||
                         (cases || []).find(c => c.title === b.caseTitle);
          if (linked) goCase(linked); else navigate("courtrooms");
        },
        icon: "calendar",
      });
    }

    if (!query) {
      // Empty query → show pages first, then a sample of recent items
      const pageItems = allItems.filter(x => x.kind === "page");
      const others = allItems.filter(x => x.kind !== "page").slice(0, 8);
      return [...pageItems, ...others];
    }

    // Score: title match strongest, then subtitle/keywords
    const tokens = query.split(/\s+/).filter(Boolean);
    const scored = [];
    for (const it of allItems) {
      const hay = norm(it.title + " " + (it.subtitle || "") + " " + (it.keywords || ""));
      let score = 0;
      let matchAll = true;
      for (const t of tokens) {
        if (!hay.includes(t)) { matchAll = false; break; }
        if (norm(it.title).includes(t)) score += 5;
        if (norm(it.title).startsWith(t)) score += 4;
        score += 1;
      }
      if (matchAll) scored.push({ ...it, _score: score });
    }
    scored.sort((a, b) => b._score - a._score);
    return scored.slice(0, 30);
  }, [q, open, cases, judges, lawyers, parties, representatives, staff, sections, bookings, navigate, goCase]);

  // Reset highlight when results change
  React.useEffect(() => { setIdx(0); }, [q]);

  // Keyboard handlers
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(results.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx(i => Math.max(0, i - 1)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const sel = results[idx]; if (sel) { sel.action(); onClose(); }
    } else if (e.key === "Escape") { onClose(); }
  };

  // Scroll selected into view
  React.useEffect(() => {
    if (!open) return;
    const li = listRef.current?.querySelector(`[data-i="${idx}"]`);
    if (li) li.scrollIntoView({ block: "nearest" });
  }, [idx, open]);

  if (!open) return null;

  // Group by kind for display
  const groups = [];
  const groupOrder = ["page", "case", "judge", "staff", "lawyer", "party", "rep", "section", "booking"];
  const groupLabels = {
    page: "Pages", case: "Cases", judge: "Judges", staff: "Court staff",
    lawyer: "Lawyers", party: "Parties", rep: "Representatives",
    section: "Sections", booking: "Hearings",
  };
  let runIdx = 0;
  for (const k of groupOrder) {
    const items = results.filter(r => r.kind === k);
    if (items.length === 0) continue;
    groups.push({ kind: k, label: groupLabels[k], items, startIdx: runIdx });
    runIdx += items.length;
  }

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(11,13,16,0.32)",
      backdropFilter: "blur(2px)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      paddingTop: "12vh", paddingLeft: 16, paddingRight: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 620,
        background: "var(--paper)",
        border: "1px solid var(--line)",
        borderRadius: 10,
        boxShadow: "0 30px 60px rgba(11,13,16,0.18), 0 6px 16px rgba(11,13,16,0.06)",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        maxHeight: "70vh",
      }}>
        {/* Search input */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 18px",
          borderBottom: "1px solid var(--line)",
        }}>
          <I.search size={16} stroke="var(--text-3)"/>
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey} placeholder="Search cases, people, sections, hearings…"
            style={{
              flex: 1, border: "none", outline: "none",
              background: "transparent", fontSize: 15,
              color: "var(--text)", fontFamily: "inherit",
            }}/>
          <span className="mono" style={{
            fontSize: 10.5, color: "var(--text-3)",
            border: "1px solid var(--line)", borderRadius: 4,
            padding: "2px 6px",
          }}>ESC</span>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
          {results.length === 0 && (
            <div style={{ padding: "32px 18px", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
              No matches for <span className="mono" style={{ color: "var(--text-2)" }}>"{q}"</span>
            </div>
          )}
          {groups.map((g) => (
            <div key={g.kind}>
              <div style={{
                fontSize: 10, color: "var(--text-3)",
                letterSpacing: "0.08em", textTransform: "uppercase",
                fontWeight: 500, padding: "8px 18px 4px",
              }}>{g.label}</div>
              {g.items.map((r, i) => {
                const ri = g.startIdx + i;
                const sel = ri === idx;
                const Ic = I[r.icon] || I.cases;
                return (
                  <button key={r.id} data-i={ri}
                    onMouseEnter={() => setIdx(ri)}
                    onClick={() => { r.action(); onClose(); }} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: "9px 18px", margin: 0, textAlign: "left",
                    background: sel ? "var(--paper-2)" : "transparent",
                    border: "none", cursor: "pointer", color: "inherit",
                    position: "relative",
                  }}>
                    {sel && <div style={{
                      position: "absolute", left: 0, top: 4, bottom: 4, width: 2,
                      background: "var(--ink)", borderRadius: 2,
                    }}/>}
                    <Ic size={15} stroke={sel ? "var(--text)" : "var(--text-2)"}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.title}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-3)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.subtitle}
                      </div>
                    </div>
                    {sel && <span className="mono" style={{
                      fontSize: 10, color: "var(--text-3)",
                    }}>↵</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer hints */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          padding: "8px 18px", borderTop: "1px solid var(--line)",
          background: "var(--paper-2)",
          fontSize: 11, color: "var(--text-3)",
        }}>
          <span><span className="mono" style={{ color: "var(--text-2)" }}>↑↓</span> navigate</span>
          <span><span className="mono" style={{ color: "var(--text-2)" }}>↵</span> open</span>
          <span style={{ marginLeft: "auto" }}>{results.length} result{results.length === 1 ? "" : "s"}</span>
        </div>
      </div>
    </div>
  );
};

window.CommandPalette = CommandPalette;
