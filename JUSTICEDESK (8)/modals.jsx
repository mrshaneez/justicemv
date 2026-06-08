// ─── Modals: New case / booking / target / task / request ────────────────────

const NewCaseModal = ({ cases, setCases, onClose }) => {
  const [f, setF] = React.useState({
    id: `HC/2024/${String(cases.length + 1).padStart(3, "0")}`,
    title: "", type: "Civil", presiding: JUDGES[0], petitioner: "", respondent: "",
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
      <Sel label="Presiding judge" options={JUDGES} value={f.presiding} onChange={(e) => setF({...f, presiding: e.target.value})}/>
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

const NewTaskModal = ({ caseData, updateCase, existing, onClose }) => {
  const [f, setF] = React.useState(existing || { text: "", assignee: JUDGES[0], priority: "Medium", due: fmt(addDays(today, 7)) });
  const submit = () => {
    if (!f.text) return;
    if (existing) {
      updateCase(caseData.id, c => ({...c, tasks: c.tasks.map(t => t.id === existing.id ? {...t, ...f} : t)}));
    } else {
      updateCase(caseData.id, c => ({...c, tasks: [...c.tasks, {...f, id: Date.now(), done: false}]}));
    }
    onClose();
  };
  return (
    <Modal title={existing ? "Edit task" : "New task"} subtitle={`${caseData.id} · ${caseData.title}`} onClose={onClose}
      footer={<><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn variant="primary" onClick={submit}>{existing ? "Save" : "Create"}</Btn></>}>
      <Input label="Task" value={f.text} onChange={e=>setF({...f, text:e.target.value})}/>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Sel label="Assignee" options={[...JUDGES, ...LAWYERS, "Clerk A", "Clerk B"]} value={f.assignee} onChange={e=>setF({...f, assignee:e.target.value})}/>
        <Sel label="Priority" options={["High","Medium","Low"]} value={f.priority} onChange={e=>setF({...f, priority:e.target.value})}/>
      </div>
      <Input label="Due" type="date" value={f.due} onChange={e=>setF({...f, due:e.target.value})}/>
    </Modal>
  );
};

const NewRequestModal = ({ caseData, updateCase, onClose }) => {
  const [f, setF] = React.useState({ type: "Adjourn", reason: "", filedBy: LAWYERS[0] });
  return (
    <Modal title="File request" subtitle={`${caseData.id} · ${caseData.title}`} onClose={onClose}
      footer={<><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn variant="primary" onClick={() => { if(!f.reason) return; updateCase(caseData.id, c => ({...c, requests: [...(c.requests||[]), {...f, id: Date.now(), status: "Pending", submittedAt: fmt(today)}]})); onClose(); }}>Submit</Btn></>}>
      <Sel label="Type" options={["Adjourn","Expedite","Amend","Withdraw"]} value={f.type} onChange={e=>setF({...f, type:e.target.value})}/>
      <Sel label="Filed by" options={LAWYERS} value={f.filedBy} onChange={e=>setF({...f, filedBy:e.target.value})}/>
      <Textarea label="Reason" rows={4} value={f.reason} onChange={e=>setF({...f, reason:e.target.value})}/>
    </Modal>
  );
};

Object.assign(window, { NewCaseModal, NewTargetModal, BookingModal, NewTaskModal, NewRequestModal });
