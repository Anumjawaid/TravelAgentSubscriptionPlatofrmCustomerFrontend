export function formatMoney(amount, currency = 'GBP') {
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * "2026-10-15" -> "Thursday 15 October 2026".
 * Built by hand (not Intl) so every browser prints exactly the same text, and there is no timezone
 * maths: the string is a plain calendar date.
 */
export function formatDate(isoDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate || '');
  if (!match) return '';
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCMonth() !== m - 1) return ''; // e.g. 2026-02-31
  return `${WEEKDAYS[date.getUTCDay()]} ${d} ${MONTHS[m - 1]} ${y}`;
}

/** Today's date in the visitor's own timezone as YYYY-MM-DD (for <input type="date" min=...>). */
export function todayIso() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
