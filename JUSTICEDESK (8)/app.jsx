// ─── App root ────────────────────────────────────────────────────────────────

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "comfortable",
  "showAdvisor": true,
  "fontScale": 1.0
}/*EDITMODE-END*/;

// Pages the user is allowed to land on, in priority order.
const DEFAULT_PAGE_BY_ROLE = {
  admin: "dashboard", judge: "dashboard", staff: "dashboard",
  lawyer: "cases", party: "cases", rep: "cases",
};

function AppInner() {
  const { session } = useAuth();
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [page, setPage] = React.useState(DEFAULT_PAGE_BY_ROLE[session?.role] || "dashboard");
  const [allCases, setCases] = React.useState(initCases);
  const [targets, setTargets] = React.useState(initTargets);
  const [bookings, setBookings] = React.useState(initBookings);
  const [judges, setJudges] = React.useState(initJudges);
  const [lawyers, setLawyers] = React.useState(initLawyers);
  const [parties, setParties] = React.useState(initParties);
  const [representatives, setRepresentatives] = React.useState(initRepresentatives);
  const [staff, setStaff] = React.useState(initStaff);
  const [sections, setSections] = React.useState(initSections);
  const [viewCase, setViewCase] = React.useState(null);
  const [modal, setModal] = React.useState(null);
  const [aiOpen, setAiOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  // Global ⌘K / Ctrl-K to open the command palette
  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Reset to a sensible default page when session changes.
  React.useEffect(() => {
    setPage(DEFAULT_PAGE_BY_ROLE[session?.role] || "dashboard");
    setViewCase(null); setModal(null); setAiOpen(false);
  }, [session?.identifier]);

  // Visible cases for current role
  const cases = React.useMemo(
    () => visibleCases(session, allCases, judges, staff, sections),
    [session, allCases, judges, staff, sections]
  );

  // People role → state slice mapping
  const peopleSlices = {
    judges:          [judges, setJudges],
    lawyers:         [lawyers, setLawyers],
    parties:         [parties, setParties],
    representatives: [representatives, setRepresentatives],
    staff:           [staff, setStaff],
  };
  const peopleRole = peopleSlices[page] ? page : null;

  React.useEffect(() => {
    document.documentElement.style.fontSize = `${tweaks.fontScale * 16}px`;
  }, [tweaks.fontScale]);

  const updateCase = (id, fn) => {
    setCases(p => p.map(c => c.id === id ? fn(c) : c));
    if (viewCase?.id === id) setViewCase(p => p ? fn(p) : p);
  };
  const goCase = (c) => { setViewCase(c); setPage("cases"); };
  const navigate = (p) => { setPage(p); setViewCase(null); };

  // Counts (from visible-cases only — counts must respect visibility)
  const counts = {
    requests: cases.flatMap(c => (c.requests || []).filter(r => r.status === "Pending")).length,
    tasks: cases.flatMap(c => c.tasks.filter(t => !t.done)).length,
  };

  const isPrivileged = ["admin","judge","staff"].includes(session?.role);

  const actions = (
    <>
      {page === "cases" && !viewCase && isPrivileged && (
        <Btn variant="primary" size="sm" leading={<I.plus size={13}/>} onClick={() => setModal("newCase")}>New case</Btn>
      )}
      {page === "courtrooms" && isPrivileged && (
        <Btn variant="primary" size="sm" leading={<I.plus size={13}/>} onClick={() => setModal("newBooking")}>Book courtroom</Btn>
      )}
      {page === "targets" && isPrivileged && (
        <Btn variant="primary" size="sm" leading={<I.plus size={13}/>} onClick={() => setModal("newTarget")}>New target</Btn>
      )}
      {peopleRole && session?.role === "admin" && (
        <Btn variant="primary" size="sm" leading={<I.plus size={13}/>}
          onClick={() => setModal({ type: "personEdit", role: peopleRole, record: null })}>
          Add {PEOPLE_ROLES[peopleRole].singular.toLowerCase()}
        </Btn>
      )}
    </>
  );

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--paper-2)" }}>
      <Sidebar page={page} setPage={navigate} counts={counts}
        aiOpen={aiOpen && tweaks.showAdvisor} setAiOpen={setAiOpen} density={tweaks.density}
        onOpenSearch={() => setPaletteOpen(true)}/>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--paper)" }}>
        <Topbar page={page} viewCase={viewCase} breadcrumbActions={actions}/>
        <main style={{ flex: 1, overflowY: "auto", padding: "24px 28px", background: "var(--paper-2)" }}>
          {page === "dashboard" && <DashPage cases={cases} targets={targets} bookings={bookings} sections={sections} setPage={navigate} goCase={goCase}/>}
          {page === "cases" && <CasesPage cases={cases} viewCase={viewCase} setViewCase={setViewCase} updateCase={updateCase} setModal={setModal}/>}
          {page === "courtrooms" && <CourtroomsPage bookings={bookings} setBookings={setBookings} cases={cases} setModal={setModal}/>}
          {page === "targets" && <TargetsPage targets={targets} setTargets={setTargets} setModal={setModal}/>}
          {page === "tasks" && <TasksPage cases={cases} updateCase={updateCase}/>}
          {page === "requests" && <RequestsPage cases={cases} updateCase={updateCase}/>}
          {page === "sections" && <SectionsPage sections={sections} setSections={setSections} judges={judges} staff={staff} cases={cases} setModal={setModal}/>}
          {peopleRole && (() => {
            const [records, setRecords] = peopleSlices[peopleRole];
            return <PeoplePage role={peopleRole} records={records} setRecords={setRecords}
              cases={cases} bookings={bookings} setModal={setModal}/>;
          })()}
        </main>
      </div>
      {tweaks.showAdvisor && isPrivileged && <AIAdvisor open={aiOpen} onClose={() => setAiOpen(false)} cases={cases} targets={targets} bookings={bookings}/>}

      {modal === "newCase" && <NewCaseModal cases={allCases} setCases={setCases} onClose={() => setModal(null)}/>}
      {modal === "newTarget" && <NewTargetModal targets={targets} setTargets={setTargets} onClose={() => setModal(null)}/>}
      {modal === "newBooking" && <BookingModal bookings={bookings} setBookings={setBookings} cases={cases} onClose={() => setModal(null)}/>}
      {modal?.type === "editBooking" && <BookingModal bookings={bookings} setBookings={setBookings} cases={cases} existing={modal.booking} onClose={() => setModal(null)}/>}
      {modal?.type === "newTask" && <NewTaskModal caseData={modal.caseData} updateCase={updateCase} existing={modal.existing} onClose={() => setModal(null)}/>}
      {modal?.type === "newRequest" && <NewRequestModal caseData={modal.caseData} updateCase={updateCase} onClose={() => setModal(null)}/>}
      {modal?.type === "personEdit" && (() => {
        const [records, setRecords] = peopleSlices[modal.role];
        return <PersonEditModal role={modal.role} record={modal.record}
          records={records} setRecords={setRecords} onClose={() => setModal(null)}/>;
      })()}
      {modal?.type === "sectionEdit" && <SectionEditModal section={modal.record} sections={sections} setSections={setSections} judges={judges} onClose={() => setModal(null)}/>}
      {modal?.type === "sectionAssign" && <SectionAssignModal section={modal.section} kind={modal.kind} sections={sections} setSections={setSections} judges={judges} staff={staff} onClose={() => setModal(null)}/>}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)}
        cases={cases} judges={judges} lawyers={lawyers} parties={parties}
        representatives={representatives} staff={staff} sections={sections} bookings={bookings}
        navigate={navigate} goCase={goCase}/>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Layout"/>
        <TweakRadio label="Density" value={tweaks.density}
          options={["comfortable","compact"]}
          onChange={(v) => setTweak("density", v)}/>
        <TweakSlider label="Font scale" value={tweaks.fontScale}
          min={0.9} max={1.15} step={0.05}
          onChange={(v) => setTweak("fontScale", v)}/>
        <TweakSection label="Advisor"/>
        <TweakToggle label="Show AI Advisor" value={tweaks.showAdvisor}
          onChange={(v) => setTweak("showAdvisor", v)}/>
      </TweaksPanel>
    </div>
  );
}

// Gate the app behind auth.
function AppGate() {
  const { session } = useAuth();
  if (!session) return <AuthScreen/>;
  return <AppInner/>;
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppGate/>
      </ToastProvider>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
