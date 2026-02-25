# 🎯 OmniPlan v2.0 - Major Restructuring Complete

## What Changed

Your planner has been completely restructured from a flat global state model to a **week-isolated architecture**. This means:

### ✅ **Week Independence**
- Each week is now its own "page" with completely isolated data
- Changes in one week **never affect** other weeks
- Perfect for tracking past weeks, managing current week, and planning future weeks

### ✅ **Proper Data Organization**
Each week now contains:
- **Business Goals** - Strategic objectives
- **Personal Goals** - Well-being & growth initiatives  
- **Daily Focus** - Main priority for each day
- **To-Do Lists** - Per-day action items
- **Meetings** - Week-level sync/meetings
- **Habits** - Week-specific tracking
- **Events** - Time-blocked calendar

### ✅ **Real-Time Synchronization**
- Monthly view is **live-synced** with weekly data
- Changes in one week instantly reflect in month view
- Central data store ensures consistency everywhere

---

## New Data Structure

### Old Way (Global):
```
- One global weeklyObjectives (affects all weeks)
- Flat todos by date (not organized by week)
- Flat events by date (no week context)
```

### New Way (Week-Isolated):
```
WeekData {
  weekStartDate: "2026-01-20"
  weekEndDate: "2026-01-26"
  goals: {
    business: ["Goal 1", "Goal 2"],
    personal: ["Wellbeing 1", "Wellbeing 2"]
  }
  dailyPlans: {
    "2026-01-20": { focus, todos, notes, events }
    "2026-01-21": { focus, todos, notes, events }
    ...
  }
  meetings: [...]
  habits: [...]
  notes: "Week overview"
}
```

---

## Files Changed

### Core Architecture
- **`types.ts`** - New data types (WeekData, DailyPlan, WeeklyGoals)
- **`App.tsx`** - Refactored for week-based state management
- **`utils/weekManager.ts`** ⭐ NEW - Week data utilities

### Components
- **`WeeklyPlannerView.tsx`** - Updated to use WeekData
  - Business goals → goals.business
  - Personal goals → goals.personal
  - Todos per day → dailyPlans[dateKey].todos
  - Events per day → dailyPlans[dateKey].events
  - Daily notes → dailyPlans[dateKey].focus
  
- **`MonthlyView.tsx`** - Updated for real-time sync
  - Reads from allWeeks (all stored weeks)
  - Shows daily data from corresponding weeks
  - Changes reflected instantly

- **`DataView.tsx`** - Updated for new data format
  - Export now saves allWeeks structure
  - Version bumped to v2.0.0

### Documentation
- **`ARCHITECTURE.md`** ⭐ NEW - Complete architecture guide

---

## How It Works

### Storage Structure
```
localStorage:
├─ omni_all_weeks: { 
│   "omni_week_2026-01-20": WeekData,
│   "omni_week_2026-01-27": WeekData,
│   ...
│ }
├─ omni_emails: [...]
└─ omni_lifegoals: [...]
```

### Data Flow
```
1. User edits week data in WeeklyPlannerView
2. updateCurrentWeek(weekData) callback fired
3. App updates allWeeks[weekKey]
4. localStorage auto-saves via useEffect
5. MonthlyView queries from same allWeeks
6. Changes visible instantly in month view
```

---

## Key Improvements

| Aspect | Before | After |
|--------|--------|-------|
| Week Isolation | ❌ Global state | ✅ Independent per-week |
| Changing Weeks | Affected all weeks | Only affects current week |
| Multiple Weeks | Not supported | Fully supported |
| Month/Week Sync | Flat data | Real-time from central store |
| Data Organization | Scattered | Hierarchical (week → day → item) |
| Goal Naming | Business/Private | Business/Personal (clearer) |
| Scalability | Limited | Full history support |

---

## Quick Start

### Using the New System

#### Add a Business Goal for This Week
```
1. Go to Weekly Planner
2. Edit "Business Goals" section
3. Add your goal
4. Data is isolated to THIS WEEK ONLY
```

#### Navigate to Next Week
```
1. Click the right arrow at top of Weekly Planner
2. You'll see a fresh week (unless you already created one)
3. Add goals/todos/events for next week
4. Previous week's data remains untouched
```

#### Check Month View
```
1. Click Monthly View tab
2. Click any day
3. See the daily data from that week
4. Changes in Weekly View appear instantly here
```

---

## Data Migration

### From v1.6 to v2.0
- **Old backups won't auto-convert** (different structure)
- Start fresh for best experience
- If you need to preserve old data, a migration script can be written

### Export Current Data
1. Go to Data View
2. Click "Export Global State"
3. This saves in v2.0 format (week-isolated)

### Restore Data
1. Go to Data View
2. Click "Restore Local State"
3. Upload your saved backup
4. All weeks restore

---

## Testing the Changes

### Test 1: Week Isolation
```
Week 1: Add todo "Buy milk"
Navigate to Week 2
Add todo "Call mom"
Go back to Week 1
✅ Only "Buy milk" shows (Week 2 data not affected)
```

### Test 2: Real-Time Sync
```
Open Monthly View
Open Weekly View in another window/tab
Edit a daily focus in Weekly View
Switch back to Monthly View
✅ See the updated focus instantly
```

### Test 3: Multiple Weeks
```
Create data for 4 consecutive weeks
Navigate monthly through all weeks
✅ Each week has its own independent data
✅ Month view aggregates correctly
```

---

## Technical Details

### New File: `utils/weekManager.ts`
Utility functions for week management:
- `createEmptyWeek(date)` - Initialize empty week
- `getWeekStorageKey(date)` - Generate storage key
- `getOrCreateWeek(date, allWeeks)` - Get or create week
- `getAllWeeks()` - Fetch all weeks from localStorage
- `saveAllWeeks(weeks)` - Persist all weeks
- `updateWeek(key, data)` - Update specific week
- `getWeeksInRange(start, end, weeks)` - For monthly view
- `getWeekSummary(week)` - Get aggregated stats

### Component Props
**WeeklyPlannerView:**
```tsx
{
  currentDate: Date
  setCurrentDate: (date: Date) => void
  currentWeek: WeekData        // ← Single week
  updateCurrentWeek: (week: WeekData) => void
  setAiLoading: (loading: boolean) => void
}
```

**MonthlyView:**
```tsx
{
  currentDate: Date
  setCurrentDate: (date: Date) => void
  allWeeks: Record<string, WeekData>  // ← All weeks
}
```

---

## Removed Features (Temporary)

The following features are removed pending re-implementation on week basis:
- ~~Weekly checks~~ (can be added back as week-specific items)
- ~~iCal import~~ (coming soon with week-based support)

These weren't critical and the new architecture is more flexible for implementing them properly.

---

## What's Next

### Suggested Enhancements
1. **Week Templates** - Save patterns and reuse
2. **Comparison View** - Compare metrics across weeks
3. **Streak Tracking** - Track habits across multiple weeks
4. **Goal Progress** - Visual progress toward weekly goals
5. **Weekly Reports** - Auto-generate week summaries
6. **Advanced Search** - Find items across all weeks
7. **Week Export** - Share individual weeks

---

## Support

### If Something Breaks
1. Check browser console for errors (F12)
2. Export your data first (Data View → Export)
3. Try refreshing the page
4. Check `ARCHITECTURE.md` for technical details

### Questions About Structure
1. See `ARCHITECTURE.md` for full breakdown
2. Check `types.ts` for data definitions
3. Review `utils/weekManager.ts` for utilities

---

## Version Info

- **Previous Version**: v1.6.0
- **Current Version**: v2.0.0
- **Architecture**: Week-Isolated with Real-Time Sync
- **Storage**: 100% Client-Side (localStorage)
- **Data Format**: WeekData hierarchical structure

---

## Summary

Your planner is now a true **multi-week manager** where:
- ✅ Each week is independent
- ✅ Changes don't cascade
- ✅ Month and week views are synchronized
- ✅ Full historical data support
- ✅ Clean, organized data structure
- ✅ Ready for future enhancements

Start using the new weekly planner for maximum productivity tracking! 🚀
