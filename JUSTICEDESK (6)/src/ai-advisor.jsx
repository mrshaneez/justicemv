// ─── AI Advisor side panel ───────────────────────────────────────────────────

const ROLE_INTRO = {
  admin: "I'm your registry advisor. I can summarise the docket, flag SLA risks, suggest scheduling, or draft directions and notices.",
  judge: "I'm your bench advisor. I can summarise your roll, surface what's pending decision, and draft directions or short reasons.",
  staff: "I'm your section advisor. I can summarise your section's matters, flag what's slipping, and help you triage tasks.",
  lawyer: "I'm your matter advisor. I can summarise your appearances, suggest filings, and check the schedule.",
  party:  "I'm your case advisor. I can explain what's happening on your matter and what to expect next.",
  rep:    "I'm your case advisor. I can summarise progress and what's coming up.",
};

const ROLE_SUGGESTIONS = {
  admin: [
    "Which cases are at risk of breaching SLA this week?",
    "Summarise today's cause list",
    "What's outstanding for HC/2024/002?",
    "Draft a notice of set-down for a part-heard matter",
  ],
  judge: [
    "What's on my roll this week?",
    "Which matters need a ruling from me?",
    "Draft directions for the next CMC",
    "Summarise where HC/2024/002 stands",
  ],
  staff: [
    "What does my section have outstanding?",
    "Which tasks are overdue?",
    "Summarise the next set-down for HC/2024/008",
  ],
  lawyer: [
    "What's on my roll this week?",
    "Summarise the status of my matters",
    "Help me draft an adjournment request",
  ],
  party: [
    "What's happening on my case?",
    "When is my next hearing?",
  ],
  rep: [
    "What's the latest on my matter?",
    "When is the next hearing?",
  ],
};

// Render a constrained markdown subset → React: **bold**, *em*, `code`,
// bullet lists, and **HC/YYYY/NNN** auto-links.
const CASE_ID_RE = /(HC\/\d{4}\/\d{3})/g;
const renderRich = (text, onCaseClick) => {
  const blocks = String(text || "").split(/\n{2,}/);
  return blocks.map((blk, bi) => {
    const lines = blk.split("\n");
    const isList = lines.every(l => /^\s*[-•*]\s+/.test(l));
    if (isList) {
      return (
        <ul key={bi} style={{ margin: "4px 0 6px 18px", padding: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          {lines.map((l, i) => (
            <li key={i} style={{ paddingLeft: 4, color: "var(--text)", fontSize: "inherit" }}>
              {renderInline(l.replace(/^\s*[-•*]\s+/, ""), onCaseClick)}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <div key={bi} style={{ marginBottom: bi < blocks.length - 1 ? 6 : 0 }}>
        {lines.map((l, i) => (
          <React.Fragment key={i}>
            {renderInline(l, onCaseClick)}
            {i < lines.length - 1 && <br/>}
          </React.Fragment>
        ))}
      </div>
    );
  });
};

const renderInline = (line, onCaseClick) => {
  // Tokenise for **bold**, *em*, `code`, and case ids.
  const parts = [];
  let rest = line;
  let key = 0;
  while (rest.length) {
    const bold = rest.match(/^\*\*([^*]+)\*\*/);
    if (bold) { parts.push(<strong key={key++}>{bold[1]}</strong>); rest = rest.slice(bold[0].length); continue; }
    const em = rest.match(/^\*([^*]+)\*/);
    if (em) { parts.push(<em key={key++}>{em[1]}</em>); rest = rest.slice(em[0].length); continue; }
    const code = rest.match(/^`([^`]+)`/);
    if (code) { parts.push(<code key={key++} style={{ background: "var(--paper-3)", padding: "1px 5px", borderRadius: 3, fontSize: "0.92em", fontFamily: "ui-monospace, monospace" }}>{code[1]}</code>); rest = rest.slice(code[0].length); continue; }
    const cid = rest.match(CASE_ID_RE);
    if (cid && rest.indexOf(cid[0]) === 0) {
      const id = cid[0];
      parts.push(
        <button key={key++} onClick={() => onCaseClick && onCaseClick(id)} style={{
          background: "var(--accent-soft)", color: "var(--accent-strong)",
          border: "1px solid var(--accent-line)", padding: "0 5px",
          borderRadius: 3, fontFamily: "ui-monospace, monospace",
          fontSize: "0.9em", cursor: onCaseClick ? "pointer" : "default",
        }}>{id}</button>
      );
      rest = rest.slice(id.length);
      continue;
    }
    // Take chars until the next interesting marker.
    const next = rest.search(/(\*\*|\*|`|HC\/\d{4}\/\d{3})/);
    if (next === -1) { parts.push(rest); break; }
    parts.push(rest.slice(0, next));
    rest = rest.slice(next);
  }
  return parts;
};

const buildContextDigest = ({ session, cases, targets, bookings }) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const fmt = (d) => d.toISOString().slice(0, 10);
  const inDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };
  const caseLines = cases.slice(0, 30).map(c => {
    const openTasks = (c.tasks || []).filter(t => !t.done).length;
    const nextHearing = (bookings || []).filter(b => b.caseId === c.id && new Date(b.date) >= today && b.status !== "Cancelled")
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    return `${c.id} "${c.title}" · ${c.type} · ${c.status} · presiding ${c.presiding}` +
      `${nextHearing ? ` · next hearing ${nextHearing.date} ${nextHearing.timeStart} ${nextHearing.courtroom}` : ""}` +
      ` · open tasks ${openTasks}`;
  }).join("\n");
  const upcoming = (bookings || []).filter(b => {
    const bd = new Date(b.date);
    return bd >= today && bd <= inDays(7) && b.status !== "Cancelled";
  }).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 12)
    .map(b => `${b.date} ${b.timeStart}-${b.timeEnd} ${b.courtroom} · ${b.caseId} ${b.caseTitle}`).join("\n");
  const targetLines = (targets || []).map(t => `${t.description}: ${t.current}/${t.metric} (deadline ${t.deadline})`).join("\n");
  const overdueTasks = cases.flatMap(c => (c.tasks || [])
    .filter(t => !t.done && t.due && new Date(t.due) < today)
    .map(t => `${c.id} · ${t.text} (assignee ${t.assignee}, due ${t.due})`)).slice(0, 10).join("\n");
  return [
    `Today: ${fmt(today)}`,
    `User: ${session?.name || "Anon"} (${session?.role || "anon"})`,
    "",
    "DOCKET (most-active first):",
    caseLines || "(no matters in scope)",
    "",
    "UPCOMING (next 7 days):",
    upcoming || "(no hearings)",
    "",
    "OVERDUE TASKS:",
    overdueTasks || "(none)",
    "",
    "TARGETS:",
    targetLines || "(none)",
  ].join("\n");
};

const AIAdvisor = ({ open, onClose, cases, targets, bookings }) => {
  const { session } = useAuth();
  const role = session?.role || "admin";
  const [msgs, setMsgs] = React.useState(() => [
    { role: "assistant", content: ROLE_INTRO[role] || ROLE_INTRO.admin },
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const ref = React.useRef(null);
  const inputRef = React.useRef(null);
  React.useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [msgs, loading]);
  React.useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);

  // Reset greeting when the role changes.
  React.useEffect(() => {
    setMsgs([{ role: "assistant", content: ROLE_INTRO[role] || ROLE_INTRO.admin }]);
  }, [role]);

  const handleCaseClick = (id) => {
    window.dispatchEvent(new CustomEvent("hc:goCase", { detail: { id } }));
    onClose && onClose();
  };

  const send = async (text) => {
    const t = text || input;
    if (!t.trim() || loading) return;
    const next = [...msgs, { role: "user", content: t }];
    setMsgs(next); setInput(""); setLoading(true);
    const ctx = buildContextDigest({ session, cases, targets, bookings });
    const system = `You are the registry advisor inside a High Court case-management system. ` +
      `You help with cause-list summaries, scheduling, task triage, SLA risk, and short drafting (directions, notices, adjournment letters). ` +
      `Tone: precise, calm, civil-service register; never speculate beyond the data provided. ` +
      `When you reference a case, write its full id like HC/2024/002 — the UI links these automatically. ` +
      `When drafting, keep to ~6 lines unless asked otherwise. Format with **bold**, *italics*, and bullet lists where helpful.`;
    try {
      const reply = await window.claude.complete({
        messages: [
          { role: "user", content: `${system}\n\nCONTEXT (live system data):\n${ctx}\n\n— end context —\n\nThe user (${role}) asks:\n${t}` },
        ],
      });
      setMsgs(p => [...p, { role: "assistant", content: reply }]);
    } catch (e) {
      setMsgs(p => [...p, { role: "assistant", content: "I couldn't reach the advisor right now. Try again in a moment." }]);
    }
    setLoading(false);
  };

  const suggestions = (ROLE_SUGGESTIONS[role] || ROLE_SUGGESTIONS.admin);

  if (!open) return null;
  return (
    <aside style={{
      width: 380, flexShrink: 0,
      background: "var(--paper)",
      borderLeft: "1px solid var(--line)",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: "var(--ink)", color: "var(--paper)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <I.sparkle size={14}/>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Registry Advisor</div>
            <div style={{ fontSize: 10.5, color: "var(--text-3)" }}>Powered by Claude · sees live docket</div>
          </div>
        </div>
        <button onClick={onClose} style={{
          width: 26, height: 26, borderRadius: 5, border: "1px solid transparent",
          background: "transparent", cursor: "pointer", color: "var(--text-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onMouseEnter={(e)=>e.currentTarget.style.background="var(--paper-2)"}
           onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}>
          <I.close size={14}/>
        </button>
      </div>

      <div ref={ref} style={{
        flex: 1, overflowY: "auto", padding: "16px",
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        {msgs.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "92%",
            background: m.role === "user" ? "var(--ink)" : "var(--paper-2)",
            color: m.role === "user" ? "var(--paper)" : "var(--text)",
            padding: "9px 13px",
            borderRadius: m.role === "user" ? "10px 10px 3px 10px" : "10px 10px 10px 3px",
            fontSize: 12.5, lineHeight: 1.55,
            border: m.role === "user" ? "none" : "1px solid var(--line)",
          }}>
            {m.role === "user" ? m.content : renderRich(m.content, handleCaseClick)}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", background: "var(--paper-2)", padding: "9px 13px", borderRadius: "10px 10px 10px 3px", display: "flex", gap: 4, border: "1px solid var(--line)" }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 5, height: 5, borderRadius: "50%", background: "var(--text-3)",
                animation: `aiPulse 1s ease-in-out ${i*0.15}s infinite`,
              }}/>
            ))}
          </div>
        )}
        {msgs.length === 1 && !loading && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 10.5, color: "var(--text-3)", letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 500, marginBottom: 4 }}>Try asking</div>
            {suggestions.map((s) => (
              <button key={s} onClick={() => send(s)} style={{
                textAlign: "left", padding: "8px 12px",
                background: "var(--paper)", border: "1px solid var(--line)",
                borderRadius: 7, fontSize: 12.5, color: "var(--text-2)",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              }} onMouseEnter={(e) => { e.currentTarget.style.background = "var(--paper-2)"; e.currentTarget.style.borderColor = "var(--line-2)"; }}
                 onMouseLeave={(e) => { e.currentTarget.style.background = "var(--paper)"; e.currentTarget.style.borderColor = "var(--line)"; }}>
                <I.arrowR size={11} stroke="var(--text-3)"/>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "12px 14px", borderTop: "1px solid var(--line)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask the advisor…"
            style={{ flex: 1, padding: "8px 11px", borderRadius: 6, border: "1px solid var(--line-2)", background: "var(--paper-2)", color: "var(--text)", fontSize: 12.5, outline: "none" }}/>
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{
            padding: "8px 12px", background: "var(--ink)", color: "var(--paper)",
            border: "none", borderRadius: 6, cursor: loading ? "not-allowed" : "pointer",
            opacity: loading || !input.trim() ? 0.5 : 1,
            display: "flex", alignItems: "center",
          }}>
            <I.arrowUp size={13}/>
          </button>
        </div>
        <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 7, lineHeight: 1.4 }}>
          Treat replies as suggestions. The advisor sees the live docket but cannot file or seal anything itself.
        </div>
      </div>
      <style>{`@keyframes aiPulse { 0%,100% { opacity: 0.3; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-2px); } }`}</style>
    </aside>
  );
};

window.AIAdvisor = AIAdvisor;
