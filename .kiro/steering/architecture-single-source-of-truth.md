# Single Source of Truth Architecture Enforcement

## Critical Rule
**All screens (HOME, JOURNEY, EXPLORER) are VIEWS of the same USER PROGRESS state.**

Never create separate state systems. All screens must read from and write to the same Context.

## Before Any Code Change
1. ✅ Is this touching USER PROGRESS state?
2. ✅ Are HOME/JOURNEY/EXPLORER accessing the SAME state reference?
3. ✅ No local useState duplicating global state?
4. ✅ Changes in one screen visible in others WITHOUT refresh?

## Red Flags - Stop and Review
- 🚩 New useState in screen components for progress data
- 🚩 Different progress values shown in different screens for same state
- 🚩 Direct communication between HOME ↔ JOURNEY or JOURNEY ↔ EXPLORER
- 🚩 useEffect that doesn't subscribe to context
- 🚩 Postcard logic in EXPLORER (belongs in STATE COMPLETED trigger)
- 🚩 "Refresh" button or polling needed to see changes
- 🚩 Prop drilling between screens instead of using Context

## Data Flow
```
USER PROGRESS (Context) ← Single Source
    ↓
    ├→ HOME (reads summary)
    ├→ JOURNEY (reads details, writes updates)
    └→ EXPLORER (reads achievements)
```

All updates flow through Context only. No screen bypasses it.

## Postcard System Constraint
Postcards must be:
- Triggered by STATE COMPLETED event
- Stored in USER PROGRESS context
- Display same postcard in EXPLORER and HOME
- No separate postcard state per screen

## Test Before Merging
Navigate HOME → JOURNEY → EXPLORER → back to HOME. Verify no refresh needed, all changes visible everywhere.
