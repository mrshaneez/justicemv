// ─── Documents — generate court documents from templates ──────────────────
// Two surfaces:
//   • DocumentsPage — list templates, pick a case, generate a doc, view archive.
//   • AccessPage    — admin grants cross-section access to judges/staff.

// ── Token resolver: fills {{tokens}} from a case + ambient values ───────────
function resolveTokens(template, caseData) {
  if (!template || !caseData) return template?.body || "";
  const c = caseData;
  const today = new Date().toLocaleDateString("en-GB",
    { day: "2-digit", month: "long", year: "numeric" });

  const appList = (c.appellants || (c.petitioner ? [c.petitioner] : []))
    .map((p) => p.name).filter(Boolean);
  const respList = (c.respondents || (c.respondent ? [c.respondent] : []))
    .map((p) => p.name).filter(Boolean);
  const appLawyers = Array.from(new Set(
    (c.appellants || (c.petitioner ? [c.petitioner] : []))
      .flatMap((p) => p.lawyers || [])));
  const respLawyers = Array.from(new Set(
    (c.respondents || (c.respondent ? [c.respondent] : []))
      .flatMap((p) => p.lawyers || [])));
  const appReps = Array.from(new Set(
    (c.appellants || (c.petitioner ? [c.petitioner] : []))
      .flatMap((p) => p.reps || [])));
  const respReps = Array.from(new Set(
    (c.respondents || (c.respondent ? [c.respondent] : []))
      .flatMap((p) => p.reps || [])));

  // Next hearing — first future hearing or "to be fixed"
  const futureHearing = (c.hearings || [])
    .map((h) => h.date)
    .filter((d) => d && new Date(d) >= new Date(new Date().toDateString()))
    .sort()[0];
  const nextHearing = futureHearing
    ? new Date(futureHearing).toLocaleDateString("en-GB",
        { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
    : "a date to be fixed by the Registry";

  const subs = {
    caseId: c.id || "",
    caseTitle: c.title || "",
    caseType: c.type || "",
    filed: c.filed || "",
    today,
    appellants: appList.join(" and ") || "—",
    respondents: respList.join(" and ") || "—",
    appellantList: appList.join("; ") || "—",
    respondentList: respList.join("; ") || "—",
    appellantLawyers: appLawyers.join(", ") || "—",
    respondentLawyers: respLawyers.join(", ") || "—",
    appellantReps: appReps.join(", ") || "—",
    respondentReps: respReps.join(", ") || "—",
    presiding: c.presiding || "—",
    bench: (c.judges || []).join(", ") || c.presiding || "—",
    summary: c.summary || "—",
    nextHearing,
  };

  return template.body.replace(/\{\{(\w+)\}\}/g, (_, k) =>
    subs[k] !== undefined ? subs[k] : `{{${k}}}`);
}

// ── Documents page ──────────────────────────────────────────────────────────
const DocumentsPage = ({ templates, cases, generatedDocs, setGeneratedDocs, setModal }) => {
  const { session } = useAuth();
  const [tab, setTab] = React.useState("templates");
  const [filter, setFilter] = React.useState("All");

  const categories = ["All", ...Array.from(new Set(templates.map((t) => t.category)))];
  const filtered = filter === "All" ? templates : templates.filter((t) => t.category === filter);

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Tab strip */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--line)", marginBottom: 20 }}>
        {[
          { id: "templates", label: "Templates", count: templates.length },
          { id: "archive",   label: "Generated", count: generatedDocs.length },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 14px", background: "transparent", border: "none",
            borderBottom: tab === t.id ? "2px solid var(--ink)" : "2px solid transparent",
            color: tab === t.id ? "var(--text)" : "var(--text-2)",
            fontSize: 13, fontWeight: tab === t.id ? 500 : 400,
            cursor: "pointer", marginBottom: -1,
          }}>
            {t.label} <span style={{ color: "var(--text-3)", marginLeft: 4 }}>{t.count}</span>
          </button>
        ))}
      </div>

      {tab === "templates" && (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {categories.map((c) => (
              <button key={c} onClick={() => setFilter(c)} style={{
                padding: "5px 11px", borderRadius: 99,
                border: `1px solid ${filter === c ? "var(--ink)" : "var(--line)"}`,
                background: filter === c ? "var(--ink)" : "var(--paper)",
                color: filter === c ? "var(--paper)" : "var(--text-2)",
                fontSize: 11.5, cursor: "pointer", fontWeight: 500,
              }}>{c}</button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
            {filtered.map((tpl) => (
              <Card key={tpl.id} interactive padding="16px"
                onClick={() => setModal({ type: "generateDoc", template: tpl })}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <I.doc size={15} stroke="var(--text-2)"/>
                    <Pill label={tpl.category} size="xs" tone="neutral"/>
                  </div>
                  <span style={{ fontSize: 10, color: "var(--text-3)",
                    fontFamily: "var(--font-mono, monospace)",
                    letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    {tpl.lang === "dv" ? "ދިވެހި" : "EN"}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, letterSpacing: "-0.01em" }}>
                  {tpl.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>
                  {tpl.description}
                </div>
                <div style={{ marginTop: 12, fontSize: 11.5, color: "var(--accent)", fontWeight: 500,
                  display: "flex", alignItems: "center", gap: 4 }}>
                  Generate <I.arrowR size={11}/>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {tab === "archive" && (
        generatedDocs.length === 0
          ? <Empty title="No documents generated yet"
              body="Pick a template to draft your first document. Generated documents will be archived here."
              action={<Btn variant="primary" size="sm" onClick={() => setTab("templates")}>Browse templates</Btn>}/>
          : <Card padding="0">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--line)" }}>
                    <th style={thS}>Document</th>
                    <th style={thS}>Case</th>
                    <th style={thS}>Template</th>
                    <th style={thS}>Generated</th>
                    <th style={thS}>By</th>
                    <th style={{ ...thS, width: 1 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {generatedDocs.map((d) => (
                    <tr key={d.id} style={{ borderBottom: "1px solid var(--line-soft)" }}>
                      <td style={tdS}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <I.doc size={13} stroke="var(--text-3)"/>
                          <span style={{ fontWeight: 500 }}>{d.name}</span>
                        </div>
                      </td>
                      <td style={tdS}><span className="mono" style={{ fontSize: 11.5, color: "var(--text-2)" }}>{d.caseId}</span></td>
                      <td style={tdS}><span style={{ fontSize: 12, color: "var(--text-2)" }}>{d.templateName}</span></td>
                      <td style={tdS}><span style={{ fontSize: 12, color: "var(--text-2)" }}>{d.generatedAt}</span></td>
                      <td style={tdS}><span style={{ fontSize: 12, color: "var(--text-2)" }}>{d.generatedBy}</span></td>
                      <td style={{ ...tdS, textAlign: "right" }}>
                        <Btn size="sm" onClick={() => setModal({ type: "viewDoc", doc: d })}>View</Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
      )}
    </div>
  );
};

const thS = { textAlign: "left", padding: "10px 16px", fontSize: 11,
  color: "var(--text-3)", fontWeight: 500, letterSpacing: "0.04em",
  textTransform: "uppercase" };
const tdS = { padding: "12px 16px", fontSize: 13, verticalAlign: "middle" };

// ── Document toolbar (Word-style) ───────────────────────────────────────────
const DocToolbar = ({ docFontSize, setDocFontSize, lang, setLang, exec, onInsertToken, tokens }) => {
  const [showTokens, setShowTokens] = React.useState(false);
  const Tbtn = ({ icon, label, onClick, active }) => (
    <button onClick={onClick} title={label} style={{
      width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center",
      border: "1px solid transparent", borderRadius: 4, cursor: "pointer",
      background: active ? "var(--paper-2)" : "transparent", color: "var(--text)",
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = "var(--paper-2)"}
    onMouseLeave={(e) => e.currentTarget.style.background = active ? "var(--paper-2)" : "transparent"}>
      {icon}
    </button>
  );
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 4,
      padding: "6px 10px",
      background: "var(--paper-2)",
      borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)",
      flexWrap: "wrap",
    }}>
      <select value={docFontSize} onChange={(e) => setDocFontSize(Number(e.target.value))} style={{
        fontSize: 12, padding: "4px 6px", border: "1px solid var(--line)",
        borderRadius: 4, background: "var(--paper)", cursor: "pointer",
      }}>
        {[10,11,12,13,14,16,18,20,24].map((s) => <option key={s} value={s}>{s}pt</option>)}
      </select>
      <span style={{ width: 1, height: 18, background: "var(--line)", margin: "0 4px" }}/>
      <Tbtn icon={<I.bold size={13}/>}      label="Bold (Ctrl+B)"     onClick={() => exec("bold")}/>
      <Tbtn icon={<I.italic size={13}/>}    label="Italic (Ctrl+I)"   onClick={() => exec("italic")}/>
      <Tbtn icon={<I.underline size={13}/>} label="Underline (Ctrl+U)" onClick={() => exec("underline")}/>
      <span style={{ width: 1, height: 18, background: "var(--line)", margin: "0 4px" }}/>
      <Tbtn icon={<span style={{ fontSize: 11, fontWeight: 500 }}>≡</span>} label="Align left"   onClick={() => exec("justifyLeft")}/>
      <Tbtn icon={<span style={{ fontSize: 11, fontWeight: 500 }}>☰</span>} label="Align center" onClick={() => exec("justifyCenter")}/>
      <Tbtn icon={<span style={{ fontSize: 11, fontWeight: 500 }}>≣</span>} label="Align right"  onClick={() => exec("justifyRight")}/>
      <span style={{ width: 1, height: 18, background: "var(--line)", margin: "0 4px" }}/>
      <Tbtn icon={<span style={{ fontSize: 12 }}>•</span>} label="Bulleted list"  onClick={() => exec("insertUnorderedList")}/>
      <Tbtn icon={<span style={{ fontSize: 11, fontWeight: 500 }}>1.</span>} label="Numbered list" onClick={() => exec("insertOrderedList")}/>
      <span style={{ width: 1, height: 18, background: "var(--line)", margin: "0 4px" }}/>
      <div style={{ position: "relative" }}>
        <button onClick={() => setShowTokens((v) => !v)} style={{
          padding: "4px 10px", fontSize: 11.5, border: "1px solid var(--line)",
          borderRadius: 4, background: "var(--paper)", cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 4,
        }}>Insert field <span style={{ color: "var(--text-3)" }}>▾</span></button>
        {showTokens && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 10,
            background: "var(--paper)", border: "1px solid var(--line)",
            borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            minWidth: 200, maxHeight: 280, overflowY: "auto",
          }}>
            {tokens.map((tk) => (
              <button key={tk.key} onClick={() => { onInsertToken(tk.key); setShowTokens(false); }} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "7px 12px", fontSize: 12, border: "none", background: "transparent",
                cursor: "pointer", color: "var(--text)",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--paper-2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <span style={{ fontWeight: 500 }}>{tk.label}</span>
                <span className="mono" style={{ marginLeft: 8, color: "var(--text-3)", fontSize: 10.5 }}>{`{{${tk.key}}}`}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 11, color: "var(--text-3)" }}>Lang</span>
        <button onClick={() => setLang(lang === "dv" ? "en" : "dv")} style={{
          padding: "4px 8px", fontSize: 11, border: "1px solid var(--line)",
          borderRadius: 4, background: "var(--paper)", cursor: "pointer",
          fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.04em",
        }}>{lang === "dv" ? "ދިވެހި" : "EN"}</button>
      </div>
    </div>
  );
};

// ── Word-style page surface ─────────────────────────────────────────────────
const DocPage = React.forwardRef(({ html, onChange, lang, fontSize, readOnly }, ref) => {
  const localRef = React.useRef(null);
  const editorRef = ref || localRef;

  // Set initial HTML once; avoid stomping selection by not re-syncing on every render.
  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    // Sync only if external html changed AND editor is not focused (e.g. case switch)
    if (editorRef.current && document.activeElement !== editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
  }, [html]);

  return (
    <div style={{
      background: "var(--paper-2)", padding: "24px 0",
      maxHeight: "60vh", overflowY: "auto",
      borderTop: "1px solid var(--line)",
    }}>
      <div style={{
        background: "white", margin: "0 auto", width: 720, minHeight: 940,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)",
        padding: "72px 80px",
        position: "relative",
      }}>
        <div ref={editorRef}
          contentEditable={!readOnly}
          suppressContentEditableWarning
          onInput={(e) => onChange?.(e.currentTarget.innerHTML)}
          style={{
            outline: "none",
            fontFamily: lang === "dv"
              ? "'Noto Sans Thaana', 'MV Boli', Faruma, Tahoma, sans-serif"
              : "'Times New Roman', Georgia, 'Liberation Serif', serif",
            fontSize: `${fontSize}pt`,
            lineHeight: 1.55,
            color: "#111",
            direction: lang === "dv" ? "rtl" : "ltr",
            textAlign: lang === "dv" ? "right" : "left",
            minHeight: 800,
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        />
      </div>
    </div>
  );
});

// Convert plain template body (with {{tokens}} and \n) to HTML for the editor
function bodyToHtml(plain) {
  if (!plain) return "";
  return plain
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .split("\n").map((line) => line.length ? line : "&nbsp;").map((line) => `<div>${line}</div>`).join("");
}
// Strip HTML for plaintext archive copy
function htmlToText(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  // Replace block elements with newlines
  tmp.querySelectorAll("br").forEach((b) => b.replaceWith("\n"));
  tmp.querySelectorAll("div, p, li").forEach((b) => {
    if (b.textContent && !b.textContent.endsWith("\n")) b.append("\n");
  });
  return (tmp.innerText || tmp.textContent || "").replace(/\u00a0/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

// Available tokens for "Insert field" menu
const TOKEN_LIST = [
  { key: "caseId",            label: "Case ID" },
  { key: "caseTitle",         label: "Case title" },
  { key: "caseType",          label: "Case type" },
  { key: "filed",             label: "Filed date" },
  { key: "today",             label: "Today's date" },
  { key: "appellantList",     label: "Appellant(s)" },
  { key: "respondentList",    label: "Respondent(s)" },
  { key: "appellantLawyers",  label: "Appellant counsel" },
  { key: "respondentLawyers", label: "Respondent counsel" },
  { key: "presiding",         label: "Presiding judge" },
  { key: "bench",             label: "Full bench" },
  { key: "summary",           label: "Case summary" },
  { key: "nextHearing",       label: "Next hearing" },
];

// Browser print of just the document page
function printDocHtml(title, lang, html) {
  const w = window.open("", "_blank", "width=900,height=1100");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
    <style>
      @page { size: A4; margin: 25mm; }
      body { font-family: ${lang === "dv" ? "'Noto Sans Thaana','MV Boli',Faruma,Tahoma,sans-serif" : "'Times New Roman',Georgia,serif"};
             font-size: 12pt; line-height: 1.55; color: #111;
             direction: ${lang === "dv" ? "rtl" : "ltr"};
             text-align: ${lang === "dv" ? "right" : "left"}; }
      div { min-height: 1em; }
    </style></head><body>${html}</body></html>`);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 250);
}

// Trigger download of an .doc file (Word-compatible HTML)
function downloadAsDoc(filename, lang, htmlBody) {
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${filename}</title>
<style>
@page WordSection1 { size: 21cm 29.7cm; margin: 2.5cm; }
body { font-family: ${lang === "dv" ? "'Faruma','MV Boli',Tahoma,sans-serif" : "'Times New Roman',serif"};
       font-size: 12pt; line-height: 1.55; color: #000;
       direction: ${lang === "dv" ? "rtl" : "ltr"};
       text-align: ${lang === "dv" ? "right" : "left"}; }
div.WordSection1 { page: WordSection1; }
</style></head><body><div class="WordSection1">${htmlBody}</div></body></html>`;
  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename.endsWith(".doc") ? filename : `${filename}.doc`;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 300);
}

// ── Send / Share modal ──────────────────────────────────────────────────────
const SendDocModal = ({ doc, caseData, lawyers, onClose }) => {
  const toast = useToast();
  const candidateLawyers = (caseData
    ? Array.from(new Set([
        ...(caseData.petitioner?.lawyers || []),
        ...(caseData.respondent?.lawyers || []),
        ...(caseData.appellants || []).flatMap((p) => p.lawyers || []),
        ...(caseData.respondents || []).flatMap((p) => p.lawyers || []),
      ]))
    : []);
  const candidates = candidateLawyers.map((nm) => {
    const l = (lawyers || []).find((x) => x.name === nm);
    return { name: nm, email: l?.email || `${(nm || "").toLowerCase().replace(/[^a-z]+/g, ".")}@maldiveslaw.mv` };
  });
  const [recipients, setRecipients] = React.useState(() => candidates.map((c) => c.name));
  const [channel, setChannel] = React.useState("email");
  const [note, setNote] = React.useState("");

  const toggle = (nm) => setRecipients((p) => p.includes(nm) ? p.filter((x) => x !== nm) : [...p, nm]);

  const send = () => {
    if (recipients.length === 0) { toast("Pick at least one recipient", "warn"); return; }
    toast(`${doc.id} sent via ${channel === "email" ? "email" : "secure portal"} to ${recipients.length} recipient${recipients.length === 1 ? "" : "s"}`, "success");
    onClose();
  };

  return (
    <Modal title={`Send: ${doc.name}`} subtitle="Deliver to counsel of record or other parties" onClose={onClose} width={520}
      footer={<>
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" leading={<I.send size={12}/>} onClick={send}>Send</Btn>
      </>}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Channel</div>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { id: "email",  label: "Email",  icon: <I.mail size={12}/> },
            { id: "portal", label: "Counsel portal", icon: <I.lock size={12}/> },
          ].map((c) => (
            <button key={c.id} onClick={() => setChannel(c.id)} style={{
              padding: "6px 12px", borderRadius: 99,
              border: `1px solid ${channel === c.id ? "var(--ink)" : "var(--line)"}`,
              background: channel === c.id ? "var(--ink)" : "var(--paper)",
              color: channel === c.id ? "var(--paper)" : "var(--text-2)",
              fontSize: 12, cursor: "pointer", fontWeight: 500,
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>{c.icon} {c.label}</button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
          Recipients {candidates.length > 0 && <span style={{ textTransform: "none", letterSpacing: 0, color: "var(--text-3)" }}>· counsel of record</span>}
        </div>
        {candidates.length === 0
          ? <div style={{ fontSize: 12, color: "var(--text-3)" }}>No counsel of record found for this case.</div>
          : <div style={{ display: "grid", gap: 6 }}>
              {candidates.map((c) => (
                <label key={c.name} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 6,
                  cursor: "pointer", background: recipients.includes(c.name) ? "var(--paper-2)" : "var(--paper)",
                }}>
                  <input type="checkbox" checked={recipients.includes(c.name)} onChange={() => toggle(c.name)}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{c.email}</div>
                  </div>
                </label>
              ))}
            </div>}
      </div>
      <Field label="Note (optional)">
        <textarea value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="Short cover note to accompany the document"
          style={{ width: "100%", minHeight: 70, padding: 10,
            border: "1px solid var(--line)", borderRadius: 6, fontSize: 12.5, resize: "vertical",
          }}/>
      </Field>
    </Modal>
  );
};

// ── Generate-document modal (Word-style) ────────────────────────────────────
const GenerateDocModal = ({ template, cases, preselectCaseId, generatedDocs, setGeneratedDocs, onClose }) => {
  const { session } = useAuth();
  const toast = useToast();
  const [caseId, setCaseId] = React.useState(preselectCaseId || cases[0]?.id || "");
  const caseData = cases.find((c) => c.id === caseId);
  const [lang, setLang] = React.useState(template.lang || "en");
  const [docFontSize, setDocFontSize] = React.useState(lang === "dv" ? 14 : 12);
  const [html, setHtml] = React.useState(() => bodyToHtml(resolveTokens(template, caseData)));
  const editorRef = React.useRef(null);

  // Re-resolve when case changes
  React.useEffect(() => {
    setHtml(bodyToHtml(resolveTokens(template, cases.find((c) => c.id === caseId))));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, template.id]);

  const exec = (cmd, val) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    setHtml(editorRef.current?.innerHTML || "");
  };
  const insertToken = (key) => {
    editorRef.current?.focus();
    document.execCommand("insertText", false, `{{${key}}}`);
    setHtml(editorRef.current?.innerHTML || "");
  };

  const onSave = () => {
    const id = `DOC-${String(generatedDocs.length + 1).padStart(4, "0")}`;
    const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const name = `${template.name} — ${caseId}`;
    const body = htmlToText(html);
    setGeneratedDocs((p) => [
      { id, name, caseId, templateId: template.id, templateName: template.name, lang,
        generatedAt: today, generatedBy: session?.name || "—", body, html },
      ...p,
    ]);
    toast(`Document generated · ${id}`, "success");
    onClose();
  };

  const filename = `${template.name.replace(/[^A-Za-z0-9 ]+/g, "").trim() || "Document"} — ${caseId}`;
  const onPrint = () => printDocHtml(filename, lang, html);
  const onDownload = () => { downloadAsDoc(filename, lang, html); toast("Downloaded as .doc"); };
  const onCopy = () => { navigator.clipboard?.writeText(htmlToText(html)); toast("Copied to clipboard"); };

  const unresolved = Array.from(new Set([...html.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1])));

  return (
    <Modal title={`Generate: ${template.name}`}
      subtitle={`${template.category} · ${filename}`}
      onClose={onClose} width={920} bodyPadding="0"
      footer={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn onClick={onCopy} leading={<I.doc size={12}/>}>Copy</Btn>
          <Btn onClick={onPrint} leading={<I.print size={12}/>}>Print</Btn>
          <Btn onClick={onDownload} leading={<I.download size={12}/>}>Download .doc</Btn>
          <Btn variant="primary" onClick={onSave} leading={<I.check size={12}/>}>Save to archive</Btn>
        </>
      }>
      <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid var(--line)" }}>
        <Sel label="Case" value={caseId} onChange={(e) => setCaseId(e.target.value)}
          options={cases.map((c) => ({ value: c.id, label: `${c.id} — ${c.title}` }))}/>
        {unresolved.length > 0 && (
          <div style={{
            padding: "6px 10px", marginTop: 6,
            background: "var(--warn-soft)", borderRadius: 4,
            fontSize: 11.5, color: "var(--warn)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <I.warn size={11}/>
            <span>Unresolved fields: {unresolved.map((t) => `{{${t}}}`).join(", ")}</span>
          </div>
        )}
      </div>
      <DocToolbar docFontSize={docFontSize} setDocFontSize={setDocFontSize}
        lang={lang} setLang={setLang} exec={exec}
        onInsertToken={insertToken} tokens={TOKEN_LIST}/>
      <DocPage ref={editorRef} html={html} onChange={setHtml}
        lang={lang} fontSize={docFontSize}/>
    </Modal>
  );
};

// ── View-document modal (Word-style + send/share) ───────────────────────────
const ViewDocModal = ({ doc, cases, lawyers, setModal, onClose }) => {
  const toast = useToast();
  const lang = doc.lang || "en";
  const [docFontSize, setDocFontSize] = React.useState(lang === "dv" ? 14 : 12);
  const html = doc.html || bodyToHtml(doc.body || "");
  const filename = `${doc.name.replace(/[^A-Za-z0-9 \-—]+/g, "").trim() || doc.id}`;
  const caseData = (cases || []).find((c) => c.id === doc.caseId);

  const onPrint = () => printDocHtml(filename, lang, html);
  const onDownload = () => { downloadAsDoc(filename, lang, html); toast("Downloaded as .doc"); };
  const onCopy = () => { navigator.clipboard?.writeText(htmlToText(html)); toast("Copied to clipboard"); };
  const onShare = () => {
    const url = `${location.origin}${location.pathname}#doc/${doc.id}`;
    navigator.clipboard?.writeText(url);
    toast("Share link copied to clipboard");
  };
  const onSend = () => setModal?.({ type: "sendDoc", doc, caseData });

  return (
    <Modal title={doc.name}
      subtitle={`${doc.id} · ${doc.generatedAt} · ${doc.generatedBy}${doc.caseId ? ` · ${doc.caseId}` : ""}`}
      onClose={onClose} width={920} bodyPadding="0"
      footer={
        <>
          <Btn onClick={onClose}>Close</Btn>
          <Btn onClick={onCopy} leading={<I.doc size={12}/>}>Copy</Btn>
          <Btn onClick={onShare} leading={<I.share size={12}/>}>Share</Btn>
          <Btn onClick={onPrint} leading={<I.print size={12}/>}>Print</Btn>
          <Btn onClick={onDownload} leading={<I.download size={12}/>}>Download .doc</Btn>
          <Btn variant="primary" onClick={onSend} leading={<I.send size={12}/>}>Send</Btn>
        </>
      }>
      <DocToolbar docFontSize={docFontSize} setDocFontSize={setDocFontSize}
        lang={lang} setLang={() => {}} exec={() => {}}
        onInsertToken={() => {}} tokens={[]}/>
      <DocPage html={html} lang={lang} fontSize={docFontSize} readOnly/>
    </Modal>
  );
};

// ── Access page (admin only) ────────────────────────────────────────────────
const AccessPage = ({ accessGrants, setAccessGrants, judges, staff, sections, setModal }) => {
  const toast = useToast();
  const [type, setType] = React.useState("all");

  const filtered = accessGrants.filter((g) => type === "all" || g.userType === type);

  const userLabel = (g) => {
    if (g.userType === "judge") {
      const j = judges.find((x) => x.id === g.userId);
      return j ? j.name : g.userId;
    }
    const s = staff.find((x) => x.id === g.userId);
    return s ? `${s.name} · ${s.title || "Staff"}` : g.userId;
  };
  const sectionLabel = (id) => {
    const s = sections.find((x) => x.id === id);
    return s ? s.name : id;
  };

  const revoke = (g) => {
    setAccessGrants((p) => p.filter((x) => x.id !== g.id));
    toast(`Access revoked · ${g.id}`, "success");
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{
        padding: "12px 14px", marginBottom: 16,
        background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 6,
        display: "flex", gap: 12, alignItems: "flex-start",
      }}>
        <I.lock size={14} stroke="var(--text-2)" style={{ marginTop: 2 }}/>
        <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.55 }}>
          By default, judges and staff see only their own section's cases.
          Cross-section access grants extend visibility — typically used for bench
          coverage, acting registrars, or shared-section work.
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[
          { id: "all", label: "All" },
          { id: "judge", label: "Judges" },
          { id: "staff", label: "Staff" },
        ].map((t) => {
          const count = t.id === "all"
            ? accessGrants.length
            : accessGrants.filter((g) => g.userType === t.id).length;
          return (
            <button key={t.id} onClick={() => setType(t.id)} style={{
              padding: "5px 11px", borderRadius: 99,
              border: `1px solid ${type === t.id ? "var(--ink)" : "var(--line)"}`,
              background: type === t.id ? "var(--ink)" : "var(--paper)",
              color: type === t.id ? "var(--paper)" : "var(--text-2)",
              fontSize: 11.5, cursor: "pointer", fontWeight: 500,
            }}>{t.label} <span style={{ opacity: 0.7, marginLeft: 3 }}>{count}</span></button>
          );
        })}
      </div>

      {filtered.length === 0
        ? <Empty title="No active access grants"
            body="Use Grant access to extend a user's visibility to another section."
            action={<Btn variant="primary" size="sm" leading={<I.plus size={12}/>}
              onClick={() => setModal({ type: "newAccessGrant" })}>Grant access</Btn>}/>
        : <Card padding="0">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <th style={thS}>User</th>
                  <th style={thS}>Type</th>
                  <th style={thS}>Granted access to</th>
                  <th style={thS}>Reason</th>
                  <th style={thS}>Granted</th>
                  <th style={{ ...thS, width: 1 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => (
                  <tr key={g.id} style={{ borderBottom: "1px solid var(--line-soft)" }}>
                    <td style={tdS}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <Avatar name={userLabel(g).replace(/^Hon\. /, "")} size={26}
                          tone={g.userType === "judge" ? "judge" : "neutral"}/>
                        <span style={{ fontWeight: 500 }}>{userLabel(g)}</span>
                      </div>
                    </td>
                    <td style={tdS}>
                      <Pill label={g.userType === "judge" ? "Judge" : "Staff"} size="xs"
                        tone={g.userType === "judge" ? "judge" : "neutral"}/>
                    </td>
                    <td style={tdS}><span style={{ fontSize: 12.5 }}>{sectionLabel(g.sectionId)}</span></td>
                    <td style={tdS}><span style={{ fontSize: 12, color: "var(--text-2)" }}>{g.reason || "—"}</span></td>
                    <td style={tdS}>
                      <div style={{ fontSize: 12, color: "var(--text-2)" }}>{g.grantedAt}</div>
                      <div style={{ fontSize: 10.5, color: "var(--text-3)" }}>by {g.grantedBy}</div>
                    </td>
                    <td style={{ ...tdS, textAlign: "right" }}>
                      <Btn size="sm" onClick={() => revoke(g)} leading={<I.trash size={11}/>}>Revoke</Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
      }
    </div>
  );
};

// ── Grant-access modal ──────────────────────────────────────────────────────
const NewAccessGrantModal = ({ accessGrants, setAccessGrants, judges, staff, sections, onClose }) => {
  const { session } = useAuth();
  const toast = useToast();
  const [userType, setUserType] = React.useState("judge");
  const [userId, setUserId] = React.useState(judges[0]?.id || "");
  const [sectionId, setSectionId] = React.useState(sections[0]?.id || "");
  const [reason, setReason] = React.useState("");

  React.useEffect(() => {
    setUserId(userType === "judge" ? (judges[0]?.id || "") : (staff[0]?.id || ""));
  }, [userType]);

  const onSave = () => {
    const id = `AG-${String(accessGrants.length + 1).padStart(3, "0")}`;
    const today = new Date().toISOString().slice(0, 10);
    setAccessGrants((p) => [...p, {
      id, userType, userId, sectionId,
      grantedBy: session?.name || "Admin",
      grantedAt: today, reason: reason.trim() || "—",
    }]);
    toast(`Access granted · ${id}`, "success");
    onClose();
  };

  const userOptions = (userType === "judge" ? judges : staff)
    .map((u) => ({ value: u.id, label: userType === "judge" ? u.name : `${u.name} — ${u.title || "Staff"}` }));

  return (
    <Modal title="Grant cross-section access"
      subtitle="Lets a judge or staff member view another section's cases"
      onClose={onClose} width={520}
      footer={<>
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={onSave} disabled={!userId || !sectionId}>Grant access</Btn>
      </>}>
      <Sel label="User type" value={userType} onChange={(e) => setUserType(e.target.value)}
        options={[{ value: "judge", label: "Judge" }, { value: "staff", label: "Court staff" }]}/>
      <Sel label="User" value={userId} onChange={(e) => setUserId(e.target.value)}
        options={userOptions}/>
      <Sel label="Grant access to section" value={sectionId} onChange={(e) => setSectionId(e.target.value)}
        options={sections.map((s) => ({ value: s.id, label: s.name }))}/>
      <Input label="Reason" value={reason} onChange={(e) => setReason(e.target.value)}
        placeholder="e.g. Bench coverage during leave"/>
    </Modal>
  );
};

// ── Pick-template modal — shown from quick actions / case detail ────────────
const PickTemplateModal = ({ templates, filterCategory, filterName, onPick, onClose }) => {
  let pool = templates;
  if (filterCategory) pool = pool.filter((t) => t.category === filterCategory);
  if (filterName) pool = pool.filter((t) => t.name.toLowerCase().includes(filterName.toLowerCase()));
  const title = filterName
    ? `Choose ${filterName} template`
    : filterCategory
      ? `Choose ${filterCategory.toLowerCase()} template`
      : "Choose template";
  return (
    <Modal title={title}
      subtitle={`${pool.length} template${pool.length === 1 ? "" : "s"} available — bilingual versions are listed separately`}
      onClose={onClose} width={620}
      footer={<Btn onClick={onClose}>Cancel</Btn>}>
      {pool.length === 0
        ? <Empty title="No templates" body="No templates match this filter."/>
        : <div style={{ display: "grid", gap: 8 }}>
            {pool.map((tpl) => (
              <Card key={tpl.id} interactive padding="14px" onClick={() => { onClose(); onPick(tpl); }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <I.doc size={13} stroke="var(--text-2)"/>
                      <span style={{ fontSize: 13.5, fontWeight: 500 }}>{tpl.name}</span>
                      <Pill label={tpl.lang === "dv" ? "ދިވެހި" : "EN"} size="xs" tone="neutral"/>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{tpl.description}</div>
                  </div>
                  <I.arrowR size={14} stroke="var(--text-3)"/>
                </div>
              </Card>
            ))}
          </div>}
    </Modal>
  );
};

window.DocumentsPage = DocumentsPage;
window.GenerateDocModal = GenerateDocModal;
window.PickTemplateModal = PickTemplateModal;
window.ViewDocModal = ViewDocModal;
window.AccessPage = AccessPage;
window.NewAccessGrantModal = NewAccessGrantModal;
window.resolveTokens = resolveTokens;
