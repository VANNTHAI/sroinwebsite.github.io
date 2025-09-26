// Format date as "Day, Month Date, Year"
export function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format day name
export function formatDay(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// Format time as "HH:MM AM/PM"
export function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Convert Kelvin to Celsius or Fahrenheit
export function kelvinToUnit(kelvin, unit) {
  if (unit === 'celsius') {
    return kelvin - 273.15;
  } else {
    return (kelvin - 273.15) * 9/5 + 32;
  }
}