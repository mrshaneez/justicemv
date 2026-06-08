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
const DocumentsPage = ({ templates, setTemplates, cases, generatedDocs, setGeneratedDocs, setModal }) => {
  const { session } = useAuth();
  const [tab, setTab] = React.useState("templates");
  const [filter, setFilter] = React.useState("All");
  const isPrivileged = session?.role === "admin" || session?.role === "judge" || session?.role === "staff";

  const categories = ["All", ...Array.from(new Set(templates.map((t) => t.category)))];
  const filtered = filter === "All" ? templates : templates.filter((t) => t.category === filter);

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Tab strip */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--line)", marginBottom: 20, alignItems: "center" }}>
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
        <div style={{ marginLeft: "auto", marginBottom: 4 }}>
          {tab === "templates" && isPrivileged && (
            <Btn size="sm" variant="primary" leading={<I.upload size={12}/>}
              onClick={() => setModal({ type: "uploadTemplate" })}>
              Upload template
            </Btn>
          )}
        </div>
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
                    {tpl.uploaded && <Pill label="Uploaded" size="xs" tone="accent"/>}
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
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 11.5, color: "var(--accent)", fontWeight: 500,
                    display: "flex", alignItems: "center", gap: 4 }}>
                    Generate <I.arrowR size={11}/>
                  </div>
                  {tpl.uploaded && isPrivileged && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete template "${tpl.name}"?`)) {
                          setTemplates((p) => p.filter((x) => x.id !== tpl.id));
                        }
                      }}
                      title="Delete template"
                      style={{
                        border: "none", background: "transparent", cursor: "pointer",
                        color: "var(--text-3)", padding: 4, display: "inline-flex",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "var(--danger)"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-3)"}>
                      <I.trash size={12}/>
                    </button>
                  )}
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

// ── Editable header/footer band — type, or upload a .docx / image (letterhead)
const DocBand = ({ kind, html, onChange, lang, readOnly }) => {
  const ref = React.useRef(null);
  const fileRef = React.useRef(null);
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (html || "")) ref.current.innerHTML = html || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    if (ref.current && document.activeElement !== ref.current && ref.current.innerHTML !== (html || "")) {
      ref.current.innerHTML = html || "";
    }
  }, [html]);

  const onUpload = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      let added = "";
      if ((file.type || "").startsWith("image/")) {
        const dataUrl = await new Promise((res, rej) => {
          const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(file);
        });
        added = `<div style="text-align:center"><img src="${dataUrl}" alt="${kind}" style="max-width:100%;max-height:130px"/></div>`;
      } else if (file.name.toLowerCase().endsWith(".docx")) {
        added = await docxFileToHtml(file);
      } else {
        added = `<div>${(await file.text()).replace(/</g, "&lt;")}</div>`;
      }
      const next = (html && html.trim() ? html : "") + added;
      if (ref.current) ref.current.innerHTML = next;
      onChange?.(next);
    } catch (e) { console.error(e); }
    finally { setBusy(false); }
  };

  const empty = !html || !html.replace(/<[^>]*>/g, "").trim() && !/<img/i.test(html || "");
  if (readOnly && empty) return null;

  const align = lang === "dv" ? "right" : "left";
  return (
    <div style={{
      position: "relative",
      [kind === "header" ? "borderBottom" : "borderTop"]: "1px solid #e2e2dc",
      [kind === "header" ? "marginBottom" : "marginTop"]: 14,
      [kind === "header" ? "paddingBottom" : "paddingTop"]: 10,
    }}>
      {!readOnly && (
        <div style={{ position: "absolute", top: kind === "header" ? -8 : 2, right: 0,
          display: "flex", alignItems: "center", gap: 6, zIndex: 2 }}>
          <span style={{ fontSize: 9, color: "#9a9a92", textTransform: "uppercase",
            letterSpacing: "0.07em", fontWeight: 600, background: "white", padding: "0 4px" }}>{kind}</span>
          <button type="button" onClick={() => fileRef.current?.click()} title={`Upload ${kind} (.docx or image)`}
            style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10,
              color: "#5b5e63", background: "white", border: "1px solid #e2e2dc", borderRadius: 4,
              padding: "1px 6px", cursor: "pointer" }}>
            <I.upload size={9}/> {busy ? "…" : "Upload"}
          </button>
          <input ref={fileRef} type="file" accept="image/*,.docx,.txt" hidden
            onChange={(e) => { onUpload(e.target.files?.[0]); e.target.value = ""; }}/>
        </div>
      )}
      <div ref={ref}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        data-placeholder={kind === "header" ? "Add a header — type, or upload a letterhead / .docx" : "Add a footer — type, or upload a .docx"}
        onInput={(e) => onChange?.(e.currentTarget.innerHTML)}
        className={empty && !readOnly ? "doc-band-empty" : ""}
        style={{
          outline: "none", minHeight: readOnly ? undefined : 22,
          fontFamily: lang === "dv"
            ? "'Noto Sans Thaana', 'MV Boli', Faruma, Tahoma, sans-serif"
            : "'Times New Roman', Georgia, 'Liberation Serif', serif",
          fontSize: "10.5pt", color: "#444", lineHeight: 1.4,
          direction: lang === "dv" ? "rtl" : "ltr", textAlign: align,
        }}/>
    </div>
  );
};

// ── Word-style page surface ─────────────────────────────────────────────────
const DocPage = React.forwardRef(({ html, onChange, lang, fontSize, readOnly,
  header, footer, onHeaderChange, onFooterChange }, ref) => {
  const localRef = React.useRef(null);
  const editorRef = ref || localRef;
  const showBands = !!(onHeaderChange || onFooterChange) || !!(header && header.trim()) || !!(footer && footer.trim());

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
      <style>{`
        .doc-band-empty:empty:before { content: attr(data-placeholder); color: #b3b3ab; font-style: italic; }
      `}</style>
      <div style={{
        background: "white", margin: "0 auto", width: 720, minHeight: 940,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)",
        padding: "56px 80px",
        position: "relative",
        display: "flex", flexDirection: "column",
      }}>
        {showBands && (
          <DocBand kind="header" html={header} onChange={onHeaderChange}
            lang={lang} readOnly={readOnly || !onHeaderChange}/>
        )}
        <div ref={editorRef}
          contentEditable={!readOnly}
          suppressContentEditableWarning
          onInput={(e) => onChange?.(e.currentTarget.innerHTML)}
          style={{
            outline: "none", flex: 1,
            fontFamily: lang === "dv"
              ? "'Noto Sans Thaana', 'MV Boli', Faruma, Tahoma, sans-serif"
              : "'Times New Roman', Georgia, 'Liberation Serif', serif",
            fontSize: `${fontSize}pt`,
            lineHeight: 1.55,
            color: "#111",
            direction: lang === "dv" ? "rtl" : "ltr",
            textAlign: lang === "dv" ? "right" : "left",
            minHeight: showBands ? 640 : 800,
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        />
        {showBands && (
          <DocBand kind="footer" html={footer} onChange={onFooterChange}
            lang={lang} readOnly={readOnly || !onFooterChange}/>
        )}
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
function printDocHtml(title, lang, html, header, footer) {
  const w = window.open("", "_blank", "width=900,height=1100");
  if (!w) return;
  const align = lang === "dv" ? "right" : "left";
  const headerBlock = header && header.trim()
    ? `<div style="border-bottom:1px solid #999;padding-bottom:8px;margin-bottom:16px;font-size:10.5pt;color:#444;text-align:${align}">${header}</div>` : "";
  const footerBlock = footer && footer.trim()
    ? `<div style="border-top:1px solid #999;padding-top:8px;margin-top:16px;font-size:10.5pt;color:#444;text-align:${align}">${footer}</div>` : "";
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
    <style>
      @page { size: A4; margin: 25mm; }
      body { font-family: ${lang === "dv" ? "'Noto Sans Thaana','MV Boli',Faruma,Tahoma,sans-serif" : "'Times New Roman',Georgia,serif"};
             font-size: 12pt; line-height: 1.55; color: #111;
             direction: ${lang === "dv" ? "rtl" : "ltr"};
             text-align: ${lang === "dv" ? "right" : "left"}; }
      div { min-height: 1em; }
    </style></head><body>${headerBlock}${html}${footerBlock}</body></html>`);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 250);
}

// Trigger download of an .doc file (Word-compatible HTML) with optional header/footer.
// Uses Word's mso header/footer so they repeat on every page.
function downloadAsDoc(filename, lang, htmlBody, header, footer) {
  const ff = lang === "dv" ? "'Faruma','MV Boli',Tahoma,sans-serif" : "'Times New Roman',serif";
  const align = lang === "dv" ? "right" : "left";
  const hasH = header && header.trim();
  const hasF = footer && footer.trim();
  const headerEl = hasH ? `<div style='mso-element:header' id=h1><p class=MsoHeader style="text-align:${align}">${header}</p></div>` : "";
  const footerEl = hasF ? `<div style='mso-element:footer' id=f1><p class=MsoFooter style="text-align:${align}">${footer}</p></div>` : "";
  const pageRules = `${hasH ? "mso-header: h1;" : ""} ${hasF ? "mso-footer: f1;" : ""}`;
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${filename}</title>
<style>
@page WordSection1 { size: 21cm 29.7cm; margin: 2.5cm; ${pageRules} }
body { font-family: ${ff};
       font-size: 12pt; line-height: 1.55; color: #000;
       direction: ${lang === "dv" ? "rtl" : "ltr"};
       text-align: ${lang === "dv" ? "right" : "left"}; }
p.MsoHeader, p.MsoFooter { font-size: 10.5pt; color: #333; margin: 0; }
div.WordSection1 { page: WordSection1; }
</style></head><body><div class="WordSection1">${headerEl}${htmlBody}${footerEl}</div></body></html>`;
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
  const prepHF = (str, cd) => {
    if (!str) return "";
    const resolved = resolveTokens({ body: str }, cd);
    return /<[a-z][\s\S]*>/i.test(str) ? resolved : bodyToHtml(resolved);
  };
  const [header, setHeader] = React.useState(() => prepHF(template.header, caseData));
  const [footer, setFooter] = React.useState(() => prepHF(template.footer, caseData));
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
        generatedAt: today, generatedBy: session?.name || "—", body, html, header, footer },
      ...p,
    ]);
    toast(`Document generated · ${id}`, "success");
    onClose();
  };

  const filename = `${template.name.replace(/[^A-Za-z0-9 ]+/g, "").trim() || "Document"} — ${caseId}`;
  const onPrint = () => printDocHtml(filename, lang, html, header, footer);
  const onDownload = () => { downloadAsDoc(filename, lang, html, header, footer); toast("Downloaded as .doc"); };
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
        lang={lang} fontSize={docFontSize}
        header={header} footer={footer}
        onHeaderChange={setHeader} onFooterChange={setFooter}/>
    </Modal>
  );
};

// ── View-document modal (Word-style + send/share) ───────────────────────────
const ViewDocModal = ({ doc, cases, lawyers, setModal, onClose }) => {
  const toast = useToast();
  const lang = doc.lang || "en";
  const [docFontSize, setDocFontSize] = React.useState(lang === "dv" ? 14 : 12);
  const html = doc.html || bodyToHtml(doc.body || "");
  const header = doc.header || "";
  const footer = doc.footer || "";
  const filename = `${doc.name.replace(/[^A-Za-z0-9 \-—]+/g, "").trim() || doc.id}`;
  const caseData = (cases || []).find((c) => c.id === doc.caseId);

  const onPrint = () => printDocHtml(filename, lang, html, header, footer);
  const onDownload = () => { downloadAsDoc(filename, lang, html, header, footer); toast("Downloaded as .doc"); };
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
      <DocPage html={html} lang={lang} fontSize={docFontSize} readOnly
        header={header} footer={footer}/>
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

// ── Upload-template modal — accepts .docx, extracts text, marks fields ─────
// Parses .docx via mammoth.js (lazy-loaded), then lets the user:
//   • name + categorise the template
//   • highlight any text and convert it to a {{token}} placeholder
//   • save into the templates list for case-based generation
function loadMammoth() {
  if (window.mammoth) return Promise.resolve(window.mammoth);
  if (window.__mammothLoading) return window.__mammothLoading;
  window.__mammothLoading = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://unpkg.com/mammoth@1.6.0/mammoth.browser.min.js";
    s.onload = () => resolve(window.mammoth);
    s.onerror = () => reject(new Error("Could not load .docx parser"));
    document.head.appendChild(s);
  });
  return window.__mammothLoading;
}

// Robust .docx → HTML by reading the raw word/document.xml zip entry.
// Fallback path that works without mammoth (no styles, but reliable).
async function rawDocxToHtml(arrayBuffer) {
  // tiny zip reader — central directory + STORE/DEFLATE entries
  const u8 = new Uint8Array(arrayBuffer);
  const dv = new DataView(arrayBuffer);
  // Locate end-of-central-directory
  let eocd = -1;
  for (let i = u8.length - 22; i >= 0 && i > u8.length - 65558; i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("Not a .docx (no EOCD)");
  const cdOffset = dv.getUint32(eocd + 16, true);
  const cdSize = dv.getUint32(eocd + 12, true);
  const total = dv.getUint16(eocd + 10, true);
  let p = cdOffset;
  let docXml = null;
  for (let i = 0; i < total; i++) {
    const sig = dv.getUint32(p, true);
    if (sig !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true);
    const compSize = dv.getUint32(p + 20, true);
    const nameLen = dv.getUint16(p + 28, true);
    const extraLen = dv.getUint16(p + 30, true);
    const commentLen = dv.getUint16(p + 32, true);
    const localOffset = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(u8.slice(p + 46, p + 46 + nameLen));
    p += 46 + nameLen + extraLen + commentLen;
    if (name === "word/document.xml") {
      const lhNameLen = dv.getUint16(localOffset + 26, true);
      const lhExtraLen = dv.getUint16(localOffset + 28, true);
      const dataStart = localOffset + 30 + lhNameLen + lhExtraLen;
      const data = u8.slice(dataStart, dataStart + compSize);
      let inflated;
      if (method === 0) inflated = data;
      else if (method === 8) {
        // browser-native via DecompressionStream
        const ds = new DecompressionStream("deflate-raw");
        const blob = new Blob([data]);
        const decompressed = await new Response(blob.stream().pipeThrough(ds)).arrayBuffer();
        inflated = new Uint8Array(decompressed);
      } else throw new Error("Unsupported compression in docx");
      docXml = new TextDecoder("utf-8").decode(inflated);
      break;
    }
  }
  if (!docXml) throw new Error("word/document.xml not found");
  // Walk paragraphs + runs; preserve bold/italic/underline; preserve line breaks
  const doc = new DOMParser().parseFromString(docXml, "application/xml");
  const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  const paras = doc.getElementsByTagNameNS(W, "p");
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let html = "";
  for (let i = 0; i < paras.length; i++) {
    const p = paras[i];
    const runs = p.getElementsByTagNameNS(W, "r");
    let inner = "";
    for (let j = 0; j < runs.length; j++) {
      const r = runs[j];
      const rPr = r.getElementsByTagNameNS(W, "rPr")[0];
      const bold = rPr && rPr.getElementsByTagNameNS(W, "b").length > 0;
      const italic = rPr && rPr.getElementsByTagNameNS(W, "i").length > 0;
      const underline = rPr && rPr.getElementsByTagNameNS(W, "u").length > 0;
      let txt = "";
      for (const c of r.childNodes) {
        const ln = c.localName;
        if (ln === "t") txt += c.textContent;
        else if (ln === "tab") txt += "    ";
        else if (ln === "br") txt += "\n";
      }
      let chunk = esc(txt).replace(/\n/g, "<br/>");
      if (underline) chunk = `<u>${chunk}</u>`;
      if (italic) chunk = `<em>${chunk}</em>`;
      if (bold) chunk = `<strong>${chunk}</strong>`;
      inner += chunk;
    }
    html += `<div>${inner || "&nbsp;"}</div>`;
  }
  return html || "<div>&nbsp;</div>";
}

async function docxFileToHtml(file) {
  const buf = await file.arrayBuffer();
  // Try mammoth first (cleaner output incl. lists); fall back to raw.
  try {
    const m = await loadMammoth();
    const result = await m.convertToHtml({ arrayBuffer: buf });
    if (result && result.value) return result.value;
  } catch (e) { /* fall through */ }
  return rawDocxToHtml(buf);
}

const UploadTemplateModal = ({ templates, setTemplates, onClose }) => {
  const toast = useToast();
  const [file, setFile] = React.useState(null);
  const [parsing, setParsing] = React.useState(false);
  const [parseError, setParseError] = React.useState("");
  const [html, setHtml] = React.useState("");
  const [headerHtml, setHeaderHtml] = React.useState("");
  const [footerHtml, setFooterHtml] = React.useState("");
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("Notice");
  const [lang, setLang] = React.useState("en");
  const [description, setDescription] = React.useState("");
  const [docFontSize, setDocFontSize] = React.useState(12);
  const [hover, setHover] = React.useState(false);
  const [fieldPickerOpen, setFieldPickerOpen] = React.useState(false);
  const [customFieldOpen, setCustomFieldOpen] = React.useState(false);
  const [customFieldKey, setCustomFieldKey] = React.useState("");
  const [savedRange, setSavedRange] = React.useState(null);
  const editorRef = React.useRef(null);
  const fileInputRef = React.useRef(null);

  const existingCategories = Array.from(new Set(templates.map((t) => t.category)));
  const allCategories = Array.from(new Set([...existingCategories, "Notice", "Order", "Letter", "Cause list", "Summons", "Custom"]));

  const handleFile = async (f) => {
    if (!f) return;
    const lname = f.name.toLowerCase();
    if (!lname.endsWith(".docx")) {
      setParseError(lname.endsWith(".doc")
        ? "The legacy .doc format isn't supported — please re-save as .docx in Word."
        : "Only Word .docx files can be uploaded.");
      setFile(f); setHtml("");
      return;
    }
    setFile(f);
    setParseError("");
    setParsing(true);
    try {
      const out = await docxFileToHtml(f);
      setHtml(out);
      // Suggest a name from the filename
      if (!name) setName(f.name.replace(/\.docx$/i, "").replace(/[_-]+/g, " ").trim());
    } catch (e) {
      console.error(e);
      setParseError("Couldn't read this document. Make sure it's a valid .docx file.");
    } finally {
      setParsing(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault(); setHover(false);
    const f = e.dataTransfer?.files?.[0];
    handleFile(f);
  };

  // Save the editor's current selection so we can restore it after a menu click
  const captureSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      setSavedRange(sel.getRangeAt(0).cloneRange());
      return sel.getRangeAt(0).cloneRange();
    }
    return null;
  };
  const restoreSelection = (rng) => {
    const r = rng || savedRange;
    if (!r) return false;
    const sel = window.getSelection();
    sel.removeAllRanges(); sel.addRange(r);
    return true;
  };

  const exec = (cmd, val) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    setHtml(editorRef.current?.innerHTML || "");
  };

  const insertTokenAtSelection = (key) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(`{{${key}}}`));
    // Place caret after inserted token
    range.collapse(false);
    sel.removeAllRanges(); sel.addRange(range);
    setHtml(editorRef.current.innerHTML);
    setSavedRange(null);
  };

  const openFieldPicker = () => {
    const rng = captureSelection();
    if (!rng || rng.collapsed) {
      toast("Highlight some text in the document first, then press Make field.", "warn");
      return;
    }
    setFieldPickerOpen(true);
  };

  const onPickToken = (key) => {
    setFieldPickerOpen(false);
    insertTokenAtSelection(key);
    toast(`Field {{${key}}} inserted`, "success");
  };

  const onAddCustom = () => {
    const cleaned = customFieldKey.trim().replace(/[^A-Za-z0-9_]/g, "");
    if (!cleaned) { toast("Field name must be letters/numbers only", "warn"); return; }
    setFieldPickerOpen(false); setCustomFieldOpen(false);
    insertTokenAtSelection(cleaned);
    setCustomFieldKey("");
    toast(`Field {{${cleaned}}} inserted`, "success");
  };

  // Tokens currently in the body (for the "fields detected" chip row)
  const detectedTokens = React.useMemo(() => {
    if (!html) return [];
    return Array.from(new Set([...html.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1])));
  }, [html]);

  const canSave = file && html && name.trim() && category.trim() && !parseError;

  const onSave = () => {
    if (!canSave) {
      toast("Add a document, name and category before saving.", "warn"); return;
    }
    const id = `TPL-U-${String(templates.filter((t) => t.uploaded).length + 1).padStart(3, "0")}`;
    const body = htmlToText(html);
    setTemplates((p) => [
      {
        id, name: name.trim(), category: category.trim(), lang,
        description: description.trim() || `Uploaded from ${file.name}`,
        body, uploaded: true,
        sourceFile: file.name,
        header: headerHtml || "", footer: footerHtml || "",
      },
      ...p,
    ]);
    toast(`Template saved · ${id}`, "success");
    onClose();
  };

  return (
    <Modal
      title="Upload Word template"
      subtitle="Upload a .docx file, then highlight any text to mark it as a fillable field"
      onClose={onClose} width={920} bodyPadding="0"
      footer={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={onSave} disabled={!canSave}
            leading={<I.check size={12}/>}>Save template</Btn>
        </>
      }>

      {/* Top form */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setHover(true); }}
            onDragLeave={() => setHover(false)}
            onDrop={onDrop}
            style={{
              border: `1.5px dashed ${hover ? "var(--accent)" : "var(--line-2)"}`,
              borderRadius: 8, padding: "32px 20px",
              textAlign: "center", cursor: "pointer",
              background: hover ? "var(--accent-soft)" : "var(--paper-2)",
              transition: "background 120ms, border-color 120ms",
            }}>
            <div style={{ display: "inline-flex", padding: 10, borderRadius: 99,
              background: "var(--paper)", border: "1px solid var(--line)", marginBottom: 10 }}>
              <I.upload size={20} stroke="var(--text-2)"/>
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
              Drop a Word document here, or click to browse
            </div>
            <div style={{ fontSize: 12, color: "var(--text-2)" }}>
              .docx files only · we'll extract the text so you can mark fillable fields
            </div>
            <input ref={fileInputRef} type="file" accept=".docx" hidden
              onChange={(e) => handleFile(e.target.files?.[0])}/>
          </div>
        ) : (
          <>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 6,
              background: "var(--paper-2)", marginBottom: 14,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 4, background: "var(--paper)",
                border: "1px solid var(--line)", display: "inline-flex",
                alignItems: "center", justifyContent: "center",
              }}>
                <I.doc size={14} stroke="var(--accent)"/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap",
                  overflow: "hidden", textOverflow: "ellipsis" }}>{file.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                  {(file.size / 1024).toFixed(1)} KB
                  {parsing && " · parsing…"}
                  {!parsing && html && ` · extracted ${htmlToText(html).length} characters`}
                </div>
              </div>
              <Btn size="sm" onClick={() => { setFile(null); setHtml(""); setParseError(""); }}>
                Replace
              </Btn>
            </div>

            {parseError && (
              <div style={{
                padding: "8px 12px", marginBottom: 12,
                background: "var(--danger-soft)", color: "var(--danger)",
                borderRadius: 4, fontSize: 12, display: "flex", alignItems: "center", gap: 8,
              }}>
                <I.warn size={12}/> {parseError}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 0.7fr", gap: 12 }}>
              <Input label="Template name" value={name}
                placeholder="e.g. Notice of Initial Hearing"
                onChange={(e) => setName(e.target.value)}/>
              <Field label="Category">
                <input list="tpl-categories" value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Notice"
                  style={{ width: "100%", padding: "7px 10px", fontSize: 13,
                    border: "1px solid var(--line)", borderRadius: 6,
                    background: "var(--paper)", outline: "none" }}/>
                <datalist id="tpl-categories">
                  {allCategories.map((c) => <option key={c} value={c}/>)}
                </datalist>
              </Field>
              <Sel label="Language" value={lang} onChange={(e) => setLang(e.target.value)}
                options={[{ value: "en", label: "English" }, { value: "dv", label: "ދިވެހި (Dhivehi)" }]}/>
            </div>
            <Input label="Description (optional)" value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short note describing when this template is used"/>
          </>
        )}
      </div>

      {file && html && !parseError && (
        <>
          {/* Field-marking toolbar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 14px", background: "var(--paper-2)",
            borderBottom: "1px solid var(--line)", flexWrap: "wrap",
          }}>
            <div style={{ fontSize: 11.5, color: "var(--text-2)", display: "flex", alignItems: "center", gap: 6 }}>
              <I.sparkle size={11} stroke="var(--accent)"/>
              <span><strong style={{ color: "var(--text)" }}>Highlight</strong> any text in the document, then click <strong style={{ color: "var(--text)" }}>Make field</strong> to turn it into a fillable placeholder.</span>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
              <select value={docFontSize} onChange={(e) => setDocFontSize(Number(e.target.value))} style={{
                fontSize: 12, padding: "4px 6px", border: "1px solid var(--line)",
                borderRadius: 4, background: "var(--paper)", cursor: "pointer",
              }}>
                {[10,11,12,13,14,16,18].map((s) => <option key={s} value={s}>{s}pt</option>)}
              </select>
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")}
                style={tbtn}><I.bold size={12}/></button>
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("italic")}
                style={tbtn}><I.italic size={12}/></button>
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec("underline")}
                style={tbtn}><I.underline size={12}/></button>
              <span style={{ width: 1, height: 18, background: "var(--line)", margin: "0 2px" }}/>
              <button onMouseDown={(e) => { e.preventDefault(); captureSelection(); }}
                onClick={openFieldPicker}
                style={{
                  padding: "5px 11px", fontSize: 11.5, fontWeight: 500,
                  border: "1px solid var(--accent)", borderRadius: 4,
                  background: "var(--accent)", color: "var(--paper)", cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}>
                <I.tag size={11}/> Make field
              </button>

              {fieldPickerOpen && (
                <FieldPickerPopup
                  tokens={TOKEN_LIST}
                  onPick={onPickToken}
                  onCustom={() => { setFieldPickerOpen(false); setCustomFieldOpen(true); }}
                  onClose={() => setFieldPickerOpen(false)}
                />
              )}
              {customFieldOpen && (
                <CustomFieldPopup
                  value={customFieldKey} setValue={setCustomFieldKey}
                  onSubmit={onAddCustom}
                  onClose={() => { setCustomFieldOpen(false); setCustomFieldKey(""); }}
                />
              )}
            </div>
          </div>

          {/* Detected fields strip */}
          {detectedTokens.length > 0 && (
            <div style={{
              padding: "8px 14px", borderBottom: "1px solid var(--line)",
              background: "var(--paper)", display: "flex", alignItems: "center",
              gap: 8, flexWrap: "wrap",
            }}>
              <span style={{ fontSize: 10.5, color: "var(--text-3)",
                textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
                Fields detected ({detectedTokens.length})
              </span>
              {detectedTokens.map((tk) => {
                const known = TOKEN_LIST.find((t) => t.key === tk);
                return (
                  <span key={tk} style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "2px 8px", borderRadius: 99,
                    background: known ? "var(--accent-soft)" : "var(--warn-soft)",
                    color: known ? "var(--accent)" : "var(--warn)",
                    fontSize: 11, fontWeight: 500,
                  }}>
                    <span className="mono" style={{ fontSize: 10.5 }}>{`{{${tk}}}`}</span>
                    {known && <span style={{ fontWeight: 400, opacity: 0.85 }}>{known.label}</span>}
                  </span>
                );
              })}
            </div>
          )}

          {/* Editable doc surface */}
          <UploadDocPage
            ref={editorRef} html={html}
            onChange={(h) => setHtml(h)}
            lang={lang} fontSize={docFontSize}
            header={headerHtml} footer={footerHtml}
            onHeaderChange={setHeaderHtml} onFooterChange={setFooterHtml}
          />
        </>
      )}

      {file && parsing && (
        <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-2)" }}>
          <I.clock size={20} stroke="var(--text-3)"/>
          <div style={{ marginTop: 8, fontSize: 13 }}>Reading document…</div>
        </div>
      )}
    </Modal>
  );
};

const tbtn = {
  width: 26, height: 26, display: "inline-flex", alignItems: "center", justifyContent: "center",
  border: "1px solid var(--line)", borderRadius: 4, background: "var(--paper)",
  color: "var(--text)", cursor: "pointer",
};

// Popup: pick a known field or "Custom field"
const FieldPickerPopup = ({ tokens, onPick, onCustom, onClose }) => {
  React.useEffect(() => {
    const onDoc = (e) => { if (!e.target.closest?.("[data-field-popup]")) onClose(); };
    setTimeout(() => document.addEventListener("mousedown", onDoc), 0);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onClose]);
  return (
    <div data-field-popup style={{
      position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 100,
      background: "var(--paper)", border: "1px solid var(--line)",
      borderRadius: 6, boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
      width: 280, maxHeight: 340, overflowY: "auto",
    }}>
      <div style={{ padding: "10px 12px 6px", fontSize: 10.5, color: "var(--text-3)",
        textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500,
        borderBottom: "1px solid var(--line-soft)" }}>
        Replace selection with…
      </div>
      {tokens.map((tk) => (
        <button key={tk.key} onClick={() => onPick(tk.key)} style={{
          display: "flex", width: "100%", textAlign: "left",
          padding: "8px 12px", fontSize: 12, border: "none", background: "transparent",
          cursor: "pointer", color: "var(--text)", alignItems: "center", justifyContent: "space-between", gap: 8,
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "var(--paper-2)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
          <span style={{ fontWeight: 500 }}>{tk.label}</span>
          <span className="mono" style={{ color: "var(--text-3)", fontSize: 10.5 }}>{`{{${tk.key}}}`}</span>
        </button>
      ))}
      <button onClick={onCustom} style={{
        display: "flex", width: "100%", textAlign: "left", alignItems: "center", gap: 6,
        padding: "10px 12px", fontSize: 12, fontWeight: 500,
        border: "none", borderTop: "1px solid var(--line-soft)",
        background: "transparent", color: "var(--accent)", cursor: "pointer",
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = "var(--accent-soft)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
        <I.plus size={11}/> Custom field…
      </button>
    </div>
  );
};

// Popup: define a custom field name
const CustomFieldPopup = ({ value, setValue, onSubmit, onClose }) => {
  const ref = React.useRef(null);
  React.useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div data-field-popup style={{
      position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 100,
      background: "var(--paper)", border: "1px solid var(--line)",
      borderRadius: 6, boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
      width: 280, padding: 12,
    }}>
      <div style={{ fontSize: 10.5, color: "var(--text-3)",
        textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500, marginBottom: 6 }}>
        Custom field name
      </div>
      <input ref={ref} value={value} onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); if (e.key === "Escape") onClose(); }}
        placeholder="e.g. clientRef"
        style={{
          width: "100%", padding: "7px 10px", fontSize: 13,
          border: "1px solid var(--line)", borderRadius: 4, outline: "none",
          fontFamily: "var(--font-mono, monospace)", marginBottom: 6,
        }}/>
      <div style={{ fontSize: 10.5, color: "var(--text-3)", marginBottom: 10 }}>
        Letters, numbers and underscores only. Will be inserted as <span className="mono">{`{{${(value || "fieldName").replace(/[^A-Za-z0-9_]/g, "") || "fieldName"}}}`}</span>.
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
        <Btn size="sm" onClick={onClose}>Cancel</Btn>
        <Btn size="sm" variant="primary" onClick={onSubmit}>Insert</Btn>
      </div>
    </div>
  );
};

// Same Word-page surface as the generator, but slightly more compact
const UploadDocPage = React.forwardRef(({ html, onChange, lang, fontSize,
  header, footer, onHeaderChange, onFooterChange }, ref) => {
  const localRef = React.useRef(null);
  const editorRef = ref || localRef;
  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    if (editorRef.current && document.activeElement !== editorRef.current
        && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
  }, [html]);
  return (
    <div style={{
      background: "var(--paper-2)", padding: "20px 0",
      maxHeight: "48vh", overflowY: "auto",
    }}>
      <div style={{
        background: "white", margin: "0 auto", width: 720, minHeight: 600,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)",
        padding: "44px 72px",
        display: "flex", flexDirection: "column",
      }}>
        <style>{`
          .upload-editor [data-field], .upload-editor mark.tpl-token {
            background: var(--accent-soft); color: var(--accent);
            padding: 1px 4px; border-radius: 3px; font-family: var(--font-mono, monospace);
            font-size: 0.92em;
          }
          .doc-band-empty:empty:before { content: attr(data-placeholder); color: #b3b3ab; font-style: italic; }
        `}</style>
        <DocBand kind="header" html={header} onChange={onHeaderChange} lang={lang}/>
        <div ref={editorRef}
          className="upload-editor"
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onChange?.(e.currentTarget.innerHTML)}
          style={{
            outline: "none", flex: 1,
            fontFamily: lang === "dv"
              ? "'Noto Sans Thaana', 'MV Boli', Faruma, Tahoma, sans-serif"
              : "'Times New Roman', Georgia, 'Liberation Serif', serif",
            fontSize: `${fontSize}pt`,
            lineHeight: 1.55,
            color: "#111",
            direction: lang === "dv" ? "rtl" : "ltr",
            textAlign: lang === "dv" ? "right" : "left",
            minHeight: 420,
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        />
        <DocBand kind="footer" html={footer} onChange={onFooterChange} lang={lang}/>
      </div>
    </div>
  );
});

window.DocumentsPage = DocumentsPage;
window.GenerateDocModal = GenerateDocModal;
window.PickTemplateModal = PickTemplateModal;
window.ViewDocModal = ViewDocModal;
window.AccessPage = AccessPage;
window.NewAccessGrantModal = NewAccessGrantModal;
window.UploadTemplateModal = UploadTemplateModal;
window.resolveTokens = resolveTokens;
