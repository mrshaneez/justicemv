// ─── Static seed data + helpers ──────────────────────────────────────────────

// ── Dhivehi (Thaana) UI strings — keyed for translation lookup ─────────────
// Wrap any rendered Dhivehi text in <span lang="dv"> so the Faruma
// @font-face / RTL block kicks in. Use `t(key, lang)` to fetch.
const DV_STRINGS = {
  appName:        { en: "JUSTICEDESK", dv: "ޖަސްޓިސްޑެސްކް" },
  highCourt:      { en: "High Court", dv: "ހައިކޯޓު" },
  cases:          { en: "Cases", dv: "މައްސަލަތައް" },
  appellant:      { en: "Appellant", dv: "ޝަކުވާކުރާ" },
  appellants:     { en: "Appellants", dv: "ޝަކުވާކުރާ ފަރާތްތައް" },
  respondent:     { en: "Respondent", dv: "ޖަވާބުދާރީ" },
  respondents:    { en: "Respondents", dv: "ޖަވާބުދާރީ ފަރާތްތައް" },
  lawyer:         { en: "Lawyer", dv: "ވަކީލު" },
  lawyers:        { en: "Lawyers", dv: "ވަކީލުން" },
  representative: { en: "Representative", dv: "ވަކާލާތު ކުރާ" },
  judge:          { en: "Judge", dv: "ފަނޑިޔާރު" },
  hearing:        { en: "Hearing", dv: "ޝަރީއަތް" },
  filed:          { en: "Filed", dv: "ހުށަހެޅި" },
  status:         { en: "Status", dv: "ހާލަތު" },
};
const t = (key, lang = "en") => (DV_STRINGS[key]?.[lang] ?? DV_STRINGS[key]?.en ?? key);

const JUDGES = [
  "Hon. Ibrahim Rasheed",
  "Hon. Aminath Didi",
  "Hon. Mohamed Waheed",
  "Hon. Fathimath Nisreen",
  "Hon. Ahmed Shiyam",
  "Hon. Hussain Faiz",
  "Hon. Mariyam Zahira",
  "Hon. Abdullah Naseer",
  "Hon. Aishath Mizna",
  "Hon. Yoosuf Latheef",
  "Hon. Khadeeja Saeed",
  "Hon. Ismail Habeeb",
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
  { id: "J-006", name: "Hon. Hussain Faiz", role: "Justice",
    appointed: "2017-11-04", chamber: "Chamber F", email: "h.faiz@highcourt.gov.mv",
    phone: "+960 332 1106", specialisations: ["Criminal", "Civil"],
    bio: "Senior trial bench. Veteran of homicide and serious crime appeals.",
    status: "Sitting" },
  { id: "J-007", name: "Hon. Mariyam Zahira", role: "Justice",
    appointed: "2018-08-22", chamber: "Chamber G", email: "m.zahira@highcourt.gov.mv",
    phone: "+960 332 1107", specialisations: ["Family", "Civil"],
    bio: "Children and family matters. Mediation accreditation.",
    status: "Sitting" },
  { id: "J-008", name: "Hon. Abdullah Naseer", role: "Justice",
    appointed: "2019-02-18", chamber: "Chamber H", email: "a.naseer@highcourt.gov.mv",
    phone: "+960 332 1108", specialisations: ["Commercial", "Constitutional"],
    bio: "Banking and finance. Former Reserve Bank legal advisor.",
    status: "Sitting" },
  { id: "J-009", name: "Hon. Aishath Mizna", role: "Justice",
    appointed: "2020-06-30", chamber: "Chamber I", email: "a.mizna@highcourt.gov.mv",
    phone: "+960 332 1109", specialisations: ["Administrative", "Constitutional"],
    bio: "Public law specialist. Former Solicitor-General.",
    status: "Sitting" },
  { id: "J-010", name: "Hon. Yoosuf Latheef", role: "Justice",
    appointed: "2021-03-11", chamber: "Chamber J", email: "y.latheef@highcourt.gov.mv",
    phone: "+960 332 1110", specialisations: ["Criminal", "Probate"],
    bio: "Came up through the Magistrate Court of Addu Atoll.",
    status: "Sitting" },
  { id: "J-011", name: "Hon. Khadeeja Saeed", role: "Justice",
    appointed: "2022-09-05", chamber: "Chamber K", email: "k.saeed@highcourt.gov.mv",
    phone: "+960 332 1111", specialisations: ["Civil", "Family"],
    bio: "Tort and personal injury bench. LLM Auckland.",
    status: "Sitting" },
  { id: "J-012", name: "Hon. Ismail Habeeb", role: "Justice",
    appointed: "2023-01-20", chamber: "Chamber L", email: "i.habeeb@highcourt.gov.mv",
    phone: "+960 332 1112", specialisations: ["Commercial", "Administrative"],
    bio: "Most recent appointment. Tax and revenue specialist.",
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
// Each section is owned by exactly ONE judge. The judges array carries that
// single name for back-compat with code that reads `section.judges`.
const initSections = [
  { id: "SEC-A", name: "Hon. Ibrahim Rasheed's Section", code: "A",
    head: "Hon. Ibrahim Rasheed", judges: ["Hon. Ibrahim Rasheed"],
    staff: ["S-001", "S-002", "S-003"],
    description: "Criminal appeals, penal matters, prosecutorial review.",
    caseTypes: ["Criminal", "Constitutional"] },
  { id: "SEC-B", name: "Hon. Aminath Didi's Section", code: "B",
    head: "Hon. Aminath Didi", judges: ["Hon. Aminath Didi"],
    staff: ["S-004", "S-005", "S-006"],
    description: "Civil disputes, commercial litigation, contract.",
    caseTypes: ["Civil", "Commercial"] },
  { id: "SEC-C", name: "Hon. Mohamed Waheed's Section", code: "C",
    head: "Hon. Mohamed Waheed", judges: ["Hon. Mohamed Waheed"],
    staff: ["S-007", "S-008", "S-009"],
    description: "Banking, finance and corporate disputes.",
    caseTypes: ["Commercial", "Civil"] },
  { id: "SEC-D", name: "Hon. Fathimath Nisreen's Section", code: "D",
    head: "Hon. Fathimath Nisreen", judges: ["Hon. Fathimath Nisreen"],
    staff: ["S-010", "S-011", "S-012"],
    description: "Probate, inheritance, family law matters.",
    caseTypes: ["Probate", "Family"] },
  { id: "SEC-E", name: "Hon. Ahmed Shiyam's Section", code: "E",
    head: "Hon. Ahmed Shiyam", judges: ["Hon. Ahmed Shiyam"],
    staff: ["S-013", "S-014", "S-015"],
    description: "Judicial review, administrative appeals.",
    caseTypes: ["Administrative", "Constitutional"] },
  { id: "SEC-F", name: "Hon. Hussain Faiz's Section", code: "F",
    head: "Hon. Hussain Faiz", judges: ["Hon. Hussain Faiz"],
    staff: ["S-016", "S-017", "S-018"],
    description: "Serious crime appeals — homicide, narcotics, terrorism.",
    caseTypes: ["Criminal"] },
  { id: "SEC-G", name: "Hon. Mariyam Zahira's Section", code: "G",
    head: "Hon. Mariyam Zahira", judges: ["Hon. Mariyam Zahira"],
    staff: ["S-019", "S-020", "S-021"],
    description: "Family, child welfare and domestic relations.",
    caseTypes: ["Family", "Civil"] },
  { id: "SEC-H", name: "Hon. Abdullah Naseer's Section", code: "H",
    head: "Hon. Abdullah Naseer", judges: ["Hon. Abdullah Naseer"],
    staff: ["S-022", "S-023", "S-024"],
    description: "Banking, securities and constitutional finance matters.",
    caseTypes: ["Commercial", "Constitutional"] },
  { id: "SEC-I", name: "Hon. Aishath Mizna's Section", code: "I",
    head: "Hon. Aishath Mizna", judges: ["Hon. Aishath Mizna"],
    staff: ["S-025", "S-026", "S-027"],
    description: "Public law, judicial review, electoral disputes.",
    caseTypes: ["Administrative", "Constitutional"] },
  { id: "SEC-J", name: "Hon. Yoosuf Latheef's Section", code: "J",
    head: "Hon. Yoosuf Latheef", judges: ["Hon. Yoosuf Latheef"],
    staff: ["S-028", "S-029", "S-030"],
    description: "Criminal trials and probate referrals.",
    caseTypes: ["Criminal", "Probate"] },
  { id: "SEC-K", name: "Hon. Khadeeja Saeed's Section", code: "K",
    head: "Hon. Khadeeja Saeed", judges: ["Hon. Khadeeja Saeed"],
    staff: ["S-031", "S-032", "S-033"],
    description: "Tort, personal injury, family civil claims.",
    caseTypes: ["Civil", "Family"] },
  { id: "SEC-L", name: "Hon. Ismail Habeeb's Section", code: "L",
    head: "Hon. Ismail Habeeb", judges: ["Hon. Ismail Habeeb"],
    staff: ["S-034", "S-035", "S-036"],
    description: "Tax, revenue and administrative commercial appeals.",
    caseTypes: ["Commercial", "Administrative"] },
];

// ─── Directory records — court staff ─────────────────────────────────────────
const initStaff = [
  { id: "S-001", name: "Fathimath Shifa", role: "Registrar", department: "Registry",
    email: "fathimath.shifa@highcourt.gov.mv", phone: "+960 332 1201",
    joined: "2016-02-02", status: "Active" },
  { id: "S-002", name: "Ali Niyaz", role: "Deputy Registrar", department: "Registry",
    email: "ali.niyaz@highcourt.gov.mv", phone: "+960 332 1202",
    joined: "2017-03-03", status: "Active" },
  { id: "S-003", name: "Khadeeja Manik", role: "Senior Clerk", department: "Registry",
    email: "khadeeja.manik@highcourt.gov.mv", phone: "+960 332 1203",
    joined: "2018-04-04", status: "Active" },
  { id: "S-004", name: "Hussain Zahira", role: "Court Clerk", department: "Courtroom 1",
    email: "hussain.zahira@highcourt.gov.mv", phone: "+960 332 1204",
    joined: "2019-05-05", status: "Active" },
  { id: "S-005", name: "Naseema Suha", role: "Court Clerk", department: "Courtroom 2",
    email: "naseema.suha@highcourt.gov.mv", phone: "+960 332 1205",
    joined: "2020-06-06", status: "Active" },
  { id: "S-006", name: "Naseer Shareef", role: "Court Clerk", department: "Courtroom 3",
    email: "naseer.shareef@highcourt.gov.mv", phone: "+960 332 1206",
    joined: "2021-07-07", status: "Active" },
  { id: "S-007", name: "Riza Hassan", role: "IT Officer", department: "Technology",
    email: "riza.hassan@highcourt.gov.mv", phone: "+960 332 1207",
    joined: "2022-08-08", status: "Active" },
  { id: "S-008", name: "Faiz Naseer", role: "Bailiff", department: "Security",
    email: "faiz.naseer@highcourt.gov.mv", phone: "+960 332 1208",
    joined: "2023-09-09", status: "Active" },
  { id: "S-009", name: "Saudha Moosa", role: "Translator", department: "Registry",
    email: "saudha.moosa@highcourt.gov.mv", phone: "+960 332 1209",
    joined: "2015-10-10", status: "Active" },
  { id: "S-010", name: "Reesha Didi", role: "Records Officer", department: "Archives",
    email: "reesha.didi@highcourt.gov.mv", phone: "+960 332 1210",
    joined: "2016-11-11", status: "Active" },
  { id: "S-011", name: "Suha Faiz", role: "Court Reporter", department: "Reporting",
    email: "suha.faiz@highcourt.gov.mv", phone: "+960 332 1211",
    joined: "2017-12-12", status: "Active" },
  { id: "S-012", name: "Ahmed Imran", role: "Legal Assistant", department: "Registry",
    email: "ahmed.imran@highcourt.gov.mv", phone: "+960 332 1212",
    joined: "2018-01-13", status: "On leave" },
  { id: "S-013", name: "Fathimath Naseer", role: "Registrar", department: "Registry",
    email: "fathimath.naseer@highcourt.gov.mv", phone: "+960 332 1213",
    joined: "2019-02-14", status: "Active" },
  { id: "S-014", name: "Ali Ali", role: "Deputy Registrar", department: "Registry",
    email: "ali.ali@highcourt.gov.mv", phone: "+960 332 1214",
    joined: "2020-03-15", status: "Active" },
  { id: "S-015", name: "Khadeeja Reesha", role: "Senior Clerk", department: "Registry",
    email: "khadeeja.reesha@highcourt.gov.mv", phone: "+960 332 1215",
    joined: "2021-04-16", status: "Active" },
  { id: "S-016", name: "Hussain Hassan", role: "Court Clerk", department: "Courtroom 1",
    email: "hussain.hassan@highcourt.gov.mv", phone: "+960 332 1216",
    joined: "2022-05-17", status: "Active" },
  { id: "S-017", name: "Naseema Laila", role: "Court Clerk", department: "Courtroom 2",
    email: "naseema.laila@highcourt.gov.mv", phone: "+960 332 1217",
    joined: "2023-06-18", status: "Active" },
  { id: "S-018", name: "Naseer Habeeb", role: "Court Clerk", department: "Courtroom 3",
    email: "naseer.habeeb@highcourt.gov.mv", phone: "+960 332 1218",
    joined: "2015-07-19", status: "Active" },
  { id: "S-019", name: "Riza Naseema", role: "IT Officer", department: "Technology",
    email: "riza.naseema@highcourt.gov.mv", phone: "+960 332 1219",
    joined: "2016-08-20", status: "Active" },
  { id: "S-020", name: "Faiz Reesha", role: "Bailiff", department: "Security",
    email: "faiz.reesha@highcourt.gov.mv", phone: "+960 332 1220",
    joined: "2017-09-21", status: "Active" },
  { id: "S-021", name: "Saudha Mohamed", role: "Translator", department: "Registry",
    email: "saudha.mohamed@highcourt.gov.mv", phone: "+960 332 1221",
    joined: "2018-10-22", status: "Active" },
  { id: "S-022", name: "Reesha Faisal", role: "Records Officer", department: "Archives",
    email: "reesha.faisal@highcourt.gov.mv", phone: "+960 332 1222",
    joined: "2019-11-23", status: "Active" },
  { id: "S-023", name: "Suha Reema", role: "Court Reporter", department: "Reporting",
    email: "suha.reema@highcourt.gov.mv", phone: "+960 332 1223",
    joined: "2020-12-24", status: "Active" },
  { id: "S-024", name: "Ahmed Riza", role: "Legal Assistant", department: "Registry",
    email: "ahmed.riza@highcourt.gov.mv", phone: "+960 332 1224",
    joined: "2021-01-25", status: "Active" },
  { id: "S-025", name: "Fathimath Latheef", role: "Registrar", department: "Registry",
    email: "fathimath.latheef@highcourt.gov.mv", phone: "+960 332 1225",
    joined: "2022-02-26", status: "On leave" },
  { id: "S-026", name: "Ali Saudha", role: "Deputy Registrar", department: "Registry",
    email: "ali.saudha@highcourt.gov.mv", phone: "+960 332 1226",
    joined: "2023-03-27", status: "Active" },
  { id: "S-027", name: "Khadeeja Riyaz", role: "Senior Clerk", department: "Registry",
    email: "khadeeja.riyaz@highcourt.gov.mv", phone: "+960 332 1227",
    joined: "2015-04-01", status: "Active" },
  { id: "S-028", name: "Hussain Habeeb", role: "Court Clerk", department: "Courtroom 1",
    email: "hussain.habeeb@highcourt.gov.mv", phone: "+960 332 1228",
    joined: "2016-05-02", status: "Active" },
  { id: "S-029", name: "Naseema Shiuna", role: "Court Clerk", department: "Courtroom 2",
    email: "naseema.shiuna@highcourt.gov.mv", phone: "+960 332 1229",
    joined: "2017-06-03", status: "Active" },
  { id: "S-030", name: "Naseer Waheed", role: "Court Clerk", department: "Courtroom 3",
    email: "naseer.waheed@highcourt.gov.mv", phone: "+960 332 1230",
    joined: "2018-07-04", status: "Active" },
  { id: "S-031", name: "Riza Afza", role: "IT Officer", department: "Technology",
    email: "riza.afza@highcourt.gov.mv", phone: "+960 332 1231",
    joined: "2019-08-05", status: "Active" },
  { id: "S-032", name: "Faiz Rasheed", role: "Bailiff", department: "Security",
    email: "faiz.rasheed@highcourt.gov.mv", phone: "+960 332 1232",
    joined: "2020-09-06", status: "Active" },
  { id: "S-033", name: "Saudha Mizna", role: "Translator", department: "Registry",
    email: "saudha.mizna@highcourt.gov.mv", phone: "+960 332 1233",
    joined: "2021-10-07", status: "Active" },
  { id: "S-034", name: "Reesha Sajidha", role: "Records Officer", department: "Archives",
    email: "reesha.sajidha@highcourt.gov.mv", phone: "+960 332 1234",
    joined: "2022-11-08", status: "Active" },
  { id: "S-035", name: "Suha Latheef", role: "Court Reporter", department: "Reporting",
    email: "suha.latheef@highcourt.gov.mv", phone: "+960 332 1235",
    joined: "2023-12-09", status: "Active" },
  { id: "S-036", name: "Ahmed Saeed", role: "Legal Assistant", department: "Registry",
    email: "ahmed.saeed@highcourt.gov.mv", phone: "+960 332 1236",
    joined: "2015-01-10", status: "Active" },
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

// ─── Case party shape ────────────────────────────────────────────────────────
// A case has any number of appellants and respondents. Each carries its own
// lawyer list and representative (PoA / guardian / corporate officer) list.
//
//   case.appellants  = [{ name, lawyers: ["Ali Hassan", …], reps: ["Hawwa Ibrahim", …] }, …]
//   case.respondents = [{ name, lawyers, reps }, …]
//
// Back-compat helpers expose `petitioner` / `respondent` as the FIRST entry
// of each list so older code keeps reading the right values.
function casePetitioner(c) { return c.appellants?.[0] || c.petitioner || null; }
function caseRespondent(c) { return c.respondents?.[0] || c.respondent || null; }
function caseAllLawyers(c) {
  const a = (c.appellants || []).flatMap((p) => p.lawyers || []);
  const r = (c.respondents || []).flatMap((p) => p.lawyers || []);
  return Array.from(new Set([...a, ...r]));
}
function caseAllParties(c) {
  return [...(c.appellants || []), ...(c.respondents || [])].map((p) => p.name);
}
function caseAllReps(c) {
  return [...(c.appellants || []), ...(c.respondents || [])].flatMap((p) => p.reps || []);
}

const initCases = [
  {
    id: "HC/2024/001",
    title: "State v. Abdullah Rasheed",
    type: "Criminal",
    status: "Active",
    filed: "2024-01-10",
    presiding: JUDGES[0],
    judges: [JUDGES[0], JUDGES[1], JUDGES[2]],
    appellants: [
      { name: "State of Maldives", lawyers: ["Ali Hassan"], reps: ["Ahmed Nashid"] },
    ],
    respondents: [
      { name: "Abdullah Rasheed", lawyers: ["Sara Moosa"], reps: [] },
    ],
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
    appellants: [
      { name: "Fathimath Ali", lawyers: ["Ismail Niyaz"], reps: [] },
    ],
    respondents: [
      { name: "Bank of Maldives", lawyers: ["Mariyam Afza", "Hussain Riza"], reps: ["Mariyam Saudha"] },
    ],
    petitioner: { name: "Fathimath Ali", lawyers: ["Ismail Niyaz"] },
    respondent: { name: "Bank of Maldives", lawyers: ["Mariyam Afza", "Hussain Riza"] },
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
    appellants: [
      { name: "Hassan Ibrahim Estate", lawyers: ["Aishath Laila"], reps: ["Hawwa Ibrahim"] },
    ],
    respondents: [],
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
    appellants: [
      { name: "Maldives Ports Ltd.", lawyers: ["Hussain Riza"], reps: ["Mariyam Saudha"] },
    ],
    respondents: [
      { name: "Reef Shipping Co.", lawyers: ["Ali Hassan", "Sara Moosa"], reps: ["Yoosuf Ali"] },
    ],
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
    appellants: [
      { name: "Attorney General's Office", lawyers: ["Ali Hassan"], reps: ["Ahmed Nashid"] },
      { name: "State of Maldives", lawyers: ["Ali Hassan"], reps: [] },
    ],
    respondents: [
      { name: "Naseem Mohamed", lawyers: ["Aishath Laila"], reps: [] },
    ],
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
    appellants: [
      { name: "Mohamed Riyaz", lawyers: ["Ismail Niyaz"], reps: [] },
    ],
    respondents: [
      { name: "Civil Service Commission", lawyers: ["Mariyam Afza"], reps: [] },
    ],
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

// ─── Document templates ──────────────────────────────────────────────────────
// Each template defines a body of text with {{placeholders}} that the
// document generator fills from a case record. Placeholders supported:
//   {{caseId}} {{caseTitle}} {{caseType}} {{filed}} {{today}}
//   {{appellants}}  {{respondents}}  {{appellantList}}  {{respondentList}}
//   {{appellantLawyers}} {{respondentLawyers}}
//   {{appellantReps}} {{respondentReps}}
//   {{presiding}} {{bench}} {{summary}}
//   {{nextHearing}}
const initTemplates = [
  {
    id: "TPL-001", name: "Notice of Hearing", category: "Notice", lang: "en",
    description: "Standard hearing notice issued to all counsel of record.",
    body:
`HIGH COURT OF THE MALDIVES
Registry — Notice of Hearing

Case No.:    {{caseId}}
Matter:      {{caseTitle}}
Filed on:    {{filed}}

TAKE NOTICE that the above matter is set down for hearing on {{nextHearing}}.

Appellant(s): {{appellantList}}
Counsel for Appellant(s): {{appellantLawyers}}

Respondent(s): {{respondentList}}
Counsel for Respondent(s): {{respondentLawyers}}

Presiding: {{presiding}}
Bench: {{bench}}

All counsel are required to attend.

Issued at the High Court of the Maldives this day {{today}}.

_____________________________
Registrar`,
  },
  {
    id: "TPL-002", name: "Cause List Entry", category: "Cause list", lang: "en",
    description: "Single-line cause list entry suitable for daily roll publication.",
    body:
`{{caseId}} — {{caseTitle}}
  Type:       {{caseType}}
  Filed:      {{filed}}
  Bench:      {{bench}}
  Appellant:  {{appellantList}} (per {{appellantLawyers}})
  Respondent: {{respondentList}} (per {{respondentLawyers}})
  Summary:    {{summary}}`,
  },
  {
    id: "TPL-003", name: "Order — Adjournment", category: "Order", lang: "en",
    description: "Routine adjournment order on the application of counsel.",
    body:
`IN THE HIGH COURT OF THE MALDIVES

Case No.: {{caseId}}

BETWEEN:
  {{appellantList}}                                Appellant(s)
        and
  {{respondentList}}                               Respondent(s)

_____________________________________________________________
ORDER
_____________________________________________________________

UPON HEARING counsel for the parties — {{appellantLawyers}} appearing
for the Appellant(s) and {{respondentLawyers}} appearing for the
Respondent(s) — and on the application of counsel,

IT IS ORDERED that the matter be ADJOURNED to a date to be fixed by the
Registry.

Dated this day {{today}}.

_____________________________
{{presiding}}
Presiding`,
  },
  {
    id: "TPL-004", name: "Authority Letter (Representative)", category: "Letter", lang: "en",
    description: "Letter authorising a representative to act on a party's behalf.",
    body:
`Date: {{today}}
To: The Registrar, High Court of the Maldives

Re: {{caseId}} — {{caseTitle}}

I / We hereby authorise the persons named below to appear and act on
behalf of the named party in the above matter, including filing of
documents, attendance at hearings, and receipt of correspondence:

  Party:           {{appellantList}}
  Authorised:      {{appellantReps}}
  Counsel:         {{appellantLawyers}}

This authority remains in force until withdrawn in writing.

Yours faithfully,

_____________________________`,
  },
  {
    id: "TPL-006", name: "Stay Order (Suspension of Execution)", category: "Order", lang: "en",
    description: "Stay-of-execution order pending an appeal — based on the High Court Stay Order format.",
    body:
`IN THE HIGH COURT OF THE MALDIVES
Malé, Republic of Maldives

ORDER FOR STAY OF EXECUTION OF JUDGMENT

Case No.:        {{caseId}}
Order No.:       {{caseId}}-SO
Applicant:       {{appellantList}}
Respondent:      Civil Court / All concerned parties
Filing party:    {{appellantList}}
Opposing party:  {{respondentList}}
Date:            {{today}}

UPON the application by {{appellantList}} to appeal Civil Court Case
No. {{caseId}} and to stay execution of the said judgment pending
appeal, AND upon the grounds set out in the application,

PURSUANT to Article 281 of Law No. 32/2021 (Civil Procedure Code),
Article 49 of the High Court Rules of Civil Procedure, and Article 68
of the High Court Rules,

UNTIL judgment is delivered in this Court's Case No. {{caseId}}, or
until otherwise ordered by this Court,

IT IS HEREBY ORDERED that execution of the judgment in the said Civil
Court case BE STAYED.

This order is made by:

    Hon. {{presiding}}    (Presiding)
    {{bench}}`,
  },
  {
    id: "TPL-007", name: "ޙުކުމް ތަންފީޒުކުރުން ފަސްކުރުމުގެ އަމުރު (Stay Order)", category: "Order", lang: "dv",
    description: "Stay-of-execution order in Dhivehi — matches the High Court Stay Order template.",
    body:
`ދިވެހިރާއްޖޭގެ ހައިކޯޓު
މާލެ، ދިވެހިރާއްޖެ

ޙުކުމް ތަންފީޒުކުރުން ފަސްކުރުމުގެ އަމުރު

ޤަޟިއްޔާ ނަންބަރު:  {{caseId}}
އަމުރު ނަންބަރު:     {{caseId}}-SO
އަމުރަށް އެދުނު ފަރާތް: {{appellantList}}
އަމުރު ރައްދުވާ ފަރާތް: ސިވިލް ކޯޓު / ކަމާބެހޭ އެންމެހާ ފަރާތްތައް
މައްސަލަ ހުށަހެޅި ފަރާތް: {{appellantList}}
މައްސަލަ ރައްދުވާ ފަރާތް: {{respondentList}}
ތާރީޚް:               {{today}}

ސިވިލް ކޯޓުގެ ނަންބަރު {{caseId}} ޤަޟިއްޔާ އިސްތިއުނާފުކުރުމަށް ހުށަހަޅައި،
އަދި އެ ޙުކުމް ތަންފީޒުކުރުން ފަސްކުރުމުގެ އަމުރަކަށް އެދި
{{appellantList}}ގެ ފަރާތުން އެދިފައިވާ ސަބަބުތަކުގެ މައްޗަށާއި،

ޤާނޫނު ނަންބަރު 2021/32 (މަދަނީ އިޖުރާއަތުގެ ގާނޫނު)ގެ 281 ވަނަ
މާއްދާއާއި، ހައިކޯޓުގެ މަދަނީ އިޖުރާއަތުގެ ގަވާއިދުގެ 49 ވަނަ މާއްދާއަށް
ރިޢާޔަތްކޮށް، ހައިކޯޓުގެ ގަވާއިދުގެ 68 ވަނަ މާއްދާއަށް ރިޢާޔަތްކޮށް،

މި ކޯޓުގެ ނަންބަރު {{caseId}} ޤަޟިއްޔާގައި ޙުކުމްކުރުމާ ހަމައަށް ނުވަތަ
މި ނޫންގޮތަކަށް މި ކޯޓުން ކަނޑައަޅަންދެން، ސިވިލް ކޯޓުގެ ނަންބަރު
{{caseId}} ޤަޟިއްޔާގެ ޙުކުމް ތަންފީޒުކުރުން ފަސްކުރުމަށް އަމުރުކޮށްފީމެވެ.

މި ނިންމުން ނިންމާފައިވަނީ:

    ފަނޑިޔާރު {{presiding}}  (ރިޔާސަތު)
    {{bench}}`,
  },
  {
    id: "TPL-008", name: "Summons / Order to Appear", category: "Summons", lang: "en",
    description: "Court order requiring a party or witness to appear — based on the High Court Summons format.",
    body:
`IN THE HIGH COURT OF THE MALDIVES
Malé, Republic of Maldives

ORDER TO APPEAR BEFORE THE COURT
Reference No.: {{caseId}}/CHT/{{caseId}}

Person required to appear:
    Full name:        {{respondentList}}
    Permanent address: ____________________________
    Current address:   ____________________________
    Service address:   ____________________________

Purpose of appearance:
    In connection with High Court Case No. {{caseId}} —
    {{caseTitle}}.
    The above-named is summoned in the capacity of a respondent
    to the appeal.

Date and time of appearance:
    {{nextHearing}} at 14:00 hrs.
    You are required to appear before the High Court of the Maldives.

Issued: {{today}}

    _____________________________
    Judge / Registrar

NOTE: Particular matters to which the recipient must pay attention
are set out on the reverse of this order.

Received by:
    Name:        ___________________________
    Signature:   ___________________________
    Time:        ____________  Date: ____________
    Relationship to person summoned: _____________

Issued by:
    Name:        ___________________________
    Signature:   ___________________________

Person who attended the court:
    Name:        ___________________________
    Signature:   ___________________________
    Date: ____________  Time: ____________`,
  },
  {
    id: "TPL-009", name: "ކޯޓަށް ޙާޒިރުވުމުގެ އަމުރު (Summons)", category: "Summons", lang: "dv",
    description: "Court summons in Dhivehi — matches the High Court summons template.",
    body:
`ދިވެހިރާއްޖޭގެ ހައިކޯޓު
ނަންބަރު: 95-B1/CHT/{{caseId}}

ކޯޓަށް ޙާޒިރުވުމުގެ އަމުރު

• ޙާޒިރުވާންޖެހޭ ފަރާތުގެ:
   ފުރިހަމަ ނަން:       {{respondentList}}
   ޢާއްމު ނަން:          —
   ދާއިމީ އެޑްރެސް:      ____________________
   މިހާރުގެ އެޑްރެސް:    ____________________
   އަމުރު ފޮނުވަންވީ އެޑްރެސް: ____________________

• ޙާޟިރުކުރެވޭ ބޭނުން:
   ހައިކޯޓުގެ ނަންބަރު {{caseId}} ޤަޟިއްޔާއާ ގުޅިގެން،
   {{caseTitle}} މައްސަލައިގައި އިސްތިއުނާފު ރައްދުވާ ފަރާތުގެ
   ޙައިޘިއްޔަތުން ޝަރީޢަތުގެ މަޖިލީހަށް.

• މަތީގައިވާ ބޭނުމަށް:
   {{nextHearing}} ދުވަހުގެ 14:00 އަށް ދިވެހިރާއްޖޭގެ ހައިކޯޓަށް
   ޙާޒިރުވުމަށް އަންގަމެވެ.

   ތާރީޚް: {{today}}

   _____________________________
   ފަނޑިޔާރު

ނޯޓް: މި އަމުރާ ގުޅިގެން ކޮންމެހެން ސަމާލުކަން ދޭންވީ ކަންތައްތައް
އަމުރުގެ އަނެއްފަރާތުގައި ލިޔެވިފައި އެވަނީއެވެ.

ޙަވާލުވި މީހާގެ:
   ނަން:    ____________________
   ސޮއި:    ____________________
   ގަޑި: ____________  ތާރީޚް: ____________
   ޙާޒިރުވާންޖެހޭ މީހާއާ ހުރި ގުޅުން: ____________

ޙަވާލުކުރި މީހާ:
   ނަން:    ____________________
   ސޮއި:    ____________________

ޗިޓަށް ޙާޒިރުވީ މީހާގެ:
   ނަން:    ____________________
   ސޮއި:    ____________________
   ތާރީޚް: ____________  ގަޑި: ____________`,
  },
  {
    id: "TPL-005", name: "ޝަރީޢަތުގެ އެންގުން (Notice of Hearing)", category: "Notice", lang: "dv",
    description: "Notice of hearing in Dhivehi (Thaana script).",
    body:
`ހައިކޯޓު — ޝަރީޢަތުގެ އެންގުން

މައްސަލަ ނަންބަރު: {{caseId}}
މައްސަލަ:           {{caseTitle}}

އިސްވެ ދެންނެވުނު މައްސަލަ {{nextHearing}} ގައި ޝަރީޢަތްކުރުމަށް ހަމަޖެހިފައިވާ ވާހަކަ
އެންގީމެވެ.

ޝަކުވާކުރާ ފަރާތްތައް: {{appellantList}}
ޖަވާބުދާރީ ފަރާތްތައް: {{respondentList}}

ޕެނަލް:  {{bench}}
ޕްރިސައިޑިން: {{presiding}}

މިއަދު: {{today}}

_________________________
ރަޖިސްޓްރާ`,
  },
];

// ─── Cross-section access grants ─────────────────────────────────────────────
// Each grant lets a judge or staff member view a section other than their
// own. Maintained as { id, userType: "judge"|"staff", userId, sectionId,
// grantedBy, grantedAt, expiresAt? }
const initAccessGrants = [
  // Example: Hon. Mohamed Waheed has been granted access to Hon. Aminath Didi's section
  { id: "AG-001", userType: "judge", userId: "J-003", sectionId: "SEC-B",
    grantedBy: "Global Admin", grantedAt: "2024-04-01", reason: "Bench coverage during leave" },
  // Example: registrar Fathimath Shifa cross-section access
  { id: "AG-002", userType: "staff", userId: "S-001", sectionId: "SEC-B",
    grantedBy: "Global Admin", grantedAt: "2024-04-15", reason: "Acting registrar coverage" },
];

Object.assign(window, {
  JUDGES, LAWYERS, COURTS, TIME_SLOTS, WEEK_DAYS, MONTH_NAMES,
  today, fmt, addDays, timeToMins, minsToTime, timesOverlap,
  initCases, initTargets, initBookings, detectClashes,
  initJudges, initLawyers, initStaff, initParties, initRepresentatives,
  initSections, initTemplates, initAccessGrants,
  DV_STRINGS, t,
  casePetitioner, caseRespondent, caseAllLawyers, caseAllParties, caseAllReps,
});
