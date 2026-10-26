# S.P.I.D.E.R. persistent data protection

All future updates must preserve workout selections, set counts, completed missions, XP, achievements, personal records, starting weight and weight logs.

- Never clear localStorage or silently reset progress.
- Keep existing storage keys. Any structure change requires a backward-compatible migration tested with populated storage.
- Initialize missing fields only; never replace populated records with defaults. Preserve unknown fields. Unsupported versions must remain untouched.
- Deploy to https://aliveinmiami-dev.github.io/operation-spiderman/ without changing origin, path, or storage scope.
- Keep JSON Export Backup and Import Backup working. Validate imports before writing; preserve current records on conflicts and roll back failed writes.
- Explicit user-confirmed XP reset is the only existing reset flow; it must preserve workout/set and weight data.
- Before deployment run `node xp-tests.cjs` and `node backup-tests.cjs`, including populated-storage upgrade and restoration checks. Verify deployment and asset availability.
