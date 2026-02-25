# Implementation Guide - Week-Isolated Architecture

## Quick Reference for Developers

### Using Week Data in Components

#### Getting Current Week Data
```tsx
// In WeeklyPlannerView
const weekData = currentWeek;  // Already provided as prop
```

#### Updating Week Data
```tsx
// Simple update
updateCurrentWeek({
  ...currentWeek,
  goals: {
    business: newBusinessGoals,
    personal: newPersonalGoals
  }
});

// Update specific day
const updatedPlans = { ...currentWeek.dailyPlans };
updatedPlans[dateKey] = { 
  ...updatedPlans[dateKey],
  focus: newFocus
};
updateCurrentWeek({ ...currentWeek, dailyPlans: updatedPlans });
```

#### Adding Items
```tsx
// Add to-do for a day
const dateKey = formatDateKey(date);
const updatedPlans = { ...currentWeek.dailyPlans };
updatedPlans[dateKey].todos.push({
  id: `t-${Date.now()}`,
  text: newTodoText,
  done: false
});
updateCurrentWeek({ ...currentWeek, dailyPlans: updatedPlans });

// Add meeting
updateCurrentWeek({
  ...currentWeek,
  meetings: [
    ...currentWeek.meetings,
    { id: `m-${Date.now()}`, text: meetingTitle, done: false }
  ]
});
```

### Querying Week Data in Views

#### Monthly View - Get Day Data
```tsx
// Get all weeks in month
const weeksInMonth = getWeeksInRange(monthStart, monthEnd, allWeeks);

// Get specific day data
const getDayData = (dateKey: string) => {
  for (const week of weeksInMonth) {
    if (week.dailyPlans[dateKey]) {
      return week.dailyPlans[dateKey];
    }
  }
  return null;
};

// Use it
const dayPlan = getDayData("2026-01-20");
const focus = dayPlan?.focus;
const events = dayPlan?.events || [];
```

#### Accessing Week Properties
```tsx
// From WeekData object
currentWeek.goals.business        // string[]
currentWeek.goals.personal        // string[]
currentWeek.dailyPlans            // Record<dateKey, DailyPlan>
currentWeek.meetings              // Todo[]
currentWeek.habits                // Habit[]
currentWeek.notes                 // string (week overview)
currentWeek.weekStartDate         // string "YYYY-MM-DD"
currentWeek.weekEndDate           // string "YYYY-MM-DD"
currentWeek.createdAt             // number (timestamp)
currentWeek.updatedAt             // number (timestamp)
```

#### Accessing Daily Plan Properties
```tsx
// From DailyPlan object
dayPlan.focus                     // string (main priority)
dayPlan.todos                     // Todo[]
dayPlan.notes                     // string (daily notes)
dayPlan.events                    // CalendarEvent[]
```

---

## Common Patterns

### Pattern 1: Edit Text for Day
```tsx
const handleFocusChange = (dateKey: string, newFocus: string) => {
  const updatedPlans = { ...currentWeek.dailyPlans };
  updatedPlans[dateKey] = {
    ...updatedPlans[dateKey],
    focus: newFocus
  };
  updateCurrentWeek({ ...currentWeek, dailyPlans: updatedPlans });
};

// In JSX
<textarea 
  value={currentWeek.dailyPlans[dateKey]?.focus || ""}
  onChange={(e) => handleFocusChange(dateKey, e.target.value)}
/>
```

### Pattern 2: Toggle Todo
```tsx
const handleToggleTodo = (dateKey: string, todoId: string) => {
  const updatedPlans = { ...currentWeek.dailyPlans };
  updatedPlans[dateKey] = {
    ...updatedPlans[dateKey],
    todos: updatedPlans[dateKey].todos.map(t => 
      t.id === todoId ? { ...t, done: !t.done } : t
    )
  };
  updateCurrentWeek({ ...currentWeek, dailyPlans: updatedPlans });
};
```

### Pattern 3: Add Event to Day
```tsx
const handleAddEvent = (dateKey: string, event: CalendarEvent) => {
  const updatedPlans = { ...currentWeek.dailyPlans };
  updatedPlans[dateKey].events.push(event);
  updateCurrentWeek({ ...currentWeek, dailyPlans: updatedPlans });
};
```

### Pattern 4: Edit Week Goals
```tsx
const handleAddBusinessGoal = (goal: string) => {
  updateCurrentWeek({
    ...currentWeek,
    goals: {
      ...currentWeek.goals,
      business: [...currentWeek.goals.business, goal]
    }
  });
};

const handleRemoveBusinessGoal = (index: number) => {
  updateCurrentWeek({
    ...currentWeek,
    goals: {
      ...currentWeek.goals,
      business: currentWeek.goals.business.filter((_, i) => i !== index)
    }
  });
};
```

### Pattern 5: Delete Item from Day
```tsx
const handleDeleteEvent = (dateKey: string, eventId: string) => {
  const updatedPlans = { ...currentWeek.dailyPlans };
  updatedPlans[dateKey] = {
    ...updatedPlans[dateKey],
    events: updatedPlans[dateKey].events.filter(e => e.id !== eventId)
  };
  updateCurrentWeek({ ...currentWeek, dailyPlans: updatedPlans });
};
```

---

## Utility Functions

### Getting Week Info
```tsx
import { getWeekStorageKey, getWeekSummary } from '../utils/weekManager';

// Get storage key for a date
const key = getWeekStorageKey(new Date("2026-01-20"));
// Returns: "omni_week_2026-01-20"

// Get week statistics
const summary = getWeekSummary(currentWeek);
// Returns: {
//   weekStart: "2026-01-20",
//   weekEnd: "2026-01-26",
//   businessGoals: [...],
//   personalGoals: [...],
//   totalTodos: 15,
//   totalEvents: 8,
//   completedTodos: 5
// }
```

### Working with Multiple Weeks
```tsx
import { getWeeksInRange, getOrCreateWeek } from '../utils/weekManager';

// Get all weeks in a month
const monthStart = new Date(year, month, 1);
const monthEnd = new Date(year, month + 1, 0);
const weeks = getWeeksInRange(monthStart, monthEnd, allWeeks);

// Get or create week for a date
const week = getOrCreateWeek(someDate, allWeeks);
```

---

## State Management in App.tsx

### Reading Week Data
```tsx
// Get current week being viewed
const currentWeek = getOrCreateWeek(currentDate, allWeeks);

// Get specific week by date
const specificWeek = getOrCreateWeek(someDate, allWeeks);
```

### Updating Week Data
```tsx
// Update callback passed to components
const updateCurrentWeek = useCallback((updatedWeek: WeekData) => {
  const weekKey = getWeekStorageKey(currentDate);
  setAllWeeks(prev => ({
    ...prev,
    [weekKey]: {
      ...updatedWeek,
      updatedAt: Date.now(),  // Auto-update timestamp
    }
  }));
}, [currentDate]);
```

### Persistence
```tsx
// Auto-saves via useEffect
useEffect(() => {
  saveAllWeeks(allWeeks);
  // Also saves emails and lifeGoals
  localStorage.setItem('omni_emails', JSON.stringify(emails));
  localStorage.setItem('omni_lifegoals', JSON.stringify(lifeGoals));
}, [allWeeks, emails, lifeGoals]);
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────┐
│        User Interaction                  │
│   (Edit focus, add todo, etc.)           │
└────────────────┬────────────────────────┘
                 │
         ┌───────▼────────┐
         │  Component     │
         │  Handler Fn    │
         └───────┬────────┘
                 │
      ┌──────────▼──────────┐
      │  updateCurrentWeek()│
      │  (new WeekData)     │
      └──────────┬──────────┘
                 │
      ┌──────────▼──────────┐
      │  setAllWeeks()      │
      │  (with new week)    │
      └──────────┬──────────┘
                 │
      ┌──────────▼──────────┐
      │  useEffect         │
      │  saveAllWeeks()    │
      │  localStorage.set  │
      └──────────┬──────────┘
                 │
      ┌──────────▼──────────┐
      │  Data Persisted     │
      │  & Synced Across    │
      │  All Views          │
      └─────────────────────┘
```

---

## Debugging Tips

### Check Week Data
```tsx
// In browser console
localStorage.getItem('omni_all_weeks')  // See all weeks
JSON.parse(localStorage.getItem('omni_all_weeks'))  // Pretty print

// Check specific week
const weeks = JSON.parse(localStorage.getItem('omni_all_weeks'));
weeks['omni_week_2026-01-20']  // See specific week
```

### Verify Updates
```tsx
// Add console logs in updateCurrentWeek callback
const updateCurrentWeek = useCallback((updatedWeek: WeekData) => {
  console.log('Week updated:', updatedWeek);
  // ... rest of code
}, [currentDate]);
```

### Check Sync
1. Edit in Weekly View
2. Check Monthly View
3. Both should show same data instantly

---

## Migration Path for New Features

### To Add Feature X to Weekly View:
1. Add to `WeekData` or `DailyPlan` type in `types.ts`
2. Add handling in `WeeklyPlannerView` component
3. Use `updateCurrentWeek()` to persist
4. Optional: Display in `MonthlyView` by querying `allWeeks`

### Example: Add "Week Theme"
```tsx
// 1. Update WeekData in types.ts
WeekData {
  ...existing...
  theme?: string  // ← Add this
}

// 2. In WeeklyPlannerView
<input 
  value={currentWeek.theme || ""}
  onChange={(e) => updateCurrentWeek({
    ...currentWeek,
    theme: e.target.value
  })}
/>

// 3. Auto-persisted via updateCurrentWeek
```

---

## Performance Considerations

- ✅ Week data is only loaded when accessed (via `getOrCreateWeek`)
- ✅ Monthly view efficiently queries only weeks in month
- ✅ Single week updates don't affect other weeks
- ✅ localStorage serialization is fast for reasonable data sizes
- ⚠️ Very large datasets (100+ weeks) may need optimization

---

## Future Optimization Points

1. **Lazy Loading** - Load weeks on-demand
2. **Indexing** - Build week index for faster lookups
3. **Compression** - Compress old weeks after 6 months
4. **Sync** - Add optional cloud sync layer
5. **Caching** - Cache frequently accessed weeks in memory

---

## Common Mistakes to Avoid

❌ **Don't**: Mutate state directly
```tsx
// WRONG
currentWeek.goals.business.push("new goal");
updateCurrentWeek(currentWeek);
```

✅ **Do**: Create new objects
```tsx
// RIGHT
updateCurrentWeek({
  ...currentWeek,
  goals: {
    ...currentWeek.goals,
    business: [...currentWeek.goals.business, "new goal"]
  }
});
```

❌ **Don't**: Update allWeeks directly from component
```tsx
// WRONG
setAllWeeks(prev => {
  prev[key].goals = newGoals;
  return prev;
});
```

✅ **Do**: Use updateCurrentWeek callback
```tsx
// RIGHT
updateCurrentWeek({
  ...currentWeek,
  goals: newGoals
});
```

---

## Quick Checklist for New Components

- [ ] Component receives `currentWeek` or `allWeeks`?
- [ ] Updates use `updateCurrentWeek()` callback?
- [ ] Date keys formatted with `formatDateKey()`?
- [ ] Checking null/undefined for optional fields?
- [ ] Maps over correct data structure?
- [ ] localStorage auto-persists via App.tsx useEffect?

---

See `ARCHITECTURE.md` for conceptual overview and `types.ts` for all type definitions.
