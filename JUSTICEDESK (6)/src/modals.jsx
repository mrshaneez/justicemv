// ─── Modals: New case / booking / target / task / request ────────────────────

const NewCaseModal = ({ cases, setCases, judges, onClose }) => {
  const judgeNames = (judges || []).map((j) => j.name);
  const [f, setF] = React.useState({
    id: `HC/2024/${String(cases.length + 1).padStart(3, "0")}`,
    title: "", type: "Civil", presiding: judgeNames[0] || "", petitioner: "", respondent: "",
  });
  const submit = () => {
    if (!f.title || !f.petitioner) return;
    setCases(p => [...p, {
      id: f.id, title: f.title, type: f.type, status: "Pending",
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
      <Sel label="Type" options={["Civil","Criminal","Commercial","Probate","Constitutional","Administrative"]} value={f.type} onChange={(e) => setF({...f, type: e.target.value})}/>
      <Sel label="Presiding judge" options={judgeNames} value={f.presiding} onChange={(e) => setF({...f, presiding: e.target.value})}/>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Petitioner" value={f.petitioner} onChange={(e) => setF({...f, petitioner: e.target.value})}/>
        <Input label="Respondent" value={f.respondent} onChange={(e) => setF({...f, respondent: e.target.value})}/>
      </div>
    </Modal>
  );
};

const NewTargetModal = ({ targets, setTargets, onClose }) => {
  const [f, setF] = React.useState({ type: "Case Resolution", description: "", metric: 10, deadline: fmt(addDays(today, 30)), assignee: "All Judges" });
  return (
    <Modal title="New target" onClose={onClose}
      footer={<><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn variant="primary" onClick={() => { if(!f.description) return; setTargets(p => [...p, {...f, id: Date.now(), current: 0, metric: Number(f.metric)}]); onClose(); }}>Create</Btn></>}>
      <Sel label="Category" options={["Case Resolution","Hearing Completion","Performance","Backlog"]} value={f.type} onChange={e=>setF({...f, type:e.target.value})}/>
      <Input label="Description" value={f.description} onChange={e=>setF({...f, description:e.target.value})}/>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Target value" type="number" value={f.metric} onChange={e=>setF({...f, metric:e.target.value})}/>
        <Input label="Deadline" type="date" value={f.deadline} onChange={e=>setF({...f, deadline:e.target.value})}/>
      </div>
      <Input label="Owner" value={f.assignee} onChange={e=>setF({...f, assignee:e.target.value})}/>
    </Modal>
  );
};

const EditTargetModal = ({ target, setTargets, onClose }) => {
  const [f, setF] = React.useState({ ...target });
  const submit = () => {
    if (!f.description) return;
    setTargets((p) => p.map((t) => t.id === target.id ? { ...f, metric: Number(f.metric), current: Number(f.current) } : t));
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Deadline" type="date" value={f.deadline} onChange={e=>setF({...f, deadline:e.target.value})}/>
        <Input label="Owner" value={f.assignee} onChange={e=>setF({...f, assignee:e.target.value})}/>
      </div>
    </Modal>
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
  });
  const submit = () => {
    if (!f.text) return;
    const targetId = caseData?.id || f.caseId;
    if (!targetId) return;
    if (existing) {
      updateCase(targetId, c => ({...c, tasks: c.tasks.map(t => t.id === existing.id ? {...t, ...f} : t)}));
    } else {
      const { caseId, ...rest } = f;
      updateCase(targetId, c => ({...c, tasks: [...c.tasks, {...rest, id: Date.now(), done: false}]}));
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
  });
  const submit = () => {
    if (!f.reason) return;
    const targetId = caseData?.id || f.caseId;
    if (!targetId) return;
    const { caseId, ...rest } = f;
    updateCase(targetId, c => ({...c, requests: [...(c.requests||[]), {...rest, id: Date.now(), status: "Pending", submittedAt: fmt(today)}]}));
    onClose();
  };
  const subtitle = caseData ? `${caseData.id} · ${caseData.title}` : "Pick a case to file this request against";
  return (
    <Modal title="File request" subtitle={subtitle} onClose={onClose}
      footer={<><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn variant="primary" onClick={submit}>Submit</Btn></>}>
      {showCasePicker && (
        <Sel label="Case" options={caseOptions} value={f.caseId} onChange={e=>setF({...f, caseId:e.target.value})}/>
      )}
      <Sel label="Type" options={["Adjourn","Expedite","Amend","Withdraw"]} value={f.type} onChange={e=>setF({...f, type:e.target.value})}/>
      <Sel label="Filed by" options={lawyerNames} value={f.filedBy} onChange={e=>setF({...f, filedBy:e.target.value})}/>
      <Textarea label="Reason" rows={4} value={f.reason} onChange={e=>setF({...f, reason:e.target.value})}/>
    </Modal>
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

const EditCaseModal = ({ caseData, setCases, judges, lawyers, parties, representatives, onClose }) => {
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
        <Sel label="Type" options={["Civil", "Criminal", "Commercial", "Probate", "Constitutional", "Administrative"]}
             value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}/>
        <Sel label="Status" options={["Active", "Pending", "Closed"]}
             value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}/>
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

Object.assign(window, { NewCaseModal, NewTargetModal, EditTargetModal, BookingModal, NewTaskModal, NewRequestModal, EditCaseModal });
