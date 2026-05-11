// ─── Auth: login, provisioning, session, role-based access ──────────────────
//
// Roles:
//   admin   — Global Admin (hardcoded credentials)
//   judge   — links to record in initJudges by email
//   staff   — links to record in initStaff by email
//   lawyer  — links to record in initLawyers by email/phone
//   party   — links to record in initParties by email/phone
//   rep     — links to record in initRepresentatives by email/phone
//
// Account creation: NO public signup. When the registry adds a person to a
// directory, the app auto-provisions a user with a temporary password (shown
// once to the admin to share out-of-band). On first login, the user is
// required to change the password.
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
    if (!u) return { ok: false, error: "No account found for that email or phone. Ask the registry to add you to the directory first." };
    if (u.password !== password) return { ok: false, error: "Incorrect password." };
    const s = { role: u.role, name: u.name, recordId: u.recordId,
      identifier: u.identifier, loggedAt: Date.now(),
      mustChangePassword: !!u.mustChangePassword };
    setSession(s);
    return { ok: true };
  };

  // Admin-driven provisioning: creates a user with a temporary password.
  // Returns { ok, tempPassword, user } so the admin UI can display the
  // credentials once. Idempotent — re-provisioning regenerates the temp
  // password and forces the user to reset on next login.
  const provisionUser = ({ identifier, role, recordId, name }) => {
    const id = String(identifier || "").trim();
    if (!id) return { ok: false, error: "An email or phone is required to create an account." };
    if (!role || !recordId) return { ok: false, error: "Role and record id are required." };

    const tempPassword = generateTempPassword();
    const norm = (x) => String(x || "").trim().toLowerCase();
    const existing = users.find((u) => norm(u.identifier) === norm(id));
    const newUser = {
      identifier: id,
      password: tempPassword,
      role, recordId,
      name: name || existing?.name || id,
      mustChangePassword: true,
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    if (existing) {
      setUsers((p) => p.map((u) =>
        norm(u.identifier) === norm(id) ? { ...u, ...newUser } : u));
    } else {
      setUsers((p) => [...p, newUser]);
    }
    return { ok: true, tempPassword, user: newUser };
  };

  // Change the password for the currently logged-in user. Clears the
  // mustChangePassword flag if set.
  const changePassword = (currentPassword, newPassword) => {
    if (!session) return { ok: false, error: "Not signed in." };
    if (session.role === "admin")
      return { ok: false, error: "The Global Admin password is fixed in this build." };
    if (!newPassword || newPassword.length < 6)
      return { ok: false, error: "New password must be at least 6 characters." };

    const norm = (x) => String(x || "").trim().toLowerCase();
    const u = users.find((x) => norm(x.identifier) === norm(session.identifier));
    if (!u) return { ok: false, error: "Account not found." };
    // Require current password unless this is a forced reset
    if (!u.mustChangePassword && u.password !== currentPassword)
      return { ok: false, error: "Current password is incorrect." };

    setUsers((p) => p.map((x) =>
      norm(x.identifier) === norm(session.identifier)
        ? { ...x, password: newPassword, mustChangePassword: false, updatedAt: Date.now() }
        : x));
    setSession((s) => s ? { ...s, mustChangePassword: false } : s);
    return { ok: true };
  };

  const logout = () => setSession(null);

  return (
    <AuthCtx.Provider value={{
      session, login, logout, users,
      provisionUser, changePassword,
    }}>
      {children}
    </AuthCtx.Provider>
  );
};

// Generate a friendly temp password — 4 letters + 4 digits, no ambiguous chars
function generateTempPassword() {
  const letters = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const digits = "23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += letters[Math.floor(Math.random() * letters.length)];
  for (let i = 0; i < 4; i++) s += digits[Math.floor(Math.random() * digits.length)];
  return s;
}

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
function visibleCases(session, allCases, judges, staff, sections, accessGrants) {
  if (!session || session.role === "admin") return allCases;
  const myName = session.name;
  const myRecordId = session.recordId;

  // Cross-section access grants currently held by this user
  const myGrants = (accessGrants || []).filter((g) =>
    g.userType === session.role && g.userId === myRecordId);
  const grantedSectionIds = new Set(myGrants.map((g) => g.sectionId));
  const grantedSections = (sections || []).filter((s) => grantedSectionIds.has(s.id));
  const grantedCaseTypes = new Set(grantedSections.flatMap((s) => s.caseTypes || []));

  if (session.role === "judge") {
    // Cases where I'm presiding OR sitting OR in my section OR via access grant
    const judgeRec = (judges || []).find((j) => j.id === myRecordId);
    const mySection = (sections || []).find((s) => s.judges?.includes(myName));
    return allCases.filter((c) => {
      if (c.presiding === myName) return true;
      if (c.judges?.includes(myName)) return true;
      if (mySection && mySection.caseTypes?.includes(c.type)) return true;
      if (grantedCaseTypes.has(c.type)) return true;
      return false;
    });
  }
  if (session.role === "staff") {
    // Cases assigned to my section (by case type) OR via access grant
    const mySection = (sections || []).find((s) => s.staff?.includes(myRecordId));
    const myTypes = new Set([
      ...(mySection?.caseTypes || []),
      ...grantedCaseTypes,
    ]);
    if (myTypes.size === 0) return [];
    return allCases.filter((c) => myTypes.has(c.type));
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
// Login screen — sign in only. Accounts are created by the registry.
// ────────────────────────────────────────────────────────────────────────────

const AuthScreen = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const submit = (e) => {
    e?.preventDefault();
    setErr(""); setBusy(true);
    const r = login(identifier, password);
    setBusy(false);
    if (!r.ok) setErr(r.error);
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
              Sign in
            </div>
            <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4 }}>
              Use your work email, phone, or admin username.
            </div>
          </div>

          <Input label="Email · phone · username"
            placeholder="you@highcourt.gov.mv or Global Admin"
            value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoFocus/>

          <Input label="Password" type="password"
            placeholder="Enter password"
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
            {busy ? "Please wait…" : "Sign in"}
          </Btn>

          <div style={{
            padding: "10px 12px", marginTop: 4,
            background: "var(--paper-2)", borderRadius: 6,
            fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.55,
          }}>
            <div style={{ fontWeight: 500, color: "var(--text)", marginBottom: 3 }}>Don't have an account?</div>
            Accounts are created by the registry when you're added to the directory.
            You'll receive a temporary password from the court — change it after your first sign-in.
          </div>

          <div style={{
            marginTop: 14, padding: "10px 12px",
            background: "var(--paper-2)", borderRadius: 6,
            fontSize: 11, color: "var(--text-3)", lineHeight: 1.55,
          }}>
            <div style={{ fontWeight: 500, color: "var(--text-2)", marginBottom: 4 }}>Demo credentials</div>
            <div><span className="mono">Global Admin</span> · <span className="mono">Shan1828</span> — full access</div>
          </div>
        </form>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Forced-reset / change password screen (mid-app)
// ────────────────────────────────────────────────────────────────────────────

const ChangePasswordScreen = ({ forced, onDone }) => {
  const { session, changePassword, logout } = useAuth();
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [err, setErr] = React.useState("");
  const [ok, setOk] = React.useState(false);

  const submit = (e) => {
    e?.preventDefault();
    setErr("");
    if (next !== confirm) { setErr("New passwords don't match."); return; }
    const r = changePassword(current, next);
    if (!r.ok) { setErr(r.error); return; }
    setOk(true);
    setTimeout(() => onDone?.(), 800);
  };

  return (
    <div style={{
      minHeight: forced ? "100vh" : "auto",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: forced ? "var(--paper-2)" : "transparent", padding: 32,
    }}>
      <form onSubmit={submit} style={{
        width: "100%", maxWidth: 420,
        background: "var(--paper)", border: "1px solid var(--line)",
        borderRadius: 10, padding: 28,
      }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.02em" }}>
            {forced ? "Set a new password" : "Change password"}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-2)", marginTop: 4, lineHeight: 1.5 }}>
            {forced
              ? `Welcome, ${session?.name}. You're using a temporary password — please choose a permanent one before continuing.`
              : "Choose a new password for your account."}
          </div>
        </div>

        {!forced && (
          <Input label="Current password" type="password"
            value={current} onChange={(e) => setCurrent(e.target.value)} autoFocus/>
        )}
        <Input label="New password" type="password"
          placeholder="At least 6 characters"
          value={next} onChange={(e) => setNext(e.target.value)} autoFocus={forced}/>
        <Input label="Confirm new password" type="password"
          value={confirm} onChange={(e) => setConfirm(e.target.value)}/>

        {err && (
          <div style={{
            padding: "9px 11px", marginBottom: 14,
            background: "var(--danger-soft)", color: "var(--danger)",
            border: "1px solid rgba(180, 70, 70, 0.2)",
            borderRadius: 6, fontSize: 12.5,
          }}>{err}</div>
        )}
        {ok && (
          <div style={{
            padding: "9px 11px", marginBottom: 14,
            background: "var(--success-soft)", color: "var(--success)",
            border: "1px solid rgba(45, 90, 61, 0.2)",
            borderRadius: 6, fontSize: 12.5,
          }}>Password updated.</div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          {!forced && (
            <Btn variant="outline" onClick={() => onDone?.()} type="button">Cancel</Btn>
          )}
          <Btn type="submit" variant="primary" onClick={submit}
            style={{ flex: 1, justifyContent: "center" }}>
            {forced ? "Set password & continue" : "Save new password"}
          </Btn>
        </div>

        {forced && (
          <button type="button" onClick={() => logout()} style={{
            marginTop: 18, background: "transparent", border: "none",
            color: "var(--text-3)", fontSize: 11.5, cursor: "pointer",
            display: "block", marginLeft: "auto", marginRight: "auto",
          }}>Sign out instead</button>
        )}
      </form>
    </div>
  );
};

window.AuthProvider = AuthProvider;
window.AuthCtx = AuthCtx;
window.useAuth = useAuth;
window.AuthScreen = AuthScreen;
window.ChangePasswordScreen = ChangePasswordScreen;
window.ROLE_LABELS = ROLE_LABELS;
window.visibleCases = visibleCases;
window.categoriseJudgeCases = categoriseJudgeCases;
