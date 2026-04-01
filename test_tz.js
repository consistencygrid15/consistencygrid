const currentUTC = new Date('2026-03-25T18:35:00Z'); // 18:30 UTC is 00:00 IST
const tz = 'Asia/Kolkata';
const localHour = parseInt(
  new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hourCycle: 'h23',
    timeZone: tz,
  }).format(currentUTC),
  10
);
console.log('Local Hour:', localHour);
