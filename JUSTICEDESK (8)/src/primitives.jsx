// ─── Shared primitives: pills, avatars, cards, buttons, inputs, modals ───────

const STATUS_COLORS = {
  Active:    { bg: "var(--success-soft)", fg: "var(--success)" },
  Pending:   { bg: "var(--warn-soft)",    fg: "var(--warn)" },
  Closed:    { bg: "var(--paper-3)",      fg: "var(--text-2)" },
  Scheduled: { bg: "var(--accent-soft)",  fg: "var(--accent)" },
  Completed: { bg: "var(--success-soft)", fg: "var(--success)" },
  Adjourned: { bg: "var(--warn-soft)",    fg: "var(--warn)" },
  Confirmed: { bg: "var(--accent-soft)",  fg: "var(--accent)" },
  Cancelled: { bg: "var(--danger-soft)",  fg: "var(--danger)" },
  Approved:  { bg: "var(--success-soft)", fg: "var(--success)" },
  Rejected:  { bg: "var(--danger-soft)",  fg: "var(--danger)" },
  Expedite:  { bg: "var(--danger-soft)",  fg: "var(--danger)" },
  Adjourn:   { bg: "var(--warn-soft)",    fg: "var(--warn)" },
  High:      { bg: "var(--danger-soft)",  fg: "var(--danger)" },
  Medium:    { bg: "var(--warn-soft)",    fg: "var(--warn)" },
  Low:       { bg: "var(--paper-3)",      fg: "var(--text-2)" },
  Done:      { bg: "var(--success-soft)", fg: "var(--success)" },
  Open:      { bg: "var(--paper-3)",      fg: "var(--text-2)" },
};

// ── Customizable status registry ────────────────────────────────────────────
// A live override store so admins can rename/recolour any status. Pill reads
// `STATUS_OVERRIDES` first, then falls back to STATUS_COLORS above. The
// StatusesPage admin tool mutates this object via setStatusOverrides.
const STATUS_OVERRIDES = {};
let _statusListeners = new Set();
function setStatusOverrides(next) {
  // Merge so callers can pass a partial { Pending: {...} }
  Object.keys(STATUS_OVERRIDES).forEach((k) => delete STATUS_OVERRIDES[k]);
  Object.assign(STATUS_OVERRIDES, next);
  _statusListeners.forEach((fn) => fn());
}
function useStatusOverrides() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    _statusListeners.add(force);
    return () => _statusListeners.delete(force);
  }, []);
  return STATUS_OVERRIDES;
}

const Pill = ({ label, tone, dot = false, size = "sm", style = {} }) => {
  const overrides = useStatusOverrides();
  const ov = overrides[label] || overrides[tone];
  const c = ov || STATUS_COLORS[label] || STATUS_COLORS[tone] || { bg: "var(--paper-3)", fg: "var(--text-2)" };
  const padding = size === "xs" ? "2px 7px" : "3px 9px";
  const fontSize = size === "xs" ? 10.5 : 11.5;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding, fontSize, fontWeight: 500, borderRadius: 99,
      background: c.bg, color: c.fg, lineHeight: 1.2,
      whiteSpace: "nowrap", letterSpacing: "0.005em", ...style,
    }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.fg }} />}
      {label}
    </span>
  );
};

const Tag = ({ children, style = {} }) => (
  <span style={{
    display: "inline-flex", alignItems: "center",
    padding: "2px 7px", fontSize: 11, color: "var(--text-2)",
    border: "1px solid var(--line)", borderRadius: 4,
    background: "var(--paper)", lineHeight: 1.3, ...style,
  }}>{children}</span>
);

// Initials avatar — square-rounded (judicial register, not playful circle)
const Avatar = ({ name = "?", size = 28, square = true, tone = "neutral", style = {} }) => {
  const initials = (name || "?").split(" ").filter(Boolean)
    .filter(w => w !== "Hon.").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const tones = {
    neutral: { bg: "var(--paper-3)", fg: "var(--text)" },
    ink: { bg: "var(--ink)", fg: "var(--paper)" },
    accent: { bg: "var(--accent-soft)", fg: "var(--accent)" },
    judge: { bg: "#1f3a3d", fg: "#e6ebe9" },
    petitioner: { bg: "#eae3d4", fg: "#5a4a1f" },
    respondent: { bg: "#e0dcd0", fg: "#3a3a30" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      borderRadius: square ? Math.max(3, size * 0.18) : "50%",
      background: t.bg, color: t.fg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 500, letterSpacing: "0.01em",
      ...style,
    }}>{initials}</div>
  );
};

const Card = ({ children, style = {}, onClick, padding = "1.25rem", interactive = false }) => (
  <div
    onClick={onClick}
    style={{
      background: "var(--paper)",
      border: "1px solid var(--line)",
      borderRadius: "var(--radius-lg)",
      padding,
      cursor: onClick || interactive ? "pointer" : "default",
      transition: "border-color .15s, box-shadow .15s, transform .15s",
      ...style,
    }}
    onMouseEnter={(e) => {
      if (!(onClick || interactive)) return;
      e.currentTarget.style.borderColor = "var(--line-2)";
      e.currentTarget.style.boxShadow = "var(--shadow-sm)";
    }}
    onMouseLeave={(e) => {
      if (!(onClick || interactive)) return;
      e.currentTarget.style.borderColor = "var(--line)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    {children}
  </div>
);

const Btn = ({ children, variant = "ghost", size = "md", onClick, disabled, type, style = {}, leading, trailing }) => {
  const sizes = {
    sm: { padding: "5px 10px", fontSize: 12 },
    md: { padding: "7px 12px", fontSize: 13 },
    lg: { padding: "9px 16px", fontSize: 13.5 },
  };
  const variants = {
    primary: { background: "var(--ink)", color: "var(--paper)", border: "1px solid var(--ink)" },
    secondary: { background: "var(--paper)", color: "var(--text)", border: "1px solid var(--line-2)" },
    ghost: { background: "transparent", color: "var(--text-2)", border: "1px solid transparent" },
    outline: { background: "var(--paper)", color: "var(--text)", border: "1px solid var(--line)" },
    danger: { background: "var(--paper)", color: "var(--danger)", border: "1px solid var(--danger-soft)" },
    accent: { background: "var(--accent)", color: "white", border: "1px solid var(--accent)" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontWeight: 500, borderRadius: "var(--radius)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background .12s, border-color .12s",
        ...sizes[size], ...variants[variant], ...style,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === "primary") e.currentTarget.style.background = "var(--ink-2)";
        if (variant === "ghost" || variant === "outline" || variant === "secondary") e.currentTarget.style.background = "var(--paper-2)";
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = variants[variant].background;
      }}
    >
      {leading}{children}{trailing}
    </button>
  );
};

const Field = ({ label, hint, children, style = {} }) => (
  <div style={{ marginBottom: 14, ...style }}>
    {label && (
      <label style={{
        display: "block", fontSize: 11, color: "var(--text-2)",
        marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em",
        fontWeight: 500,
      }}>{label}</label>
    )}
    {children}
    {hint && <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{hint}</div>}
  </div>
);

const Input = ({ label, hint, ...p }) => (
  <Field label={label} hint={hint}>
    <input {...p} style={{
      width: "100%", boxSizing: "border-box",
      padding: "8px 11px", borderRadius: "var(--radius)",
      border: "1px solid var(--line-2)", background: "var(--paper)",
      color: "var(--text)", fontSize: 13, outline: "none",
      transition: "border-color .12s",
      ...(p.style || {}),
    }}
    onFocus={(e) => e.currentTarget.style.borderColor = "var(--ink)"}
    onBlur={(e) => e.currentTarget.style.borderColor = "var(--line-2)"}
    />
  </Field>
);

const Sel = ({ label, options, hint, ...p }) => (
  <Field label={label} hint={hint}>
    <select {...p} style={{
      width: "100%", padding: "8px 11px", borderRadius: "var(--radius)",
      border: "1px solid var(--line-2)", background: "var(--paper)",
      color: "var(--text)", fontSize: 13, outline: "none",
      ...(p.style || {}),
    }}>
      {options.map((o) => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  </Field>
);

const Textarea = ({ label, hint, ...p }) => (
  <Field label={label} hint={hint}>
    <textarea {...p} style={{
      width: "100%", boxSizing: "border-box",
      padding: "8px 11px", borderRadius: "var(--radius)",
      border: "1px solid var(--line-2)", background: "var(--paper)",
      color: "var(--text)", fontSize: 13, outline: "none",
      resize: "vertical", fontFamily: "inherit",
      ...(p.style || {}),
    }} />
  </Field>
);

const Modal = ({ title, subtitle, onClose, children, footer, width = 560, bodyPadding = "1.25rem" }) => {
  React.useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(11,13,16,0.35)",
      zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, backdropFilter: "blur(2px)",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--paper)", borderRadius: 12,
        border: "1px solid var(--line)", boxShadow: "var(--shadow)",
        width: "100%", maxWidth: width, maxHeight: "92vh",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          padding: "1rem 1.25rem", borderBottom: "1px solid var(--line)",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em" }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{
            background: "transparent", border: "1px solid transparent",
            width: 28, height: 28, borderRadius: 6, cursor: "pointer",
            color: "var(--text-2)", display: "flex", alignItems: "center", justifyContent: "center",
          }} onMouseEnter={(e)=>e.currentTarget.style.background="var(--paper-2)"}
             onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}>
            <I.close size={15}/>
          </button>
        </div>
        <div style={{ padding: bodyPadding, overflowY: "auto", flex: 1 }}>
          {children}
        </div>
        {footer && (
          <div style={{
            padding: "0.875rem 1.25rem", borderTop: "1px solid var(--line)",
            display: "flex", justifyContent: "flex-end", gap: 8,
            background: "var(--paper-2)",
          }}>{footer}</div>
        )}
      </div>
    </div>
  );
};

const SectionTitle = ({ children, hint, action, style = {} }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: "0.75rem", ...style,
  }}>
    <div>
      <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: "-0.005em" }}>{children}</div>
      {hint && <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 1 }}>{hint}</div>}
    </div>
    {action}
  </div>
);

const Empty = ({ title = "Nothing here yet", body, action }) => (
  <div style={{
    padding: "2rem 1rem", textAlign: "center",
    color: "var(--text-2)", fontSize: 13,
  }}>
    <div style={{ fontWeight: 500, color: "var(--text)" }}>{title}</div>
    {body && <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>{body}</div>}
    {action && <div style={{ marginTop: 12 }}>{action}</div>}
  </div>
);

// Elegant divider with optional label
const Divider = ({ label, style = {} }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10,
    color: "var(--text-3)", fontSize: 11, fontWeight: 500,
    textTransform: "uppercase", letterSpacing: "0.08em",
    margin: "1rem 0", ...style,
  }}>
    {label && <span>{label}</span>}
    <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
  </div>
);

// Toast system (lightweight)
const ToastCtx = React.createContext(null);
const useToast = () => React.useContext(ToastCtx);
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([]);
  const push = (msg, kind = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div style={{
        position: "fixed", bottom: 22, right: 22, zIndex: 10000,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            background: "var(--ink)", color: "var(--paper)",
            padding: "10px 16px", borderRadius: 8, fontSize: 13,
            boxShadow: "var(--shadow)", maxWidth: 360,
            display: "flex", alignItems: "center", gap: 10,
            animation: "slideUp .25s ease-out",
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: t.kind === "danger" ? "var(--danger)"
                       : t.kind === "success" ? "#7fae8a"
                       : "var(--accent-soft)",
            }}/>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};

// Linked-case chips — render a row of case references, optionally clickable
const LinkedCaseChips = ({ ids = [], cases = [], goCase, size = "sm" }) => {
  if (!ids || ids.length === 0) return null;
  const byId = new Map((cases || []).map((c) => [c.id, c]));
  const fs = size === "xs" ? 10 : 11;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
      {ids.map((id) => {
        const c = byId.get(id);
        const clickable = c && goCase;
        return (
          <button key={id} type="button" disabled={!clickable}
            onClick={clickable ? (e) => { e.stopPropagation(); goCase(c); } : undefined}
            title={c?.title || id}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5, maxWidth: 220,
              padding: "2px 8px", borderRadius: 99, border: "1px solid var(--line)",
              background: "var(--paper-2)", cursor: clickable ? "pointer" : "default",
              font: "inherit",
            }}
            onMouseEnter={(e) => { if (clickable) e.currentTarget.style.borderColor = "var(--line-2)"; }}
            onMouseLeave={(e) => { if (clickable) e.currentTarget.style.borderColor = "var(--line)"; }}>
            <I.cases size={fs} stroke="var(--text-3)"/>
            <span className="mono" style={{ fontSize: fs, color: "var(--text-2)" }}>{id}</span>
            {c && <span style={{ fontSize: fs + 0.5, color: "var(--text-2)", overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</span>}
          </button>
        );
      })}
    </div>
  );
};

Object.assign(window, {
  STATUS_COLORS, STATUS_OVERRIDES, setStatusOverrides, useStatusOverrides,
  Pill, Tag, Avatar, Card, Btn, Field, LinkedCaseChips,
  Input, Sel, Textarea, Modal, SectionTitle, Empty, Divider,
  ToastProvider, useToast,
});
