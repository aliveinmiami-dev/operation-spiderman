# S.P.I.D.E.R. XP v1

No backend or external dependencies. Run `node xp-tests.cjs` from the repository root; the suite uses only Node built-ins.

## Rules

Monday, Wednesday and Sunday complete strength missions: 100 XP each. Tuesday active recovery: 40 XP. Thursday optional conditioning and Friday circuit: 75 XP each. All scheduled checkboxes, including Thursday's rest interval, must be checked. Saturday has no exercise checklist: explicit Complete Regeneration grants 50 XP. Undo removes that award.

Completing Monday, Wednesday and Sunday within a local Monday–Sunday week grants 150 XP once. Editing a qualifying workout recalculates the bonus. Calendar totals include the bonus on Sunday. PRs require an explicit single-set verification; the first verified best and each strictly higher logged best per exercise grant 100 XP. Duplicate or lower entries do not qualify. PRs are self-reported, not externally verified.

Levels advance every 500 XP: Rookie, Recruit, Vigilante, Web Warrior, Neighborhood Legend. Later levels retain Neighborhood Legend. Eight cosmetic achievements unlock once and remain unlocked until reset. The ledger is derived, never an incremented balance.

## Persistence and migration

The existing `spiderman-checks`, `spiderman-weights`, and `spiderman-starting-weight` keys remain in place. Migration never writes those keys. `spiderman-xp-v1` stores version 1 and awardRulesVersion 1, completion records, explicit recovery entries, PRs, permanent achievement IDs, and reset exclusions. There is no independently mutable XP total.

Only fully checked historical records whose date is valid, not future, and matches their stored scheduled weekday qualify. Ambiguous old records remain untouched but do not earn XP. Partial exercise XP is replaced by whole-mission XP, so the displayed total can change. Completion timestamps record when the system first observes completion, not proof of the historical exercise time.

Reset XP Progress requires confirmation. It clears RPG progression and excludes currently complete workouts from automatic re-import. Their checkmarks and all weight data remain unchanged. Marking an excluded workout incomplete and completing it again makes it eligible under the new reset period.

## Safeguards and limitations

Stable date-based award IDs prevent refresh, selection, repeated button presses, and uncheck/recheck duplication. Future dates are blocked in both handlers and scoring. Dates use local noon and Monday week boundaries, avoiding UTC date-only parsing. A wall-clock/monotonic-clock comparison blocks recording after a substantial clock change while the page is open. Offline client-only storage cannot prevent deliberate clock changes across restarts or storage editing. Browser data is not synced or backed up.

## Validation

Node tests pass in America/New_York and Pacific/Auckland: full-workout awards, incomplete/recomplete changes, refresh/reopen persistence, actual checkbox callbacks, weekly awards and reversal, Saturday idempotence, levels, four consecutive weeks, year/week boundaries, PR verification/deduplication, future and mismatched dates, reset exclusions, unchanged weight history, schedule and form-guide reference preservation. JavaScript syntax checks pass. Actual iPhone/Home Screen behavior and narrow Safari rendering could not be visually verified in this environment; responsive wrapping and existing installation metadata are preserved.
