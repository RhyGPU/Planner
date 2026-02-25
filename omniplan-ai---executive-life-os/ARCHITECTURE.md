# OmniPlan AI - Week-Isolated Architecture (v2.0)

## Overview

The planner has been completely restructured to support **week-isolated data management**. Each week is now an independent page with its own data that doesn't affect other weeks. All changes are tracked per-week, and real-time synchronization happens across month and weekly views through a centralized data store.

---

## Core Architecture Changes

### 1. **Data Structure Transformation**

#### Old Structure (Global):
```
- weeklyObjectives (single, global)
- weeklyMeetings (single, global)
- todos (flat record by date)
- events (flat record by date)
- dailyNotes (flat record by date)
```

#### New Structure (Week-Isolated):
```
WeekData {
  weekStartDate: string (Monday)
  weekEndDate: string (Sunday)
  goals: {
    business: string[]        // Business/enterprise weekly goals
    personal: string[]        // Personal well-being & growth goals
  }
  dailyPlans: {
    [YYYY-MM-DD]: DailyPlan   // Each day has isolated data
  }
  meetings: Todo[]            // Week-level meetings
  notes: string              // Week overview notes
  habits: Habit[]            // Week-specific habit tracking
  createdAt: timestamp
  updatedAt: timestamp
}

DailyPlan {
  focus: string              // Daily focus theme
  todos: Todo[]              // Daily to-do list
  notes: string              // Daily notes
  events: CalendarEvent[]    // Daily events/time blocks
}
```

---

## Key Benefits

### ✅ **Week Isolation**
- Modifying one week's data doesn't affect others
- Each week is independently stored and managed
- Perfect for historical tracking and future planning

### ✅ **Real-Time Sync**
- Monthly view reads from all weeks in the month
- Changes in weekly view instantly reflect in monthly view
- Central data store (`allWeeks`) ensures consistency

### ✅ **Proper Organization**
- **Business Goals** - enterprise/strategic objectives
- **Personal Goals** - well-being & growth initiatives
- **Daily Focus** - main priority for each day
- **To-Do Lists** - per-day action items
- **Meetings** - week-level scheduling
- **Habits** - weekly performance tracking
- **Events** - time-blocked calendar

---

## File Structure

### New Files Created:
- `utils/weekManager.ts` - Week data management utilities

### Updated Files:
- `types.ts` - New data structures (WeekData, DailyPlan, WeeklyGoals)
- `App.tsx` - Centralized state using `allWeeks`
- `components/WeeklyPlannerView.tsx` - Week-based operations
- `components/MonthlyView.tsx` - Synced with week data
- `components/DataView.tsx` - Updated for new data format

---

## API Reference

### weekManager.ts Functions

```typescript
// Create new empty week structure
createEmptyWeek(date: Date): WeekData

// Get storage key for a week
getWeekStorageKey(date: Date): string

// Get or create week data
getOrCreateWeek(date: Date, allWeeks: Record<string, WeekData>): WeekData

// Get all weeks from localStorage
getAllWeeks(): Record<string, WeekData>

// Save all weeks to localStorage
saveAllWeeks(weeks: Record<string, WeekData>): void

// Update specific week
updateWeek(weekKey: string, weekData: WeekData): Record<string, WeekData>

// Get weeks in date range (for monthly view)
getWeeksInRange(startDate: Date, endDate: Date, allWeeks: Record<string, WeekData>): WeekData[]

// Get summary statistics for a week
getWeekSummary(weekData: WeekData): WeekSummary
```

---

## State Management Flow

### App.tsx
```
allWeeks (central store)
  ├─ [omni_week_2025-01-20]: WeekData
  ├─ [omni_week_2025-01-27]: WeekData
  └─ [omni_week_2026-02-03]: WeekData

updateCurrentWeek(weekData) → setAllWeeks
```

### WeeklyPlannerView
- Receives: `currentWeek` and `updateCurrentWeek`
- All operations update the specific week only
- Changes persist through `updateCurrentWeek` callback

### MonthlyView
- Receives: `allWeeks` (read-only)
- Queries weeks in the month range
- Shows aggregated data from multiple weeks
- Real-time sync via shared data source

---

## Data Flow Example

### Weekly View → Update Daily Focus
```
1. User edits daily focus textarea
2. Component creates new dailyPlan object
3. updateCurrentWeek(updatedWeekData) called
4. App updates allWeeks[weekKey]
5. localStorage auto-saves (useEffect)
6. If month view is open, it queries the same data
```

### Monthly View → Click Day
```
1. User clicks a date in calendar
2. Component looks up the day in allWeeks
3. Shows dailyPlan.focus, dailyPlan.notes, dailyPlan.events
4. Data always reflects current week state
```

---

## Storage Structure

```
localStorage:
├─ omni_all_weeks: JSON (all WeekData objects)
├─ omni_emails: JSON (global emails)
└─ omni_lifegoals: JSON (10/5/3/1 life goals)
```

Each week is stored with key format: `omni_week_YYYY-MM-DD` (where date is Monday of the week)

---

## Migration Notes

### From v1.6 → v2.0

If you're loading old backups:
1. The system won't automatically migrate old flat data
2. Create a migration function if needed (not included)
3. New weeks are created empty on first access
4. Recommend starting fresh for best experience

---

## Testing the New System

### Week Isolation Test
1. Go to Week 1, add a goal/todo
2. Navigate to Week 2
3. Week 2 should be empty
4. Go back to Week 1 - your data is there

### Real-Time Sync Test
1. Open Month View
2. Switch to Week View
3. Add/modify data in Week View
4. Switch back to Month View
5. Changes should be visible instantly

### Data Persistence Test
1. Make changes in Week View
2. Refresh browser (F5)
3. Data should persist
4. Export backup (Data View)
5. Load backup - all weeks restore

---

## Future Enhancements

- [ ] Week-to-week comparison views
- [ ] Habit streak tracking across weeks
- [ ] Goal progress visualization
- [ ] Week templates for recurring patterns
- [ ] Advanced filtering/search by week
- [ ] Week-based reporting and analytics
- [ ] iCal import (on per-week basis)
- [ ] Collaborative week sharing

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     App.tsx                              │
│         Central State: allWeeks Record                   │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
    ┌────▼──────────┐         ┌─────▼─────────┐
    │ WeeklyPlanner │         │ MonthlyView   │
    │   updateWeek  │         │  (read data)  │
    └─────┬─────────┘         └───────────────┘
          │
    ┌─────▼──────────────────────────┐
    │   updateCurrentWeek callback    │
    │   → setAllWeeks                 │
    │   → localStorage auto-save      │
    └────────────────────────────────┘
```

---

## Quick Reference

| Concept | Old | New |
|---------|-----|-----|
| Weekly Data | Global shared state | Week-isolated in WeekData |
| Daily Data | Flat by date | Nested in dailyPlans |
| Goals | businessProactive/private | business/personal in WeekData.goals |
| Meetings | Global list | Per-week in WeekData.meetings |
| Habits | Global list | Per-week in WeekData.habits |
| Storage Key | Random | `omni_week_YYYY-MM-DD` |
| Month View | Shows flat events | Shows weeks' dailyPlans |

---

## Support

For issues or questions about the architecture:
1. Check `types.ts` for data structure definitions
2. Review `weekManager.ts` for utility functions
3. Check component prop interfaces for usage examples
4. Verify localStorage keys via DevTools

All data is client-side only - no server dependencies!
