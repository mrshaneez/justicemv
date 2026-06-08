// ─── Modals: New case / booking / target / task / request ────────────────────

// Free-text field with suggestions (datalist) — lets users add any value
const Combo = ({ label, hint, value, onChange, options = [], placeholder, listId }) => {
  const autoId = React.useId ? React.useId().replace(/:/g, "") : `combo-${Math.random().toString(36).slice(2)}`;
  const id = listId || autoId;
  return (
    <Field label={label} hint={hint}>
      <input list={id} value={value || ""} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "8px 11px", fontSize: 13,
          border: "1px solid var(--line-2)", borderRadius: "var(--radius)",
          background: "var(--paper)", color: "var(--text)", outline: "none" }}/>
      <datalist id={id}>{options.map((o) => <option key={o} value={o}/>)}</datalist>
    </Field>
  );
};

const CASE_TYPE_DEFAULTS = ["Civil", "Criminal", "Commercial", "Probate", "Constitutional", "Administrative", "Family", "Tax & Revenue", "Maritime"];
const CASE_STATUS_DEFAULTS = ["Active", "Pending", "Closed", "Reserved", "Adjourned", "Stayed", "Dismissed", "Withdrawn", "On appeal"];
// Union of default values + any values already present across cases
const caseFieldOptions = (cases, key, defaults) =>
  Array.from(new Set([...defaults, ...(cases || []).map((c) => c[key]).filter(Boolean)]));

const NewCaseModal = ({ cases, setCases, judges, onClose }) => {
  const judgeNames = (judges || []).map((j) => j.name);
  const [f, setF] = React.useState({
    id: `HC/2024/${String(cases.length + 1).padStart(3, "0")}`,
    title: "", type: "Civil", status: "Pending", presiding: judgeNames[0] || "", petitioner: "", respondent: "",
  });
  const submit = () => {
    if (!f.title || !f.petitioner) return;
    setCases(p => [...p, {
      id: f.id, title: f.title, type: (f.type || "").trim() || "Civil", status: (f.status || "").trim() || "Pending",
      filed: fmt(today), presiding: f.presiding,
      judges: [f.presiding], petitioner: { name: f.petitioner, lawyers: [] },
      respondent: f.respondent ? { name: f.respondent, lawyers: [] } : null,
      summary: "", hearings: [], tasks: [], requests: [],
    }]);
    onClose();
  };
  return (
    <Modal title="Register new case" onClose={onClose}
      footer={<><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn variant="primary" onClick={submit}>Register</Btn></>}>
      <Input label="Case number" value={f.id} onChange={(e) => setF({...f, id: e.target.value})}/>
      <Input label="Title" placeholder="e.g. State v. Ahmed" value={f.title} onChange={(e) => setF({...f, title: e.target.value})}/>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Combo label="Category / type" value={f.type} onChange={(v) => setF({...f, type: v})}
          options={caseFieldOptions(cases, "type", CASE_TYPE_DEFAULTS)}
          placeholder="e.g. Civil — or type a new category" hint="Pick or type any category"/>
        <Combo label="Status" value={f.status} onChange={(v) => setF({...f, status: v})}
          options={caseFieldOptions(cases, "status", CASE_STATUS_DEFAULTS)}
          placeholder="e.g. Pending" hint="Pick or type any status"/>
      </div>
      <Sel label="Presiding judge" options={judgeNames} value={f.presiding} onChange={(e) => setF({...f, presiding: e.target.value})}/>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Petitioner" value={f.petitioner} onChange={(e) => setF({...f, petitioner: e.target.value})}/>
        <Input label="Respondent" value={f.respondent} onChange={(e) => setF({...f, respondent: e.target.value})}/>
      </div>
    </Modal>
  );
};

const NewTargetModal = ({ targets, setTargets, judges, staff, cases, onClose }) => {
  const [f, setF] = React.useState({ type: "Case Resolution", description: "", metric: 10, deadline: fmt(addDays(today, 30)), assignees: ["All Judges"], caseIds: [] });
  const suggestions = assigneeSuggestions(judges, staff);
  return (
    <Modal title="New target" onClose={onClose}
      footer={<><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn variant="primary" onClick={() => { if(!f.description) return; const assignees = f.assignees.length ? f.assignees : ["Unassigned"]; setTargets(p => [...p, {...f, assignees, assignee: assignees.join(", "), id: Date.now(), current: 0, metric: Number(f.metric)}]); onClose(); }}>Create</Btn></>}>
      <Sel label="Category" options={["Case Resolution","Hearing Completion","Performance","Backlog"]} value={f.type} onChange={e=>setF({...f, type:e.target.value})}/>
      <Input label="Description" value={f.description} onChange={e=>setF({...f, description:e.target.value})}/>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Target value" type="number" value={f.metric} onChange={e=>setF({...f, metric:e.target.value})}/>
        <Input label="Deadline" type="date" value={f.deadline} onChange={e=>setF({...f, deadline:e.target.value})}/>
      </div>
      <AssigneePicker label="Assigned to" values={f.assignees} suggestions={suggestions}
        onChange={(v) => setF({ ...f, assignees: v })}/>
      <CasePicker label="Linked case(s)" cases={cases || []} values={f.caseIds || []}
        onChange={(v) => setF({ ...f, caseIds: v })}
        hint="Optional — link this target to one or more specific cases"/>
    </Modal>
  );
};

const EditTargetModal = ({ target, setTargets, judges, staff, cases, onClose }) => {
  const [f, setF] = React.useState({ ...target, assignees: targetAssignees(target), caseIds: target.caseIds || [] });
  const suggestions = assigneeSuggestions(judges, staff);
  const submit = () => {
    if (!f.description) return;
    const assignees = f.assignees.length ? f.assignees : ["Unassigned"];
    setTargets((p) => p.map((t) => t.id === target.id ? { ...f, assignees, assignee: assignees.join(", "), metric: Number(f.metric), current: Number(f.current) } : t));
    onClose();
  };
  return (
    <Modal title="Edit target" subtitle={target.type} onClose={onClose}
      footer={<><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn variant="primary" onClick={submit}>Save changes</Btn></>}>
      <Sel label="Category" options={["Case Resolution","Hearing Completion","Performance","Backlog"]} value={f.type} onChange={e=>setF({...f, type:e.target.value})}/>
      <Input label="Description" value={f.description} onChange={e=>setF({...f, description:e.target.value})}/>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Target value" type="number" value={f.metric} onChange={e=>setF({...f, metric:e.target.value})}/>
        <Input label="Current value" type="number" value={f.current} onChange={e=>setF({...f, current:e.target.value})}/>
      </div>
      <Input label="Deadline" type="date" value={f.deadline} onChange={e=>setF({...f, deadline:e.target.value})}/>
      <AssigneePicker label="Assigned to" values={f.assignees} suggestions={suggestions}
        onChange={(v) => setF({ ...f, assignees: v })}/>
      <CasePicker label="Linked case(s)" cases={cases || []} values={f.caseIds || []}
        onChange={(v) => setF({ ...f, caseIds: v })}
        hint="Optional — link this target to one or more specific cases"/>
    </Modal>
  );
};

// Normalise a target's assignees to an array (back-compat with single `assignee`)
function targetAssignees(t) {
  if (Array.isArray(t?.assignees)) return t.assignees;
  if (t?.assignee) return String(t.assignee).split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}
// Build suggestion list: common groups + judge + staff names
function assigneeSuggestions(judges, staff) {
  const groups = ["All Judges", "All Staff", "Court Admin", "Registry"];
  const names = [
    ...(judges || []).map((j) => j.name),
    ...(staff || []).map((s) => s.name),
  ];
  return Array.from(new Set([...groups, ...names]));
}

// Chips + datalist multi-assignee picker — pick people/groups or type a custom name
const AssigneePicker = ({ label, values = [], suggestions = [], onChange }) => {
  const [text, setText] = React.useState("");
  const listId = React.useId ? React.useId().replace(/:/g, "") : `assignee-${Math.random().toString(36).slice(2)}`;
  const add = (name) => {
    const v = (name || "").trim();
    if (!v) return;
    if (!values.includes(v)) onChange([...values, v]);
    setText("");
  };
  const remove = (name) => onChange(values.filter((x) => x !== name));
  const available = suggestions.filter((s) => !values.includes(s));
  return (
    <Field label={label} hint="Add one or more people or groups — type a name or pick a suggestion, Enter to add">
      <div style={{
        display: "flex", gap: 6, flexWrap: "wrap", padding: "7px 8px",
        border: "1px solid var(--line-2)", borderRadius: "var(--radius)",
        background: "var(--paper)", minHeight: 42, alignItems: "center",
      }}>
        {values.map((nm) => (
          <span key={nm} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "3px 4px 3px 9px", fontSize: 12, fontWeight: 500,
            background: "var(--paper-2)", border: "1px solid var(--line)", borderRadius: 99,
          }}>
            {nm}
            <button type="button" onClick={() => remove(nm)}
              style={{ border: "none", background: "transparent", cursor: "pointer",
                color: "var(--text-3)", padding: 2, display: "flex" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--danger)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-3)"}>
              <I.close size={11}/>
            </button>
          </span>
        ))}
        <input list={listId} value={text}
          onChange={(e) => {
            const v = e.target.value;
            // Selecting from the datalist fires a change with the full value
            if (suggestions.includes(v)) { add(v); }
            else setText(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); add(text); }
            else if (e.key === "Backspace" && !text && values.length) { remove(values[values.length - 1]); }
          }}
          placeholder={values.length ? "Add another…" : "Add assignee…"}
          style={{ flex: 1, minWidth: 110, border: "none", outline: "none",
            fontSize: 12.5, background: "transparent", padding: "2px 0" }}/>
        <datalist id={listId}>
          {available.map((s) => <option key={s} value={s}/>)}
        </datalist>
      </div>
    </Field>
  );
};

// Chips + datalist multi-case picker — link a target/task to one or more cases
const CasePicker = ({ label, hint, cases = [], values = [], onChange, exclude }) => {
  const [text, setText] = React.useState("");
  const listId = React.useId ? React.useId().replace(/:/g, "") : `casepick-${Math.random().toString(36).slice(2)}`;
  const optionFor = (c) => `${c.id} — ${c.title}`;
  const labelToId = new Map(cases.map((c) => [optionFor(c), c.id]));
  const caseById = new Map(cases.map((c) => [c.id, c]));
  const add = (raw) => {
    const v = (raw || "").trim();
    if (!v) return;
    let id = labelToId.get(v);
    if (!id) {
      const c = cases.find((c) => c.id === v || optionFor(c).toLowerCase() === v.toLowerCase());
      id = c?.id;
    }
    if (!id || id === exclude) { setText(""); return; }
    if (!values.includes(id)) onChange([...values, id]);
    setText("");
  };
  const remove = (id) => onChange(values.filter((x) => x !== id));
  const available = cases.filter((c) => c.id !== exclude && !values.includes(c.id));
  return (
    <Field label={label} hint={hint || "Type a case number or title, or pick a suggestion — Enter to add"}>
      <div style={{
        display: "flex", gap: 6, flexWrap: "wrap", padding: "7px 8px",
        border: "1px solid var(--line-2)", borderRadius: "var(--radius)",
        background: "var(--paper)", minHeight: 42, alignItems: "center",
      }}>
        {values.map((id) => {
          const c = caseById.get(id);
          return (
            <span key={id} title={c?.title || id} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "3px 4px 3px 8px", fontSize: 11.5, fontWeight: 500,
              background: "var(--paper-2)", border: "1px solid var(--line)", borderRadius: 99, maxWidth: 230,
            }}>
              <span className="mono" style={{ fontSize: 10.5, color: "var(--text-2)" }}>{id}</span>
              {c && <span style={{ color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis",
                whiteSpace: "nowrap" }}>{c.title}</span>}
              <button type="button" onClick={() => remove(id)}
                style={{ border: "none", background: "transparent", cursor: "pointer",
                  color: "var(--text-3)", padding: 2, display: "flex", flexShrink: 0 }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--danger)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-3)"}>
                <I.close size={11}/>
              </button>
            </span>
          );
        })}
        <input list={listId} value={text}
          onChange={(e) => { const v = e.target.value; if (labelToId.has(v)) add(v); else setText(v); }}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); add(text); }
            else if (e.key === "Backspace" && !text && values.length) { remove(values[values.length - 1]); }
          }}
          placeholder={values.length ? "Link another case…" : "Link a case…"}
          style={{ flex: 1, minWidth: 130, border: "none", outline: "none",
            fontSize: 12.5, background: "transparent", padding: "2px 0" }}/>
        <datalist id={listId}>
          {available.map((c) => <option key={c.id} value={optionFor(c)}/>)}
        </datalist>
      </div>
    </Field>
  );
};

const BookingModal = ({ bookings, setBookings, cases, existing, onClose }) => {
  const [f, setF] = React.useState(existing || {
    caseId: cases[0].id, courtroom: COURTS[0],
    date: fmt(addDays(today, 1)), timeStart: "09:00", timeEnd: "10:00",
    notes: "",
  });
  const cs = cases.find(c => c.id === f.caseId);
  const probe = {
    ...f,
    caseTitle: cs.title,
    judges: cs.judges,
    parties: [cs.petitioner.name, cs.respondent?.name].filter(Boolean),
    lawyers: [...cs.petitioner.lawyers, ...(cs.respondent?.lawyers||[])],
  };
  const clashes = detectClashes(bookings, probe, existing?.id);

  const submit = () => {
    const payload = {...probe, status: "Confirmed", id: existing?.id || Date.now()};
    if (existing) setBookings(p => p.map(b => b.id === existing.id ? payload : b));
    else setBookings(p => [...p, payload]);
    onClose();
  };

  return (
    <Modal title={existing ? "Edit hearing" : "Book courtroom"} onClose={onClose} width={620}
      footer={<><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn variant="primary" onClick={submit}>{existing ? "Save changes" : "Book"}</Btn></>}>
      <Sel label="Case" options={cases.map(c => ({ value: c.id, label: `${c.id} — ${c.title}` }))} value={f.caseId} onChange={e=>setF({...f, caseId:e.target.value})}/>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Sel label="Courtroom" options={COURTS} value={f.courtroom} onChange={e=>setF({...f, courtroom:e.target.value})}/>
        <Input label="Date" type="date" value={f.date} onChange={e=>setF({...f, date:e.target.value})}/>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Sel label="Start" options={TIME_SLOTS} value={f.timeStart} onChange={e=>setF({...f, timeStart:e.target.value})}/>
        <Sel label="End" options={TIME_SLOTS} value={f.timeEnd} onChange={e=>setF({...f, timeEnd:e.target.value})}/>
      </div>
      <Textarea label="Notes" rows={2} value={f.notes} onChange={e=>setF({...f, notes:e.target.value})}/>
      {clashes.length > 0 && (
        <div style={{ background: "var(--warn-soft)", border: "1px solid #e8d4a4", borderRadius: 8, padding: 12, marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, color: "var(--warn)", fontSize: 12, fontWeight: 500 }}>
            <I.warn size={13}/> {clashes.length} schedule conflict{clashes.length>1?"s":""} detected
          </div>
          {clashes.map((c, i) => (
            <div key={i} style={{ fontSize: 11.5, color: "var(--warn)", paddingLeft: 19, lineHeight: 1.4 }}>· {c.msg}</div>
          ))}
        </div>
      )}
    </Modal>
  );
};

const NewTaskModal = ({ caseData, cases, updateCase, existing, judges, lawyers, onClose }) => {
  const judgeNames = (judges || []).map((j) => j.name);
  const lawyerNames = (lawyers || []).map((l) => l.name);
  const showCasePicker = !caseData;
  const caseOptions = (cases || []).map((c) => ({ value: c.id, label: `${c.id} — ${c.title}` }));
  const [f, setF] = React.useState(existing || {
    caseId: caseData?.id || cases?.[0]?.id || "",
    text: "", assignee: judgeNames[0] || "", priority: "Medium", due: fmt(addDays(today, 7)),
    linkedCases: [],
  });
  const primaryId = caseData?.id || f.caseId;
  const submit = () => {
    if (!f.text) return;
    const targetId = primaryId;
    if (!targetId) return;
    const linkedCases = (f.linkedCases || []).filter((id) => id !== targetId);
    if (existing) {
      updateCase(targetId, c => ({...c, tasks: c.tasks.map(t => t.id === existing.id ? {...t, ...f, linkedCases} : t)}));
    } else {
      const { caseId, ...rest } = f;
      updateCase(targetId, c => ({...c, tasks: [...c.tasks, {...rest, linkedCases, id: Date.now(), done: false}]}));
    }
    onClose();
  };
  const subtitle = caseData ? `${caseData.id} · ${caseData.title}` : "Pick a case to add this task to";
  return (
    <Modal title={existing ? "Edit task" : "New task"} subtitle={subtitle} onClose={onClose}
      footer={<><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn variant="primary" onClick={submit}>{existing ? "Save" : "Create"}</Btn></>}>
      {showCasePicker && !existing && (
        <Sel label="Case" options={caseOptions} value={f.caseId} onChange={e=>setF({...f, caseId:e.target.value})}/>
      )}
      <Input label="Task" value={f.text} onChange={e=>setF({...f, text:e.target.value})}/>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Sel label="Assignee" options={[...judgeNames, ...lawyerNames, "Clerk A", "Clerk B"]} value={f.assignee} onChange={e=>setF({...f, assignee:e.target.value})}/>
        <Sel label="Priority" options={["High","Medium","Low"]} value={f.priority} onChange={e=>setF({...f, priority:e.target.value})}/>
      </div>
      <Input label="Due" type="date" value={f.due} onChange={e=>setF({...f, due:e.target.value})}/>
      <CasePicker label="Also linked to" cases={cases || []} values={f.linkedCases || []}
        exclude={primaryId} onChange={(v) => setF({ ...f, linkedCases: v })}
        hint="Optionally link this task to other related cases"/>
    </Modal>
  );
};

const NewRequestModal = ({ caseData, cases, updateCase, lawyers, onClose }) => {
  const lawyerNames = (lawyers || []).map((l) => l.name);
  const showCasePicker = !caseData;
  const caseOptions = (cases || []).map((c) => ({ value: c.id, label: `${c.id} — ${c.title}` }));
  const [f, setF] = React.useState({
    caseId: caseData?.id || cases?.[0]?.id || "",
    type: "Adjourn", reason: "", filedBy: lawyerNames[0] || "",
    attachments: [],
  });
  const submit = () => {
    if (!f.reason) return;
    const targetId = caseData?.id || f.caseId;
    if (!targetId) return;
    const { caseId, ...rest } = f;
    const type = (f.type || "").trim() || "Request";
    updateCase(targetId, c => ({...c, requests: [...(c.requests||[]), {...rest, type, id: Date.now(), status: "Pending", submittedAt: fmt(today)}]}));
    onClose();
  };
  const subtitle = caseData ? `${caseData.id} · ${caseData.title}` : "Pick a case to file this request against";
  return (
    <Modal title="File request" subtitle={subtitle} onClose={onClose}
      footer={<><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn variant="primary" onClick={submit}>Submit</Btn></>}>
      {showCasePicker && (
        <Sel label="Case" options={caseOptions} value={f.caseId} onChange={e=>setF({...f, caseId:e.target.value})}/>
      )}
      <Field label="Type" hint="Pick a common type or type your own">
        <input list="request-type-options" value={f.type}
          onChange={e=>setF({...f, type:e.target.value})}
          placeholder="e.g. Adjourn, or describe the request"
          style={{ width: "100%", padding: "8px 11px", borderRadius: 6,
            border: "1px solid var(--line-2)", background: "var(--paper)",
            color: "var(--text)", fontSize: 13, outline: "none" }}/>
        <datalist id="request-type-options">
          {["Adjourn","Expedite","Amend","Withdraw","Extension of time","Substitution of counsel","Consolidation","Stay of proceedings","Production of documents","Recusal"].map((o) => <option key={o} value={o}/>)}
        </datalist>
      </Field>
      <Sel label="Filed by" options={lawyerNames} value={f.filedBy} onChange={e=>setF({...f, filedBy:e.target.value})}/>
      <Textarea label="Reason" rows={4} value={f.reason} onChange={e=>setF({...f, reason:e.target.value})}/>
      <AttachmentField attachments={f.attachments} onChange={(a) => setF({ ...f, attachments: a })}/>
    </Modal>
  );
};

// ─── Attachment field — attach files & images to a request ───────────────────
// Files are read as data URLs so previews + downloads survive in app state.
const fmtBytes = (n) => n < 1024 ? `${n} B`
  : n < 1024 * 1024 ? `${(n / 1024).toFixed(0)} KB`
  : `${(n / 1024 / 1024).toFixed(1)} MB`;

const AttachmentField = ({ attachments = [], onChange }) => {
  const inputRef = React.useRef(null);
  const [hover, setHover] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const toast = useToast?.();

  const readFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setBusy(true);
    const read = (file) => new Promise((resolve) => {
      // Cap individual files at ~8MB to keep app state sane
      if (file.size > 8 * 1024 * 1024) {
        toast?.(`${file.name} is larger than 8 MB and was skipped`, "warn");
        resolve(null); return;
      }
      const fr = new FileReader();
      fr.onload = () => resolve({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name, type: file.type || "application/octet-stream",
        size: file.size, dataUrl: fr.result,
      });
      fr.onerror = () => { toast?.(`Couldn't read ${file.name}`, "warn"); resolve(null); };
      fr.readAsDataURL(file);
    });
    const results = (await Promise.all(files.map(read))).filter(Boolean);
    onChange([...(attachments || []), ...results]);
    setBusy(false);
  };

  const removeAt = (id) => onChange((attachments || []).filter((a) => a.id !== id));

  return (
    <Field label="Attachments" hint="Documents or images to support this request">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setHover(true); }}
        onDragLeave={() => setHover(false)}
        onDrop={(e) => { e.preventDefault(); setHover(false); readFiles(e.dataTransfer?.files); }}
        style={{
          border: `1.5px dashed ${hover ? "var(--accent)" : "var(--line-2)"}`,
          borderRadius: 8, padding: "16px 14px", textAlign: "center", cursor: "pointer",
          background: hover ? "var(--accent-soft)" : "var(--paper-2)",
          transition: "background 120ms, border-color 120ms",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
        <I.paperclip size={14} stroke="var(--text-2)"/>
        <span style={{ fontSize: 12.5, color: "var(--text-2)" }}>
          {busy ? "Reading files…" : "Drop files here, or click to attach documents & images"}
        </span>
        <input ref={inputRef} type="file" multiple hidden
          accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.csv"
          onChange={(e) => { readFiles(e.target.files); e.target.value = ""; }}/>
      </div>

      {(attachments || []).length > 0 && (
        <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
          {attachments.map((a) => {
            const isImg = (a.type || "").startsWith("image/");
            return (
              <div key={a.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "7px 9px", border: "1px solid var(--line)", borderRadius: 6,
                background: "var(--paper)",
              }}>
                {isImg
                  ? <img src={a.dataUrl} alt={a.name} style={{
                      width: 34, height: 34, objectFit: "cover", borderRadius: 4,
                      border: "1px solid var(--line)", flexShrink: 0,
                    }}/>
                  : <div style={{
                      width: 34, height: 34, borderRadius: 4, flexShrink: 0,
                      background: "var(--paper-2)", border: "1px solid var(--line)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}><I.doc size={15} stroke="var(--text-2)"/></div>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap",
                    overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>{fmtBytes(a.size)}</div>
                </div>
                <button type="button" onClick={() => removeAt(a.id)} title="Remove"
                  style={{ border: "none", background: "transparent", cursor: "pointer",
                    color: "var(--text-3)", padding: 4, display: "flex" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--danger)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-3)"}>
                  <I.close size={13}/>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Field>
  );
};

// ─── Edit case modal — full case metadata ────────────────────────────────────

const MultiPicker = ({ label, options, values, onChange, emptyText = "None selected" }) => {
  const toggle = (v) => onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11.5, color: "var(--text-2)", marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 6,
        padding: 8, border: "1px solid var(--line)", borderRadius: 6,
        background: "var(--paper-2)", maxHeight: 140, overflowY: "auto",
      }}>
        {options.length === 0 && (
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>{emptyText}</span>
        )}
        {options.map((opt) => {
          const on = values.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => toggle(opt)} style={{
              padding: "4px 10px", borderRadius: 999, fontSize: 11.5,
              border: on ? "1px solid var(--accent)" : "1px solid var(--line)",
              background: on ? "var(--accent)" : "var(--paper)",
              color: on ? "#fff" : "var(--text-2)",
              cursor: "pointer", fontWeight: on ? 500 : 400,
            }}>{opt}</button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Party block — used N times for appellants and N times for respondents ──
const PartyBlock = ({ side, idx, party, partyOptions, lawyerNames, repNames, onChange, onRemove, canRemove }) => {
  const update = (patch) => onChange({ ...party, ...patch });
  const sideColor = side === "Appellant" ? "var(--success)" : "var(--accent)";
  return (
    <div style={{
      border: "1px solid var(--line)", borderRadius: 8,
      padding: 14, marginBottom: 10, background: "var(--paper)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: sideColor }}/>
          <span style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>
            {side} #{idx + 1}
          </span>
        </div>
        {canRemove && (
          <button onClick={onRemove} type="button"
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 4, display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
            <I.close size={12}/> Remove
          </button>
        )}
      </div>
      <Field label="Party name">
        <input list={`party-options-${side}-${idx}`}
          value={party.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Select existing or type new"
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "8px 11px", borderRadius: 6,
            border: "1px solid var(--line-2)", background: "var(--paper-2)",
            color: "var(--text)", fontSize: 13, outline: "none",
          }}/>
        <datalist id={`party-options-${side}-${idx}`}>
          {partyOptions.map((p) => <option key={p} value={p}/>)}
        </datalist>
      </Field>
      <MultiPicker label="Lawyers" options={lawyerNames}
        values={party.lawyers || []}
        onChange={(v) => update({ lawyers: v })}
        emptyText="No lawyers available"/>
      <MultiPicker label="Representatives" options={repNames}
        values={party.reps || []}
        onChange={(v) => update({ reps: v })}
        emptyText="No representatives available"/>
    </div>
  );
};

const EditCaseModal = ({ caseData, cases, setCases, judges, lawyers, parties, representatives, onClose }) => {
  const judgeNames = (judges || []).map((j) => j.name);
  const lawyerNames = (lawyers || []).map((l) => l.name);
  const partyNames = (parties || []).map((p) => p.name);
  const repNames = (representatives || []).map((r) => r.name);

  // Migrate legacy single-petitioner shape if present
  const seedAppellants = caseData.appellants?.length ? caseData.appellants
    : caseData.petitioner ? [{ name: caseData.petitioner.name, lawyers: caseData.petitioner.lawyers || [], reps: [] }]
    : [];
  const seedRespondents = caseData.respondents?.length ? caseData.respondents
    : caseData.respondent ? [{ name: caseData.respondent.name, lawyers: caseData.respondent.lawyers || [], reps: [] }]
    : [];

  const [f, setF] = React.useState({
    title: caseData.title,
    type: caseData.type,
    status: caseData.status,
    presiding: caseData.presiding,
    judges: caseData.judges || [],
    appellants: seedAppellants,
    respondents: seedRespondents,
    summary: caseData.summary || "",
  });

  // Keep presiding inside the bench list automatically
  React.useEffect(() => {
    if (f.presiding && !f.judges.includes(f.presiding)) {
      setF((s) => ({ ...s, judges: [f.presiding, ...s.judges] }));
    }
  }, [f.presiding]);

  const submit = () => {
    if (!f.title) return;
    const cleanA = f.appellants.filter((p) => p.name.trim());
    const cleanR = f.respondents.filter((p) => p.name.trim());
    setCases((p) => p.map((c) => c.id === caseData.id ? {
      ...c,
      title: f.title,
      type: f.type,
      status: f.status,
      presiding: f.presiding,
      judges: f.judges.length ? f.judges : [f.presiding],
      appellants: cleanA,
      respondents: cleanR,
      // back-compat shims so legacy reads still work
      petitioner: cleanA[0] ? { name: cleanA[0].name, lawyers: cleanA[0].lawyers } : null,
      respondent: cleanR[0] ? { name: cleanR[0].name, lawyers: cleanR[0].lawyers } : null,
      summary: f.summary,
    } : c));
    onClose();
  };

  const partyOptions = Array.from(new Set([
    ...partyNames,
    ...f.appellants.map((p) => p.name),
    ...f.respondents.map((p) => p.name),
  ].filter(Boolean)));

  const updateAppellant = (idx, val) =>
    setF((s) => ({ ...s, appellants: s.appellants.map((p, i) => i === idx ? val : p) }));
  const updateRespondent = (idx, val) =>
    setF((s) => ({ ...s, respondents: s.respondents.map((p, i) => i === idx ? val : p) }));
  const addAppellant = () => setF((s) => ({ ...s, appellants: [...s.appellants, { name: "", lawyers: [], reps: [] }] }));
  const addRespondent = () => setF((s) => ({ ...s, respondents: [...s.respondents, { name: "", lawyers: [], reps: [] }] }));
  const removeAppellant = (idx) => setF((s) => ({ ...s, appellants: s.appellants.filter((_, i) => i !== idx) }));
  const removeRespondent = (idx) => setF((s) => ({ ...s, respondents: s.respondents.filter((_, i) => i !== idx) }));

  return (
    <Modal title="Edit case" subtitle={`${caseData.id}`} width={780} onClose={onClose}
      footer={<><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn variant="primary" onClick={submit}>Save changes</Btn></>}>
      <Input label="Title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })}/>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Combo label="Category / type" value={f.type} onChange={(v) => setF({ ...f, type: v })}
          options={caseFieldOptions(cases, "type", CASE_TYPE_DEFAULTS)}
          placeholder="Type any category" hint="Pick or type any category"/>
        <Combo label="Status" value={f.status} onChange={(v) => setF({ ...f, status: v })}
          options={caseFieldOptions(cases, "status", CASE_STATUS_DEFAULTS)}
          placeholder="Type any status" hint="Pick or type any status"/>
      </div>
      <Sel label="Presiding judge" options={judgeNames}
           value={f.presiding} onChange={(e) => setF({ ...f, presiding: e.target.value })}/>
      <MultiPicker label="Bench (sitting judges)" options={judgeNames}
                   values={f.judges}
                   onChange={(v) => setF({ ...f, judges: v.includes(f.presiding) ? v : [f.presiding, ...v] })}/>

      <div style={{ height: 1, background: "var(--line)", margin: "10px 0 16px" }}/>

      {/* Appellants */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "-0.005em" }}>
          Appellants <span style={{ color: "var(--text-3)", fontWeight: 400 }}>· {f.appellants.length}</span>
        </div>
        <Btn variant="outline" size="sm" leading={<I.plus size={11}/>} onClick={addAppellant}>Add appellant</Btn>
      </div>
      {f.appellants.length === 0 && (
        <div style={{ padding: 14, background: "var(--paper-2)", borderRadius: 6, fontSize: 12, color: "var(--text-3)", textAlign: "center", marginBottom: 10 }}>
          No appellants — add at least one.
        </div>
      )}
      {f.appellants.map((p, i) => (
        <PartyBlock key={i} side="Appellant" idx={i} party={p}
          partyOptions={partyOptions} lawyerNames={lawyerNames} repNames={repNames}
          onChange={(v) => updateAppellant(i, v)} onRemove={() => removeAppellant(i)}
          canRemove={f.appellants.length > 1}/>
      ))}

      {/* Respondents */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "16px 0 10px" }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "-0.005em" }}>
          Respondents <span style={{ color: "var(--text-3)", fontWeight: 400 }}>· {f.respondents.length}</span>
        </div>
        <Btn variant="outline" size="sm" leading={<I.plus size={11}/>} onClick={addRespondent}>Add respondent</Btn>
      </div>
      {f.respondents.length === 0 && (
        <div style={{ padding: 14, background: "var(--paper-2)", borderRadius: 6, fontSize: 12, color: "var(--text-3)", textAlign: "center", marginBottom: 10 }}>
          No respondents — leave empty for ex parte / probate matters.
        </div>
      )}
      {f.respondents.map((p, i) => (
        <PartyBlock key={i} side="Respondent" idx={i} party={p}
          partyOptions={partyOptions} lawyerNames={lawyerNames} repNames={repNames}
          onChange={(v) => updateRespondent(i, v)} onRemove={() => removeRespondent(i)}
          canRemove={true}/>
      ))}

      <div style={{ height: 1, background: "var(--line)", margin: "16px 0" }}/>

      <Textarea label="Summary" rows={3} value={f.summary}
                onChange={(e) => setF({ ...f, summary: e.target.value })}/>
    </Modal>
  );
};

Object.assign(window, { NewCaseModal, NewTargetModal, EditTargetModal, BookingModal, NewTaskModal, NewRequestModal, EditCaseModal, targetAssignees, CasePicker });
