// ─── Targets, Tasks, Requests pages ──────────────────────────────────────────

const TargetsPage = ({ targets, setTargets, cases = [], goCase, setModal }) => {
  const { session } = useAuth();
  const canManage = session?.role === "admin";
  const toast = useToast();
  const deleteTarget = (id) => {
    if (!confirm("Delete this target?")) return;
    setTargets((p) => p.filter((t) => t.id !== id));
    toast("Target deleted", "info");
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>Targets</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>{targets.length} active goals</div>
        </div>
        {canManage && <Btn variant="primary" leading={<I.plus size={14}/>} onClick={() => setModal("newTarget")}>New target</Btn>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {targets.map((t) => {
          const pct = Math.min(100, Math.round((t.current / t.metric) * 100));
          const color = pct >= 80 ? "var(--success)" : pct >= 50 ? "var(--ink)" : "var(--warn)";
          return (
            <Card key={t.id} padding="20px">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Tag>{t.type}</Tag>
                  <div style={{ fontSize: 15, fontWeight: 500, marginTop: 8, letterSpacing: "-0.005em" }}>{t.description}</div>
                  {(() => {
                    const people = targetAssignees(t);
                    return (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                        {people.length > 0 && (
                          <div style={{ display: "flex", alignItems: "center" }}>
                            {people.slice(0, 4).map((nm, i) => (
                              <div key={nm} title={nm} style={{ marginLeft: i ? -7 : 0,
                                border: "2px solid var(--paper)", borderRadius: 6 }}>
                                <Avatar name={nm.replace(/^Hon\.\s*/, "")} size={22}
                                  tone={/judge|hon\./i.test(nm) ? "judge" : "neutral"}/>
                              </div>
                            ))}
                            {people.length > 4 && (
                              <div style={{ marginLeft: -7, border: "2px solid var(--paper)", borderRadius: 6,
                                width: 22, height: 22, background: "var(--paper-3)", color: "var(--text-2)",
                                fontSize: 9.5, fontWeight: 500, display: "flex", alignItems: "center",
                                justifyContent: "center" }}>+{people.length - 4}</div>
                            )}
                          </div>
                        )}
                        <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>
                          {people.length === 0 ? "Unassigned"
                            : people.length <= 2 ? people.join(" · ")
                            : `${people.length} assignees`}
                          {" · Due "}{t.deadline}
                        </span>
                      </div>
                    );
                  })()}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <div style={{ fontSize: 28, fontWeight: 500, color, letterSpacing: "-0.03em", lineHeight: 1 }}>{pct}%</div>
                  {canManage && (
                    <div style={{ display: "flex", gap: 2 }}>
                      <button onClick={() => setModal({ type: "editTarget", target: t })}
                        title="Edit target"
                        style={{ background: "transparent", border: "none", padding: 5, borderRadius: 4, color: "var(--text-3)", cursor: "pointer", display: "inline-flex" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "var(--paper-3)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.background = "transparent"; }}>
                        <I.edit size={13}/>
                      </button>
                      <button onClick={() => deleteTarget(t.id)}
                        title="Delete target"
                        style={{ background: "transparent", border: "none", padding: 5, borderRadius: 4, color: "var(--text-3)", cursor: "pointer", display: "inline-flex" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "var(--paper-3)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.background = "transparent"; }}>
                        <I.trash size={13}/>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ height: 6, background: "var(--paper-3)", borderRadius: 3, marginBottom: 8 }}>
                <div style={{ width: `${pct}%`, height: 6, background: color, borderRadius: 3 }}/>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-3)" }}>
                <span className="mono">{t.current} / {t.metric}</span>
                <span>{t.metric - t.current} to go</span>
              </div>
              {(t.caseIds || []).length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line-soft)" }}>
                  <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase",
                    letterSpacing: "0.06em", fontWeight: 500, marginBottom: 7 }}>Linked cases</div>
                  <LinkedCaseChips ids={t.caseIds} cases={cases} goCase={goCase}/>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const TasksPage = ({ cases, updateCase, goCase, setModal }) => {
  const { session } = useAuth();
  const canManage = session?.role === "admin" || session?.role === "judge" || session?.role === "staff";
  const toast = useToast();
  const all = cases.flatMap(c => c.tasks.map(t => ({...t, caseId: c.id, caseTitle: c.title })));
  const open = all.filter(t => !t.done);
  const done = all.filter(t => t.done);

  const editTask = (t) => {
    const cs = cases.find(c => c.id === t.caseId);
    if (!cs) return;
    setModal({ type: "editTask", caseData: cs, task: t });
  };
  const deleteTask = (t) => {
    if (!confirm("Delete this task?")) return;
    updateCase(t.caseId, c => ({...c, tasks: c.tasks.filter(tk => tk.id !== t.id)}));
    toast("Task deleted", "info");
  };

  const RowActions = ({ t }) => canManage ? (
    <div style={{ display: "inline-flex", gap: 2 }}>
      <button onClick={() => editTask(t)} title="Edit task"
        style={{ background: "transparent", border: "none", padding: 5, borderRadius: 4, color: "var(--text-3)", cursor: "pointer", display: "inline-flex" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "var(--paper-3)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.background = "transparent"; }}>
        <I.edit size={12}/>
      </button>
      <button onClick={() => deleteTask(t)} title="Delete task"
        style={{ background: "transparent", border: "none", padding: 5, borderRadius: 4, color: "var(--text-3)", cursor: "pointer", display: "inline-flex" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "var(--paper-3)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.background = "transparent"; }}>
        <I.trash size={12}/>
      </button>
    </div>
  ) : null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>Tasks</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>
            {open.length} open · {done.length} completed
          </div>
        </div>
        {canManage && (
          <Btn variant="primary" leading={<I.plus size={14}/>} onClick={() => setModal("newTask")}>
            New task
          </Btn>
        )}
      </div>
      <Card padding={0}>
        <div style={{ padding: "10px 16px", background: "var(--paper-2)", borderBottom: "1px solid var(--line)", fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 500 }}>
          Open · {open.length}
        </div>
        {open.map((t) => (
          <div key={t.caseId + t.id} style={{
            display: "grid", gridTemplateColumns: "auto 1.5fr 1fr 100px 100px 70px",
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
              {(t.linkedCases || []).length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <LinkedCaseChips ids={t.linkedCases} cases={cases} goCase={goCase} size="xs"/>
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar name={t.assignee} size={22}/>
              <span style={{ fontSize: 12 }}>{t.assignee.replace("Hon. ", "")}</span>
            </div>
            <Pill label={t.priority || "Medium"} size="xs"/>
            <span style={{ fontSize: 12, color: "var(--text-2)" }}>{t.due}</span>
            <div style={{ textAlign: "right" }}><RowActions t={t}/></div>
          </div>
        ))}
        {done.length > 0 && (
          <>
            <div style={{ padding: "10px 16px", background: "var(--paper-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 500 }}>
              Completed · {done.length}
            </div>
            {done.map((t) => (
              <div key={t.caseId + t.id} style={{
                display: "grid", gridTemplateColumns: "auto 1.5fr 1fr 100px 100px 70px",
                gap: 12, padding: "10px 16px",
                borderBottom: "1px solid var(--line-soft)", alignItems: "center",
              }}>
                <input type="checkbox" checked readOnly style={{ width: 14, height: 14, accentColor: "var(--ink)" }}/>
                <div style={{ textDecoration: "line-through", color: "var(--text-3)", fontSize: 13, opacity: 0.7 }}>{t.text}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)", opacity: 0.7 }}>{t.assignee.replace("Hon. ","")}</div>
                <div></div>
                <div style={{ fontSize: 12, color: "var(--text-3)", opacity: 0.7 }}>{t.due}</div>
                <div style={{ textAlign: "right" }}><RowActions t={t}/></div>
              </div>
            ))}
          </>
        )}
      </Card>
    </div>
  );
};

const RequestsPage = ({ cases, updateCase, setModal }) => {
  const { session } = useAuth();
  const canFile = session?.role === "admin" || session?.role === "lawyer" || session?.role === "rep";
  const all = cases.flatMap(c => (c.requests || []).map(r => ({...r, caseId: c.id, caseTitle: c.title })));
  const decide = (caseId, reqId, status) =>
    updateCase(caseId, c => ({...c, requests: (c.requests||[]).map(r => r.id === reqId ? {...r, status} : r)}));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>Requests</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>
            {all.filter(r => r.status === "Pending").length} awaiting decision
          </div>
        </div>
        {canFile && (
          <Btn variant="primary" leading={<I.plus size={14}/>} onClick={() => setModal("newRequest")}>
            File request
          </Btn>
        )}
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
                {(r.attachments || []).length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                    {r.attachments.map((a) => {
                      const isImg = (a.type || "").startsWith("image/");
                      const open = () => {
                        const w = window.open();
                        if (w) w.document.write(
                          isImg
                            ? `<title>${a.name}</title><body style="margin:0;background:#111;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${a.dataUrl}" style="max-width:100%;max-height:100vh"/></body>`
                            : `<title>${a.name}</title><body><iframe src="${a.dataUrl}" style="border:0;width:100%;height:100vh"></iframe></body>`
                        );
                      };
                      return (
                        <button key={a.id} type="button" onClick={open} title={`Open ${a.name}`}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "3px 8px 3px 4px", border: "1px solid var(--line)",
                            borderRadius: 99, background: "var(--paper-2)", cursor: "pointer",
                            maxWidth: 200,
                          }}>
                          {isImg
                            ? <img src={a.dataUrl} alt="" style={{ width: 18, height: 18, objectFit: "cover", borderRadius: 3, flexShrink: 0 }}/>
                            : <span style={{ display: "flex", flexShrink: 0 }}><I.doc size={12} stroke="var(--text-2)"/></span>}
                          <span style={{ fontSize: 11.5, color: "var(--text-2)", whiteSpace: "nowrap",
                            overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
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
