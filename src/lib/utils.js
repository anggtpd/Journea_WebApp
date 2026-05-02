export function calculateStreak(entries) {
  if (!entries || entries.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dates = entries.map(e => {
    const d = new Date(e.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  const uniqueSortedDates = [...new Set(dates)].sort((a, b) => b - a);
  const latestEntryDate = uniqueSortedDates[0];

  // If the latest entry isn't today or yesterday, the streak is broken
  if (latestEntryDate !== today.getTime() && latestEntryDate !== yesterday.getTime()) {
    return 0;
  }

  let streak = 0;
  let expectedDate = latestEntryDate;

  for (const d of uniqueSortedDates) {
    if (d === expectedDate) {
      streak++;
      expectedDate -= 86400000; // Move to the previous day
    } else {
      break;
    }
  }

  return streak;
}
