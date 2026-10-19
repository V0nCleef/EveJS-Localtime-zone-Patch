# Changelog

## 0.1.1 - 2026-10-19

- Corrected re-release: declare the GitHub update source and publish the matching
  `.update.json` sidecar, so this package can discover future Launcher updates.
  Earlier 0.1.0 and initial 0.1.1 downloads need the one-time migration in README.
  The original 0.1.1 runtime bytes are unchanged.
- Add a deterministic, allowlisted ZIP/sidecar/checksum builder, release tests,
  CI validation and documented publishing steps to keep the update pair together.
- Add compatibility with the reviewed EveJS 261018.1 Native login source while
  retaining the 0.12.9 baseline.
- Treat server-version labels as advisory. A changed login source still leaves
  the mod inactive and preserves normal login.
- Keep the existing local clock, automatic daylight saving adjustment, date
  tooltip, and calendar click behavior. Server time remains unchanged.
- Validate native login composition and Windows clock/DST behavior with focused
  isolated checks. Live gameplay on the new server combination remains unverified.

## 0.1.0 - 2026-10-10

- Initial per-client Neocom local clock and timezone-aware date tooltip for
  EveJS 0.12.9 Native with the Windows build-3396210 client.
