// ─── Sections — judicial section management ─────────────────────────────────

const SectionsPage = ({ sections, setSections, judges, staff, cases, setModal }) => {
  const { session } = useAuth();
  const isAdmin = session?.role === "admin";
  const isJudge = session?.role === "judge";

  // Judges only see their own section; cases inside it are limited to ones they're on the bench for.
  const visibleSections = isJudge
    ? sections.filter((s) => s.judges?.includes(session.name) || s.head === session.name)
    : sections;
  const involvedCases = isJudge
    ? cases.filter((c) => c.presiding === session.name || c.judges?.includes(session.name))
    : cases;

  const [selectedId, setSelectedId] = React.useState(visibleSections[0]?.id || null);

  // If the visible set changes (e.g. session switch), keep selection valid.
  React.useEffect(() => {
    if (!visibleSections.find((s) => s.id === selectedId)) {
      setSelectedId(visibleSections[0]?.id || null);
    }
  }, [visibleSections.map((s) => s.id).join("|")]);

  const selected = visibleSections.find((s) => s.id === selectedId);

  // Judge sees only one section — render the detail directly without the list rail.
  if (isJudge) {
    return (
      <div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>My section</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>
            {selected ? `${selected.name} · ${selected.code}` : "You are not assigned to a section"}
          </div>
        </div>
        {selected ? (
          <SectionDetail section={selected} sections={sections} setSections={setSections}
            judges={judges} staff={staff} cases={involvedCases} isAdmin={false} setModal={setModal}/>
        ) : (
          <Card><Empty title="No section assigned" body="Speak to court administration to be assigned to a judicial section."/></Card>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>Sections</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>
            One section per judge · {sections.length} sections, each with its own staff
          </div>
        </div>
        {isAdmin && (
          <Btn variant="primary" leading={<I.plus size={14}/>}
            onClick={() => setModal({ type: "sectionEdit", record: null })}>
            New section
          </Btn>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 14, alignItems: "start" }}>
        {/* Section list */}
        <Card padding={0}>
          {visibleSections.map((sec) => {
            const isSel = sec.id === selectedId;
            const caseCount = cases.filter((c) => sec.caseTypes?.includes(c.type)).length;
            return (
              <div key={sec.id} onClick={() => setSelectedId(sec.id)} style={{
                padding: "14px 16px",
                borderBottom: "1px solid var(--line-soft)",
                cursor: "pointer",
                background: isSel ? "var(--paper-2)" : "transparent",
                position: "relative",
              }}
              onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = "var(--paper-2)"; }}
              onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
                {isSel && <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "var(--ink)",
                }}/>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{sec.name}</div>
                  <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>{sec.code}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-3)", display: "flex", gap: 12 }}>
                  <span>{sec.head?.replace("Hon. ", "") || "—"}</span>
                  <span>{sec.staff.length} staff</span>
                  <span>{caseCount} cases</span>
                </div>
              </div>
            );
          })}
        </Card>

        {/* Detail */}
        {selected && (
          <SectionDetail section={selected} sections={sections} setSections={setSections}
            judges={judges} staff={staff} cases={cases} isAdmin={isAdmin} setModal={setModal}/>
        )}
      </div>
    </div>
  );
};

const SectionDetail = ({ section, sections, setSections, judges, staff, cases, isAdmin, setModal }) => {
  const toast = useToast();
  const sectionCases = cases.filter((c) => section.caseTypes?.includes(c.type));
  const head = judges.find((j) => j.name === section.head);

  const removeStaff = (id) => {
    setSections((p) => p.map((s) => s.id === section.id
      ? { ...s, staff: s.staff.filter((x) => x !== id) } : s));
    toast("Staff removed from section", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header card */}
      <Card padding="20px">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 6,
                background: "var(--ink)", color: "var(--paper)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 600, fontSize: 14,
              }}>{section.code}</div>
              <div style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em" }}>{section.name}</div>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55, marginTop: 6 }}>
              {section.description}
            </div>
            <div style={{ display: "flex", gap: 5, marginTop: 10, flexWrap: "wrap" }}>
              {section.caseTypes.map((t) => <Tag key={t}>{t}</Tag>)}
            </div>
          </div>
          {isAdmin && (
            <Btn size="sm" variant="outline" leading={<I.edit size={12}/>}
              onClick={() => setModal({ type: "sectionEdit", record: section })}>Edit</Btn>
          )}
        </div>
      </Card>

      {/* Members — one judge owns this section, plus its staff */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 14 }}>
        {/* Section judge */}
        <Card padding="18px">
          <div style={{ fontSize: 10.5, color: "var(--text-3)", letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 500, marginBottom: 12 }}>Section judge</div>
          {head ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
              <Avatar name={head.name} tone="judge" size={48}/>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{head.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{head.role}</div>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 4 }}>
                {head.chamber} · appointed {head.appointed}
              </div>
            </div>
          ) : (
            <Empty title="No judge assigned"/>
          )}
          {isAdmin && (
            <div style={{ marginTop: 14 }}>
              <Btn size="sm" variant="outline" leading={<I.edit size={11}/>}
                onClick={() => setModal({ type: "sectionEdit", record: section })}>
                Reassign judge
              </Btn>
            </div>
          )}
        </Card>

        {/* Staff */}
        <Card padding="18px">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Staff <span className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginLeft: 4 }}>{section.staff.length}</span></div>
            {isAdmin && (
              <Btn size="sm" variant="ghost" leading={<I.plus size={11}/>}
                onClick={() => setModal({ type: "sectionAssign", section, kind: "staff" })}>Assign</Btn>
            )}
          </div>
          {section.staff.length === 0 && <Empty title="No staff assigned"/>}
          {section.staff.map((sid) => {
            const s = staff.find((x) => x.id === sid);
            if (!s) return null;
            return (
              <div key={sid} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 0", borderTop: "1px solid var(--line-soft)",
              }}>
                <Avatar name={s.name} size={30}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>{s.role} · {s.department}</div>
                </div>
                {isAdmin && (
                  <button onClick={() => removeStaff(sid)} style={{
                    background: "transparent", border: "none", padding: 4,
                    color: "var(--text-3)", cursor: "pointer",
                  }}><I.close size={13}/></button>
                )}
              </div>
            );
          })}
        </Card>
      </div>

      {/* Cases */}
      <Card padding="18px">
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
          Cases in this section <span className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginLeft: 4 }}>{sectionCases.length}</span>
        </div>
        {sectionCases.length === 0 && <Empty title="No cases"/>}
        {sectionCases.map((c) => (
          <div key={c.id} style={{
            display: "grid", gridTemplateColumns: "100px 1fr 100px 80px 100px",
            gap: 12, padding: "10px 0",
            borderTop: "1px solid var(--line-soft)", alignItems: "center", fontSize: 12.5,
          }}>
            <span className="mono" style={{ fontSize: 11.5, color: "var(--text-2)" }}>{c.id}</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</span>
            <Tag>{c.type}</Tag>
            <Pill label={c.status} size="xs" dot/>
            <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>{c.presiding.replace("Hon. ", "")}</span>
          </div>
        ))}
      </Card>
    </div>
  );
};

// ── Modal: Edit / create section (admin only) ───────────────────────────────
const SectionEditModal = ({ section, sections, setSections, judges, onClose }) => {
  const isNew = !section;
  const toast = useToast();
  const nextId = `SEC-${String.fromCharCode(65 + sections.length)}`;

  // Judges already owning another section — cannot be picked here
  const takenHeads = new Set(
    sections.filter((s) => !section || s.id !== section.id).map((s) => s.head).filter(Boolean)
  );
  const availableJudges = judges.filter((j) => !takenHeads.has(j.name));
  const headOptions = availableJudges.map((j) => j.name);
  // Make sure existing head stays selectable when editing
  if (section?.head && !headOptions.includes(section.head)) headOptions.unshift(section.head);

  const initialHead = section?.head || availableJudges[0]?.name || "";
  const [f, setF] = React.useState(section || {
    id: nextId, code: String.fromCharCode(65 + sections.length),
    name: initialHead ? `${initialHead}'s Section` : "",
    head: initialHead, judges: initialHead ? [initialHead] : [],
    staff: [], description: "", caseTypes: [],
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const onHeadChange = (name) => {
    setF((p) => {
      const wasAuto = !p.name || p.name === `${p.head}'s Section`;
      return { ...p, head: name, judges: [name], name: wasAuto ? `${name}'s Section` : p.name };
    });
  };

  const submit = () => {
    if (!f.name.trim() || !f.head) return;
    const payload = { ...f, judges: [f.head] };
    if (isNew) setSections((p) => [...p, payload]);
    else setSections((p) => p.map((s) => s.id === payload.id ? payload : s));
    toast(isNew ? "Section created" : "Section updated", "success");
    onClose();
  };

  const allTypes = ["Criminal", "Civil", "Commercial", "Probate", "Constitutional", "Administrative", "Family"];

  return (
    <Modal width={580}
      title={isNew ? "Create section" : "Edit section"}
      subtitle={isNew ? "A new judicial section" : section.name}
      onClose={onClose}
      footer={<>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={submit}>{isNew ? "Create" : "Save"}</Btn>
      </>}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: "0 14px" }}>
        <Input label="Section name" placeholder="e.g. Section A — Criminal"
          value={f.name} onChange={(e) => set("name", e.target.value)}/>
        <Input label="Code" value={f.code} onChange={(e) => set("code", e.target.value)}/>
      </div>
      <Sel label="Section judge" options={headOptions}
        value={f.head} onChange={(e) => onHeadChange(e.target.value)}/>
      <div style={{ fontSize: 11, color: "var(--text-3)", margin: "-8px 0 14px" }}>
        Each judge can lead only one section.
      </div>
      <Textarea label="Description" rows={2}
        value={f.description} onChange={(e) => set("description", e.target.value)}/>
      <Field label="Case types handled" hint="Used to filter cases routed to this section">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {allTypes.map((t) => {
            const on = f.caseTypes.includes(t);
            return (
              <button key={t} type="button" onClick={() => set("caseTypes",
                on ? f.caseTypes.filter((x) => x !== t) : [...f.caseTypes, t])}
                style={{
                  padding: "4px 10px", fontSize: 11.5, borderRadius: 99,
                  border: on ? "1px solid var(--ink)" : "1px solid var(--line-2)",
                  background: on ? "var(--ink)" : "var(--paper)",
                  color: on ? "var(--paper)" : "var(--text-2)",
                  cursor: "pointer", fontWeight: 500,
                }}>{t}</button>
            );
          })}
        </div>
      </Field>
    </Modal>
  );
};

// ── Modal: Assign judges or staff to a section ─────────────────────────────
const SectionAssignModal = ({ section, kind, sections, setSections, judges, staff, onClose }) => {
  const toast = useToast();
  const list = kind === "judges" ? judges : staff;
  const currentKey = kind === "judges" ? "judges" : "staff";
  const valKey = kind === "judges" ? "name" : "id";
  const current = section[currentKey] || [];
  const [picked, setPicked] = React.useState(current);

  const toggle = (v) => setPicked((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);

  const submit = () => {
    setSections((p) => p.map((s) => s.id === section.id ? { ...s, [currentKey]: picked } : s));
    toast(`${kind === "judges" ? "Judges" : "Staff"} updated`, "success");
    onClose();
  };

  return (
    <Modal width={500}
      title={`Assign ${kind === "judges" ? "judges" : "staff"} to ${section.name}`}
      onClose={onClose}
      footer={<>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={submit}>Save assignment</Btn>
      </>}>
      <div style={{ maxHeight: 360, overflowY: "auto" }}>
        {list.map((rec) => {
          const v = rec[valKey];
          const on = picked.includes(v);
          return (
            <label key={v} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px",
              borderRadius: 6, cursor: "pointer",
              background: on ? "var(--paper-2)" : "transparent",
              marginBottom: 2,
            }}>
              <input type="checkbox" checked={on} onChange={() => toggle(v)}
                style={{ width: 14, height: 14, accentColor: "var(--ink)" }}/>
              <Avatar name={rec.name} size={28} tone={kind === "judges" ? "judge" : "neutral"}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{rec.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                  {kind === "judges" ? rec.role : `${rec.role} · ${rec.department}`}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </Modal>
  );
};

window.SectionsPage = SectionsPage;
window.SectionEditModal = SectionEditModal;
window.SectionAssignModal = SectionAssignModal;
