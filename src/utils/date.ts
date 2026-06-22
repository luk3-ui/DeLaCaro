export function formatHeaderDate(date = new Date()): string {
  const formatted = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
