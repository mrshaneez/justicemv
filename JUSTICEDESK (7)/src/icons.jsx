// ─── Minimal line icons (1.5px stroke) ───────────────────────────────────────

const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
       strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d}
  </svg>
);

const I = {
  dashboard: (p) => <Icon {...p} d={<><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></>} />,
  cases: (p) => <Icon {...p} d={<><path d="M4 5h16v14H4z"/><path d="M4 9h16"/><path d="M9 14h6"/></>} />,
  court: (p) => <Icon {...p} d={<><path d="M3 9 12 4l9 5"/><path d="M5 10v8M19 10v8M9 10v8M15 10v8"/><path d="M3 19h18"/></>} />,
  target: (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></>} />,
  check: (p) => <Icon {...p} d={<><path d="M3 5h12"/><path d="M3 12h9"/><path d="M3 19h13"/><path d="m17 8 2 2 4-5"/></>} />,
  inbox: (p) => <Icon {...p} d={<><path d="M3 13l2-8h14l2 8"/><path d="M3 13v6h18v-6"/><path d="M8 13a4 4 0 0 0 8 0"/></>} />,
  search: (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>} />,
  plus: (p) => <Icon {...p} d={<><path d="M12 5v14M5 12h14"/></>} />,
  chevronL: (p) => <Icon {...p} d={<path d="m15 18-6-6 6-6"/>} />,
  chevronR: (p) => <Icon {...p} d={<path d="m9 18 6-6-6-6"/>} />,
  chevronD: (p) => <Icon {...p} d={<path d="m6 9 6 6 6-6"/>} />,
  arrowUp: (p) => <Icon {...p} d={<><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></>} />,
  arrowR: (p) => <Icon {...p} d={<><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>} />,
  close: (p) => <Icon {...p} d={<><path d="M18 6 6 18M6 6l12 12"/></>} />,
  edit: (p) => <Icon {...p} d={<><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></>} />,
  trash: (p) => <Icon {...p} d={<><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="m5 6 1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14"/></>} />,
  filter: (p) => <Icon {...p} d={<path d="M3 5h18l-7 8v6l-4-2v-4z"/>} />,
  sparkle: (p) => <Icon {...p} d={<><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M18.5 5.5l-2.8 2.8M8.3 15.7l-2.8 2.8"/></>} />,
  warn: (p) => <Icon {...p} d={<><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.41 0z"/><path d="M12 9v4M12 17h.01"/></>} />,
  clock: (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>} />,
  lock: (p) => <Icon {...p} d={<><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>} />,
  user: (p) => <Icon {...p} d={<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>} />,
  gavel: (p) => <Icon {...p} d={<><path d="m14 14-7.5 7.5L3 18l7.5-7.5z"/><path d="m9.5 8.5 6 6"/><path d="M14 4l6 6-2 2-6-6z"/><path d="M3 21h18"/></>} />,
  doc: (p) => <Icon {...p} d={<><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M9 13h6M9 17h4"/></>} />,
  paperclip: (p) => <Icon {...p} d={<path d="M21.44 11.05 12.25 20.24a5 5 0 0 1-7.07-7.07l9.19-9.19a3 3 0 0 1 4.24 4.24l-9.2 9.19a1 1 0 0 1-1.41-1.41l8.49-8.49"/>} />,
  image: (p) => <Icon {...p} d={<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></>} />,
  stats: (p) => <Icon {...p} d={<><path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6"/><rect x="12" y="7" width="3" height="10"/><rect x="17" y="13" width="3" height="4"/></>} />,
  list: (p) => <Icon {...p} d={<><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></>} />,
  book: (p) => <Icon {...p} d={<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>} />,
  bell: (p) => <Icon {...p} d={<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10.5 21a2 2 0 0 0 3 0"/></>} />,
  cmd: (p) => <Icon {...p} d={<><path d="M9 6V18M15 6V18"/><path d="M6 9H18M6 15H18"/><circle cx="6" cy="6" r="1.5"/><circle cx="18" cy="6" r="1.5"/><circle cx="6" cy="18" r="1.5"/><circle cx="18" cy="18" r="1.5"/></>} />,
  flag: (p) => <Icon {...p} d={<><path d="M4 21V4M4 4l16 4-3 5 3 5H4"/></>} />,
  send: (p) => <Icon {...p} d={<><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></>} />,
  scales: (p) => <Icon {...p} d={<><path d="M12 3v18"/><path d="M5 21h14"/><path d="M6 8 3 14h6z"/><path d="M18 8l-3 6h6z"/><path d="M3 14a3 3 0 0 0 6 0"/><path d="M15 14a3 3 0 0 0 6 0"/><path d="M6 8h12"/></>} />,
  users: (p) => <Icon {...p} d={<><circle cx="9" cy="8" r="3.5"/><path d="M3 21a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15 14a4.5 4.5 0 0 1 6.5 4"/></>} />,
  building: (p) => <Icon {...p} d={<><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/><path d="M10 21v-3h4v3"/></>} />,
  userTag: (p) => <Icon {...p} d={<><circle cx="9" cy="8" r="3.5"/><path d="M3 21a6 6 0 0 1 12 0"/><path d="m16 13 5 5"/><path d="M21 13v5h-5"/></>} />,
  mail: (p) => <Icon {...p} d={<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>} />,
  print: (p) => <Icon {...p} d={<><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="1"/><rect x="6" y="14" width="12" height="7"/><circle cx="17" cy="12" r="0.6" fill="currentColor"/></>} />,
  share: (p) => <Icon {...p} d={<><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8 11l8-4M8 13l8 4"/></>} />,
  download: (p) => <Icon {...p} d={<><path d="M12 4v12"/><path d="m6 12 6 6 6-6"/><path d="M5 21h14"/></>} />,
  upload: (p) => <Icon {...p} d={<><path d="M12 20V8"/><path d="m6 12 6-6 6 6"/><path d="M5 4h14"/></>} />,
  tag: (p) => <Icon {...p} d={<><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="8" cy="8" r="1.5"/></>} />,
  bold: (p) => <Icon {...p} d={<><path d="M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z"/></>} />,
  italic: (p) => <Icon {...p} d={<><path d="M14 4 10 20M8 4h8M6 20h8"/></>} />,
  underline: (p) => <Icon {...p} d={<><path d="M7 4v8a5 5 0 0 0 10 0V4M5 21h14"/></>} />,
  phone: (p) => <Icon {...p} d={<path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 5a2 2 0 0 1 2-1z"/>} />,
  calendar: (p) => <Icon {...p} d={<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></>} />,
  signOut: (p) => <Icon {...p} d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></>} />,
};

window.I = I;
window.Icon = Icon;
