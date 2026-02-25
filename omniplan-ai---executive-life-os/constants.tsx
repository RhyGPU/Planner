export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const START_HOUR = 0;
export const END_HOUR = 24;
export const STEP = 0.5;
export const PIXELS_PER_HOUR = 80;

export const formatDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

export const getWeekDays = (date: Date) => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(start);
  monday.setDate(diff);
  const week = [];
  for (let i = 0; i < 7; i++) {
    const next = new Date(monday);
    next.setDate(monday.getDate() + i);
    week.push(next);
  }
  return week;
};

export const formatHour = (hour: number) => {
  const h = Math.floor(hour);
  const m = (hour % 1) === 0.5 ? '30' : '00';
  const ampm = h >= 12 && h < 24 ? 'PM' : 'AM';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${m} ${ampm}`;
};

export const generateTimeSlots = () => {
  const slots: number[] = [];
  for (let i = START_HOUR; i < END_HOUR; i += STEP) slots.push(i);
  return slots;
};
