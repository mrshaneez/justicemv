// ─── Auth: login, signup, session, role-based access ────────────────────────
//
// Roles:
//   admin   — Global Admin (hardcoded credentials)
//   judge   — links to record in initJudges by email
//   staff   — links to record in initStaff by email
//   lawyer  — links to record in initLawyers by email/phone
//   party   — links to record in initParties by email/phone
//   rep     — links to record in initRepresentatives by email/phone
//
// Session is stored in localStorage. Hardcoded admin credentials per spec:
//   Username: "Global Admin", Password: "Shan1828"

const ADMIN_USER = { username: "Global Admin", password: "Shan1828" };
const SESSION_KEY = "jd_session_v1";
const USERS_KEY = "jd_users_v1";

// ── Storage helpers ─────────────────────────────────────────────────────────
const loadUsers = () => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
};
const saveUsers = (u) => localStorage.setItem(USERS_KEY, JSON.stringify(u));
const loadSession = () => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
  catch { return null; }
};
const saveSession = (s) => {
  if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else localStorage.removeItem(SESSION_KEY);
};

// ── Match an identifier (email or phone) to an existing directory record ────
function detectRoleFromIdentifier(identifier) {
  const norm = (s) => String(s || "").trim().toLowerCase().replace(/\s+/g, "");
  const id = norm(identifier);
  if (!id) return null;

  const matches = (rec) => norm(rec.email) === id || norm(rec.phone) === id;

  for (const r of (window.initJudges || []))          if (matches(r)) return { role: "judge", recordId: r.id, name: r.name };
  for (const r of (window.initStaff  || []))          if (matches(r)) return { role: "staff", recordId: r.id, name: r.name };
  for (const r of (window.initLawyers|| []))          if (matches(r)) return { role: "lawyer", recordId: r.id, name: r.name };
  for (const r of (window.initParties|| []))          if (matches(r)) return { role: "party", recordId: r.id, name: r.name };
  for (const r of (window.initRepresentatives || [])) if (matches(r)) return { role: "rep", recordId: r.id, name: r.name };
  return null;
}

// ── Auth context ────────────────────────────────────────────────────────────
const AuthCtx = React.createContext(null);
const useAuth = () => React.useContext(AuthCtx);

const AuthProvider = ({ children }) => {
  const [session, setSession] = React.useState(() => loadSession());
  const [users, setUsers] = React.useState(() => loadUsers());

  React.useEffect(() => saveSession(session), [session]);
  React.useEffect(() => saveUsers(users), [users]);

  const login = (identifier, password) => {
    const id = String(identifier || "").trim();
    // Admin
    if (id === ADMIN_USER.username && password === ADMIN_USER.password) {
      const s = { role: "admin", name: "Global Admin", recordId: null,
        identifier: id, loggedAt: Date.now() };
      setSession(s);
      return { ok: true };
    }
    // Registered user (lookup by email/phone)
    const norm = (x) => String(x || "").trim().toLowerCase();
    const u = users.find((x) => norm(x.identifier) === norm(id));
    if (!u) return { ok: false, error: "No account found for that email or phone." };
    if (u.password !== password) return { ok: false, error: "Incorrect password." };
    const s = { role: u.role, name: u.name, recordId: u.recordId,
      identifier: u.identifier, loggedAt: Date.now() };
    setSession(s);
    return { ok: true };
  };

  const signup = ({ identifier, password, displayName }) => {
    const id = String(identifier || "").trim();
    if (!id || !password) return { ok: false, error: "Both fields are required." };
    if (id === ADMIN_USER.username) return { ok: false, error: "That username is reserved." };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

    const norm = (x) => String(x || "").trim().toLowerCase();
    if (users.some((u) => norm(u.identifier) === norm(id)))
      return { ok: false, error: "An account already exists for that email/phone." };

    const detected = detectRoleFromIdentifier(id);
    if (!detected)
      return { ok: false, error: "We couldn't find a directory record matching that email or phone. Ask the registry to add you first." };

    const newUser = {
      identifier: id, password,
      role: detected.role, recordId: detected.recordId,
      name: displayName?.trim() || detected.name,
      createdAt: Date.now(),
    };
    setUsers((p) => [...p, newUser]);
    const s = { role: newUser.role, name: newUser.name, recordId: newUser.recordId,
      identifier: newUser.identifier, loggedAt: Date.now() };
    setSession(s);
    return { ok: true };
  };

  const logout = () => setSession(null);

  return (
    <AuthCtx.Provider value={{ session, login, signup, logout, users }}>
      {children}
    </AuthCtx.Provider>
  );
};

// ── Role label + tone helpers ───────────────────────────────────────────────
const ROLE_LABELS = {
  admin:  { label: "Global Admin",   tone: "ink" },
  judge:  { label: "Judge",          tone: "judge" },
  staff:  { label: "Court Staff",    tone: "neutral" },
  lawyer: { label: "Lawyer",         tone: "accent" },
  party:  { label: "Party",          tone: "neutral" },
  rep:    { label: "Representative", tone: "neutral" },
};

// ── Visibility filters: which cases / bookings can a session see? ───────────
function visibleCases(session, allCases, judges, staff, sections) {
  if (!session || session.role === "admin") return allCases;
  const myName = session.name;
  const myRecordId = session.recordId;

  if (session.role === "judge") {
    // Cases where I'm presiding OR sitting OR in my section
    const judgeRec = (judges || []).find((j) => j.id === myRecordId);
    const mySection = (sections || []).find((s) => s.judges?.includes(myName));
    return allCases.filter((c) => {
      if (c.presiding === myName) return true;
      if (c.judges?.includes(myName)) return true;
      if (mySection && mySection.caseTypes?.includes(c.type)) return true;
      return false;
    });
  }
  if (session.role === "staff") {
    // Cases assigned to my section (by case type)
    const mySection = (sections || []).find((s) => s.staff?.includes(myRecordId));
    if (!mySection) return [];
    return allCases.filter((c) => mySection.caseTypes?.includes(c.type));
  }
  if (session.role === "lawyer") {
    return allCases.filter((c) =>
      c.petitioner?.lawyers?.includes(myName) || c.respondent?.lawyers?.includes(myName));
  }
  if (session.role === "party") {
    const partyRec = (window.initParties || []).find((p) => p.id === myRecordId);
    const partyName = partyRec?.name || myName;
    return allCases.filter((c) =>
      c.petitioner?.name === partyName || c.respondent?.name === partyName);
  }
  if (session.role === "rep") {
    const repRec = (window.initRepresentatives || []).find((r) => r.id === myRecordId);
    const partyName = repRec?.represents;
    return allCases.filter((c) =>
      c.petitioner?.name === partyName || c.respondent?.name === partyName);
  }
  return [];
}

// Categorise a judge's cases into presiding / sitting / section
function categoriseJudgeCases(session, allCases, sections) {
  if (session?.role !== "judge") return { presiding: [], sitting: [], section: [] };
  const myName = session.name;
  const mySection = (sections || []).find((s) => s.judges?.includes(myName));
  const presiding = allCases.filter((c) => c.presiding === myName);
  const sitting = allCases.filter((c) => c.presiding !== myName && c.judges?.includes(myName));
  const section = mySection
    ? allCases.filter((c) =>
        mySection.caseTypes?.includes(c.type) &&
        c.presiding !== myName &&
        !c.judges?.includes(myName))
    : [];
  return { presiding, sitting, section };
}

// ────────────────────────────────────────────────────────────────────────────
// Login / Signup screens
// ────────────────────────────────────────────────────────────────────────────

const AuthScreen = () => {
  const { login, signup } = useAuth();
  const [mode, setMode] = React.useState("login"); // login | signup
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const submit = (e) => {
    e?.preventDefault();
    setErr(""); setBusy(true);
    const fn = mode === "login" ? login(identifier, password)
      : signup({ identifier, password, displayName });
    setBusy(false);
    if (!fn.ok) setErr(fn.error);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "stretch",
      background: "var(--paper-2)",
    }}>
      {/* Left: brand panel */}
      <div style={{
        flex: 1, background: "var(--ink)", color: "var(--paper)",
        padding: "48px 56px", display: "flex", flexDirection: "column",
        justifyContent: "space-between", position: "relative", overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            background: "var(--paper)", color: "var(--ink)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em",
          }}>HC</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.01em" }}>JUSTICEDESK</div>
            <div style={{ fontSize: 11, color: "rgba(250,250,248,0.55)" }}>High Court · Case Management</div>
          </div>
        </div>

        <div>
          <div style={{
            fontSize: 36, fontWeight: 400, letterSpacing: "-0.025em",
            lineHeight: 1.15, maxWidth: 480, marginBottom: 18,
          }}>
            A single workspace for the bench, registry, and bar.
          </div>
          <div style={{
            fontSize: 14, color: "rgba(250,250,248,0.65)",
            lineHeight: 1.55, maxWidth: 440,
          }}>
            Each user sees only the matters they're involved in. Judges see presiding and sitting cases.
            Staff see their section. Counsel see their appearances. The registry sees everything.
          </div>
        </div>

        <div style={{ fontSize: 11, color: "rgba(250,250,248,0.45)", letterSpacing: "0.04em" }}>
          © High Court of the Maldives — internal preview
        </div>

        {/* Subtle texture */}
        <div style={{
          position: "absolute", right: -120, bottom: -80, width: 420, height: 420,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(250,250,248,0.06), transparent 70%)",
          pointerEvents: "none",
        }}/>
      </div>

      {/* Right: form */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 32,
      }}>
        <form onSubmit={submit} style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>
              {mode === "login" ? "Sign in" : "Create your account"}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4 }}>
              {mode === "login"
                ? "Use your work email, phone, or admin username."
                : "Sign up with the email or phone the registry has on file."}
            </div>
          </div>

          {mode === "signup" && (
            <Input label="Display name (optional)"
              placeholder="As you'd like to appear"
              value={displayName} onChange={(e) => setDisplayName(e.target.value)}/>
          )}

          <Input label={mode === "login" ? "Email · phone · username" : "Email or phone"}
            placeholder={mode === "login" ? "you@highcourt.gov.mv or Global Admin" : "you@highcourt.gov.mv"}
            value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoFocus/>

          <Input label="Password" type="password"
            placeholder={mode === "login" ? "Enter password" : "At least 6 characters"}
            value={password} onChange={(e) => setPassword(e.target.value)}/>

          {err && (
            <div style={{
              padding: "9px 11px", marginBottom: 14,
              background: "var(--danger-soft)", color: "var(--danger)",
              border: "1px solid rgba(180, 70, 70, 0.2)",
              borderRadius: 6, fontSize: 12.5, lineHeight: 1.4,
            }}>{err}</div>
          )}

          <Btn type="submit" variant="primary" size="lg" onClick={submit}
            style={{ width: "100%", justifyContent: "center", marginTop: 4, marginBottom: 16 }}>
            {busy ? "Please wait…" : (mode === "login" ? "Sign in" : "Create account")}
          </Btn>

          <div style={{ textAlign: "center", fontSize: 12.5, color: "var(--text-2)" }}>
            {mode === "login" ? (
              <>New here?{" "}
                <button type="button" onClick={() => { setMode("signup"); setErr(""); }}
                  style={{ background: "transparent", border: "none",
                    color: "var(--ink)", textDecoration: "underline", cursor: "pointer",
                    fontSize: 12.5, fontWeight: 500 }}>
                  Create an account
                </button>
              </>
            ) : (
              <>Have an account?{" "}
                <button type="button" onClick={() => { setMode("login"); setErr(""); }}
                  style={{ background: "transparent", border: "none",
                    color: "var(--ink)", textDecoration: "underline", cursor: "pointer",
                    fontSize: 12.5, fontWeight: 500 }}>
                  Sign in
                </button>
              </>
            )}
          </div>

          <div style={{
            marginTop: 28, padding: "10px 12px",
            background: "var(--paper-2)", borderRadius: 6,
            fontSize: 11, color: "var(--text-3)", lineHeight: 1.55,
          }}>
            <div style={{ fontWeight: 500, color: "var(--text-2)", marginBottom: 4 }}>Demo credentials</div>
            <div><span className="mono">Global Admin</span> · <span className="mono">Shan1828</span> — full access</div>
            <div style={{ marginTop: 4 }}>Or sign up with: <span className="mono">i.rasheed@highcourt.gov.mv</span> (judge), <span className="mono">a.saeed@highcourt.gov.mv</span> (staff), <span className="mono">ali@hassanco.mv</span> (lawyer)</div>
          </div>
        </form>
      </div>
    </div>
  );
};

window.AuthProvider = AuthProvider;
window.AuthCtx = AuthCtx;
window.useAuth = useAuth;
window.AuthScreen = AuthScreen;
window.ROLE_LABELS = ROLE_LABELS;
window.visibleCases = visibleCases;
window.categoriseJudgeCases = categoriseJudgeCases;
