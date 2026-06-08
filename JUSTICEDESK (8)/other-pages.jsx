// ─── Targets, Tasks, Requests pages ──────────────────────────────────────────

const TargetsPage = ({ targets, setTargets, setModal }) => {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>Targets</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>{targets.length} active goals</div>
        </div>
        <Btn variant="primary" leading={<I.plus size={14}/>} onClick={() => setModal("newTarget")}>New target</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {targets.map((t) => {
          const pct = Math.min(100, Math.round((t.current / t.metric) * 100));
          const color = pct >= 80 ? "var(--success)" : pct >= 50 ? "var(--ink)" : "var(--warn)";
          return (
            <Card key={t.id} padding="20px">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <Tag>{t.type}</Tag>
                  <div style={{ fontSize: 15, fontWeight: 500, marginTop: 8, letterSpacing: "-0.005em" }}>{t.description}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 4 }}>Owner: {t.assignee} · Due {t.deadline}</div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 500, color, letterSpacing: "-0.03em" }}>{pct}%</div>
              </div>
              <div style={{ height: 6, background: "var(--paper-3)", borderRadius: 3, marginBottom: 8 }}>
                <div style={{ width: `${pct}%`, height: 6, background: color, borderRadius: 3 }}/>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-3)" }}>
                <span className="mono">{t.current} / {t.metric}</span>
                <span>{t.metric - t.current} to go</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const TasksPage = ({ cases, updateCase }) => {
  const all = cases.flatMap(c => c.tasks.map(t => ({...t, caseId: c.id, caseTitle: c.title })));
  const open = all.filter(t => !t.done);
  const done = all.filter(t => t.done);
  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>Tasks</div>
        <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>
          {open.length} open · {done.length} completed
        </div>
      </div>
      <Card padding={0}>
        <div style={{ padding: "10px 16px", background: "var(--paper-2)", borderBottom: "1px solid var(--line)", fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 500 }}>
          Open · {open.length}
        </div>
        {open.map((t) => (
          <div key={t.caseId + t.id} style={{
            display: "grid", gridTemplateColumns: "auto 1.5fr 1fr 100px 100px",
            gap: 12, padding: "12px 16px",
            borderBottom: "1px solid var(--line-soft)", alignItems: "center",
          }}>
            <input type="checkbox" checked={false}
              onChange={() => updateCase(t.caseId, c => ({...c, tasks: c.tasks.map(tk => tk.id === t.id ? {...tk, done: true} : tk)}))}
              style={{ width: 14, height: 14, accentColor: "var(--ink)", cursor: "pointer" }}/>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{t.text}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>
                <span className="mono">{t.caseId}</span> · {t.caseTitle}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar name={t.assignee} size={22}/>
              <span style={{ fontSize: 12 }}>{t.assignee.replace("Hon. ", "")}</span>
            </div>
            <Pill label={t.priority || "Medium"} size="xs"/>
            <span style={{ fontSize: 12, color: "var(--text-2)" }}>{t.due}</span>
          </div>
        ))}
        {done.length > 0 && (
          <>
            <div style={{ padding: "10px 16px", background: "var(--paper-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 500 }}>
              Completed · {done.length}
            </div>
            {done.map((t) => (
              <div key={t.caseId + t.id} style={{
                display: "grid", gridTemplateColumns: "auto 1.5fr 1fr 100px 100px",
                gap: 12, padding: "10px 16px",
                borderBottom: "1px solid var(--line-soft)", alignItems: "center", opacity: 0.65,
              }}>
                <input type="checkbox" checked readOnly style={{ width: 14, height: 14, accentColor: "var(--ink)" }}/>
                <div style={{ textDecoration: "line-through", color: "var(--text-3)", fontSize: 13 }}>{t.text}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>{t.assignee.replace("Hon. ","")}</div>
                <div></div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>{t.due}</div>
              </div>
            ))}
          </>
        )}
      </Card>
    </div>
  );
};

const RequestsPage = ({ cases, updateCase }) => {
  const all = cases.flatMap(c => (c.requests || []).map(r => ({...r, caseId: c.id, caseTitle: c.title })));
  const decide = (caseId, reqId, status) =>
    updateCase(caseId, c => ({...c, requests: (c.requests||[]).map(r => r.id === reqId ? {...r, status} : r)}));

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>Requests</div>
        <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>
          {all.filter(r => r.status === "Pending").length} awaiting decision
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {all.length === 0 && <Card><Empty title="No requests filed"/></Card>}
        {all.map((r) => (
          <Card key={r.caseId + r.id} padding="18px">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <Pill label={r.type} size="xs"/>
                  <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>{r.caseId}</span>
                  <span style={{ fontSize: 12, color: "var(--text-3)" }}>·</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{r.caseTitle}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text)", marginBottom: 8 }}>{r.reason}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>Filed by {r.filedBy} on {r.submittedAt}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                <Pill label={r.status} dot/>
                {r.status === "Pending" && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn size="sm" variant="outline" onClick={() => decide(r.caseId, r.id, "Rejected")}>Reject</Btn>
                    <Btn size="sm" variant="primary" onClick={() => decide(r.caseId, r.id, "Approved")}>Approve</Btn>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { TargetsPage, TasksPage, RequestsPage });
