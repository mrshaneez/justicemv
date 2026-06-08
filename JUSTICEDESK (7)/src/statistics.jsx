// ─── Statistics page — aggregates everything the app holds ───────────────────
// Cases, hearings, tasks, requests, targets, documents, and the full directory
// (judges, lawyers, staff, parties, representatives, sections, access grants).

// Count occurrences of a key across records → sorted [{label, value}]
function tally(records, getKey) {
  const m = new Map();
  for (const r of records) {
    const k = getKey(r);
    const keys = Array.isArray(k) ? k : [k];
    for (const key of keys) {
      if (key === undefined || key === null || key === "") continue;
      m.set(key, (m.get(key) || 0) + 1);
    }
  }
  return Array.from(m.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

const StatisticsPage = ({
  cases = [], bookings = [], targets = [], judges = [], lawyers = [],
  staff = [], parties = [], representatives = [], sections = [],
  accessGrants = [], templates = [], generatedDocs = [], setPage,
}) => {
  const todayMs = new Date(fmt(today)).getTime();

  const m = React.useMemo(() => {
    // ── Cases ──
    const byStatus = tally(cases, (c) => c.status);
    const byType = tally(cases, (c) => c.type);
    const active = cases.filter((c) => c.status === "Active").length;
    const pending = cases.filter((c) => c.status === "Pending").length;
    const closed = cases.filter((c) => c.status === "Closed").length;

    // Cases by section (match a case's presiding/judges to a section's judges)
    const sectionCounts = sections.map((s) => {
      const setJ = new Set(s.judges || []);
      const n = cases.filter((c) =>
        (c.judges || []).some((j) => setJ.has(j)) || setJ.has(c.presiding)).length;
      return { label: s.name.replace(/^Hon\.\s*/, "").replace(/'s Section$/, ""), value: n };
    }).filter((x) => x.value > 0).sort((a, b) => b.value - a.value);

    // Cases filed by month (last 8 months window based on data range)
    const filedDates = cases.map((c) => c.filed).filter(Boolean).sort();
    const monthKey = (d) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`; };
    const monthMap = new Map();
    for (const c of cases) {
      if (!c.filed) continue;
      const k = monthKey(c.filed);
      monthMap.set(k, (monthMap.get(k) || 0) + 1);
    }
    const filedByMonth = Array.from(monthMap.entries()).sort().slice(-8).map(([k, v]) => {
      const [y, mo] = k.split("-");
      return { label: `${MONTH_NAMES[Number(mo) - 1].slice(0, 3)} ${y.slice(2)}`, value: v };
    });

    // ── Hearings (from case.hearings + bookings) ──
    const allHearings = cases.flatMap((c) => (c.hearings || []).map((h) => ({ ...h, caseId: c.id })));
    const hearingsByOutcome = tally(allHearings, (h) => h.outcome || "Pending");
    const hearingsByCourt = tally(
      [...allHearings.map((h) => ({ court: h.court })), ...bookings.filter((b) => b.status !== "Cancelled").map((b) => ({ court: b.courtroom }))],
      (x) => x.court
    );
    const bookingsByStatus = tally(bookings, (b) => b.status);

    // ── Tasks ──
    const allTasks = cases.flatMap((c) => (c.tasks || []).map((t) => ({ ...t, caseId: c.id })));
    const tasksOpen = allTasks.filter((t) => !t.done).length;
    const tasksDone = allTasks.filter((t) => t.done).length;
    const tasksOverdue = allTasks.filter((t) => !t.done && t.due && new Date(t.due).getTime() < todayMs).length;
    const tasksByPriority = tally(allTasks.filter((t) => !t.done), (t) => t.priority || "None");

    // ── Requests ──
    const allRequests = cases.flatMap((c) => (c.requests || []).map((r) => ({ ...r, caseId: c.id })));
    const reqByStatus = tally(allRequests, (r) => r.status);
    const reqByType = tally(allRequests, (r) => r.type);
    const reqAttachments = allRequests.reduce((a, r) => a + (r.attachments?.length || 0), 0);

    // ── People / directory ──
    const judgesByStatus = tally(judges, (j) => j.status);
    const lawyersBySide = tally(lawyers, (l) => l.side);
    const staffByDept = tally(staff, (s) => s.department);
    const staffByRole = tally(staff, (s) => s.role);
    const partiesByKind = tally(parties, (p) => p.kind);
    const repsByRelation = tally(representatives, (r) => r.relation);

    // ── Documents ──
    const templatesByCat = tally(templates, (t) => t.category);
    const uploadedTpls = templates.filter((t) => t.uploaded).length;

    return {
      byStatus, byType, active, pending, closed, sectionCounts, filedByMonth,
      filedRange: filedDates.length ? [filedDates[0], filedDates[filedDates.length - 1]] : null,
      allHearings, hearingsByOutcome, hearingsByCourt, bookingsByStatus,
      allTasks, tasksOpen, tasksDone, tasksOverdue, tasksByPriority,
      allRequests, reqByStatus, reqByType, reqAttachments,
      judgesByStatus, lawyersBySide, staffByDept, staffByRole, partiesByKind, repsByRelation,
      templatesByCat, uploadedTpls,
    };
  }, [cases, bookings, targets, judges, lawyers, staff, parties, representatives, sections, templates, generatedDocs, todayMs]);

  const statusColors = {
    Active: "#2d5a3d", Pending: "#8b6914", Closed: "#3a3a30",
    Reserved: "#1f3a3d", Adjourned: "#a02d2a",
  };

  // ── CSV export — every figure on this page ──
  const exportCsv = () => {
    const rows = [["Category", "Metric", "Value"]];
    const push = (cat, list) => list.forEach((d) => rows.push([cat, d.label, d.value]));
    rows.push(["Summary", "Total cases", cases.length]);
    rows.push(["Summary", "Active cases", m.active]);
    rows.push(["Summary", "Pending cases", m.pending]);
    rows.push(["Summary", "Closed cases", m.closed]);
    rows.push(["Summary", "Total hearings", m.allHearings.length]);
    rows.push(["Summary", "Open tasks", m.tasksOpen]);
    rows.push(["Summary", "Completed tasks", m.tasksDone]);
    rows.push(["Summary", "Overdue tasks", m.tasksOverdue]);
    rows.push(["Summary", "Requests filed", m.allRequests.length]);
    rows.push(["Summary", "Request attachments", m.reqAttachments]);
    rows.push(["Summary", "Courtroom bookings", bookings.length]);
    rows.push(["Summary", "Judges", judges.length]);
    rows.push(["Summary", "Lawyers", lawyers.length]);
    rows.push(["Summary", "Court staff", staff.length]);
    rows.push(["Summary", "Parties", parties.length]);
    rows.push(["Summary", "Representatives", representatives.length]);
    rows.push(["Summary", "Sections", sections.length]);
    rows.push(["Summary", "Access grants", accessGrants.length]);
    rows.push(["Summary", "Document templates", templates.length]);
    rows.push(["Summary", "Generated documents", generatedDocs.length]);
    push("Cases by status", m.byStatus);
    push("Cases by type", m.byType);
    push("Cases by section", m.sectionCounts);
    push("Cases filed by month", m.filedByMonth);
    push("Hearings by outcome", m.hearingsByOutcome);
    push("Hearings by courtroom", m.hearingsByCourt);
    push("Bookings by status", m.bookingsByStatus);
    push("Open tasks by priority", m.tasksByPriority);
    push("Requests by status", m.reqByStatus);
    push("Requests by type", m.reqByType);
    push("Judges by status", m.judgesByStatus);
    push("Lawyers by side", m.lawyersBySide);
    push("Staff by department", m.staffByDept);
    push("Parties by kind", m.partiesByKind);
    push("Representatives by relation", m.repsByRelation);
    push("Templates by category", m.templatesByCat);

    const csv = rows.map((r) => r.map((cell) => {
      const s = String(cell);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(",")).join("\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `JusticeDesk Statistics — ${fmt(today)}.csv`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 300);
  };

  const gridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 };

  return (
    <div style={{ maxWidth: 1180 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>Statistics</div>
          <div style={{ fontSize: 12.5, color: "var(--text-2)", marginTop: 3 }}>
            A complete picture across every record the registry holds
            {m.filedRange && <> · matters filed {new Date(m.filedRange[0]).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}–{new Date(m.filedRange[1]).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn size="sm" leading={<I.print size={12}/>} onClick={() => window.print()}>Print</Btn>
          <Btn size="sm" variant="primary" leading={<I.download size={12}/>} onClick={exportCsv}>Export CSV</Btn>
        </div>
      </div>

      {/* KPI tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 22 }}>
        <StatTile label="Cases" value={cases.length} accent="#1f3a3d"
          sub={`${m.active} active · ${m.pending} pending`} onClick={() => setPage?.("cases")}/>
        <StatTile label="Hearings" value={m.allHearings.length} accent="#5a4a1f"
          sub={`${bookings.length} bookings`} onClick={() => setPage?.("courtrooms")}/>
        <StatTile label="Open tasks" value={m.tasksOpen} accent="#8b6914"
          sub={m.tasksOverdue > 0 ? `${m.tasksOverdue} overdue` : `${m.tasksDone} completed`}
          onClick={() => setPage?.("tasks")}/>
        <StatTile label="Requests" value={m.allRequests.length} accent="#a02d2a"
          sub={`${m.reqByStatus.find((x) => x.label === "Pending")?.value || 0} pending`}
          onClick={() => setPage?.("requests")}/>
        <StatTile label="Documents" value={generatedDocs.length} accent="#3d4a6b"
          sub={`${templates.length} templates`} onClick={() => setPage?.("documents")}/>
        <StatTile label="Judges" value={judges.length}
          sub={`${m.judgesByStatus.find((x) => x.label === "Sitting")?.value || 0} sitting`}
          onClick={() => setPage?.("judges")}/>
        <StatTile label="Lawyers" value={lawyers.length} onClick={() => setPage?.("lawyers")}/>
        <StatTile label="Court staff" value={staff.length} onClick={() => setPage?.("staff")}/>
        <StatTile label="Parties" value={parties.length} sub={`${representatives.length} representatives`}
          onClick={() => setPage?.("parties")}/>
        <StatTile label="Sections" value={sections.length} sub={`${accessGrants.length} access grants`}
          onClick={() => setPage?.("sections")}/>
      </div>

      {/* Cases: status donut + by type */}
      <div style={gridStyle}>
        <ChartCard title="Cases by status" hint="Distribution across the roll">
          <Donut
            data={m.byStatus.map((d) => ({ ...d, color: statusColors[d.label] }))}
            centerValue={cases.length} centerLabel="total"/>
        </ChartCard>
        <ChartCard title="Cases by type" hint="Matter classification">
          <BarList data={m.byType} colored/>
        </ChartCard>
      </div>

      {/* Cases: by section + filed over time */}
      <div style={gridStyle}>
        <ChartCard title="Caseload by section" hint="Matters routed to each judicial section">
          <BarList data={m.sectionCounts}/>
        </ChartCard>
        <ChartCard title="Matters filed over time" hint="New registrations by month">
          {m.filedByMonth.length
            ? <ColumnChart data={m.filedByMonth} color="#1f3a3d"/>
            : <div style={{ fontSize: 12, color: "var(--text-3)", fontStyle: "italic" }}>No filing data.</div>}
        </ChartCard>
      </div>

      {/* Hearings */}
      <div style={gridStyle}>
        <ChartCard title="Hearings by outcome" hint={`${m.allHearings.length} hearings on record`}>
          <BarList data={m.hearingsByOutcome.map((d) => ({ ...d, color: statusColors[d.label] }))}/>
        </ChartCard>
        <ChartCard title="Courtroom utilisation" hint="Hearings + bookings per room">
          <BarList data={m.hearingsByCourt} colored/>
        </ChartCard>
      </div>

      {/* Tasks + Requests */}
      <div style={gridStyle}>
        <ChartCard title="Tasks" hint="Across all matters"
          right={m.tasksOverdue > 0 && <Pill label={`${m.tasksOverdue} overdue`} tone="Closed" size="xs"/>}>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            {[
              ["Open", m.tasksOpen, "var(--ink)"],
              ["Completed", m.tasksDone, "var(--success)"],
              ["Overdue", m.tasksOverdue, "var(--danger)"],
            ].map(([l, v, c]) => (
              <div key={l} style={{ flex: 1, padding: "10px 12px", background: "var(--paper-2)",
                border: "1px solid var(--line)", borderRadius: 8 }}>
                <div style={{ fontSize: 22, fontWeight: 500, color: c, letterSpacing: "-0.02em" }}>{v}</div>
                <div style={{ fontSize: 10.5, color: "var(--text-3)", textTransform: "uppercase",
                  letterSpacing: "0.05em" }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--text-3)", textTransform: "uppercase",
            letterSpacing: "0.05em", marginBottom: 10 }}>Open tasks by priority</div>
          <BarList data={m.tasksByPriority.map((d) => ({ ...d,
            color: d.label === "High" ? "var(--danger)" : d.label === "Medium" ? "var(--warn)" : "var(--text-3)" }))}/>
        </ChartCard>
        <ChartCard title="Requests" hint={`${m.allRequests.length} filed · ${m.reqAttachments} attachments`}>
          <div style={{ fontSize: 10.5, color: "var(--text-3)", textTransform: "uppercase",
            letterSpacing: "0.05em", marginBottom: 10 }}>By status</div>
          <BarList data={m.reqByStatus.map((d) => ({ ...d,
            color: d.label === "Approved" ? "var(--success)" : d.label === "Rejected" ? "var(--danger)" : "var(--warn)" }))}/>
          <div style={{ fontSize: 10.5, color: "var(--text-3)", textTransform: "uppercase",
            letterSpacing: "0.05em", margin: "16px 0 10px" }}>By type</div>
          <BarList data={m.reqByType} colored/>
        </ChartCard>
      </div>

      {/* Directory / People */}
      <ChartCard title="Directory" hint="People and organisation on file" style={{ marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px 28px" }}>
          <div>
            <div style={statSubhead}>Judges by status</div>
            <BarList data={m.judgesByStatus.map((d) => ({ ...d,
              color: d.label === "Sitting" ? "var(--success)" : "var(--warn)" }))}/>
          </div>
          <div>
            <div style={statSubhead}>Lawyers by side</div>
            <BarList data={m.lawyersBySide} colored/>
          </div>
          <div>
            <div style={statSubhead}>Staff by department</div>
            <BarList data={m.staffByDept} colored/>
          </div>
          <div>
            <div style={statSubhead}>Staff by role</div>
            <BarList data={m.staffByRole} colored/>
          </div>
          <div>
            <div style={statSubhead}>Parties by kind</div>
            <BarList data={m.partiesByKind} colored/>
          </div>
          <div>
            <div style={statSubhead}>Representatives by relation</div>
            <BarList data={m.repsByRelation} colored/>
          </div>
        </div>
      </ChartCard>

      {/* Targets + Documents */}
      <div style={gridStyle}>
        <ChartCard title="Targets" hint="Quarter-to-date progress">
          {targets.length === 0
            ? <div style={{ fontSize: 12, color: "var(--text-3)", fontStyle: "italic" }}>No targets set.</div>
            : targets.map((t) => {
                const people = (typeof targetAssignees === "function") ? targetAssignees(t) : (t.assignee ? [t.assignee] : []);
                const who = people.length === 0 ? "Unassigned"
                  : people.length <= 2 ? people.join(", ")
                  : `${people.length} assignees`;
                return (
                  <ProgressRow key={t.id} label={t.description}
                    current={t.current ?? 0} metric={t.metric}
                    sub={`${who}${t.deadline ? ` · due ${t.deadline}` : ""}`}/>
                );
              })}
        </ChartCard>
        <ChartCard title="Documents" hint={`${generatedDocs.length} generated · ${templates.length} templates`}>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            {[
              ["Templates", templates.length, "var(--ink)"],
              ["Uploaded", m.uploadedTpls, "var(--accent)"],
              ["Generated", generatedDocs.length, "#3d4a6b"],
            ].map(([l, v, c]) => (
              <div key={l} style={{ flex: 1, padding: "10px 12px", background: "var(--paper-2)",
                border: "1px solid var(--line)", borderRadius: 8 }}>
                <div style={{ fontSize: 22, fontWeight: 500, color: c, letterSpacing: "-0.02em" }}>{v}</div>
                <div style={{ fontSize: 10.5, color: "var(--text-3)", textTransform: "uppercase",
                  letterSpacing: "0.05em" }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={statSubhead}>Templates by category</div>
          <BarList data={m.templatesByCat} colored/>
        </ChartCard>
      </div>
    </div>
  );
};

const statSubhead = {
  fontSize: 10.5, color: "var(--text-3)", textTransform: "uppercase",
  letterSpacing: "0.05em", marginBottom: 10, fontWeight: 500,
};

window.StatisticsPage = StatisticsPage;
