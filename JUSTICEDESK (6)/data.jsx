// ─── Static seed data + helpers ──────────────────────────────────────────────

const JUDGES = [
  "Hon. Ibrahim Rasheed",
  "Hon. Aminath Didi",
  "Hon. Mohamed Waheed",
  "Hon. Fathimath Nisreen",
  "Hon. Ahmed Shiyam",
];
const LAWYERS = [
  "Ali Hassan", "Sara Moosa", "Ismail Niyaz",
  "Mariyam Afza", "Hussain Riza", "Aishath Laila",
];

// ─── Directory records — judges ──────────────────────────────────────────────
const initJudges = [
  { id: "J-001", name: "Hon. Ibrahim Rasheed", role: "Chief Justice",
    appointed: "2018-04-12", chamber: "Chamber A", email: "i.rasheed@highcourt.gov.mv",
    phone: "+960 332 1101", specialisations: ["Criminal", "Constitutional"],
    bio: "Former Attorney General. LLM Cambridge. Sits on full bench matters.",
    status: "Sitting" },
  { id: "J-002", name: "Hon. Aminath Didi", role: "Justice",
    appointed: "2019-09-01", chamber: "Chamber B", email: "a.didi@highcourt.gov.mv",
    phone: "+960 332 1102", specialisations: ["Civil", "Administrative"],
    bio: "Career judge. Previously Magistrate Court bench (2008–2019).",
    status: "Sitting" },
  { id: "J-003", name: "Hon. Mohamed Waheed", role: "Justice",
    appointed: "2020-03-15", chamber: "Chamber C", email: "m.waheed@highcourt.gov.mv",
    phone: "+960 332 1103", specialisations: ["Commercial", "Civil"],
    bio: "Commercial litigation specialist. LLM Harvard.",
    status: "Sitting" },
  { id: "J-004", name: "Hon. Fathimath Nisreen", role: "Justice",
    appointed: "2021-07-20", chamber: "Chamber D", email: "f.nisreen@highcourt.gov.mv",
    phone: "+960 332 1104", specialisations: ["Probate", "Family"],
    bio: "Family and probate matters. PhD Inheritance Law (KIU).",
    status: "On leave" },
  { id: "J-005", name: "Hon. Ahmed Shiyam", role: "Justice",
    appointed: "2022-01-10", chamber: "Chamber E", email: "a.shiyam@highcourt.gov.mv",
    phone: "+960 332 1105", specialisations: ["Constitutional", "Administrative"],
    bio: "Constitutional law scholar. Former Faculty of Sharia & Law.",
    status: "Sitting" },
];

// ─── Directory records — lawyers ─────────────────────────────────────────────
const initLawyers = [
  { id: "L-001", name: "Ali Hassan", barNumber: "BAR/2012/0451", firm: "Hassan & Co.",
    side: "Both", email: "ali@hassanco.mv", phone: "+960 776 1234",
    yearsActive: 12, activeCases: 2, status: "Active" },
  { id: "L-002", name: "Sara Moosa", barNumber: "BAR/2014/0612", firm: "Moosa Legal",
    side: "Defence", email: "sara@moosalegal.mv", phone: "+960 776 2345",
    yearsActive: 10, activeCases: 2, status: "Active" },
  { id: "L-003", name: "Ismail Niyaz", barNumber: "BAR/2010/0298", firm: "Niyaz Associates",
    side: "Petitioner", email: "ismail@niyazassoc.mv", phone: "+960 776 3456",
    yearsActive: 14, activeCases: 2, status: "Active" },
  { id: "L-004", name: "Mariyam Afza", barNumber: "BAR/2016/0784", firm: "Bank of Maldives Legal Dept.",
    side: "Respondent", email: "m.afza@bml.com.mv", phone: "+960 776 4567",
    yearsActive: 8, activeCases: 2, status: "Active" },
  { id: "L-005", name: "Hussain Riza", barNumber: "BAR/2009/0186", firm: "Riza Chambers",
    side: "Both", email: "h.riza@rizachambers.mv", phone: "+960 776 5678",
    yearsActive: 15, activeCases: 1, status: "Active" },
  { id: "L-006", name: "Aishath Laila", barNumber: "BAR/2017/0823", firm: "Laila Legal",
    side: "Both", email: "a.laila@lailalegal.mv", phone: "+960 776 6789",
    yearsActive: 7, activeCases: 2, status: "Active" },
];

// ─── Sections — judicial sections grouping judges + staff ───────────────────
const initSections = [
  { id: "SEC-A", name: "Section A — Criminal", code: "A",
    head: "Hon. Ibrahim Rasheed",
    judges: ["Hon. Ibrahim Rasheed", "Hon. Aminath Didi"],
    staff: ["S-001", "S-003"],
    description: "Criminal appeals, penal matters, prosecutorial review.",
    caseTypes: ["Criminal", "Constitutional"],
  },
  { id: "SEC-B", name: "Section B — Civil & Commercial", code: "B",
    head: "Hon. Aminath Didi",
    judges: ["Hon. Aminath Didi", "Hon. Mohamed Waheed"],
    staff: ["S-002", "S-004"],
    description: "Civil disputes, commercial litigation, contract.",
    caseTypes: ["Civil", "Commercial"],
  },
  { id: "SEC-C", name: "Section C — Family & Probate", code: "C",
    head: "Hon. Fathimath Nisreen",
    judges: ["Hon. Fathimath Nisreen"],
    staff: ["S-005", "S-008"],
    description: "Probate, inheritance, family law matters.",
    caseTypes: ["Probate", "Family"],
  },
  { id: "SEC-D", name: "Section D — Administrative", code: "D",
    head: "Hon. Ahmed Shiyam",
    judges: ["Hon. Ahmed Shiyam"],
    staff: ["S-006", "S-007"],
    description: "Judicial review, administrative appeals.",
    caseTypes: ["Administrative", "Constitutional"],
  },
];

// ─── Directory records — court staff ─────────────────────────────────────────
const initStaff = [
  { id: "S-001", name: "Ahmed Saeed", role: "Registrar", department: "Registry",
    email: "a.saeed@highcourt.gov.mv", phone: "+960 332 1200",
    joined: "2015-06-01", status: "Active" },
  { id: "S-002", name: "Aminath Shiuna", role: "Deputy Registrar", department: "Registry",
    email: "a.shiuna@highcourt.gov.mv", phone: "+960 332 1201",
    joined: "2017-09-15", status: "Active" },
  { id: "S-003", name: "Mohamed Faisal", role: "Court Clerk", department: "Courtroom 1",
    email: "m.faisal@highcourt.gov.mv", phone: "+960 332 1210",
    joined: "2019-02-10", status: "Active" },
  { id: "S-004", name: "Fathimath Reesha", role: "Court Clerk", department: "Courtroom 2",
    email: "f.reesha@highcourt.gov.mv", phone: "+960 332 1211",
    joined: "2020-04-22", status: "Active" },
  { id: "S-005", name: "Hassan Naseer", role: "Court Clerk", department: "Courtroom 3",
    email: "h.naseer@highcourt.gov.mv", phone: "+960 332 1212",
    joined: "2021-08-03", status: "Active" },
  { id: "S-006", name: "Mariyam Shifa", role: "IT Officer", department: "Technology",
    email: "m.shifa@highcourt.gov.mv", phone: "+960 332 1220",
    joined: "2022-01-12", status: "Active" },
  { id: "S-007", name: "Ali Waheed", role: "Bailiff", department: "Security",
    email: "a.waheed@highcourt.gov.mv", phone: "+960 332 1230",
    joined: "2018-11-05", status: "Active" },
  { id: "S-008", name: "Aishath Reema", role: "Translator", department: "Registry",
    email: "a.reema@highcourt.gov.mv", phone: "+960 332 1240",
    joined: "2020-10-18", status: "On leave" },
];

// ─── Directory records — parties ─────────────────────────────────────────────
const initParties = [
  { id: "P-001", name: "State of Maldives", kind: "Government",
    contact: "Attorney General's Office", email: "ago@ago.gov.mv",
    phone: "+960 332 3666", address: "Velaanaage, Male'", status: "Active" },
  { id: "P-002", name: "Abdullah Rasheed", kind: "Individual",
    contact: "Self / via counsel", email: "—", phone: "via counsel",
    address: "M. Heenfulhumaage, Male'", status: "Active" },
  { id: "P-003", name: "Fathimath Ali", kind: "Individual",
    contact: "Self / via counsel", email: "f.ali@email.mv", phone: "+960 776 8810",
    address: "H. Fairyland, Hulhumale'", status: "Active" },
  { id: "P-004", name: "Bank of Maldives", kind: "Corporation",
    contact: "Legal Department", email: "legal@bml.com.mv", phone: "+960 333 0200",
    address: "Boduthakurufaanu Magu, Male'", status: "Active" },
  { id: "P-005", name: "Hassan Ibrahim Estate", kind: "Estate",
    contact: "Executor — Aishath Laila", email: "a.laila@lailalegal.mv", phone: "+960 776 6789",
    address: "—", status: "Active" },
  { id: "P-006", name: "Maldives Ports Ltd.", kind: "Corporation",
    contact: "General Counsel", email: "legal@mpl.com.mv", phone: "+960 332 9090",
    address: "Hulhumale' Industrial Zone", status: "Active" },
  { id: "P-007", name: "Reef Shipping Co.", kind: "Corporation",
    contact: "Director — Operations", email: "ops@reefshipping.mv", phone: "+960 332 7711",
    address: "Marine Drive, Male'", status: "Active" },
  { id: "P-008", name: "Naseem Mohamed", kind: "Individual",
    contact: "Self / via counsel", email: "—", phone: "via counsel",
    address: "G. Aagasdhoshuge, Male'", status: "Active" },
  { id: "P-009", name: "Civil Service Commission", kind: "Government",
    contact: "Secretary", email: "info@csc.gov.mv", phone: "+960 334 4055",
    address: "Majeedhee Magu, Male'", status: "Active" },
  { id: "P-010", name: "Mohamed Riyaz", kind: "Individual",
    contact: "Self / via counsel", email: "m.riyaz@email.mv", phone: "+960 776 9920",
    address: "Ma. Nooraaneege, Male'", status: "Active" },
];

// ─── Directory records — representatives (authorised reps / power of attorney) ─
const initRepresentatives = [
  { id: "R-001", name: "Hawwa Ibrahim", relation: "Power of Attorney",
    represents: "Hassan Ibrahim Estate", basis: "Notarised PoA dated 2024-01-08",
    email: "h.ibrahim@email.mv", phone: "+960 776 1010", status: "Active" },
  { id: "R-002", name: "Aishath Mohamed", relation: "Guardian ad litem",
    represents: "Minor — Y.A. (HC/2024/003)", basis: "Court appointment 2024-03-20",
    email: "a.mohamed@email.mv", phone: "+960 776 2020", status: "Active" },
  { id: "R-003", name: "Yoosuf Ali", relation: "Corporate Officer",
    represents: "Reef Shipping Co.", basis: "Board resolution 2023-10-14",
    email: "y.ali@reefshipping.mv", phone: "+960 776 3030", status: "Active" },
  { id: "R-004", name: "Mariyam Saudha", relation: "Director",
    represents: "Maldives Ports Ltd.", basis: "Letter of authority 2024-02-11",
    email: "m.saudha@mpl.com.mv", phone: "+960 776 4040", status: "Active" },
  { id: "R-005", name: "Ahmed Nashid", relation: "Government Agent",
    represents: "Attorney General's Office", basis: "Standing instruction",
    email: "a.nashid@ago.gov.mv", phone: "+960 776 5050", status: "Active" },
];
const COURTS = ["Courtroom 1", "Courtroom 2", "Courtroom 3"];
const TIME_SLOTS = [
  "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30",
];
const WEEK_DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const today = new Date();
const fmt = (d) => d.toISOString().split("T")[0];
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const timeToMins = (t) => { const [h,m] = t.split(":").map(Number); return h*60+m; };
const minsToTime = (m) => `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`;
const timesOverlap = (s1,e1,s2,e2) =>
  timeToMins(s1) < timeToMins(e2) && timeToMins(e1) > timeToMins(s2);

const initCases = [
  {
    id: "HC/2024/001",
    title: "State v. Abdullah Rasheed",
    type: "Criminal",
    status: "Active",
    filed: "2024-01-10",
    presiding: JUDGES[0],
    judges: [JUDGES[0], JUDGES[1], JUDGES[2]],
    petitioner: { name: "State of Maldives", lawyers: ["Ali Hassan"] },
    respondent: { name: "Abdullah Rasheed", lawyers: ["Sara Moosa"] },
    summary: "Appeal from Criminal Court conviction. Charges of aggravated breach of trust under Section 18 of Penal Code. Hearings continue on questions of admissibility.",
    hearings: [
      { date: "2024-02-12", court: "Courtroom 1", outcome: "Adjourned", notes: "Defence requested additional preparation time." },
      { date: "2024-03-04", court: "Courtroom 1", outcome: "Completed", notes: "Witness testimony heard. Reserved." },
    ],
    tasks: [
      { id: 1, text: "File initial submission", done: true, assignee: "Ali Hassan", due: "2024-02-01", priority: "High" },
      { id: 2, text: "Schedule next hearing", done: false, assignee: "Clerk A", due: "2024-05-01", priority: "Medium" },
      { id: 3, text: "Prepare bench memo on admissibility", done: false, assignee: JUDGES[0], due: "2024-05-08", priority: "High" },
    ],
    requests: [
      { id: 1, type: "Expedite", reason: "Witness travelling overseas. Counsel requests early date.", filedBy: "Sara Moosa", submittedAt: "2024-04-12", status: "Pending" },
    ],
  },
  {
    id: "HC/2024/002",
    title: "Fathimath v. Bank of Maldives",
    type: "Civil",
    status: "Active",
    filed: "2024-02-20",
    presiding: JUDGES[1],
    judges: [JUDGES[1], JUDGES[2], JUDGES[3]],
    petitioner: { name: "Fathimath Ali", lawyers: ["Ismail Niyaz"] },
    respondent: { name: "Bank of Maldives", lawyers: ["Mariyam Afza"] },
    summary: "Civil claim regarding wrongful debit and account freeze. Damages sought under contract and consumer protection law.",
    hearings: [
      { date: "2024-03-18", court: "Courtroom 2", outcome: "Completed", notes: "Preliminary submissions filed." },
    ],
    tasks: [
      { id: 1, text: "Review filed documents", done: false, assignee: JUDGES[1], due: "2024-05-10", priority: "High" },
      { id: 2, text: "Issue directions on discovery", done: false, assignee: JUDGES[1], due: "2024-05-22", priority: "Medium" },
    ],
    requests: [
      { id: 1, type: "Adjourn", reason: "Counsel for respondent has scheduling conflict.", filedBy: "Mariyam Afza", submittedAt: "2024-04-20", status: "Pending" },
    ],
  },
  {
    id: "HC/2024/003",
    title: "In re: Estate of Hassan Ibrahim",
    type: "Probate",
    status: "Pending",
    filed: "2024-03-05",
    presiding: JUDGES[3],
    judges: [JUDGES[3], JUDGES[4], JUDGES[0]],
    petitioner: { name: "Hassan Ibrahim Estate", lawyers: ["Aishath Laila"] },
    respondent: null,
    summary: "Probate of will dated 2019. Two contested assets pending valuation.",
    hearings: [],
    tasks: [
      { id: 1, text: "Receive valuation report", done: false, assignee: "Aishath Laila", due: "2024-05-15", priority: "Medium" },
    ],
    requests: [],
  },
  {
    id: "HC/2024/004",
    title: "Maldives Ports v. Reef Shipping",
    type: "Commercial",
    status: "Active",
    filed: "2023-11-01",
    presiding: JUDGES[2],
    judges: [JUDGES[2], JUDGES[4], JUDGES[1]],
    petitioner: { name: "Maldives Ports Ltd.", lawyers: ["Hussain Riza"] },
    respondent: { name: "Reef Shipping Co.", lawyers: ["Ali Hassan", "Sara Moosa"] },
    summary: "Commercial dispute over berth allocation and demurrage charges. Quantum exceeds MVR 4M.",
    hearings: [
      { date: "2024-01-22", court: "Courtroom 1", outcome: "Adjourned", notes: "Settlement discussions encouraged." },
      { date: "2024-02-19", court: "Courtroom 1", outcome: "Completed", notes: "" },
    ],
    tasks: [
      { id: 1, text: "Settlement conference", done: true, assignee: "Hussain Riza", due: "2024-02-15", priority: "High" },
      { id: 2, text: "File expert evidence", done: false, assignee: "Ali Hassan", due: "2024-05-12", priority: "High" },
    ],
    requests: [],
  },
  {
    id: "HC/2024/005",
    title: "State v. Naseem (constitutional ref.)",
    type: "Constitutional",
    status: "Active",
    filed: "2024-01-28",
    presiding: JUDGES[4],
    judges: [JUDGES[4], JUDGES[0], JUDGES[2], JUDGES[1], JUDGES[3]],
    petitioner: { name: "Attorney General's Office", lawyers: ["Ali Hassan"] },
    respondent: { name: "Naseem Mohamed", lawyers: ["Aishath Laila"] },
    summary: "Reference under Article 95 of the Constitution. Full bench convened.",
    hearings: [],
    tasks: [],
    requests: [],
  },
  {
    id: "HC/2023/142",
    title: "Riyaz v. Civil Service Comm.",
    type: "Administrative",
    status: "Closed",
    filed: "2023-06-14",
    presiding: JUDGES[1],
    judges: [JUDGES[1], JUDGES[3], JUDGES[4]],
    petitioner: { name: "Mohamed Riyaz", lawyers: ["Ismail Niyaz"] },
    respondent: { name: "Civil Service Commission", lawyers: ["Mariyam Afza"] },
    summary: "Judicial review of dismissal. Disposed.",
    hearings: [
      { date: "2023-09-10", court: "Courtroom 3", outcome: "Completed", notes: "Judgment delivered." },
    ],
    tasks: [],
    requests: [],
  },
];

const initTargets = [
  { id: 1, type: "Case Resolution", description: "Close 20 criminal cases by Q2", metric: 20, current: 14, deadline: "2024-06-30", assignee: "All Judges" },
  { id: 2, type: "Hearing Completion", description: "Complete 50 hearings this month", metric: 50, current: 38, deadline: "2024-04-30", assignee: "Court Admin" },
  { id: 3, type: "Performance", description: "Hon. Ibrahim Rasheed: resolve 5 cases", metric: 5, current: 3, deadline: "2024-05-31", assignee: JUDGES[0] },
  { id: 4, type: "Backlog", description: "Reduce pre-2023 backlog under 12", metric: 12, current: 7, deadline: "2024-12-31", assignee: "Registry" },
];

const initBookings = [
  { id: 1, caseId: "HC/2024/001", caseTitle: "State v. Abdullah Rasheed", courtroom: "Courtroom 1", date: fmt(addDays(today, 0)), timeStart: "09:00", timeEnd: "10:30", judges: [JUDGES[0], JUDGES[1], JUDGES[2]], parties: ["State of Maldives", "Abdullah Rasheed"], lawyers: ["Ali Hassan", "Sara Moosa"], notes: "Continued from 04 Mar. Witness B to testify.", status: "Confirmed" },
  { id: 2, caseId: "HC/2024/002", caseTitle: "Fathimath v. Bank of Maldives", courtroom: "Courtroom 2", date: fmt(addDays(today, 0)), timeStart: "11:00", timeEnd: "12:00", judges: [JUDGES[1], JUDGES[2], JUDGES[3]], parties: ["Fathimath Ali", "Bank of Maldives"], lawyers: ["Ismail Niyaz", "Mariyam Afza"], notes: "", status: "Confirmed" },
  { id: 3, caseId: "HC/2024/004", caseTitle: "Maldives Ports v. Reef Shipping", courtroom: "Courtroom 1", date: fmt(addDays(today, 1)), timeStart: "09:30", timeEnd: "11:30", judges: [JUDGES[2], JUDGES[4], JUDGES[1]], parties: ["Maldives Ports Ltd.", "Reef Shipping Co."], lawyers: ["Hussain Riza", "Ali Hassan", "Sara Moosa"], notes: "", status: "Confirmed" },
  { id: 4, caseId: "HC/2024/003", caseTitle: "In re: Estate of Hassan Ibrahim", courtroom: "Courtroom 3", date: fmt(addDays(today, 2)), timeStart: "14:00", timeEnd: "15:00", judges: [JUDGES[3], JUDGES[4], JUDGES[0]], parties: ["Hassan Ibrahim Estate"], lawyers: ["Aishath Laila"], notes: "", status: "Confirmed" },
  { id: 5, caseId: "HC/2024/005", caseTitle: "State v. Naseem (constitutional ref.)", courtroom: "Courtroom 1", date: fmt(addDays(today, 3)), timeStart: "10:00", timeEnd: "13:00", judges: [JUDGES[4], JUDGES[0], JUDGES[2], JUDGES[1], JUDGES[3]], parties: ["AG's Office", "Naseem Mohamed"], lawyers: ["Ali Hassan", "Aishath Laila"], notes: "Full bench. Press allowed.", status: "Confirmed" },
  { id: 6, caseId: "HC/2024/002", caseTitle: "Fathimath v. Bank of Maldives", courtroom: "Courtroom 2", date: fmt(addDays(today, 4)), timeStart: "10:30", timeEnd: "12:00", judges: [JUDGES[1], JUDGES[2], JUDGES[3]], parties: ["Fathimath Ali", "Bank of Maldives"], lawyers: ["Ismail Niyaz", "Mariyam Afza"], notes: "", status: "Confirmed" },
];

function detectClashes(bookings, newB, excludeId = null) {
  const clashes = [];
  const others = bookings.filter(
    (b) => b.id !== excludeId && b.date === newB.date && b.status !== "Cancelled"
  );
  for (const b of others) {
    if (!timesOverlap(newB.timeStart, newB.timeEnd, b.timeStart, b.timeEnd)) continue;
    if (b.courtroom === newB.courtroom)
      clashes.push({ type: "courtroom", msg: `${b.courtroom} occupied by ${b.caseTitle} (${b.timeStart}–${b.timeEnd})` });
    const jC = newB.judges.filter((j) => b.judges.includes(j));
    if (jC.length)
      clashes.push({ type: "judge", msg: `${jC.map((j)=>j.replace("Hon. ", "")).join(", ")} sitting on ${b.caseTitle}` });
    const lC = newB.lawyers.filter((l) => b.lawyers.includes(l));
    if (lC.length)
      clashes.push({ type: "lawyer", msg: `${lC.join(", ")} appearing in ${b.caseTitle}` });
    const pC = newB.parties.filter((p) => b.parties.includes(p));
    if (pC.length)
      clashes.push({ type: "party", msg: `${pC.join(", ")} party in ${b.caseTitle}` });
  }
  return clashes;
}

Object.assign(window, {
  JUDGES, LAWYERS, COURTS, TIME_SLOTS, WEEK_DAYS, MONTH_NAMES,
  today, fmt, addDays, timeToMins, minsToTime, timesOverlap,
  initCases, initTargets, initBookings, detectClashes,
  initJudges, initLawyers, initStaff, initParties, initRepresentatives,
  initSections,
});
