// ─── AI Advisor side panel ───────────────────────────────────────────────────

const AIAdvisor = ({ open, onClose, cases, targets, bookings }) => {
  const [msgs, setMsgs] = React.useState([
    { role: "assistant", content: "I'm your Case Advisor. I can summarize the docket, suggest scheduling, flag conflicts, or draft directions. What would you like?" },
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [msgs, loading]);

  const send = async (text) => {
    const t = text || input;
    if (!t.trim() || loading) return;
    const next = [...msgs, { role: "user", content: t }];
    setMsgs(next); setInput(""); setLoading(true);
    const cSum = cases.map(c => `${c.id} "${c.title}" (${c.type}, ${c.status}) — presiding: ${c.presiding}; tasks: ${c.tasks.length}`).join("\n");
    const tSum = targets.map(t => `- ${t.description} ${t.current}/${t.metric} by ${t.deadline}`).join("\n");
    const bSum = bookings.filter(b => b.status !== "Cancelled").slice(0, 8).map(b => `${b.date} ${b.timeStart}-${b.timeEnd} ${b.courtroom}: ${b.caseTitle}`).join("\n");
    try {
      const reply = await window.claude.complete({
        messages: [
          { role: "user", content: `You are a concise Case Advisor for a High Court registrar. Use plain prose and short bullet points. Be specific and reference case numbers when relevant.

Current docket:
${cSum}

Targets:
${tSum}

Upcoming hearings:
${bSum}

The registrar's question: ${t}` },
        ],
      });
      setMsgs(p => [...p, { role: "assistant", content: reply }]);
    } catch (e) {
      setMsgs(p => [...p, { role: "assistant", content: "I couldn't reach the advisor right now. Try again in a moment." }]);
    }
    setLoading(false);
  };

  const suggestions = [
    "Summarize today's cause list",
    "Which cases are at risk of breaching SLA?",
    "Draft directions for HC/2024/002",
  ];

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
            <div style={{ fontSize: 13, fontWeight: 500 }}>Case Advisor</div>
            <div style={{ fontSize: 10.5, color: "var(--text-3)" }}>Powered by Claude</div>
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
            maxWidth: "90%",
            background: m.role === "user" ? "var(--ink)" : "var(--paper-2)",
            color: m.role === "user" ? "var(--paper)" : "var(--text)",
            padding: "9px 13px",
            borderRadius: m.role === "user" ? "10px 10px 3px 10px" : "10px 10px 10px 3px",
            fontSize: 12.5, lineHeight: 1.5, whiteSpace: "pre-wrap",
          }}>{m.content}</div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", background: "var(--paper-2)", padding: "9px 13px", borderRadius: "10px 10px 10px 3px", display: "flex", gap: 4 }}>
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

      <div style={{ padding: "12px 14px", borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)}
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
      <style>{`@keyframes aiPulse { 0%,100% { opacity: 0.3; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-2px); } }`}</style>
    </aside>
  );
};

window.AIAdvisor = AIAdvisor;
