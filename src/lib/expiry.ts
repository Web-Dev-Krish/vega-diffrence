// Returns the next weekly expiry date (Thursday) for Indian index options.
// If today is Thursday and before 15:30 IST, returns today; otherwise next Thursday.
export const getNextWeeklyExpiry = (): string => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);

  const day = istTime.getUTCDay();
  const hour = istTime.getUTCHours();
  const minute = istTime.getUTCMinutes();

  let daysUntilThursday = (4 - day + 7) % 7;
  // If today is Thursday but market has closed (after 15:30 IST), use next Thursday.
  if (day === 4 && (hour > 10 || (hour === 10 && minute >= 0))) {
    // 15:30 IST = 10:00 UTC
    daysUntilThursday = 7;
  }

  const expiry = new Date(istTime.getTime() + daysUntilThursday * 24 * 60 * 60 * 1000);
  return expiry.toISOString().split('T')[0];
};

// Format YYYY-MM-DD to a more readable form.
export const formatExpiry = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
