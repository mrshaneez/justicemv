// ─── Dashboard ───────────────────────────────────────────────────────────────

const COURT_HUE = {
  "Courtroom 1": { bar: "#1f3a3d", soft: "#e6ebe9" },
  "Courtroom 2": { bar: "#5a4a1f", soft: "#eee7d6" },
  "Courtroom 3": { bar: "#3a3a30", soft: "#e7e6df" },
};

// Bucket card for the judge dashboard — shows a count + the next 3 cases.
const JudgeBucket = ({ label, hint, cases, goCase, tone = "neutral" }) => {
  const accentBg = tone === "accent" ? "var(--accent)" : tone === "judge" ? "#7a6a44" : "var(--text-2)";
  return (
    <div style={{
      background: "var(--paper)", border: "1px solid var(--line)",
      borderRadius: 10, padding: "16px 18px",
      display: "flex", flexDirection: "column", gap: 10, minHeight: 174,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: accentBg }}/>
            <span style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.06em",
              textTransform: "uppercase", fontWeight: 500 }}>{label}</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1 }}>
            {cases.length}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 4 }}>{hint}</div>
        </div>
      </div>
      {cases.length === 0 && (
        <div style={{ fontSize: 11.5, color: "var(--text-3)", fontStyle: "italic" }}>None right now.</div>
      )}
      {cases.slice(0, 3).map((c) => (
        <button key={c.id} onClick={() => goCase(c)} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
          padding: "6px 0", background: "transparent", border: "none",
          borderTop: "1px solid var(--line-soft)",
          cursor: "pointer", textAlign: "left", color: "inherit",
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis",
              whiteSpace: "nowrap", fontWeight: 500 }}>{c.title}</div>
            <div style={{ fontSize: 10.5, color: "var(--text-3)" }} className="mono">{c.id}</div>
          </div>
          <I.arrowR size={11} stroke="var(--text-3)"/>
        </button>
      ))}
    </div>
  );
};

const QuickAction = ({ icon, label, onClick, tone }) => {
  const accent = tone === "accent";
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      padding: "7px 12px",
      background: accent ? "var(--accent-soft)" : "var(--paper)",
      border: `1px solid ${accent ? "var(--accent-line)" : "var(--line)"}`,
      borderRadius: 7,
      fontSize: 12.5, fontWeight: 500,
      color: accent ? "var(--accent-strong)" : "var(--text)",
      cursor: "pointer",
      transition: "background 120ms ease, border-color 120ms ease",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = accent ? "var(--accent-soft-hover, var(--accent-soft))" : "var(--paper-3)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = accent ? "var(--accent-soft)" : "var(--paper)"; }}>
      {icon}
      <span>{label}</span>
    </button>
  );
};

const Stat = ({ value, label, hint, sub, onClick }) => (  <button onClick={onClick} style={{
    background: "var(--paper)",
    border: "1px solid var(--line)",
    borderRadius: 10, padding: "16px 18px",
    display: "flex", flexDirection: "column", gap: 4,
    cursor: onClick ? "pointer" : "default",
    textAlign: "left", font: "inherit", color: "inherit",
    transition: "background .12s, border-color .12s, transform .12s",
  }}
  onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.borderColor = "var(--line-2)"; e.currentTarget.style.background = "var(--paper)"; }}}
  onMouseLeave={(e) => { if (onClick) { e.currentTarget.style.borderColor = "var(--line)"; }}}>
    <div style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
      {label}
      {onClick && <I.arrowR size={10} stroke="var(--text-3)" style={{ marginLeft: "auto", opacity: 0.5 }}/>}
    </div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <div style={{ fontSize: 32, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1 }}>
        {value}
      </div>
      {hint && <div style={{ fontSize: 11.5, color: "var(--text-2)" }}>{hint}</div>}
    </div>
    {sub && <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{sub}</div>}
  </button>
);

const SparkBar = ({ data, height = 28 }) => {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height }}>
      {data.map((v, i) => (
        <div key={i} style={{
          width: 6, flexShrink: 0,
          height: `${Math.max(2, (v / max) * height)}px`,
          background: i === data.length - 1 ? "var(--ink)" : "var(--line-2)",
          borderRadius: 1,
        }}/>
      ))}
    </div>
  );
};

// Tasks card for the dashboard right column.
const DashTasks = ({ cases, setPage, goCase }) => {
  const todayMs = new Date(fmt(today)).getTime();
  const tasks = (cases || [])
    .flatMap(c => (c.tasks || [])
      .filter(t => !t.done)
      .map(t => ({
        ...t, caseId: c.id, caseTitle: c.title, _case: c,
        dueMs: t.due ? new Date(t.due).getTime() : Infinity,
      })))
    .sort((a, b) => a.dueMs - b.dueMs)
    .slice(0, 5);

  const overdueCount = (cases || []).flatMap(c => (c.tasks || []))
    .filter(t => !t.done && t.due && new Date(t.due).getTime() < todayMs).length;

  const dueLabel = (dueMs) => {
    if (!isFinite(dueMs)) return { label: "no due", tone: "muted" };
    const days = Math.round((dueMs - todayMs) / 86400000);
    if (days < 0) return { label: `${Math.abs(days)}d overdue`, tone: "danger" };
    if (days === 0) return { label: "due today", tone: "warn" };
    if (days === 1) return { label: "due tomorrow", tone: "warn" };
    if (days <= 7) return { label: `in ${days}d`, tone: "default" };
    return { label: new Date(dueMs).toLocaleDateString("en-GB", { day: "numeric", month: "short" }), tone: "muted" };
  };
  const toneColor = { danger: "var(--danger)", warn: "var(--warn)", default: "var(--text-2)", muted: "var(--text-3)" };
  const priorityDot = { High: "var(--danger)", Medium: "var(--warn)", Low: "var(--text-3)" };

  return (
    <Card padding={0}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 500 }}>Tasks</div>
          <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 1 }}>
            Next due
            {overdueCount > 0 && (
              <> · <span style={{ color: "var(--danger)", fontWeight: 500 }}>{overdueCount} overdue</span></>
            )}
          </div>
        </div>
        <button onClick={() => setPage("tasks")} style={navBtnStyle}>
          <I.arrowR size={13}/>
        </button>
      </div>

      <div style={{ padding: "4px 6px 8px" }}>
        {tasks.length === 0 && (
          <div style={{ padding: "20px 12px", textAlign: "center", fontSize: 11.5, color: "var(--text-3)" }}>
            No open tasks. Nice.
          </div>
        )}
        {tasks.map((t) => {
          const d = dueLabel(t.dueMs);
          return (
            <button key={`${t.caseId}-${t.id}`} onClick={() => goCase(t._case)} style={{
              width: "100%", display: "flex", alignItems: "flex-start", gap: 10,
              padding: "9px 12px", borderRadius: 6, cursor: "pointer",
              background: "transparent", border: "none", textAlign: "left", color: "inherit",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--paper-2)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <span style={{
                width: 14, height: 14, borderRadius: 4, marginTop: 2,
                border: "1.5px solid var(--line-2)", flexShrink: 0,
                background: "var(--paper)",
              }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  {t.priority && (
                    <span style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: priorityDot[t.priority] || "var(--text-3)",
                    }}/>
                  )}
                  <div style={{ fontSize: 12.5, fontWeight: 500,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.text}
                  </div>
                </div>
                <div style={{ fontSize: 10.5, color: "var(--text-3)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <span className="mono">{t.caseId}</span> · {t.caseTitle} · {t.assignee || "Unassigned"}
                </div>
              </div>
              <span style={{
                fontSize: 10.5, color: toneColor[d.tone],
                fontWeight: d.tone === "danger" || d.tone === "warn" ? 500 : 400,
                whiteSpace: "nowrap", paddingTop: 2,
              }}>{d.label}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

const DashPage = ({ cases, targets, bookings, sections = [], setPage, goCase, setModal, setAiOpen }) => {
  const { session } = useAuth();
  const role = session?.role || "admin";
  const firstName = (session?.name || "").replace(/^Hon\.\s*/, "").split(" ")[0] || "there";
  const buckets = categoriseJudgeCases(session, cases, sections);
  const active = cases.filter(c => c.status === "Active").length;
  const pending = cases.filter(c => c.status === "Pending").length;
  const closed = cases.filter(c => c.status === "Closed").length;
  const totalTasks = cases.flatMap(c => c.tasks);
  const openTasks = totalTasks.filter(t => !t.done).length;
  const todayStr = fmt(today);

  const [schedDate, setSchedDate] = React.useState(todayStr);
  const [weekStart, setWeekStart] = React.useState(() => {
    const d = new Date(today); d.setDate(d.getDate() - d.getDay()); return d;
  });
  const weekDates = Array.from({ length: 7 }, (_, i) => fmt(addDays(weekStart, i)));
  const dayBookings = bookings
    .filter(b => b.date === schedDate && b.status !== "Cancelled")
    .sort((a, b) => a.timeStart.localeCompare(b.timeStart));

  const SCHED_HOURS = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00"];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", gap: 24 }}>
      {/* LEFT */}
      <div>
        {/* Greeting */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, fontWeight: 500 }}>
            {role === "admin" && "Registry · Court is in session"}
            {role === "judge" && "Bench · Court is in session"}
            {role === "staff" && "Registry — your section"}
            {role === "lawyer" && "Counsel · your appearances"}
            {role === "party" && "Your matters"}
            {role === "rep" && "Matters you represent"}
          </div>
          <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            {role === "admin" && `Welcome back, ${firstName}.`}
            {role === "judge" && `Good morning, ${firstName} J.`}
            {role === "staff" && `Welcome, ${firstName}.`}
            {role === "lawyer" && `Welcome, ${firstName}.`}
            {role === "party" && `Hello, ${firstName}.`}
            {role === "rep" && `Hello, ${firstName}.`}
          </div>
          <div style={{ fontSize: 13.5, color: "var(--text-2)", marginTop: 4 }}>
            {role === "judge" && (
              <>You're presiding on <b style={{ color: "var(--text)" }}>{buckets.presiding.length}</b> matter{buckets.presiding.length === 1 ? "" : "s"}, sitting on <b style={{ color: "var(--text)" }}>{buckets.sitting.length}</b>, and your section has <b style={{ color: "var(--text)" }}>{buckets.section.length}</b> more on the roll.</>
            )}
            {role === "admin" && <>{cases.length} matters on the roll. {openTasks} open tasks across active matters.</>}
            {role === "staff" && <>{cases.length} matter{cases.length === 1 ? "" : "s"} routed to your section. {openTasks} open tasks.</>}
            {role === "lawyer" && <>You have appearances on {cases.length} matter{cases.length === 1 ? "" : "s"}.</>}
            {(role === "party" || role === "rep") && <>{cases.length} matter{cases.length === 1 ? "" : "s"} on file.</>}
          </div>
        </div>

        {/* Quick actions */}
        {setModal && (role === "admin" || role === "judge" || role === "staff" || role === "lawyer") && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
            {(role === "admin") && (
              <QuickAction icon={<I.cases size={13}/>} label="New case" onClick={() => setModal("newCase")}/>
            )}
            {(role === "admin" || role === "judge" || role === "staff") && (
              <QuickAction icon={<I.check size={13}/>} label="New task" onClick={() => setModal("newTask")}/>
            )}
            {(role === "admin" || role === "staff") && (
              <QuickAction icon={<I.court size={13}/>} label="Schedule hearing" onClick={() => setModal("newBooking")}/>
            )}
            {(role === "admin" || role === "judge" || role === "staff") && (
              <QuickAction icon={<I.doc size={13}/>} label="Issue summons" onClick={() => setModal({ type: "pickTemplate", filterCategory: "Summons" })}/>
            )}
            {(role === "admin" || role === "judge") && (
              <QuickAction icon={<I.doc size={13}/>} label="Stay order" onClick={() => setModal({ type: "pickTemplate", filterCategory: "Order", filterName: "Stay" })}/>
            )}
            {(role === "admin") && (
              <QuickAction icon={<I.target size={13}/>} label="New target" onClick={() => setModal("newTarget")}/>
            )}
            {(role === "lawyer") && (
              <QuickAction icon={<I.doc size={13}/>} label="File request" onClick={() => setModal("newRequest")}/>
            )}
            {setAiOpen && (
              <QuickAction icon={<I.sparkle size={13}/>} label="Ask the registry advisor" tone="accent" onClick={() => setAiOpen(true)}/>
            )}
          </div>
        )}

        {/* Judge: presiding / sitting / section buckets */}
        {role === "judge" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 22 }}>
            <JudgeBucket label="Presiding" tone="accent" cases={buckets.presiding} goCase={goCase}
              hint="You're the lead judge"/>
            <JudgeBucket label="Sitting" tone="judge" cases={buckets.sitting} goCase={goCase}
              hint="On the panel"/>
            <JudgeBucket label="Section" tone="neutral" cases={buckets.section} goCase={goCase}
              hint="Your section's roll"/>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 22 }}>
          <Stat label="Active" value={active} sub={`${cases.length} total on roll`}
            onClick={() => setPage("cases")} />
          <Stat label="Pending" value={pending} sub="awaiting registration"
            onClick={() => setPage("cases")} />
          <Stat label="Open tasks" value={openTasks} sub={`${totalTasks.length - openTasks} completed`}
            onClick={() => setPage("tasks")} />
          <Stat label="This week" value={bookings.filter(b=>{
            const bd = new Date(b.date); const ws = new Date(weekStart);
            return bd >= ws && bd < addDays(ws, 7) && b.status !== "Cancelled";
          }).length} sub="hearings scheduled"
            onClick={() => setPage("courtrooms")} />
        </div>

        {/* Cause list table */}
        <Card padding={0} style={{ marginBottom: 22 }}>
          <div style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--line)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.005em" }}>Cause list</div>
              <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 1 }}>Most recently active matters</div>
            </div>
            <button onClick={() => setPage("cases")} style={{
              fontSize: 12, color: "var(--text-2)",
              background: "transparent", border: "1px solid var(--line)",
              borderRadius: 6, padding: "5px 11px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              All cases <I.arrowR size={12}/>
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--paper-2)" }}>
                {["Case", "Bench", "Type", "Status", "Tasks", "Filed"].map((h) => (
                  <th key={h} style={{
                    fontSize: 10.5, color: "var(--text-3)",
                    fontWeight: 500, textAlign: "left",
                    padding: "8px 18px", textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    borderBottom: "1px solid var(--line)",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cases.slice(0, 5).map((c) => {
                const done = c.tasks.filter(t => t.done).length;
                const pct = c.tasks.length ? Math.round(done / c.tasks.length * 100) : 0;
                return (
                  <tr key={c.id} onClick={() => goCase(c)}
                    style={{ cursor: "pointer", transition: "background .1s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--paper-2)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "13px 18px", borderBottom: "1px solid var(--line-soft)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span className="mono" style={{ fontSize: 11, color: "var(--text-3)", minWidth: 78 }}>{c.id}</span>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{c.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: "13px 18px", borderBottom: "1px solid var(--line-soft)" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {c.judges.slice(0, 3).map((j, i) => (
                          <div key={j} style={{ marginLeft: i ? -7 : 0, border: "2px solid var(--paper)", borderRadius: 6 }}>
                            <Avatar name={j} size={22} tone="judge"/>
                          </div>
                        ))}
                        {c.judges.length > 3 && (
                          <div style={{
                            marginLeft: -7, border: "2px solid var(--paper)",
                            borderRadius: 6, width: 22, height: 22,
                            background: "var(--paper-3)", color: "var(--text-2)",
                            fontSize: 9.5, fontWeight: 500,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>+{c.judges.length - 3}</div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "13px 18px", borderBottom: "1px solid var(--line-soft)", fontSize: 12, color: "var(--text-2)" }}>
                      {c.type}
                    </td>
                    <td style={{ padding: "13px 18px", borderBottom: "1px solid var(--line-soft)" }}>
                      <Pill label={c.status} dot/>
                    </td>
                    <td style={{ padding: "13px 18px", borderBottom: "1px solid var(--line-soft)" }}>
                      {c.tasks.length === 0
                        ? <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>—</span>
                        : (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 60, height: 4, background: "var(--paper-3)", borderRadius: 2 }}>
                              <div style={{ width: `${pct}%`, height: 4, background: pct === 100 ? "var(--success)" : "var(--ink)", borderRadius: 2 }}/>
                            </div>
                            <span className="mono" style={{ fontSize: 11, color: "var(--text-2)" }}>{done}/{c.tasks.length}</span>
                          </div>
                        )}
                    </td>
                    <td style={{ padding: "13px 18px", borderBottom: "1px solid var(--line-soft)", fontSize: 12, color: "var(--text-3)" }}>
                      {c.filed}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {/* Targets + Activity */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card padding="18px" interactive onClick={() => setPage("targets")}>
            <SectionTitle hint="Quarter-to-date">Targets</SectionTitle>
            {targets.slice(0, 4).map((t) => {
              const pct = Math.min(100, Math.round((t.current / t.metric) * 100));
              return (
                <div key={t.id} style={{
                  display: "grid", gridTemplateColumns: "1fr auto",
                  gap: 12, padding: "10px 0",
                  borderTop: "1px solid var(--line-soft)",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 5 }}>{t.description}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: "var(--paper-3)", borderRadius: 2 }}>
                        <div style={{
                          width: `${pct}%`, height: 4, borderRadius: 2,
                          background: pct >= 80 ? "var(--success)" : pct >= 50 ? "var(--ink)" : "var(--warn)",
                        }}/>
                      </div>
                      <span className="mono" style={{ fontSize: 10.5, color: "var(--text-3)", minWidth: 32, textAlign: "right" }}>
                        {t.current}/{t.metric}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 36 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.02em" }}>{pct}%</div>
                  </div>
                </div>
              );
            })}
          </Card>
          <Card padding="18px" interactive onClick={() => setPage("courtrooms")}>
            <SectionTitle hint="Last 14 days">Hearings completed</SectionTitle>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 32, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1 }}>38</div>
              <Pill label="+12% wow" tone="Active" size="xs" />
            </div>
            <SparkBar data={[3,4,2,5,3,4,6,5,4,5,7,6,5,8]} height={42}/>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--text-3)", marginTop: 8 }}>
              <span>Apr 15</span><span>Apr 28</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line-soft)" }}>
              {[
                ["Adjourned", "9", "var(--warn)"],
                ["Completed", "26", "var(--success)"],
                ["Reserved", "3", "var(--accent)"],
              ].map(([l, v, c]) => (
                <div key={l}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: c }}>{v}</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>{l}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* RIGHT — Hearing schedule */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card padding={0}>
          <div style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--line)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>Today's bench</div>
              <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 1 }}>
                {dayBookings.length} hearing{dayBookings.length !== 1 ? "s" : ""} listed
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setWeekStart(p => addDays(p, -7))} style={navBtnStyle}>
                <I.chevronL size={13}/>
              </button>
              <button onClick={() => setWeekStart(p => addDays(p, 7))} style={navBtnStyle}>
                <I.chevronR size={13}/>
              </button>
            </div>
          </div>

          {/* Week strip */}
          <div style={{ padding: "12px 14px 6px", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {weekDates.map((d) => {
              const dt = new Date(d + "T00:00:00");
              const isToday = d === todayStr;
              const isSel = d === schedDate;
              const has = bookings.some(b => b.date === d && b.status !== "Cancelled");
              return (
                <button key={d} onClick={() => setSchedDate(d)} style={{
                  padding: "8px 0",
                  borderRadius: 6,
                  border: isToday && !isSel ? "1px solid var(--line-2)" : "1px solid transparent",
                  background: isSel ? "var(--ink)" : "transparent",
                  color: isSel ? "var(--paper)" : "var(--text)",
                  cursor: "pointer", textAlign: "center",
                  display: "flex", flexDirection: "column", gap: 2, alignItems: "center",
                }}>
                  <span style={{ fontSize: 9.5, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {WEEK_DAYS[dt.getDay()]}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.02em" }}>{dt.getDate()}</span>
                  <span style={{
                    width: 4, height: 4, borderRadius: "50%",
                    background: has ? (isSel ? "var(--paper)" : "var(--ink)") : "transparent",
                    opacity: has ? 0.7 : 0,
                  }}/>
                </button>
              );
            })}
          </div>

          {/* Time grid */}
          <div style={{ padding: "8px 14px 14px", maxHeight: 380, overflowY: "auto" }}>
            {SCHED_HOURS.map((slot) => {
              const ev = dayBookings.find(b => b.timeStart === slot
                || (timeToMins(slot) > timeToMins(b.timeStart) && timeToMins(slot) < timeToMins(b.timeEnd)));
              const isStart = ev && ev.timeStart === slot;
              const hue = ev ? COURT_HUE[ev.courtroom] : null;
              return (
                <div key={slot} style={{ display: "flex", gap: 10, marginBottom: 4, alignItems: "stretch" }}>
                  <div className="mono" style={{
                    fontSize: 10.5, color: "var(--text-3)",
                    width: 36, flexShrink: 0, paddingTop: 8, textAlign: "right",
                  }}>{slot}</div>
                  {ev && isStart ? (
                    <button onClick={() => {
                      const linked = cases.find(c => c.id === ev.caseId) || cases.find(c => c.title === ev.caseTitle);
                      if (linked) goCase(linked); else setPage("courtrooms");
                    }} style={{
                      flex: 1,
                      background: hue.soft,
                      borderLeft: `2px solid ${hue.bar}`,
                      borderRadius: "0 6px 6px 0",
                      borderTop: "none", borderRight: "none", borderBottom: "none",
                      padding: "8px 12px",
                      textAlign: "left", cursor: "pointer", color: "inherit",
                      transition: "filter .12s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(0.97)"}
                    onMouseLeave={(e) => e.currentTarget.style.filter = "none"}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 3, lineHeight: 1.25 }}>
                        {ev.caseTitle}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: "var(--text-2)" }}>
                        <span className="mono">{ev.timeStart}–{ev.timeEnd}</span>
                        <span>·</span>
                        <span>{ev.courtroom}</span>
                      </div>
                    </button>
                  ) : ev ? (
                    <div style={{ flex: 1, height: 32, background: hue.soft, borderLeft: `2px solid ${hue.bar}`, opacity: 0.5 }}/>
                  ) : (
                    <div style={{ flex: 1, height: 32, borderTop: "1px dashed var(--line)", marginTop: 12 }}/>
                  )}
                </div>
              );
            })}
            {dayBookings.length === 0 && (
              <div style={{ padding: "1.5rem 0", textAlign: "center", fontSize: 12, color: "var(--text-3)" }}>
                Court not in session.
              </div>
            )}
          </div>
        </Card>

        {/* Tasks (open + due soon) */}
        <DashTasks cases={cases} setPage={setPage} goCase={goCase}/>

        {/* Pending requests preview */}
        <Card padding={0}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>Pending requests</div>
              <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 1 }}>Awaiting registrar review</div>
            </div>
            <button onClick={() => setPage("requests")} style={navBtnStyle}>
              <I.arrowR size={13}/>
            </button>
          </div>
          <div style={{ padding: "4px 6px 8px" }}>
            {cases.flatMap(c => (c.requests || []).filter(r => r.status === "Pending").map(r => ({...r, caseId: c.id, caseTitle: c.title }))).slice(0, 4).map((r) => (
              <button key={r.caseId + r.id} onClick={() => {
                const linked = cases.find(c => c.id === r.caseId);
                if (linked) goCase(linked); else setPage("requests");
              }} style={{
                width: "100%",
                padding: "10px 12px", borderRadius: 6, cursor: "pointer",
                display: "flex", gap: 10, alignItems: "center",
                background: "transparent", border: "none", textAlign: "left",
                color: "inherit",
              }} onMouseEnter={(e)=>e.currentTarget.style.background="var(--paper-2)"}
                 onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}>
                <Pill label={r.type} size="xs" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.caseTitle}
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--text-3)" }}>
                    Filed by {r.filedBy} · {r.submittedAt}
                  </div>
                </div>
                <I.arrowR size={11} stroke="var(--text-3)"/>
              </button>
            ))}
            {cases.flatMap(c => (c.requests || []).filter(r => r.status === "Pending")).length === 0 && (
              <div style={{ padding: "20px 12px", textAlign: "center", fontSize: 11.5, color: "var(--text-3)" }}>
                No pending requests.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

const navBtnStyle = {
  width: 28, height: 28, borderRadius: 6,
  background: "transparent", border: "1px solid var(--line)",
  cursor: "pointer", color: "var(--text-2)",
  display: "flex", alignItems: "center", justifyContent: "center",
};

window.DashPage = DashPage;
window.COURT_HUE = COURT_HUE;