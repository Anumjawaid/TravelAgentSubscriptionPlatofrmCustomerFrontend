// Small inline SVG icons (no icon library needed). They inherit the text colour via currentColor.
const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const PinIcon = (props) => (
  <svg {...base} {...props}><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);
export const FlagIcon = (props) => (
  <svg {...base} {...props}><path d="M5 21V4m0 1h11l-2 4 2 4H5" /></svg>
);
export const CalendarIcon = (props) => (
  <svg {...base} {...props}><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4m8-4v4" /></svg>
);
export const ClockIcon = (props) => (
  <svg {...base} {...props}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
);
export const UsersIcon = (props) => (
  <svg {...base} {...props}><circle cx="9" cy="8.5" r="3.2" /><path d="M3 20c.4-3.4 3-5.5 6-5.5s5.6 2.1 6 5.5" /><path d="M16 5.6a3.2 3.2 0 0 1 0 5.8M18 14.7c1.6.6 2.8 2.2 3 5.3" /></svg>
);
export const ArrowRightIcon = (props) => (
  <svg {...base} {...props}><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
);
export const CheckIcon = (props) => (
  <svg {...base} {...props}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const TagIcon = (props) => (
  <svg {...base} {...props}><path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.5 1.5 0 0 1 0 2.1l-5.6 5.6a1.5 1.5 0 0 1-2.1 0L3.5 12.2Z" /><circle cx="8" cy="8" r="1.3" /></svg>
);
export const MailIcon = (props) => (
  <svg {...base} {...props}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7.5 8 6 8-6" /></svg>
);
export const ShieldIcon = (props) => (
  <svg {...base} {...props}><path d="M12 3 5 6v5.5c0 4.2 3 7.6 7 9.5 4-1.9 7-5.3 7-9.5V6l-7-3Z" /><path d="m9 12 2.2 2.2L15 10.5" /></svg>
);
