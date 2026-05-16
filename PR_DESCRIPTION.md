# 🧪 Add tests for userProgress service

## Description
This PR addresses the missing testing coverage for the user progress module (`frontend/src/lib/userProgress.js`), which handles critical gamification and statistics logic.

### 🎯 **What:**
- The `userProgress.js` module interacts directly with the Supabase client to fetch, update, and manage user progression state (XP, Streaks, Algorithms Used, Challenges Completed).
- It lacked testing coverage, making refactoring or expanding gamification features risky.

### 📊 **Coverage:**
- **User Profile Management**: Tested fetching existing profiles and creating profiles when missing (`PGRST116` error handling).
- **XP Calculation**: Tested `updateUserXP` to verify correct XP summation and level calculation (`500 XP = 1 Level`).
- **Streak Calculation**: Tested `updateStreak` with mocked time to assert increments on consecutive days, resets on missed days, and maintaining the streak for same-day updates.
- **Records Management**: Tested inserting vs updating behavior in `recordAlgorithmRun` and `recordChallengeCompletion`.
- **Aggregation**: Tested the calculation logic of `getDashboardData` to ensure totals, runs, and streaks are mapped perfectly.

### ✨ **Result:**
- The `userProgress` module is now thoroughly tested.
- Refactoring internal schemas, API calls, or scaling our gamification progression logic can now be done safely with high confidence.
- `vitest` was installed and integrated into the frontend workspace.
