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

// ── Legal research mode — general legal assistant, not docket-bound ──────────
const RESEARCH_INTRO =
  "I'm in legal research mode. Ask me about legal principles, statutes, procedure, " +
  "precedent, or doctrine — or have me outline arguments and draft research memos. " +
  "I reason from general principles and will flag where you should verify against primary sources.";

const RESEARCH_SUGGESTIONS = [
  "Explain the test for granting a stay of execution pending appeal",
  "What are the grounds for appeal against a criminal conviction?",
  "Summarise the principles on admissibility of confession evidence",
  "Draft a short research memo on the standard of proof in civil fraud",
];

// localStorage persistence for saved conversations
const ADVISOR_STORE_KEY = "hc:advisorChats:v1";
const uid = () => `chat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const nowIso = () => new Date().toISOString();

const introFor = (mode, role) =>
  mode === "research" ? RESEARCH_INTRO : (ROLE_INTRO[role] || ROLE_INTRO.admin);

const makeChat = (mode, role) => ({
  id: uid(), name: "New chat", mode,
  msgs: [{ role: "assistant", content: introFor(mode, role) }],
  createdAt: nowIso(), updatedAt: nowIso(),
});

const loadChats = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(ADVISOR_STORE_KEY) || "null");
    if (raw && Array.isArray(raw.chats) && raw.chats.length) return raw;
  } catch (e) { /* ignore */ }
  return null;
};
const saveChats = (chats, activeId) => {
  try { localStorage.setItem(ADVISOR_STORE_KEY, JSON.stringify({ chats, activeId })); }
  catch (e) { /* ignore quota */ }
};
const relTime = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
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

  // ── Saved conversations (persisted) ──
  const [chats, setChats] = React.useState(() => {
    const stored = loadChats();
    return stored ? stored.chats : [makeChat("docket", role)];
  });
  const [activeId, setActiveId] = React.useState(() => {
    const stored = loadChats();
    return stored ? (stored.activeId || stored.chats[0].id) : null;
  });
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [renamingId, setRenamingId] = React.useState(null);
  const [renameText, setRenameText] = React.useState("");

  // Ensure we always have a valid active chat
  const active = chats.find((c) => c.id === activeId) || chats[0];
  React.useEffect(() => { if (!activeId && chats[0]) setActiveId(chats[0].id); }, [activeId, chats]);

  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const ref = React.useRef(null);
  const inputRef = React.useRef(null);

  const msgs = active?.msgs || [];
  const mode = active?.mode || "docket";

  // Persist on every change
  React.useEffect(() => { saveChats(chats, activeId); }, [chats, activeId]);
  React.useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [msgs, loading]);
  React.useEffect(() => { if (open && inputRef.current && !historyOpen) inputRef.current.focus(); }, [open, historyOpen, activeId]);

  // ── Chat operations ──
  const patchActive = (patch) => setChats((p) => p.map((c) =>
    c.id === active.id ? { ...c, ...patch, updatedAt: nowIso() } : c));

  const newChat = (m = mode) => {
    const c = makeChat(m, role);
    setChats((p) => [c, ...p]);
    setActiveId(c.id);
    setHistoryOpen(false);
    setInput("");
  };
  const openChat = (id) => { setActiveId(id); setHistoryOpen(false); };
  const deleteChat = (id) => {
    setChats((p) => {
      const next = p.filter((c) => c.id !== id);
      if (next.length === 0) { const c = makeChat("docket", role); setActiveId(c.id); return [c]; }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  };
  const commitRename = (id) => {
    const name = renameText.trim() || "Untitled";
    setChats((p) => p.map((c) => c.id === id ? { ...c, name } : c));
    setRenamingId(null); setRenameText("");
  };
  const setMode = (m) => {
    if (m === mode) return;
    // If the chat is still empty (only the intro), swap the intro to match the mode.
    if (msgs.length <= 1) {
      patchActive({ mode: m, msgs: [{ role: "assistant", content: introFor(m, role) }] });
    } else {
      patchActive({ mode: m });
    }
    setInput("");
  };

  const handleCaseClick = (id) => {
    window.dispatchEvent(new CustomEvent("hc:goCase", { detail: { id } }));
    onClose && onClose();
  };

  const send = async (text) => {
    const t = text || input;
    if (!t.trim() || loading || !active) return;
    const isFirstUserMsg = !msgs.some((m) => m.role === "user");
    const next = [...msgs, { role: "user", content: t }];
    // Auto-name the chat from the first question
    const autoName = (active.name === "New chat" && isFirstUserMsg)
      ? t.trim().replace(/\s+/g, " ").slice(0, 42) + (t.trim().length > 42 ? "…" : "")
      : active.name;
    patchActive({ msgs: next, name: autoName });
    setInput(""); setLoading(true);

    let system, userContent;
    if (mode === "research") {
      system =
        `You are a legal research assistant supporting lawyers and judges at the High Court of the Maldives. ` +
        `Help with legal research: explain principles, statutes, procedure, precedent and doctrine; ` +
        `outline arguments for and against; and draft research memos and skeleton arguments. ` +
        `The Maldivian legal system blends civil-law structure, common-law reasoning and Islamic law; ` +
        `where a jurisdiction-specific authority is uncertain, say so plainly and reason from general principles. ` +
        `Be candid about the limits of your knowledge and flag where the user must verify against primary sources ` +
        `(statutes, decided cases, practice directions). Do not invent citations. ` +
        `Tone: precise and scholarly. Format with **bold**, *italics*, headings and bullet lists where helpful.`;
      userContent = `The ${role} asks a legal-research question:\n\n${t}`;
    } else {
      const ctx = buildContextDigest({ session, cases, targets, bookings });
      system = `You are the registry advisor inside a High Court case-management system. ` +
        `You help with cause-list summaries, scheduling, task triage, SLA risk, and short drafting (directions, notices, adjournment letters). ` +
        `Tone: precise, calm, civil-service register; never speculate beyond the data provided. ` +
        `When you reference a case, write its full id like HC/2024/002 — the UI links these automatically. ` +
        `When drafting, keep to ~6 lines unless asked otherwise. Format with **bold**, *italics*, and bullet lists where helpful.`;
      userContent = `CONTEXT (live system data):\n${ctx}\n\n— end context —\n\nThe user (${role}) asks:\n${t}`;
    }

    try {
      const reply = await window.claude.complete({
        messages: [{ role: "user", content: `${system}\n\n${userContent}` }],
      });
      setChats((p) => p.map((c) => c.id === active.id
        ? { ...c, msgs: [...next, { role: "assistant", content: reply }], updatedAt: nowIso() } : c));
    } catch (e) {
      setChats((p) => p.map((c) => c.id === active.id
        ? { ...c, msgs: [...next, { role: "assistant", content: "I couldn't reach the advisor right now. Try again in a moment." }], updatedAt: nowIso() } : c));
    }
    setLoading(false);
  };

  const suggestions = mode === "research"
    ? RESEARCH_SUGGESTIONS
    : (ROLE_SUGGESTIONS[role] || ROLE_SUGGESTIONS.admin);

  if (!open) return null;
  const sortedChats = [...chats].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <aside style={{
      width: 380, flexShrink: 0,
      background: "var(--paper)",
      borderLeft: "1px solid var(--line)",
      display: "flex", flexDirection: "column",
      position: "relative",
    }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, flexShrink: 0,
            background: "var(--ink)", color: "var(--paper)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <I.sparkle size={14}/>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {active?.name && active.name !== "New chat" ? active.name : "Case Advisor"}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--text-3)" }}>
              {mode === "research" ? "Legal research" : "Powered by Claude · sees live docket"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
          <button onClick={() => newChat()} title="New chat" style={advisorIconBtn}
            onMouseEnter={(e)=>e.currentTarget.style.background="var(--paper-2)"}
            onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}>
            <I.plus size={15}/>
          </button>
          <button onClick={() => setHistoryOpen((v) => !v)} title="Saved chats" style={{
            ...advisorIconBtn, background: historyOpen ? "var(--paper-2)" : "transparent" }}
            onMouseEnter={(e)=>e.currentTarget.style.background="var(--paper-2)"}
            onMouseLeave={(e)=>e.currentTarget.style.background=historyOpen?"var(--paper-2)":"transparent"}>
            <I.list size={15}/>
          </button>
          <button onClick={onClose} title="Close" style={advisorIconBtn}
            onMouseEnter={(e)=>e.currentTarget.style.background="var(--paper-2)"}
            onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}>
            <I.close size={14}/>
          </button>
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", display: "flex", gap: 6 }}>
        {[
          { id: "docket", label: "Docket advisor", icon: <I.sparkle size={12}/> },
          { id: "research", label: "Legal research", icon: <I.book size={12}/> },
        ].map((m) => {
          const on = mode === m.id;
          return (
            <button key={m.id} onClick={() => setMode(m.id)} style={{
              flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "7px 10px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 500,
              border: `1px solid ${on ? "var(--ink)" : "var(--line)"}`,
              background: on ? "var(--ink)" : "var(--paper)",
              color: on ? "var(--paper)" : "var(--text-2)",
            }}>{m.icon} {m.label}</button>
          );
        })}
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
            placeholder={mode === "research" ? "Ask a legal-research question…" : "Ask the advisor…"}
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
          {mode === "research"
            ? "Research aid only — verify all authorities against primary sources before relying on them."
            : "Treat replies as suggestions. The advisor sees the live docket but cannot file or seal anything itself."}
        </div>
      </div>

      {/* Saved-chats drawer */}
      {historyOpen && (
        <div style={{
          position: "absolute", inset: 0, background: "var(--paper)",
          display: "flex", flexDirection: "column", zIndex: 20,
        }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)",
            display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Saved chats <span style={{ color: "var(--text-3)", fontWeight: 400 }}>{chats.length}</span></div>
            <button onClick={() => setHistoryOpen(false)} style={advisorIconBtn}
              onMouseEnter={(e)=>e.currentTarget.style.background="var(--paper-2)"}
              onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}>
              <I.close size={14}/>
            </button>
          </div>
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--line-soft)", display: "flex", gap: 6 }}>
            <Btn size="sm" variant="primary" leading={<I.plus size={12}/>} onClick={() => newChat("docket")} style={{ flex: 1 }}>New docket chat</Btn>
            <Btn size="sm" leading={<I.book size={12}/>} onClick={() => newChat("research")} style={{ flex: 1 }}>New research chat</Btn>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
            {sortedChats.map((c) => {
              const isActive = c.id === activeId;
              const preview = (c.msgs.find((mm) => mm.role === "user")?.content || "No messages yet").slice(0, 60);
              return (
                <div key={c.id} style={{
                  padding: "10px 11px", marginBottom: 6, borderRadius: 8, cursor: "pointer",
                  border: `1px solid ${isActive ? "var(--ink)" : "var(--line)"}`,
                  background: isActive ? "var(--paper-2)" : "var(--paper)",
                }} onClick={() => renamingId !== c.id && openChat(c.id)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase",
                      padding: "1px 6px", borderRadius: 99, flexShrink: 0,
                      background: c.mode === "research" ? "var(--accent-soft)" : "var(--paper-3)",
                      color: c.mode === "research" ? "var(--accent-strong, var(--accent))" : "var(--text-2)",
                    }}>{c.mode === "research" ? "Research" : "Docket"}</span>
                    {renamingId === c.id ? (
                      <input autoFocus value={renameText}
                        onChange={(e) => setRenameText(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => { if (e.key === "Enter") commitRename(c.id); if (e.key === "Escape") { setRenamingId(null); } }}
                        onBlur={() => commitRename(c.id)}
                        style={{ flex: 1, fontSize: 12.5, padding: "2px 6px", border: "1px solid var(--line-2)",
                          borderRadius: 4, outline: "none", fontWeight: 500 }}/>
                    ) : (
                      <span style={{ flex: 1, fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap",
                        overflow: "hidden", textOverflow: "ellipsis" }}>
                        {c.name === "New chat" ? <span style={{ color: "var(--text-3)", fontWeight: 400 }}>New chat</span> : c.name}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--text-3)", whiteSpace: "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{preview}</span>
                    <span style={{ fontSize: 10, color: "var(--text-3)", flexShrink: 0 }}>{relTime(c.updatedAt)}</span>
                    <button onClick={(e) => { e.stopPropagation(); setRenamingId(c.id); setRenameText(c.name === "New chat" ? "" : c.name); }}
                      title="Rename" style={advisorMiniBtn}
                      onMouseEnter={(e)=>e.currentTarget.style.color="var(--text)"}
                      onMouseLeave={(e)=>e.currentTarget.style.color="var(--text-3)"}>
                      <I.edit size={12}/>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteChat(c.id); }}
                      title="Delete" style={advisorMiniBtn}
                      onMouseEnter={(e)=>e.currentTarget.style.color="var(--danger)"}
                      onMouseLeave={(e)=>e.currentTarget.style.color="var(--text-3)"}>
                      <I.trash size={12}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`@keyframes aiPulse { 0%,100% { opacity: 0.3; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-2px); } }`}</style>
    </aside>
  );
};

const advisorIconBtn = {
  width: 26, height: 26, borderRadius: 5, border: "1px solid transparent",
  background: "transparent", cursor: "pointer", color: "var(--text-2)",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const advisorMiniBtn = {
  border: "none", background: "transparent", cursor: "pointer", color: "var(--text-3)",
  padding: 3, display: "flex", alignItems: "center", flexShrink: 0,
};

window.AIAdvisor = AIAdvisor;
