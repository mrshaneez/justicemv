// ─── Cases list + detail ─────────────────────────────────────────────────────

const CasesPage = ({ cases, viewCase, setViewCase, updateCase, setModal }) => {
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("All");
  const [activeTab, setActiveTab] = React.useState("overview");

  const cs = viewCase ? cases.find(c => c.id === viewCase.id) : null;

  if (cs) return <CaseDetail cs={cs} updateCase={updateCase} setViewCase={setViewCase} setModal={setModal} activeTab={activeTab} setActiveTab={setActiveTab} />;

  const filtered = cases.filter(c =>
    (filter === "All" || c.status === filter) &&
    (c.id.toLowerCase().includes(search.toLowerCase()) ||
     c.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>Cases</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>
            {cases.length} matters on the roll · {cases.filter(c => c.status === "Active").length} active
          </div>
        </div>
        <Btn variant="primary" onClick={() => setModal("newCase")} leading={<I.plus size={14}/>}>
          New case
        </Btn>
      </div>

      <Card padding={0}>
        <div style={{ display: "flex", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--line)", alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <I.search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}/>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by case ID or title…"
              style={{
                width: "100%", padding: "7px 11px 7px 32px",
                borderRadius: 6, border: "1px solid var(--line)",
                background: "var(--paper-2)", color: "var(--text)",
                fontSize: 13, outline: "none", boxSizing: "border-box",
              }}/>
          </div>
          <div style={{ display: "flex", gap: 2, padding: 2, background: "var(--paper-2)", borderRadius: 6 }}>
            {["All", "Active", "Pending", "Closed"].map((s) => (
              <button key={s} onClick={() => setFilter(s)} style={{
                padding: "5px 12px", borderRadius: 4,
                border: "none", background: filter === s ? "var(--paper)" : "transparent",
                color: filter === s ? "var(--text)" : "var(--text-2)",
                fontSize: 12, cursor: "pointer", fontWeight: filter === s ? 500 : 400,
                boxShadow: filter === s ? "var(--shadow-sm)" : "none",
              }}>{s}</button>
            ))}
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--paper-2)" }}>
              {["Case", "Type", "Bench", "Status", "Filed", "Duration", ""].map((h) => (
                <th key={h} style={{
                  fontSize: 10.5, color: "var(--text-3)", fontWeight: 500,
                  textAlign: "left", padding: "9px 18px",
                  textTransform: "uppercase", letterSpacing: "0.07em",
                  borderBottom: "1px solid var(--line)",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}
                style={{ cursor: "pointer", transition: "background .1s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--paper-2)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                onClick={() => setViewCase(c)}>
                <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--line-soft)" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{c.title}</div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span className="mono" style={{ fontSize: 10.5, color: "var(--text-3)" }}>{c.id}</span>
                      <span style={{ fontSize: 11, color: "var(--text-3)" }}>
                        {c.petitioner.name} {c.respondent ? `v. ${c.respondent.name}` : ""}
                      </span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--line-soft)" }}>
                  <Tag>{c.type}</Tag>
                </td>
                <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--line-soft)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar name={c.presiding} size={22} tone="judge"/>
                    <span style={{ fontSize: 12, color: "var(--text-2)" }}>
                      {c.presiding.replace("Hon. ", "")}
                      {c.judges.length > 1 && <span style={{ color: "var(--text-3)" }}> +{c.judges.length - 1}</span>}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--line-soft)" }}>
                  <Pill label={c.status} dot/>
                </td>
                <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--line-soft)", fontSize: 12, color: "var(--text-2)" }}>
                  {c.filed}
                </td>
                <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--line-soft)", fontSize: 12 }}>
                  {(() => {
                    const days = Math.max(0, Math.floor((today - new Date(c.filed + "T00:00:00")) / 86400000));
                    const totalMonths = Math.floor(days / 30);
                    const yrs = Math.floor(totalMonths / 12);
                    const mos = totalMonths % 12;
                    const label = yrs >= 1
                      ? (mos > 0 ? `${yrs} yr ${mos} mo` : `${yrs} yr`)
                      : (totalMonths >= 1 ? `${totalMonths} mo` : `${days} d`);
                    const tone = c.status === "Closed" ? "var(--text-3)" : days > 180 ? "var(--danger)" : days > 90 ? "var(--warn)" : "var(--text-2)";
                    return <span className="mono" style={{ color: tone, fontSize: 11.5 }}>{label}</span>;
                  })()}
                </td>
                <td style={{ padding: "14px 18px", borderBottom: "1px solid var(--line-soft)", textAlign: "right" }}>
                  <I.chevronR size={14} stroke="var(--text-3)"/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <Empty title="No matching cases" body="Try a different search or filter"/>}
      </Card>
    </div>
  );
};

const CaseDetail = ({ cs, updateCase, setViewCase, setModal, activeTab, setActiveTab }) => {
  const done = cs.tasks.filter(t => t.done).length;
  const allLawyers = [...cs.petitioner.lawyers, ...(cs.respondent?.lawyers || [])];
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "tasks",    label: `Tasks · ${cs.tasks.length}` },
    { id: "hearings", label: `Hearings · ${(cs.hearings || []).length}` },
    { id: "bench",    label: `Bench · ${cs.judges.length}` },
    { id: "requests", label: `Requests · ${(cs.requests || []).length}` },
  ];

  return (
    <div>
      <button onClick={() => setViewCase(null)} style={{
        fontSize: 12, color: "var(--text-2)",
        background: "transparent", border: "none", cursor: "pointer",
        padding: 0, marginBottom: 14,
        display: "inline-flex", alignItems: "center", gap: 4,
      }}>
        <I.chevronL size={13}/> Back to cases
      </button>

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, marginBottom: 14 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span className="mono" style={{ fontSize: 11.5, color: "var(--text-3)", letterSpacing: "0.02em" }}>{cs.id}</span>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>·</span>
              <Tag>{cs.type}</Tag>
              <Pill label={cs.status} dot/>
            </div>
            <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.15, marginBottom: 8 }}>
              {cs.title}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-2)", maxWidth: 720 }}>
              {cs.summary}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="outline" onClick={() => setModal({ type: "newRequest", caseData: cs })}>
              File request
            </Btn>
            <Btn variant="primary" onClick={() => setModal({ type: "newTask", caseData: cs })}
                 leading={<I.plus size={13}/>}>
              Add task
            </Btn>
          </div>
        </div>

        {/* Meta grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          // duration cell — color tells age band at a glance
          background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 10,
          overflow: "hidden",
        }}>
          {[
            // ordering: filing meta first, parties next
            ["Filed", cs.filed],
            ["Duration", (() => {
              const days = Math.max(0, Math.floor((today - new Date(cs.filed + "T00:00:00")) / 86400000));
              const totalMonths = Math.floor(days / 30);
              const yrs = Math.floor(totalMonths / 12);
              const mos = totalMonths % 12;
              if (yrs >= 1) return mos > 0 ? `${yrs} yr ${mos} mo` : `${yrs} yr`;
              if (totalMonths >= 1) return `${totalMonths} mo`;
              return `${days} d`;
            })()],
            ["Petitioner", cs.petitioner.name],
            ["Presiding", cs.presiding.replace("Hon. ", "")],
          ].map(([k, v], i) => (
            <div key={k} style={{
              padding: "12px 16px",
              borderRight: i < 3 ? "1px solid var(--line)" : "none",
            }}>
              <div style={{ fontSize: 10.5, color: "var(--text-3)", letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 500, marginBottom: 4 }}>{k}</div>
              <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.005em" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--line)", marginBottom: 16, gap: 0 }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "10px 16px", border: "none", background: "transparent",
            fontSize: 12.5, cursor: "pointer",
            color: activeTab === t.id ? "var(--text)" : "var(--text-2)",
            fontWeight: activeTab === t.id ? 500 : 400,
            borderBottom: activeTab === t.id ? "2px solid var(--ink)" : "2px solid transparent",
            marginBottom: -1,
          }}>{t.label}</button>
        ))}
      </div>

      {activeTab === "overview" && <CaseOverview cs={cs} setActiveTab={setActiveTab}/>}
      {activeTab === "tasks" && <CaseTasks cs={cs} updateCase={updateCase} setModal={setModal}/>}
      {activeTab === "hearings" && <CaseHearings cs={cs}/>}
      {activeTab === "bench" && <CaseBench cs={cs}/>}
      {activeTab === "requests" && <CaseRequests cs={cs}/>}
    </div>
  );
};

const CaseOverview = ({ cs, setActiveTab }) => {
  const open = cs.tasks.filter(t => !t.done);
  const lastHearing = (cs.hearings || []).slice(-1)[0];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card padding="18px">
          <SectionTitle hint={`${cs.tasks.length - open.length} of ${cs.tasks.length} done`}
            action={<button onClick={() => setActiveTab("tasks")} style={navBtnStyle}><I.arrowR size={13}/></button>}>
            Open tasks
          </SectionTitle>
          {open.length === 0 ? <Empty title="All caught up" body="Every task on this matter is closed."/>
            : open.slice(0, 4).map((t) => (
              <div key={t.id} style={{ display: "flex", gap: 10, padding: "9px 0", borderTop: "1px solid var(--line-soft)", alignItems: "center" }}>
                <div style={{ width: 14, height: 14, border: "1.5px solid var(--line-2)", borderRadius: 3, flexShrink: 0 }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 1 }}>{t.text}</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                    {t.assignee} · due {t.due}
                  </div>
                </div>
                <Pill label={t.priority || "Medium"} size="xs"/>
              </div>
            ))}
        </Card>

        <Card padding="18px">
          <SectionTitle hint="Most recent first">Recent activity</SectionTitle>
          {[
            ["Hearing scheduled", "Tomorrow at 09:00 in Courtroom 1", "2h ago"],
            ["Task completed", "Filed initial submission — Ali Hassan", "Yesterday"],
            ["Document uploaded", "Bench memo on admissibility (12 pages)", "2 days ago"],
            ["Bench updated", "Hon. Mohamed Waheed added to coram", "5 days ago"],
          ].map(([h, body, when], i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderTop: "1px solid var(--line-soft)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--line-2)", marginTop: 6, flexShrink: 0 }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{h}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 1 }}>{body}</div>
              </div>
              <div style={{ fontSize: 10.5, color: "var(--text-3)" }}>{when}</div>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card padding="18px">
          <SectionTitle>Bench</SectionTitle>
          {cs.judges.map((j) => (
            <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: "1px solid var(--line-soft)" }}>
              <Avatar name={j} size={28} tone="judge"/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{j.replace("Hon. ", "")}</div>
                <div style={{ fontSize: 10.5, color: "var(--text-3)" }}>
                  {j === cs.presiding ? "Presiding" : "Coram"}
                </div>
              </div>
            </div>
          ))}
        </Card>

        <Card padding="18px">
          <SectionTitle>Counsel</SectionTitle>
          <div style={{ fontSize: 10.5, color: "var(--text-3)", letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 500, marginTop: 8, marginBottom: 6 }}>Petitioner</div>
          {cs.petitioner.lawyers.map((l) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
              <Avatar name={l} size={24} tone="petitioner"/>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{l}</div>
            </div>
          ))}
          {cs.respondent && (
            <>
              <div style={{ fontSize: 10.5, color: "var(--text-3)", letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 500, marginTop: 12, marginBottom: 6 }}>Respondent</div>
              {cs.respondent.lawyers.map((l) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
                  <Avatar name={l} size={24} tone="respondent"/>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{l}</div>
                </div>
              ))}
            </>
          )}
        </Card>

        {lastHearing && (
          <Card padding="18px">
            <SectionTitle>Last hearing</SectionTitle>
            <div style={{ fontSize: 12.5, fontWeight: 500, marginTop: 4 }}>{lastHearing.date}</div>
            <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 2 }}>{lastHearing.court}</div>
            <div style={{ marginTop: 8 }}><Pill label={lastHearing.outcome}/></div>
            {lastHearing.notes && <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--line-soft)" }}>{lastHearing.notes}</div>}
          </Card>
        )}
      </div>
    </div>
  );
};

const CaseTasks = ({ cs, updateCase, setModal }) => (
  <Card padding={0}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead><tr style={{ background: "var(--paper-2)" }}>
        {["", "Task", "Assignee", "Priority", "Due", ""].map((h) => (
          <th key={h} style={{ fontSize: 10.5, color: "var(--text-3)", fontWeight: 500, textAlign: "left", padding: "9px 14px", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid var(--line)" }}>{h}</th>
        ))}
      </tr></thead>
      <tbody>
        {cs.tasks.length === 0 && <tr><td colSpan={6}><Empty title="No tasks yet"/></td></tr>}
        {cs.tasks.map((t) => (
          <tr key={t.id}>
            <td style={{ padding: "12px 14px", borderBottom: "1px solid var(--line-soft)", width: 36 }}>
              <input type="checkbox" checked={t.done} onChange={() => updateCase(cs.id, c => ({...c, tasks: c.tasks.map(tk => tk.id === t.id ? {...tk, done: !tk.done} : tk)}))}
                style={{ cursor: "pointer", width: 14, height: 14, accentColor: "var(--ink)" }}/>
            </td>
            <td style={{ padding: "12px 14px", borderBottom: "1px solid var(--line-soft)" }}>
              <div style={{ fontSize: 13, textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--text-3)" : "var(--text)" }}>{t.text}</div>
            </td>
            <td style={{ padding: "12px 14px", borderBottom: "1px solid var(--line-soft)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar name={t.assignee} size={22}/>
                <span style={{ fontSize: 12 }}>{t.assignee.replace("Hon. ", "")}</span>
              </div>
            </td>
            <td style={{ padding: "12px 14px", borderBottom: "1px solid var(--line-soft)" }}>
              <Pill label={t.priority || "Medium"} size="xs"/>
            </td>
            <td style={{ padding: "12px 14px", borderBottom: "1px solid var(--line-soft)", fontSize: 12, color: "var(--text-2)" }}>{t.due}</td>
            <td style={{ padding: "12px 14px", borderBottom: "1px solid var(--line-soft)", textAlign: "right" }}>
              <button onClick={() => setModal({ type: "newTask", caseData: cs, existing: t })}
                style={{ width: 26, height: 26, border: "1px solid var(--line)", borderRadius: 5, background: "var(--paper)", cursor: "pointer", color: "var(--text-2)" }}>
                <I.edit size={12}/>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

const CaseHearings = ({ cs }) => (
  <Card padding={0}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead><tr style={{ background: "var(--paper-2)" }}>
        {["Date", "Courtroom", "Outcome", "Notes"].map((h) => (
          <th key={h} style={{ fontSize: 10.5, color: "var(--text-3)", fontWeight: 500, textAlign: "left", padding: "9px 14px", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid var(--line)" }}>{h}</th>
        ))}
      </tr></thead>
      <tbody>
        {(cs.hearings || []).length === 0 && <tr><td colSpan={4}><Empty title="No hearings recorded"/></td></tr>}
        {(cs.hearings || []).map((h, i) => (
          <tr key={i}>
            <td style={{ padding: "12px 14px", borderBottom: "1px solid var(--line-soft)", fontSize: 13, fontWeight: 500 }}>{h.date}</td>
            <td style={{ padding: "12px 14px", borderBottom: "1px solid var(--line-soft)", fontSize: 12, color: "var(--text-2)" }}>{h.court || h.courtroom}</td>
            <td style={{ padding: "12px 14px", borderBottom: "1px solid var(--line-soft)" }}><Pill label={h.outcome} dot/></td>
            <td style={{ padding: "12px 14px", borderBottom: "1px solid var(--line-soft)", fontSize: 12, color: "var(--text-2)" }}>{h.notes || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

const CaseBench = ({ cs }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
    {cs.judges.map((j) => (
      <Card key={j} padding="16px">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <Avatar name={j} size={36} tone="judge"/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{j.replace("Hon. ", "")}</div>
            <div style={{ fontSize: 10.5, color: "var(--text-3)" }}>High Court Judge</div>
          </div>
        </div>
        {j === cs.presiding && <Pill label="Presiding" size="xs" tone="Confirmed"/>}
      </Card>
    ))}
  </div>
);

const CaseRequests = ({ cs }) => (
  <Card padding={0}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead><tr style={{ background: "var(--paper-2)" }}>
        {["Type", "Reason", "Filed by", "Date", "Status"].map((h) => (
          <th key={h} style={{ fontSize: 10.5, color: "var(--text-3)", fontWeight: 500, textAlign: "left", padding: "9px 14px", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid var(--line)" }}>{h}</th>
        ))}
      </tr></thead>
      <tbody>
        {(cs.requests || []).length === 0 && <tr><td colSpan={5}><Empty title="No requests filed"/></td></tr>}
        {(cs.requests || []).map((r) => (
          <tr key={r.id}>
            <td style={{ padding: "12px 14px", borderBottom: "1px solid var(--line-soft)" }}><Pill label={r.type} size="xs"/></td>
            <td style={{ padding: "12px 14px", borderBottom: "1px solid var(--line-soft)", fontSize: 12 }}>{r.reason}</td>
            <td style={{ padding: "12px 14px", borderBottom: "1px solid var(--line-soft)", fontSize: 12, color: "var(--text-2)" }}>{r.filedBy}</td>
            <td style={{ padding: "12px 14px", borderBottom: "1px solid var(--line-soft)", fontSize: 12, color: "var(--text-2)" }}>{r.submittedAt}</td>
            <td style={{ padding: "12px 14px", borderBottom: "1px solid var(--line-soft)" }}><Pill label={r.status} dot/></td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

window.CasesPage = CasesPage;
