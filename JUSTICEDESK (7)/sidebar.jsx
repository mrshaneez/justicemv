// ─── Sidebar nav + topbar ────────────────────────────────────────────────────

// Each item has a `roles` array — controls who sees it.
const NAV_GROUPS = [
  { label: "Workspace", items: [
    { id: "dashboard",  label: "Dashboard",   icon: "dashboard", roles: ["admin","judge","staff","lawyer","party","rep"] },
    { id: "cases",      label: "Cases",       icon: "cases",     roles: ["admin","judge","staff","lawyer","party","rep"] },
    { id: "courtrooms", label: "Courtrooms",  icon: "court",     roles: ["admin","staff","judge"] },
    { id: "targets",    label: "Targets",     icon: "target",    roles: ["admin","judge","staff"] },
    { id: "tasks",      label: "Tasks",       icon: "check",     roles: ["admin","judge","staff"] },
    { id: "requests",   label: "Requests",    icon: "inbox",     roles: ["admin","judge","staff","lawyer","party","rep"] },
  ]},
  { label: "Organisation", items: [
    { id: "sections",        label: "Sections",        icon: "building", roles: ["admin","judge","staff"] },
    { id: "judges",          label: "Judges",          icon: "gavel",    roles: ["admin","staff","judge"] },
    { id: "staff",           label: "Court staff",     icon: "users",    roles: ["admin","staff"] },
  ]},
  { label: "Bar & Public", items: [
    { id: "lawyers",         label: "Lawyers",         icon: "scales",  roles: ["admin","staff"] },
    { id: "parties",         label: "Parties",         icon: "users",   roles: ["admin","staff"] },
    { id: "representatives", label: "Representatives", icon: "userTag", roles: ["admin","staff"] },
  ]},
];

const NAV_ITEMS = NAV_GROUPS.flatMap(g => g.items);

// Filter groups for the active role; drop empty groups.
function navForRole(role) {
  return NAV_GROUPS
    .map(g => ({ ...g, items: g.items.filter(i => i.roles.includes(role)) }))
    .filter(g => g.items.length > 0);
}

const Sidebar = ({ page, setPage, counts, aiOpen, setAiOpen, density, onOpenSearch }) => {
  const { session, logout } = useAuth();
  const padY = density === "compact" ? 7 : 9;
  const groups = navForRole(session?.role || "admin");
  const [menuOpen, setMenuOpen] = React.useState(false);
  const roleInfo = ROLE_LABELS[session?.role] || ROLE_LABELS.admin;

  return (
    <aside style={{
      width: 232, flexShrink: 0,
      background: "var(--paper)",
      borderRight: "1px solid var(--line)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Wordmark */}
      <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 6,
          background: "var(--ink)", color: "var(--paper)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 600, fontSize: 13, letterSpacing: "-0.02em",
        }}>HC</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.1 }}>JusticeDesk</div>
          <div style={{ fontSize: 10.5, color: "var(--text-3)", letterSpacing: "0.02em" }}>High Court</div>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: "0 14px 12px" }}>
        <button onClick={onOpenSearch} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          padding: "7px 10px", border: "1px solid var(--line)",
          borderRadius: 6, background: "var(--paper-2)",
          color: "var(--text-3)", fontSize: 12.5, cursor: "pointer",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--line-2)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; }}>
          <I.search size={13}/>
          <span style={{ flex: 1, textAlign: "left" }}>Search…</span>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--text-3)" }}>⌘K</span>
        </button>
      </div>

      <nav style={{ flex: 1, padding: "0 10px", overflowY: "auto" }}>
        {groups.map((group, gi) => (
          <React.Fragment key={group.label}>
            <div style={{
              fontSize: 10.5, color: "var(--text-3)",
              letterSpacing: "0.08em", textTransform: "uppercase",
              padding: gi === 0 ? "8px 8px 6px" : "16px 8px 6px", fontWeight: 500,
            }}>{group.label}</div>

            {group.items.map((n) => {
              const Ic = I[n.icon];
              const active = page === n.id;
              const count = counts[n.id] || 0;
              return (
                <button key={n.id} onClick={() => setPage(n.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: `${padY}px 10px`, marginBottom: 1,
                    background: active ? "var(--paper-2)" : "transparent",
                    border: "1px solid transparent",
                    borderRadius: 6,
                    color: active ? "var(--text)" : "var(--text-2)",
                    fontSize: 13, cursor: "pointer", textAlign: "left",
                    fontWeight: active ? 500 : 400,
                    position: "relative",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--paper-2)"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                  {active && <div style={{
                    position: "absolute", left: -10, top: 6, bottom: 6, width: 2,
                    background: "var(--ink)", borderRadius: 2,
                  }}/>}
                  {Ic && <Ic size={15} stroke={active ? "var(--text)" : "var(--text-2)"} />}
                  <span style={{ flex: 1 }}>{n.label}</span>
                  {count > 0 && (
                    <span style={{
                      background: n.id === "requests" ? "var(--danger-soft)" : "var(--paper-3)",
                      color: n.id === "requests" ? "var(--danger)" : "var(--text-2)",
                      fontSize: 10.5, fontWeight: 500,
                      padding: "1px 7px", borderRadius: 99, minWidth: 18, textAlign: "center",
                    }}>{count}</span>
                  )}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </nav>

      {/* Bottom: AI advisor + user menu */}
      <div style={{ padding: "10px 10px 14px", borderTop: "1px solid var(--line)" }}>
        {(session?.role === "admin" || session?.role === "judge" || session?.role === "staff") && (
          <button onClick={() => setAiOpen(!aiOpen)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 9,
            padding: "9px 10px",
            background: aiOpen ? "var(--ink)" : "var(--paper-2)",
            color: aiOpen ? "var(--paper)" : "var(--text)",
            border: aiOpen ? "1px solid var(--ink)" : "1px solid var(--line)",
            borderRadius: 6, fontSize: 12.5, cursor: "pointer", fontWeight: 500,
          }}>
            <I.sparkle size={14}/>
            <span style={{ flex: 1, textAlign: "left" }}>Case Advisor</span>
            <span style={{
              fontSize: 9.5, color: aiOpen ? "rgba(250,250,248,0.6)" : "var(--text-3)",
              letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
            }}>AI</span>
          </button>
        )}

        <div style={{ position: "relative", marginTop: 10 }}>
          <button onClick={() => setMenuOpen(o => !o)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 9,
            padding: "8px 10px", background: menuOpen ? "var(--paper-2)" : "transparent",
            border: "none", borderRadius: 6, cursor: "pointer", textAlign: "left",
          }}>
            <Avatar name={session?.name || "User"} size={28}
              tone={roleInfo.tone === "accent" ? "accent" : roleInfo.tone === "judge" ? "judge" : "neutral"}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.2,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {session?.name || "—"}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--text-3)" }}>{roleInfo.label}</div>
            </div>
            <I.chevronD size={12} stroke="var(--text-3)"/>
          </button>

          {menuOpen && (
            <div style={{
              position: "absolute", bottom: "calc(100% + 4px)", left: 0, right: 0,
              background: "var(--paper)", border: "1px solid var(--line)",
              borderRadius: 6, boxShadow: "var(--shadow)", zIndex: 100,
              padding: 4,
            }}>
              <div style={{ padding: "8px 10px", fontSize: 11, color: "var(--text-3)",
                borderBottom: "1px solid var(--line-soft)", marginBottom: 4 }}>
                Signed in as<br/>
                <span style={{ color: "var(--text)", fontWeight: 500 }}>{session?.identifier}</span>
              </div>
              <button onClick={() => { setMenuOpen(false); logout(); }} style={{
                width: "100%", padding: "8px 10px", background: "transparent",
                border: "none", borderRadius: 4, cursor: "pointer", textAlign: "left",
                fontSize: 12.5, color: "var(--text)",
                display: "flex", alignItems: "center", gap: 8,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--paper-2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <I.signOut size={13}/> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

const Topbar = ({ page, viewCase, breadcrumbActions }) => {
  const NAV_ITEM = NAV_ITEMS.find((n) => n.id === page);
  const today = new Date();
  const niceDate = today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  return (
    <header style={{
      height: 56, padding: "0 24px",
      borderBottom: "1px solid var(--line)",
      background: "var(--paper)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <div style={{ fontSize: 14.5, fontWeight: 500, letterSpacing: "-0.01em" }}>
          {NAV_ITEM?.label}
        </div>
        {viewCase && (
          <>
            <span style={{ color: "var(--text-3)", fontSize: 12 }}>/</span>
            <span className="mono" style={{ fontSize: 12, color: "var(--text-2)" }}>{viewCase.id}</span>
          </>
        )}
        <span style={{ color: "var(--text-3)", fontSize: 11.5, marginLeft: 4 }}>· {niceDate}</span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {breadcrumbActions}
        <button style={{
          width: 32, height: 32, borderRadius: 6, background: "transparent",
          border: "1px solid transparent", cursor: "pointer", color: "var(--text-2)",
          display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
        }} onMouseEnter={(e)=>e.currentTarget.style.background="var(--paper-2)"}
           onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}>
          <I.bell size={15}/>
          <span style={{
            position: "absolute", top: 7, right: 8,
            width: 6, height: 6, borderRadius: "50%", background: "var(--danger)",
          }}/>
        </button>
      </div>
    </header>
  );
};

window.Sidebar = Sidebar;
window.Topbar = Topbar;
window.NAV_ITEMS = NAV_ITEMS;
window.navForRole = navForRole;
