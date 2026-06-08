// ─── Courtrooms scheduler ────────────────────────────────────────────────────

const CourtroomsPage = ({ bookings, setBookings, cases, setModal }) => {
  const [weekStart, setWeekStart] = React.useState(() => {
    const d = new Date(today); d.setDate(d.getDate() - d.getDay()); return d;
  });
  const [selDate, setSelDate] = React.useState(fmt(today));
  const [viewBooking, setViewBooking] = React.useState(null);
  const weekDates = Array.from({ length: 7 }, (_, i) => fmt(addDays(weekStart, i)));
  const dayB = (d) => bookings.filter(b => b.date === d && b.status !== "Cancelled");

  const cancelBooking = (id) => {
    setBookings(p => p.map(b => b.id === id ? {...b, status: "Cancelled"} : b));
    setViewBooking(null);
  };

  if (viewBooking) {
    const b = bookings.find(x => x.id === viewBooking.id) || viewBooking;
    const hue = COURT_HUE[b.courtroom];
    return (
      <div>
        <button onClick={() => setViewBooking(null)} style={{
          fontSize: 12, color: "var(--text-2)", background: "transparent",
          border: "none", cursor: "pointer", padding: 0, marginBottom: 14,
          display: "inline-flex", alignItems: "center", gap: 4,
        }}>
          <I.chevronL size={13}/> Back to schedule
        </button>
        <Card padding="22px">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{
                width: 4, height: 56, background: hue.bar, borderRadius: 2, marginTop: 4,
              }}/>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--text-3)" }}>{b.caseId}</span>
                  <Pill label={b.status} dot/>
                </div>
                <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 6 }}>{b.caseTitle}</div>
                <div style={{ fontSize: 13, color: "var(--text-2)" }}>
                  {new Date(b.date+"T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  · <span className="mono">{b.timeStart}–{b.timeEnd}</span> · {b.courtroom}
                </div>
              </div>
            </div>
            {b.status === "Confirmed" && (
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="outline" onClick={() => { setViewBooking(null); setModal({ type: "editBooking", booking: b }); }}>Edit</Btn>
                <Btn variant="danger" onClick={() => cancelBooking(b.id)}>Cancel hearing</Btn>
              </div>
            )}
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden",
          }}>
            <div style={{ padding: 16, borderRight: "1px solid var(--line)" }}>
              <div style={{ fontSize: 10.5, color: "var(--text-3)", letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Bench</div>
              {b.judges.map((j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                  <Avatar name={j} size={24} tone="judge"/>
                  <span style={{ fontSize: 12 }}>{j.replace("Hon. ", "")}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: 16, borderRight: "1px solid var(--line)" }}>
              <div style={{ fontSize: 10.5, color: "var(--text-3)", letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Parties</div>
              {b.parties.map((p) => (
                <div key={p} style={{ fontSize: 12, marginBottom: 6, fontWeight: 500 }}>{p}</div>
              ))}
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 10.5, color: "var(--text-3)", letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Counsel</div>
              {b.lawyers.map((l) => (
                <div key={l} style={{ fontSize: 12, marginBottom: 6 }}>{l}</div>
              ))}
            </div>
          </div>
          {b.notes && (
            <div style={{ marginTop: 16, padding: 14, background: "var(--paper-2)", borderRadius: 8, fontSize: 12.5, color: "var(--text)" }}>
              <div style={{ fontSize: 10.5, color: "var(--text-3)", letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 500, marginBottom: 4 }}>Note</div>
              {b.notes}
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Day grid view (multi-court timeline)
  const HOURS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];
  const daySel = dayB(selDate).sort((a,b)=>a.timeStart.localeCompare(b.timeStart));
  const HOUR_HEIGHT = 64;
  const startMin = timeToMins("08:00");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>Courtrooms</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>
            {daySel.length} hearing{daySel.length !== 1 ? "s" : ""} on {new Date(selDate+"T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>
        <Btn variant="primary" leading={<I.plus size={14}/>} onClick={() => setModal("newBooking")}>Book courtroom</Btn>
      </div>

      {/* Week strip */}
      <Card padding={0} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            {new Date(weekDates[0]+"T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – {new Date(weekDates[6]+"T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setWeekStart(p => addDays(p, -7))} style={navBtnStyle}><I.chevronL size={13}/></button>
            <button onClick={() => { const d=new Date(today); d.setDate(d.getDate()-d.getDay()); setWeekStart(d); setSelDate(fmt(today)); }}
              style={{...navBtnStyle, width: "auto", padding: "0 10px", fontSize: 11.5}}>Today</button>
            <button onClick={() => setWeekStart(p => addDays(p, 7))} style={navBtnStyle}><I.chevronR size={13}/></button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {weekDates.map((d, i) => {
            const dt = new Date(d + "T00:00:00");
            const isSel = d === selDate;
            const isToday = d === fmt(today);
            const count = dayB(d).length;
            return (
              <button key={d} onClick={() => setSelDate(d)} style={{
                padding: "12px 10px",
                borderRight: i < 6 ? "1px solid var(--line)" : "none",
                background: isSel ? "var(--paper-2)" : "var(--paper)",
                border: "none", borderBottom: isSel ? "2px solid var(--ink)" : "2px solid transparent",
                cursor: "pointer", textAlign: "left",
              }}>
                <div style={{ fontSize: 10.5, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 500 }}>
                  {WEEK_DAYS[dt.getDay()]}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 3 }}>
                  <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.02em", color: isToday ? "var(--accent)" : "var(--text)" }}>{dt.getDate()}</span>
                  {count > 0 && <span style={{ fontSize: 10.5, color: "var(--text-3)" }}>{count} hr</span>}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Day grid by courtroom */}
      <Card padding={0}>
        <div style={{ display: "grid", gridTemplateColumns: "60px repeat(3, 1fr)", borderBottom: "1px solid var(--line)" }}>
          <div></div>
          {COURTS.map((c) => {
            const hue = COURT_HUE[c];
            return (
              <div key={c} style={{ padding: "12px 16px", borderLeft: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: hue.bar }}/>
                <span style={{ fontSize: 12.5, fontWeight: 500 }}>{c}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "60px repeat(3, 1fr)", position: "relative" }}>
          {/* Time column */}
          <div>
            {HOURS.map((h) => (
              <div key={h} className="mono" style={{
                height: HOUR_HEIGHT, padding: "6px 8px",
                fontSize: 10.5, color: "var(--text-3)",
                textAlign: "right",
                borderBottom: "1px solid var(--line-soft)",
              }}>{h}</div>
            ))}
          </div>
          {COURTS.map((c) => {
            const events = daySel.filter(b => b.courtroom === c);
            return (
              <div key={c} style={{ position: "relative", borderLeft: "1px solid var(--line)" }}>
                {HOURS.map((h, i) => (
                  <div key={h} style={{ height: HOUR_HEIGHT, borderBottom: "1px solid var(--line-soft)" }}/>
                ))}
                {events.map((b) => {
                  const top = ((timeToMins(b.timeStart) - startMin) / 60) * HOUR_HEIGHT;
                  const height = ((timeToMins(b.timeEnd) - timeToMins(b.timeStart)) / 60) * HOUR_HEIGHT;
                  const hue = COURT_HUE[c];
                  return (
                    <div key={b.id} onClick={() => setViewBooking(b)} style={{
                      position: "absolute", left: 6, right: 6,
                      top: `${top}px`, height: `${Math.max(height - 2, 30)}px`,
                      background: hue.soft,
                      borderLeft: `3px solid ${hue.bar}`,
                      borderRadius: 6, padding: "6px 10px",
                      cursor: "pointer", overflow: "hidden",
                    }}>
                      <div style={{ fontSize: 11.5, fontWeight: 500, lineHeight: 1.25, marginBottom: 2 }}>{b.caseTitle}</div>
                      <div className="mono" style={{ fontSize: 10, color: "var(--text-2)" }}>{b.timeStart}–{b.timeEnd}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

window.CourtroomsPage = CourtroomsPage;
