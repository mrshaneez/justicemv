// ─── Status customization — admin Settings → Statuses ─────────────────────
// Five status sets, editable name + colour. Writes flow through
// setStatusOverrides() so every Pill across the app updates live.

// Curated palette mapped to existing tokens — paired bg + fg pulled from
// the design system so customised pills still feel native.
const STATUS_PALETTE = [
  { id: "neutral", label: "Neutral", bg: "var(--paper-3)",     fg: "var(--text-2)",   sample: "#ebebe5" },
  { id: "ink",     label: "Ink",     bg: "#e7e7e2",            fg: "#0b0d10",         sample: "#0b0d10" },
  { id: "accent",  label: "Teal",    bg: "var(--accent-soft)", fg: "var(--accent)",   sample: "#1f3a3d" },
  { id: "success", label: "Green",   bg: "var(--success-soft)",fg: "var(--success)",  sample: "#2d5a3d" },
  { id: "warn",    label: "Amber",   bg: "var(--warn-soft)",   fg: "var(--warn)",     sample: "#8b6914" },
  { id: "danger",  label: "Red",     bg: "var(--danger-soft)", fg: "var(--danger)",   sample: "#a02d2a" },
  { id: "indigo",  label: "Indigo",  bg: "#e6e7f1",            fg: "#3b3f78",         sample: "#3b3f78" },
  { id: "plum",    label: "Plum",    bg: "#efe6ec",            fg: "#6b3a5c",         sample: "#6b3a5c" },
];

// Default starting sets for each status type
const DEFAULT_STATUS_SETS = {
  case:    ["Active", "Pending", "Closed"],
  request: ["Pending", "Approved", "Rejected"],
  task:    ["Open", "Done"],
  target:  ["Scheduled", "Completed", "Cancelled"],
  hearing: ["Scheduled", "Adjourned", "Completed", "Cancelled"],
};

const STATUS_SET_LABELS = {
  case:    { label: "Case",    desc: "Lifecycle of cases on the docket." },
  request: { label: "Request", desc: "Counsel-submitted requests awaiting registry action." },
  task:    { label: "Task",    desc: "Internal task tracking on each case." },
  target:  { label: "Target",  desc: "Scheduled disposition targets." },
  hearing: { label: "Hearing", desc: "Outcome of each scheduled hearing." },
};

// Initial seed for the editable store — mirrors STATUS_COLORS palette ids
const DEFAULT_TONE_FOR = {
  Active: "success", Pending: "warn", Closed: "neutral",
  Scheduled: "accent", Completed: "success", Adjourned: "warn",
  Confirmed: "accent", Cancelled: "danger",
  Approved: "success", Rejected: "danger",
  Open: "neutral", Done: "success",
};

function paletteEntry(id) {
  return STATUS_PALETTE.find((p) => p.id === id) || STATUS_PALETTE[0];
}

// ── StatusesPage ────────────────────────────────────────────────────────────
const StatusesPage = ({ statusSets, setStatusSets }) => {
  const toast = useToast();
  const [editing, setEditing] = React.useState(null); // { setId, status } or { setId, status: null } for new
  const [activeSet, setActiveSet] = React.useState("case");

  const removeStatus = (setId, statusName) => {
    setStatusSets((p) => ({ ...p, [setId]: p[setId].filter((s) => s.name !== statusName) }));
    toast(`Removed "${statusName}"`, "success");
  };

  return (
    <div style={{ maxWidth: 980 }}>
      <div style={{
        padding: "12px 14px", marginBottom: 16,
        background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 6,
        display: "flex", gap: 12, alignItems: "flex-start",
      }}>
        <I.sparkle size={14} stroke="var(--text-2)" style={{ marginTop: 2 }}/>
        <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.55 }}>
          Customize the status values used across the system. Renaming a status
          updates its colour everywhere it appears — pills on the dashboard,
          case lists, requests, tasks, targets, and hearings all read from this
          registry. The lists below aren't exhaustive; add what your registry needs.
        </div>
      </div>

      {/* Tab strip per set */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--line)", marginBottom: 20 }}>
        {Object.keys(STATUS_SET_LABELS).map((id) => (
          <button key={id} onClick={() => setActiveSet(id)} style={{
            padding: "8px 14px", background: "transparent", border: "none",
            borderBottom: activeSet === id ? "2px solid var(--ink)" : "2px solid transparent",
            color: activeSet === id ? "var(--text)" : "var(--text-2)",
            fontSize: 13, fontWeight: activeSet === id ? 500 : 400,
            cursor: "pointer", marginBottom: -1,
          }}>
            {STATUS_SET_LABELS[id].label}
            <span style={{ color: "var(--text-3)", marginLeft: 6 }}>
              {(statusSets[id] || []).length}
            </span>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <div style={{ fontSize: 12.5, color: "var(--text-2)" }}>
          {STATUS_SET_LABELS[activeSet].desc}
        </div>
        <Btn variant="primary" size="sm" leading={<I.plus size={12}/>}
          onClick={() => setEditing({ setId: activeSet, status: null })}>
          Add status
        </Btn>
      </div>

      <Card padding="0">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)" }}>
              <th style={thS}>Preview</th>
              <th style={thS}>Name</th>
              <th style={thS}>Colour</th>
              <th style={{ ...thS, width: 1 }}></th>
            </tr>
          </thead>
          <tbody>
            {(statusSets[activeSet] || []).map((s) => (
              <tr key={s.name} style={{ borderBottom: "1px solid var(--line-soft)" }}>
                <td style={tdS}><Pill label={s.name}/></td>
                <td style={tdS}><span style={{ fontWeight: 500 }}>{s.name}</span></td>
                <td style={tdS}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 14, height: 14, borderRadius: 3,
                      background: s.bg, border: "1px solid var(--line)" }}/>
                    <span style={{ fontSize: 11.5, color: "var(--text-2)" }} className="mono">
                      {s.paletteId === "custom" ? s.bg : paletteEntry(s.paletteId).label}
                    </span>
                  </div>
                </td>
                <td style={{ ...tdS, textAlign: "right", whiteSpace: "nowrap" }}>
                  <Btn size="sm" leading={<I.edit size={11}/>}
                    onClick={() => setEditing({ setId: activeSet, status: s })}>Edit</Btn>
                  <span style={{ marginLeft: 6 }}/>
                  <Btn size="sm" leading={<I.trash size={11}/>}
                    onClick={() => removeStatus(activeSet, s.name)}>Remove</Btn>
                </td>
              </tr>
            ))}
            {(statusSets[activeSet] || []).length === 0 && (
              <tr><td colSpan={4} style={{ padding: 32, textAlign: "center", color: "var(--text-3)", fontSize: 12.5 }}>
                No statuses in this set yet.
              </td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {editing && (
        <StatusEditModal editing={editing} statusSets={statusSets}
          setStatusSets={setStatusSets} onClose={() => setEditing(null)}/>
      )}
    </div>
  );
};

const thS = { textAlign: "left", padding: "10px 16px", fontSize: 11,
  color: "var(--text-3)", fontWeight: 500, letterSpacing: "0.04em",
  textTransform: "uppercase" };
const tdS = { padding: "12px 16px", fontSize: 13, verticalAlign: "middle" };

// ── Edit / new status modal ─────────────────────────────────────────────────
const StatusEditModal = ({ editing, statusSets, setStatusSets, onClose }) => {
  const toast = useToast();
  const isNew = !editing.status;
  const initial = editing.status || { name: "", paletteId: "neutral", bg: "var(--paper-3)", fg: "var(--text-2)" };
  const [name, setName] = React.useState(initial.name);
  const [paletteId, setPaletteId] = React.useState(initial.paletteId || "neutral");
  const [customBg, setCustomBg] = React.useState(
    initial.paletteId === "custom" ? initial.bg : "#e7e7e2");
  const [customFg, setCustomFg] = React.useState(
    initial.paletteId === "custom" ? initial.fg : "#0b0d10");

  const isCustom = paletteId === "custom";
  const previewBg = isCustom ? customBg : paletteEntry(paletteId).bg;
  const previewFg = isCustom ? customFg : paletteEntry(paletteId).fg;

  const onSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const next = { name: trimmed, paletteId, bg: previewBg, fg: previewFg };
    setStatusSets((p) => {
      const list = [...(p[editing.setId] || [])];
      if (isNew) {
        if (list.find((s) => s.name === trimmed)) return p;
        list.push(next);
      } else {
        const idx = list.findIndex((s) => s.name === editing.status.name);
        if (idx >= 0) list[idx] = next;
      }
      return { ...p, [editing.setId]: list };
    });
    toast(isNew ? `Added "${trimmed}"` : `Updated "${trimmed}"`, "success");
    onClose();
  };

  return (
    <Modal title={isNew ? "Add status" : `Edit "${editing.status.name}"`}
      subtitle={`${STATUS_SET_LABELS[editing.setId].label} statuses`}
      onClose={onClose} width={520}
      footer={<>
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={onSave} disabled={!name.trim()}>
          {isNew ? "Add" : "Save"}
        </Btn>
      </>}>
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Reserved"/>

      {/* Live preview */}
      <Field label="Preview">
        <div style={{
          padding: 16, background: "var(--paper-2)", borderRadius: 6,
          border: "1px solid var(--line)",
          display: "flex", gap: 10, alignItems: "center",
        }}>
          <span style={{
            background: previewBg, color: previewFg,
            padding: "3px 9px", borderRadius: 99,
            fontSize: 11.5, fontWeight: 500, letterSpacing: "-0.005em",
          }}>{name.trim() || "Status"}</span>
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>
            ← updates everywhere this status appears
          </span>
        </div>
      </Field>

      {/* Palette swatches */}
      <Field label="Palette" hint="Curated tones from the design system.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {STATUS_PALETTE.map((p) => (
            <button key={p.id} type="button" onClick={() => setPaletteId(p.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 10px",
                border: `1px solid ${paletteId === p.id ? "var(--ink)" : "var(--line)"}`,
                background: paletteId === p.id ? "var(--paper-2)" : "var(--paper)",
                borderRadius: 6, cursor: "pointer", textAlign: "left",
              }}>
              <span style={{ background: p.bg, color: p.fg,
                width: 22, height: 18, borderRadius: 99, display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600,
                border: "1px solid var(--line)" }}>Aa</span>
              <span style={{ fontSize: 12, color: "var(--text)" }}>{p.label}</span>
            </button>
          ))}
        </div>
      </Field>

      {/* Custom hex */}
      <Field label="Or use a custom hex"
        hint="Pick any background + text colour combination.">
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button type="button" onClick={() => setPaletteId("custom")}
            style={{
              padding: "5px 11px", borderRadius: 6,
              border: `1px solid ${isCustom ? "var(--ink)" : "var(--line)"}`,
              background: isCustom ? "var(--paper-2)" : "var(--paper)",
              fontSize: 11.5, color: "var(--text)", cursor: "pointer", fontWeight: 500,
            }}>Custom</button>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--text-2)" }}>
            BG
            <input type="color" value={customBg}
              onChange={(e) => { setCustomBg(e.target.value); setPaletteId("custom"); }}
              style={{ width: 32, height: 28, border: "1px solid var(--line)", borderRadius: 4, padding: 2, background: "var(--paper)" }}/>
            <input value={customBg}
              onChange={(e) => { setCustomBg(e.target.value); setPaletteId("custom"); }}
              style={{ width: 80, padding: "4px 6px", border: "1px solid var(--line)", borderRadius: 4, fontSize: 11.5 }} className="mono"/>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--text-2)" }}>
            FG
            <input type="color" value={customFg}
              onChange={(e) => { setCustomFg(e.target.value); setPaletteId("custom"); }}
              style={{ width: 32, height: 28, border: "1px solid var(--line)", borderRadius: 4, padding: 2, background: "var(--paper)" }}/>
            <input value={customFg}
              onChange={(e) => { setCustomFg(e.target.value); setPaletteId("custom"); }}
              style={{ width: 80, padding: "4px 6px", border: "1px solid var(--line)", borderRadius: 4, fontSize: 11.5 }} className="mono"/>
          </label>
        </div>
      </Field>
    </Modal>
  );
};

// Build initial statusSets state from the seed defaults
function buildInitialStatusSets() {
  const out = {};
  Object.entries(DEFAULT_STATUS_SETS).forEach(([setId, names]) => {
    out[setId] = names.map((n) => {
      const tone = DEFAULT_TONE_FOR[n] || "neutral";
      const p = paletteEntry(tone);
      return { name: n, paletteId: tone, bg: p.bg, fg: p.fg };
    });
  });
  return out;
}

// Flatten statusSets into a single { name → {bg,fg} } map and push to the
// override store so Pill picks up the new colours.
function flattenStatusSets(sets) {
  const out = {};
  Object.values(sets || {}).forEach((arr) => {
    (arr || []).forEach((s) => { out[s.name] = { bg: s.bg, fg: s.fg }; });
  });
  return out;
}

window.StatusesPage = StatusesPage;
window.StatusEditModal = StatusEditModal;
window.buildInitialStatusSets = buildInitialStatusSets;
window.flattenStatusSets = flattenStatusSets;
window.DEFAULT_STATUS_SETS = DEFAULT_STATUS_SETS;
window.STATUS_SET_LABELS = STATUS_SET_LABELS;
window.STATUS_PALETTE = STATUS_PALETTE;
