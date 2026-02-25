import { WeekData, DailyPlan, Habit } from '../types';
import { formatDateKey, getWeekDays } from '../constants';

/**
 * Create a new empty week structure
 */
export const createEmptyWeek = (date: Date): WeekData => {
  const weekDates = getWeekDays(date);
  const weekStartDate = formatDateKey(weekDates[0]); // Monday
  const weekEndDate = formatDateKey(weekDates[6]); // Sunday
  const now = Date.now();

  const dailyPlans: Record<string, DailyPlan> = {};
  weekDates.forEach(d => {
    const dateKey = formatDateKey(d);
    dailyPlans[dateKey] = {
      focus: '',
      todos: [],
      notes: '',
      events: [],
    };
  });

  return {
    weekStartDate,
    weekEndDate,
    goals: { business: [], personal: [] },
    dailyPlans,
    meetings: [],
    notes: '',
    habits: [], // Start empty - user creates habits as needed
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Get the week data key for storage
 */
export const getWeekStorageKey = (date: Date): string => {
  const weekDates = getWeekDays(date);
  const weekStart = formatDateKey(weekDates[0]);
  return `omni_week_${weekStart}`;
};

/**
 * Get or create week data for a given date
 */
export const getOrCreateWeek = (
  date: Date,
  allWeeks: Record<string, WeekData>
): WeekData => {
  const key = getWeekStorageKey(date);
  if (allWeeks[key]) {
    return allWeeks[key];
  }
  
  const newWeek = createEmptyWeek(date);
  const newDates = getWeekDays(date);
  
  // Collect habits from ALL previous weeks (by ID, to avoid duplicates)
  const habitMap = new Map<string, Habit>();
  let currentDate = new Date(date);
  currentDate.setDate(currentDate.getDate() - 7);
  
  for (let i = 0; i < 520; i++) { // Look back up to 10 years
    const prevWeekKey = getWeekStorageKey(currentDate);
    const prevWeek = allWeeks[prevWeekKey];
    
    if (prevWeek && prevWeek.habits) {
      // Add or update habits (keyed by ID to prevent duplicates)
      prevWeek.habits.forEach(h => {
        if (!h.deletedAt && !habitMap.has(h.id)) {
          habitMap.set(h.id, h);
        }
      });
    }
    
    currentDate.setDate(currentDate.getDate() - 7);
  }
  
  // Convert habit map to array with reset completions
  if (habitMap.size > 0) {
    newWeek.habits = Array.from(habitMap.values())
      .filter(h => !h.deletedAt)
      .map(h => ({
        ...h,
        completions: {}, // Reset completions for new week
        createdAt: h.createdAt, // Keep original creation date
      }));
  }
  
  // Copy repeating events from previous weeks to corresponding days
  currentDate = new Date(date);
  currentDate.setDate(currentDate.getDate() - 7);
  
  for (let i = 0; i < 520; i++) {
    const prevWeekKey = getWeekStorageKey(currentDate);
    const prevWeek = allWeeks[prevWeekKey];
    
    if (prevWeek && prevWeek.dailyPlans) {
      const prevDates = getWeekDays(currentDate);
      
      prevDates.forEach((prevDate, dayIndex) => {
        const prevDayPlan = prevWeek.dailyPlans[formatDateKey(prevDate)];
        if (prevDayPlan && prevDayPlan.events && dayIndex < newDates.length) {
          const newDateKey = formatDateKey(newDates[dayIndex]);
          const newDayPlan = newWeek.dailyPlans[newDateKey];
          
          // Copy repeating events
          const repeatingEvents = prevDayPlan.events.filter(e => e.repeating !== false);
          newDayPlan.events = repeatingEvents.map(e => ({
            ...e,
            id: `${e.id}-${Date.now()}`, // Create new ID
          }));
        }
      });
      
      break; // Only copy events from the most recent week with data
    }
    
    currentDate.setDate(currentDate.getDate() - 7);
  }
  
  return newWeek;
};

/**
 * Get all weeks from local storage
 */
export const getAllWeeks = (): Record<string, WeekData> => {
  const saved = localStorage.getItem('omni_all_weeks');
  return saved ? JSON.parse(saved) : {};
};

/**
 * Save all weeks to local storage
 */
export const saveAllWeeks = (weeks: Record<string, WeekData>) => {
  localStorage.setItem('omni_all_weeks', JSON.stringify(weeks));
};

/**
 * Update a specific week
 */
export const updateWeek = (weekKey: string, weekData: WeekData) => {
  const allWeeks = getAllWeeks();
  allWeeks[weekKey] = {
    ...weekData,
    updatedAt: Date.now(),
  };
  saveAllWeeks(allWeeks);
  return allWeeks;
};

/**
 * Get weeks for a date range (e.g., to populate monthly view)
 */
export const getWeeksInRange = (
  startDate: Date,
  endDate: Date,
  allWeeks: Record<string, WeekData>
): WeekData[] => {
  const weeks: WeekData[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const week = getOrCreateWeek(current, allWeeks);
    // Avoid duplicates
    if (!weeks.find(w => w.weekStartDate === week.weekStartDate)) {
      weeks.push(week);
    }
    current.setDate(current.getDate() + 7);
  }
  
  return weeks;
};

/**
 * Get combined daily plans for all days of a week for aggregated monthly view
 */
export const getWeekSummary = (weekData: WeekData) => {
  return {
    weekStart: weekData.weekStartDate,
    weekEnd: weekData.weekEndDate,
    businessGoals: weekData.goals.business,
    personalGoals: weekData.goals.personal,
    totalTodos: Object.values(weekData.dailyPlans).reduce(
      (sum, day) => sum + day.todos.length,
      0
    ),
    totalEvents: Object.values(weekData.dailyPlans).reduce(
      (sum, day) => sum + day.events.length,
      0
    ),
    completedTodos: Object.values(weekData.dailyPlans).reduce(
      (sum, day) => sum + day.todos.filter(t => t.done).length,
      0
    ),
  };
};

/**
 * Calculate habit streak statistics across all time (not just current week)
 */
export const calculateHabitStreak = (habit: Habit, weekDates: Date[]) => {
  const dateKeys = weekDates.map(d => formatDateKey(d));
  const completions = dateKeys.map(key => !!habit.completions[key]);
  const totalDays = completions.filter(Boolean).length;

  if (dateKeys.length === 0) {
    return { current: 0, longest: 0, totalDays: 0, percentageComplete: 0 };
  }

  // Calculate longest streak within the week
  let longest = 0;
  let temp = 0;
  completions.forEach(done => {
    if (done) {
      temp += 1;
      longest = Math.max(longest, temp);
    } else {
      temp = 0;
    }
  });

  // Current streak up to today within the week
  const todayKey = formatDateKey(new Date());
  const todayIdx = dateKeys.indexOf(todayKey);
  const endIdx = todayIdx === -1 ? dateKeys.length - 1 : todayIdx;
  let current = 0;
  for (let i = endIdx; i >= 0; i--) {
    if (completions[i]) current += 1;
    else break;
  }

  const percentageComplete = Math.round((totalDays / dateKeys.length) * 100);
  return { current, longest, totalDays, percentageComplete };
};

/**
 * Filter habits for a week - show all non-deleted habits
 */
export const getActiveHabitsForWeek = (allHabits: Habit[], weekStartDate: string) => {
  const weekStart = new Date(weekStartDate);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartMs = weekStart.getTime();
  const weekEndMs = weekStartMs + (7 * 24 * 60 * 60 * 1000) - 1;

  return allHabits.filter(habit => {
    const createdAt = habit.createdAt ?? 0;
    const deletedAt = habit.deletedAt ?? Number.POSITIVE_INFINITY;
    return createdAt <= weekEndMs && deletedAt > weekEndMs;
  });
};

/**
 * Handle habit deletion - marks as deleted from now forward
 */
export const deleteHabitFromWeek = (habit: Habit, weekStartDate: string): Habit => {
  return {
    ...habit,
    deletedAt: Date.now(), // Mark as deleted NOW, not at week start
  };
};
