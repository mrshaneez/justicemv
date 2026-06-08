// ─── People directories — Judges, Lawyers, Parties, Reps, Staff ─────────────
//
// All five pages share a generic layout (header → search/filter → split table +
// detail panel) so the visual register stays consistent. The per-role config
// declares columns, fields and detail layout — no per-role JSX duplication.

// ──────────────────────────────────────────────────────────────────────────────
// Role configs
// ──────────────────────────────────────────────────────────────────────────────

const ROLES = {
  judges: {
    label: "Judges",
    singular: "Judge",
    icon: "gavel",
    avatarTone: "judge",
    description: (n) => `${n} justices on the bench`,
    filterKey: "status",
    filterValues: ["All", "Sitting", "On leave"],
    searchKeys: ["name", "role", "chamber", "specialisations"],
    columns: [
      { key: "name", label: "Name", flex: 1.6, render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <Avatar name={r.name} tone="judge" size={28}/>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }} className="mono">{r.id}</div>
          </div>
        </div>
      )},
      { key: "role", label: "Role", flex: 0.9, render: (r) => <span style={{ fontSize: 12.5 }}>{r.role}</span> },
      { key: "chamber", label: "Chamber", flex: 0.7, render: (r) => <span style={{ fontSize: 12, color: "var(--text-2)" }}>{r.chamber}</span> },
      { key: "specs", label: "Specialty", flex: 1.1, render: (r) => (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {r.specialisations.slice(0, 2).map(s => <Tag key={s}>{s}</Tag>)}
          {r.specialisations.length > 2 && <Tag>+{r.specialisations.length - 2}</Tag>}
        </div>
      )},
      { key: "status", label: "Status", flex: 0.7, render: (r) => <Pill label={r.status === "Sitting" ? "Active" : r.status} dot/> },
    ],
    fields: [
      { key: "name", label: "Full name", required: true },
      { key: "role", label: "Role", kind: "select", options: ["Chief Justice", "Justice", "Acting Justice"] },
      { key: "chamber", label: "Chamber" },
      { key: "appointed", label: "Appointed", kind: "date" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "specialisations", label: "Specialisations", kind: "tags" },
      { key: "bio", label: "Biography", kind: "textarea" },
      { key: "status", label: "Status", kind: "select", options: ["Sitting", "On leave"] },
    ],
    blank: { id: "", name: "", role: "Justice", chamber: "", appointed: "",
      email: "", phone: "", specialisations: [], bio: "", status: "Sitting" },
    idPrefix: "J",
    detail: "judge",
  },

  lawyers: {
    label: "Lawyers",
    singular: "Lawyer",
    icon: "scales",
    avatarTone: "neutral",
    description: (n) => `${n} counsel registered with the bar`,
    filterKey: "side",
    filterValues: ["All", "Petitioner", "Respondent", "Defence", "Both"],
    searchKeys: ["name", "firm", "barNumber", "side"],
    columns: [
      { key: "name", label: "Name", flex: 1.5, render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <Avatar name={r.name} size={28}/>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }} className="mono">{r.barNumber}</div>
          </div>
        </div>
      )},
      { key: "firm", label: "Firm", flex: 1.2, render: (r) => <span style={{ fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{r.firm}</span> },
      { key: "side", label: "Side", flex: 0.5, render: (r) => <Tag>{r.side}</Tag> },
      { key: "active", label: "Active cases", flex: 0.6, render: (r) => (
        <span className="mono" style={{ fontSize: 12, color: r.activeCases > 0 ? "var(--text)" : "var(--text-3)" }}>
          {r.activeCases}
        </span>
      )},
      { key: "years", label: "Years", flex: 0.4, render: (r) => <span className="mono" style={{ fontSize: 12, color: "var(--text-2)" }}>{r.yearsActive}</span> },
      { key: "status", label: "Status", flex: 0.5, render: (r) => <Pill label={r.status} dot/> },
    ],
    fields: [
      { key: "name", label: "Full name", required: true },
      { key: "barNumber", label: "Bar number" },
      { key: "firm", label: "Firm / chambers" },
      { key: "side", label: "Typical side", kind: "select", options: ["Petitioner", "Respondent", "Defence", "Both"] },
      { key: "yearsActive", label: "Years active", kind: "number" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "status", label: "Status", kind: "select", options: ["Active", "Inactive", "Suspended"] },
    ],
    blank: { id: "", name: "", barNumber: "", firm: "", side: "Both",
      yearsActive: 0, email: "", phone: "", status: "Active", activeCases: 0 },
    idPrefix: "L",
    detail: "lawyer",
  },

  parties: {
    label: "Parties",
    singular: "Party",
    icon: "users",
    avatarTone: "neutral",
    description: (n) => `${n} parties on record`,
    filterKey: "kind",
    filterValues: ["All", "Individual", "Corporation", "Government", "Estate"],
    searchKeys: ["name", "kind", "contact"],
    columns: [
      { key: "name", label: "Name", flex: 1.5, render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <Avatar name={r.name} size={28} tone={r.kind === "Government" ? "ink" : "neutral"}/>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }} className="mono">{r.id}</div>
          </div>
        </div>
      )},
      { key: "kind", label: "Kind", flex: 0.8, render: (r) => <Tag>{r.kind}</Tag> },
      { key: "contact", label: "Contact", flex: 1.2, render: (r) => <span style={{ fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{r.contact}</span> },
      { key: "phone", label: "Phone", flex: 0.8, render: (r) => <span className="mono" style={{ fontSize: 11.5, color: "var(--text-2)" }}>{r.phone}</span> },
      { key: "status", label: "Status", flex: 0.6, render: (r) => <Pill label={r.status} dot/> },
    ],
    fields: [
      { key: "name", label: "Name", required: true },
      { key: "kind", label: "Party kind", kind: "select", options: ["Individual", "Corporation", "Government", "Estate"] },
      { key: "contact", label: "Primary contact" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "address", label: "Address", kind: "textarea" },
      { key: "status", label: "Status", kind: "select", options: ["Active", "Inactive"] },
    ],
    blank: { id: "", name: "", kind: "Individual", contact: "",
      email: "", phone: "", address: "", status: "Active" },
    idPrefix: "P",
    detail: "party",
  },

  representatives: {
    label: "Representatives",
    singular: "Representative",
    icon: "userTag",
    avatarTone: "neutral",
    description: (n) => `${n} authorised representatives`,
    filterKey: "relation",
    filterValues: ["All", "Power of Attorney", "Guardian ad litem", "Corporate Officer", "Director", "Government Agent"],
    searchKeys: ["name", "relation", "represents"],
    columns: [
      { key: "name", label: "Representative", flex: 1.3, render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <Avatar name={r.name} size={28}/>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }} className="mono">{r.id}</div>
          </div>
        </div>
      )},
      { key: "relation", label: "Capacity", flex: 1.0, render: (r) => <Tag>{r.relation}</Tag> },
      { key: "represents", label: "Represents", flex: 1.2, render: (r) => <span style={{ fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{r.represents}</span> },
      { key: "status", label: "Status", flex: 0.6, render: (r) => <Pill label={r.status} dot/> },
    ],
    fields: [
      { key: "name", label: "Full name", required: true },
      { key: "relation", label: "Capacity", kind: "select",
        options: ["Power of Attorney", "Guardian ad litem", "Corporate Officer", "Director", "Government Agent", "Trustee", "Next friend"] },
      { key: "represents", label: "Represents (party)" },
      { key: "basis", label: "Basis of authority" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "status", label: "Status", kind: "select", options: ["Active", "Lapsed", "Revoked"] },
    ],
    blank: { id: "", name: "", relation: "Power of Attorney", represents: "",
      basis: "", email: "", phone: "", status: "Active" },
    idPrefix: "R",
    detail: "rep",
  },

  staff: {
    label: "Court staff",
    singular: "Staff member",
    icon: "building",
    avatarTone: "neutral",
    description: (n) => `${n} employees across departments`,
    filterKey: "department",
    filterValues: ["All", "Registry", "Courtroom 1", "Courtroom 2", "Courtroom 3", "Technology", "Security"],
    searchKeys: ["name", "role", "department"],
    columns: [
      { key: "name", label: "Name", flex: 1.5, render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <Avatar name={r.name} size={28}/>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }} className="mono">{r.id}</div>
          </div>
        </div>
      )},
      { key: "role", label: "Role", flex: 1.0, render: (r) => <span style={{ fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{r.role}</span> },
      { key: "department", label: "Department", flex: 1.0, render: (r) => <Tag>{r.department}</Tag> },
      { key: "status", label: "Status", flex: 0.6, render: (r) => <Pill label={r.status === "Active" ? "Active" : r.status} dot/> },
    ],
    fields: [
      { key: "name", label: "Full name", required: true },
      { key: "role", label: "Role", kind: "combo",
        placeholder: "e.g. Court Clerk",
        options: ["Registrar", "Deputy Registrar", "Court Clerk", "Senior Clerk", "IT Officer", "Bailiff", "Translator", "Records Officer", "Court Reporter", "Legal Assistant", "Security Officer", "Administrator"] },
      { key: "department", label: "Department", kind: "combo",
        placeholder: "e.g. Registry",
        options: ["Registry", "Courtroom 1", "Courtroom 2", "Courtroom 3", "Technology", "Security", "Archives", "Reporting", "Administration"] },
      { key: "joined", label: "Joined", kind: "date" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "status", label: "Status", kind: "select", options: ["Active", "On leave", "Inactive"] },
    ],
    blank: { id: "", name: "", role: "Court Clerk", department: "Registry",
      joined: "", email: "", phone: "", status: "Active" },
    idPrefix: "S",
    detail: "staff",
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Generic directory page
// ──────────────────────────────────────────────────────────────────────────────

const PeoplePage = ({ role, records, setRecords, cases, bookings, setModal }) => {
  const cfg = ROLES[role];
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("All");
  const [selectedId, setSelectedId] = React.useState(records[0]?.id || null);
  const toast = useToast();

  // Reset selection when switching role pages
  React.useEffect(() => {
    setSearch(""); setFilter("All");
    setSelectedId(records[0]?.id || null);
  }, [role]); // eslint-disable-line

  const filtered = records.filter((r) => {
    if (filter !== "All" && r[cfg.filterKey] !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return cfg.searchKeys.some((k) => {
      const v = r[k];
      if (Array.isArray(v)) return v.some((x) => String(x).toLowerCase().includes(q));
      return String(v ?? "").toLowerCase().includes(q);
    });
  });

  // Filter pills = configured values + any custom values present in records
  const filterValues = React.useMemo(() => {
    const base = cfg.filterValues || ["All"];
    const present = Array.from(new Set(
      records.map((r) => r[cfg.filterKey]).filter(Boolean)
    ));
    const extras = present.filter((v) => !base.includes(v));
    return [...base, ...extras];
  }, [records, cfg.filterValues, cfg.filterKey]);

  const selected = records.find((r) => r.id === selectedId) || filtered[0];

  const remove = (id) => {
    if (!confirm(`Remove this ${cfg.singular.toLowerCase()}?`)) return;
    setRecords((p) => p.filter((r) => r.id !== id));
    toast(`${cfg.singular} removed`, "danger");
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>{cfg.label}</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>{cfg.description(records.length)}</div>
        </div>
        <Btn variant="primary" leading={<I.plus size={14}/>}
          onClick={() => setModal({ type: "personEdit", role, record: null })}>
          Add {cfg.singular.toLowerCase()}
        </Btn>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
        <div style={{
          flex: 1, maxWidth: 360, position: "relative",
          display: "flex", alignItems: "center",
        }}>
          <I.search size={13} style={{ position: "absolute", left: 10, color: "var(--text-3)" }}/>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${cfg.label.toLowerCase()}…`}
            style={{
              width: "100%", padding: "7px 11px 7px 30px",
              border: "1px solid var(--line-2)", borderRadius: 6,
              background: "var(--paper)", fontSize: 12.5, outline: "none",
            }}/>
        </div>
        <div style={{ display: "flex", gap: 4, padding: 2, flexWrap: "wrap",
          background: "var(--paper-2)", border: "1px solid var(--line)", borderRadius: 7 }}>
          {filterValues.map((v) => (
            <button key={v} onClick={() => setFilter(v)} style={{
              padding: "4px 10px", fontSize: 11.5, border: "none",
              borderRadius: 5, cursor: "pointer",
              background: filter === v ? "var(--paper)" : "transparent",
              color: filter === v ? "var(--text)" : "var(--text-3)",
              fontWeight: filter === v ? 500 : 400,
              boxShadow: filter === v ? "var(--shadow-sm)" : "none",
            }}>{v}</button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--text-3)" }}>
          <span className="mono">{filtered.length}</span> of <span className="mono">{records.length}</span>
        </div>
      </div>

      {/* Split: list + detail */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 14, alignItems: "start" }}>
        {/* List card */}
        <Card padding={0} style={{ overflow: "hidden" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: cfg.columns.map((c) => `${c.flex}fr`).join(" "),
            gap: "0 16px",
            padding: "10px 16px", background: "var(--paper-2)",
            borderBottom: "1px solid var(--line)",
            fontSize: 10.5, color: "var(--text-3)", fontWeight: 500,
            textTransform: "uppercase", letterSpacing: "0.07em",
          }}>
            {cfg.columns.map((c) => (
              <div key={c.key} style={{
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{c.label}</div>
            ))}
          </div>
          {filtered.length === 0 && <Empty title="No matches" body="Try a different search or filter"/>}
          {filtered.map((r) => {
            const isSel = selected?.id === r.id;
            return (
              <div key={r.id} onClick={() => setSelectedId(r.id)} style={{
                display: "grid",
                gridTemplateColumns: cfg.columns.map((c) => `${c.flex}fr`).join(" "),
                gap: "0 16px",
                padding: "12px 16px",
                borderBottom: "1px solid var(--line-soft)",
                alignItems: "center",
                cursor: "pointer",
                background: isSel ? "var(--paper-2)" : "transparent",
                position: "relative",
              }}
              onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = "var(--paper-2)"; }}
              onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
                {isSel && <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0, width: 2,
                  background: "var(--ink)",
                }}/>}
                {cfg.columns.map((c) => (
                  <div key={c.key} style={{ minWidth: 0, overflow: "hidden" }}>
                    {c.render(r)}
                  </div>
                ))}
              </div>
            );
          })}
        </Card>

        {/* Detail panel */}
        <div style={{ position: "sticky", top: 0 }}>
          {selected
            ? <DetailPanel record={selected} cfg={cfg} role={role}
                cases={cases} bookings={bookings}
                onEdit={() => setModal({ type: "personEdit", role, record: selected })}
                onRemove={() => remove(selected.id)}/>
            : <Card><Empty title={`Select a ${cfg.singular.toLowerCase()}`} body="Click any row to view full details"/></Card>}
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Detail panel — adapts per role using cfg.detail key
// ──────────────────────────────────────────────────────────────────────────────

const DetailPanel = ({ record, cfg, role, cases, bookings, onEdit, onRemove }) => {
  const linkedCases = useLinkedCases(record, role, cases);
  const upcoming = useUpcomingHearings(record, role, bookings);

  return (
    <Card padding={0}>
      <div style={{ padding: "20px 20px 14px" }}>
        <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
          <Avatar name={record.name} size={48} tone={cfg.avatarTone}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.2 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 3 }}>
              <span className="mono">{record.id}</span>
              {record.role && <> · {record.role}</>}
              {record.kind && <> · {record.kind}</>}
              {record.relation && <> · {record.relation}</>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Btn size="sm" variant="outline" leading={<I.edit size={12}/>} onClick={onEdit}>Edit</Btn>
            <Btn size="sm" variant="ghost" onClick={onRemove}
              style={{ color: "var(--text-3)", padding: "5px 8px" }}>
              <I.trash size={13}/>
            </Btn>
          </div>
        </div>

        {/* Contact strip */}
        {(record.email || record.phone) && (
          <div style={{ display: "flex", gap: 16, padding: "10px 12px",
            background: "var(--paper-2)", borderRadius: 8, fontSize: 12 }}>
            {record.email && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-2)" }}>
                <I.mail size={12} stroke="var(--text-3)"/> {record.email}
              </div>
            )}
            {record.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-2)" }}>
                <I.phone size={12} stroke="var(--text-3)"/> <span className="mono">{record.phone}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Role-specific facts */}
      <div style={{ borderTop: "1px solid var(--line-soft)", padding: "16px 20px" }}>
        <div style={{ fontSize: 10.5, color: "var(--text-3)", fontWeight: 500,
          textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Details</div>
        <RoleFacts record={record} role={role}/>
      </div>

      {/* Linked cases */}
      {linkedCases.length > 0 && (
        <div style={{ borderTop: "1px solid var(--line-soft)", padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 10.5, color: "var(--text-3)", fontWeight: 500,
              textTransform: "uppercase", letterSpacing: "0.07em" }}>Cases</div>
            <span className="mono" style={{ fontSize: 10.5, color: "var(--text-3)" }}>{linkedCases.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {linkedCases.slice(0, 5).map((c) => (
              <div key={c.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", background: "var(--paper-2)",
                borderRadius: 6, fontSize: 12,
              }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--text-3)", minWidth: 88 }}>{c.id}</span>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</span>
                <Pill label={c.status} size="xs"/>
              </div>
            ))}
            {linkedCases.length > 5 && (
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
                + {linkedCases.length - 5} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upcoming hearings */}
      {upcoming.length > 0 && (
        <div style={{ borderTop: "1px solid var(--line-soft)", padding: "16px 20px" }}>
          <div style={{ fontSize: 10.5, color: "var(--text-3)", fontWeight: 500,
            textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Upcoming hearings</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {upcoming.map((b) => (
              <div key={b.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", background: "var(--paper-2)",
                borderRadius: 6, fontSize: 12,
              }}>
                <I.calendar size={12} stroke="var(--text-3)"/>
                <span className="mono" style={{ fontSize: 11, color: "var(--text-2)" }}>{b.date}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>{b.timeStart}</span>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.caseTitle}</span>
                <Tag>{b.courtroom.replace("Courtroom ", "Crt ")}</Tag>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

// Role-specific fact grid
const RoleFacts = ({ record, role }) => {
  const facts = [];
  if (role === "judges") {
    facts.push(["Chamber", record.chamber]);
    facts.push(["Appointed", record.appointed]);
    facts.push(["Status", <Pill label={record.status === "Sitting" ? "Active" : record.status} size="xs" dot/>]);
    facts.push(["Specialisations",
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {record.specialisations.map((s) => <Tag key={s}>{s}</Tag>)}
      </div>]);
  } else if (role === "lawyers") {
    facts.push(["Bar number", <span className="mono">{record.barNumber}</span>]);
    facts.push(["Firm", record.firm]);
    facts.push(["Typical side", <Tag>{record.side}</Tag>]);
    facts.push(["Years active", <span className="mono">{record.yearsActive}</span>]);
    facts.push(["Active cases", <span className="mono">{record.activeCases}</span>]);
  } else if (role === "parties") {
    facts.push(["Kind", <Tag>{record.kind}</Tag>]);
    facts.push(["Primary contact", record.contact]);
    if (record.address) facts.push(["Address", record.address]);
  } else if (role === "representatives") {
    facts.push(["Capacity", <Tag>{record.relation}</Tag>]);
    facts.push(["Represents", record.represents]);
    facts.push(["Basis", record.basis]);
  } else if (role === "staff") {
    facts.push(["Role", record.role]);
    facts.push(["Department", <Tag>{record.department}</Tag>]);
    facts.push(["Joined", record.joined]);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", rowGap: 8, columnGap: 12, fontSize: 12.5 }}>
      {facts.map(([k, v], i) => (
        <React.Fragment key={i}>
          <div style={{ color: "var(--text-3)", fontSize: 11.5 }}>{k}</div>
          <div style={{ color: "var(--text)" }}>{v || <span style={{ color: "var(--text-3)" }}>—</span>}</div>
        </React.Fragment>
      ))}
      {role === "judges" && record.bio && (
        <>
          <div style={{ color: "var(--text-3)", fontSize: 11.5 }}>Biography</div>
          <div style={{ color: "var(--text-2)", fontSize: 12, lineHeight: 1.55 }}>{record.bio}</div>
        </>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Hooks: link records to cases / hearings
// ──────────────────────────────────────────────────────────────────────────────

const useLinkedCases = (record, role, cases) => {
  return React.useMemo(() => {
    if (!record) return [];
    if (role === "judges") return cases.filter((c) => c.judges?.includes(record.name));
    if (role === "lawyers") return cases.filter((c) =>
      c.petitioner?.lawyers?.includes(record.name) || c.respondent?.lawyers?.includes(record.name));
    if (role === "parties") return cases.filter((c) =>
      c.petitioner?.name === record.name || c.respondent?.name === record.name);
    if (role === "representatives") return cases.filter((c) =>
      c.petitioner?.name === record.represents || c.respondent?.name === record.represents);
    return [];
  }, [record, role, cases]);
};

const useUpcomingHearings = (record, role, bookings) => {
  return React.useMemo(() => {
    if (!record || role === "staff") return [];
    const todayStr = fmt(today);
    const future = bookings.filter((b) => b.date >= todayStr);
    let matching = [];
    if (role === "judges") matching = future.filter((b) => b.judges?.includes(record.name));
    else if (role === "lawyers") matching = future.filter((b) => b.lawyers?.includes(record.name));
    else if (role === "parties") matching = future.filter((b) => b.parties?.includes(record.name));
    else if (role === "representatives")
      matching = future.filter((b) => b.parties?.includes(record.represents));
    return matching.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  }, [record, role, bookings]);
};

// ──────────────────────────────────────────────────────────────────────────────
// Add / edit modal
// ──────────────────────────────────────────────────────────────────────────────

// Row used in the one-time credentials panel after provisioning
const CredsRow = ({ label, value, mono, highlight }) => {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "11px 14px", marginBottom: 8,
      background: highlight ? "var(--accent-soft)" : "var(--paper-2)",
      border: `1px solid ${highlight ? "rgba(31,58,61,0.18)" : "var(--line)"}`,
      borderRadius: 6,
    }}>
      <div>
        <div style={{ fontSize: 10.5, color: "var(--text-3)", letterSpacing: "0.07em",
          textTransform: "uppercase", fontWeight: 500, marginBottom: 3 }}>{label}</div>
        <div className={mono ? "mono" : undefined} style={{
          fontSize: mono ? 15 : 13, fontWeight: mono ? 500 : 400,
          color: "var(--text)", letterSpacing: mono ? "0.04em" : 0,
        }}>{value}</div>
      </div>
      <button onClick={copy} style={{
        padding: "5px 10px", fontSize: 11.5,
        border: "1px solid var(--line-2)", borderRadius: 4,
        background: "var(--paper)", cursor: "pointer", color: "var(--text)",
      }}>{copied ? "Copied" : "Copy"}</button>
    </div>
  );
};

const PersonEditModal = ({ role, record, records, setRecords, onClose }) => {
  const cfg = ROLES[role];
  const isNew = !record;
  const toast = useToast();
  const auth = useAuth?.() || null;
  const provisionUser = auth?.provisionUser;
  const nextId = `${cfg.idPrefix}-${String(records.length + 1).padStart(3, "0")}`;

  const [f, setF] = React.useState(record || { ...cfg.blank, id: nextId });
  const [tagInput, setTagInput] = React.useState("");
  const [creds, setCreds] = React.useState(null); // { identifier, tempPassword } shown after create
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  // Map directory role → auth role
  const ROLE_TO_AUTH = {
    judges: "judge", staff: "staff", lawyers: "lawyer",
    parties: "party", representatives: "rep",
  };

  const submit = () => {
    if (!f.name || !f.name.trim()) return;
    if (isNew) {
      setRecords((p) => [...p, f]);

      // Auto-provision a user account if we have a contact identifier
      const authRole = ROLE_TO_AUTH[role];
      const identifier = (f.email && f.email.trim()) || (f.phone && f.phone.trim()) || "";
      if (authRole && provisionUser && identifier) {
        const r = provisionUser({
          identifier, role: authRole, recordId: f.id, name: f.name,
        });
        if (r.ok) {
          // Hold the modal open so the admin can copy/share the temp password
          setCreds({ identifier, tempPassword: r.tempPassword, name: f.name });
          return;
        }
      }
      toast(`${cfg.singular} added`, "success");
    } else {
      setRecords((p) => p.map((r) => r.id === f.id ? f : r));
      toast(`${cfg.singular} updated`, "success");
    }
    onClose();
  };

  // After provisioning, show a one-time credentials panel instead of the form
  if (creds) {
    return (
      <Modal width={520} title="Account created" subtitle={creds.name}
        onClose={onClose}
        footer={<Btn variant="primary" onClick={onClose}>Done</Btn>}>
        <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55, marginBottom: 14 }}>
          A user account has been created. Share these credentials with the {cfg.singular.toLowerCase()} —
          they'll be required to set their own password on first sign-in.
          <span style={{ display: "block", marginTop: 6, color: "var(--text-3)", fontSize: 12 }}>
            This password will not be shown again.
          </span>
        </div>
        <CredsRow label="Sign-in" value={creds.identifier}/>
        <CredsRow label="Temporary password" value={creds.tempPassword} mono highlight/>
      </Modal>
    );
  }

  return (
    <Modal width={580}
      title={isNew ? `Add ${cfg.singular.toLowerCase()}` : `Edit ${cfg.singular.toLowerCase()}`}
      subtitle={isNew ? `Register a new ${cfg.singular.toLowerCase()} in the directory` : record.name}
      onClose={onClose}
      footer={<>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={submit}>{isNew ? "Add" : "Save changes"}</Btn>
      </>}>

      {/* Two-column field grid where reasonable */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
        {cfg.fields.map((field, i) => {
          const wide = field.kind === "textarea" || field.kind === "tags" || field.key === "name" || field.key === "represents" || field.key === "basis" || field.key === "address";
          const wrap = (children) => (
            <div key={field.key} style={{ gridColumn: wide ? "1 / -1" : undefined }}>{children}</div>
          );
          if (field.kind === "select") {
            return wrap(<Sel label={field.label} options={field.options}
              value={f[field.key] || ""} onChange={(e) => set(field.key, e.target.value)}/>);
          }
          if (field.kind === "combo") {
            const listId = `combo-${role}-${field.key}`;
            return wrap(
              <Field label={field.label} hint={field.hint || "Type a value or pick a suggestion"}>
                <input list={listId} value={f[field.key] || ""}
                  placeholder={field.placeholder || ""}
                  onChange={(e) => set(field.key, e.target.value)}
                  style={{
                    width: "100%", padding: "8px 10px", fontSize: 13,
                    border: "1px solid var(--line-2)", borderRadius: "var(--radius)",
                    background: "var(--paper)", outline: "none", color: "var(--text)",
                  }}/>
                <datalist id={listId}>
                  {(field.options || []).map((o) => <option key={o} value={o}/>)}
                </datalist>
              </Field>
            );
          }
          if (field.kind === "textarea") {
            return wrap(<Textarea label={field.label} rows={3}
              value={f[field.key] || ""} onChange={(e) => set(field.key, e.target.value)}/>);
          }
          if (field.kind === "date") {
            return wrap(<Input label={field.label} type="date"
              value={f[field.key] || ""} onChange={(e) => set(field.key, e.target.value)}/>);
          }
          if (field.kind === "number") {
            return wrap(<Input label={field.label} type="number"
              value={f[field.key] ?? 0} onChange={(e) => set(field.key, Number(e.target.value))}/>);
          }
          if (field.kind === "tags") {
            return wrap(
              <Field label={field.label} hint="Press Enter to add">
                <div style={{
                  display: "flex", gap: 6, flexWrap: "wrap", padding: "6px 8px",
                  border: "1px solid var(--line-2)", borderRadius: "var(--radius)",
                  background: "var(--paper)", minHeight: 40, alignItems: "center",
                }}>
                  {(f[field.key] || []).map((t) => (
                    <span key={t} style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "2px 4px 2px 8px", fontSize: 11.5,
                      background: "var(--paper-2)", border: "1px solid var(--line)",
                      borderRadius: 4,
                    }}>
                      {t}
                      <button onClick={() => set(field.key, f[field.key].filter((x) => x !== t))}
                        style={{ border: "none", background: "transparent", cursor: "pointer",
                          color: "var(--text-3)", padding: 2, display: "flex" }}>
                        <I.close size={10}/>
                      </button>
                    </span>
                  ))}
                  <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tagInput.trim()) {
                        e.preventDefault();
                        const cur = f[field.key] || [];
                        if (!cur.includes(tagInput.trim())) set(field.key, [...cur, tagInput.trim()]);
                        setTagInput("");
                      }
                    }}
                    placeholder="Add…"
                    style={{
                      flex: 1, minWidth: 80, border: "none", outline: "none",
                      fontSize: 12.5, background: "transparent", padding: "2px 0",
                    }}/>
                </div>
              </Field>
            );
          }
          return wrap(<Input label={field.label}
            value={f[field.key] || ""} onChange={(e) => set(field.key, e.target.value)}/>);
        })}
      </div>

      {!isNew && (
        <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
          Record ID: <span className="mono">{f.id}</span>
        </div>
      )}
    </Modal>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────────────────

window.PeoplePage = PeoplePage;
window.PersonEditModal = PersonEditModal;
window.PEOPLE_ROLES = ROLES;
