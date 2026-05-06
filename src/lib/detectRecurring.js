// Detects subscriptions — same description appearing every ~30 days
export function detectRecurring(transactions) {
  if (!transactions || transactions.length === 0) return [];
  
  const grouped = {};
  for (const t of transactions) {
    const key = t.description?.toLowerCase().trim();
    if (!key) continue;
    grouped[key] = grouped[key] || [];
    grouped[key].push(new Date(t.date));
  }

  const recurring = [];
  for (const [name, dates] of Object.entries(grouped)) {
    if (dates.length < 2) continue;
    dates.sort((a, b) => a - b);
    const gaps = dates.slice(1).map((d, i) =>
      (d - dates[i]) / (1000 * 60 * 60 * 24)
    );
    const avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;
    // Look for approximately monthly intervals (25-35 days)
    if (avgGap >= 25 && avgGap <= 35) recurring.push(name);
  }
  return recurring;
}
