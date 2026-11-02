# Fitness analytics and scheduling upgrade

The existing seven-day workout plan, form cues, progression targets, imagery, verified PRs, achievements and explicit Saturday regeneration remain. The interface now has Missions, Calendar & Macros, and Athlete Profile tabs. There was no independent mobility SET-reward system in this repository; the existing mobility exercise remains part of Tuesday's recovery session.

## Files

- `index.html` and `Operation-Spiderman-APP.html`: load the extension and preserve the original interface/plan. Production's existing alternate-entry redirect can remain unchanged.
- `fitness-engine.js`: canonical measurements, local dates, dated session instances, movement history, activity snapshots, migration, validation and atomic persistence.
- `fitness-ui.js` and `fitness.css`: profile controls, separate session cards, actual-work entry, reschedule/undo dialog, calendar, ranges and daily chart.
- `backup.js`: exports new state and legacy snapshot, validates before import, retains local sessions on conflicts, imports missing legacy sessions and rolls back failed writes.
- `fitness-tests.cjs`: 14 acceptance groups. `xp-tests.cjs`: existing checks retained, image assertion updated to the current production WebP asset.
- Existing public image and manifest files were copied into this workspace for preview; production assets are unchanged.

## Persistence and migration

No legacy storage keys are removed or cleared. Before XP initialization, raw legacy values are copied to `spiderman-legacy-backup-v2`. The new `spiderman-fitness-v2` key is versioned; unsupported versions fail closed without overwriting that key. Each successful state change writes one validated JSON value, so failed writes retain the previous state.

On first launch, matching weekday/date check and set records become dated sessions. Mismatched/invalid/future legacy dates remain in `legacyAmbiguous`, with their original weekday reference and raw backup. Completed legacy sessions retain their existing XP rules and reset exclusions. Legacy workout calories remain unknown because historical active duration and bodyweight cannot be established. Existing weight history is converted from lb to canonical kg while leaving its source key intact. If only a starting weight exists, it is used as the initial weight estimate.

Historical calorie snapshots are never recalculated on profile edits. Imported conflicts retain the entire local session and its logs, avoiding mixed-source completion counts. New workouts use the v2 store; downgrading to an old app will not display new v2 logs, though they remain stored and exported.

## Calculation assumptions

Active kcal = `max(MET - 1, 0) * 3.5 * weightKg / 200 * activeSeconds / 60`.

Sources: [2024 Adult Compendium conditioning](https://pacompendium.com/conditioning-exercise/) and [walking](https://pacompendium.com/walking/).

Moderate calisthenics use 3.8 MET, light core 2.8, vigorous burpees 7.5, bodyweight circuit movements 6, mild mobility/stretching 2.3, and brisk walking 4.8 (3.5–3.9 mph). March-or-jog defaults to a conservative light/moderate 3.5 assumption; users can correct effort. Movement-specific assignments are estimates, not individual measurements. Rest is zero active energy. Height is stored but never multiplied into the MET formula.

Rep estimates use a configurable 3 sec/rep default, midpoint of prescribed ranges, and both sides where specified. Timed estimates use range midpoints; actual inputs take precedence. The lower bound of a prescribed range is sufficient for completion. Circuit rounds retain the existing two-round tracking convention. Manual inputs represent total reps and seconds for the entered sets; fractional progress is supported. The app has no automatic exercise timer or wearable integration.

Activity is attributed to the explicit local performed date; new entries default to today. Recorded-at timestamps are stored separately. Completion XP belongs to each session's latest activity date when it becomes complete, and is revoked when correction makes it partial. Weekly strength bonuses follow the original Monday–Sunday template week, with the bonus posted when its final mission is completed. Rest dates earn no automatic XP; the existing explicit Saturday regeneration action still earns 50 XP.

## Verification

Run from this directory:

```
node fitness-tests.cjs
node xp-tests.cjs
node backup-tests.cjs
```

All pass. Fitness coverage includes weight/height, missing weight, partial/full progress, repeated correction, merged-day rewards, transfer/undo, historical snapshots, inclusive ranges, atomic storage failure, reload, rest days, DST/year transitions, populated legacy migration, extended backups, post-upgrade legacy import, unsupported versions, weekly bonus reconciliation and incomplete actual reps/time.

Chrome checks: startup, profile save and reload persistence, calendar inspection, Thursday-to-Friday confirmation, source rest status, two distinct destination sessions, 375px layout and partial set logging (calories increase while XP remains zero). Sample profile values were entered only in the localhost preview, never in the production origin.

## Short manual checklist

1. Export a backup from Athlete Profile, then save height and weight. Switch units and confirm equivalent values.
2. Log a few sets: calories rise, completion XP stays zero. Finish a session; undo one log and confirm its reward is revoked.
3. Select Thursday → Reschedule Mission → Friday. Confirm both names; check Thursday rest, Friday two sessions and Saturday unchanged. Undo the move.
4. Open Calendar & Macros, choose a custom range, browse another month and confirm the range remains selected.
5. Refresh, then export/import a backup and confirm measurements, sessions, movement history and XP persist.

Calories remain population estimates. Legacy unmeasured activity is flagged rather than included as invented calories. Data remains browser-local; there is no cloud synchronization. Physical iPhone/Android testing remains advisable.

## Release

This update targets the existing https://aliveinmiami-dev.github.io/operation-spiderman/ origin and path. Publication includes application source, tests and this documentation only; browser-local workout and weight data are not uploaded.
