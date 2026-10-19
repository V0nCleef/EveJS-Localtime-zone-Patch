# Verification - 0.1.1

Checked on 2026-10-19 against the installed EveJS 261018.1 Native source.
The previous 0.12.9 source is retained as a separate exact approved baseline.

## Passed

- Seven focused Node checks with the actual 261018.1 marshal codec and isolated
  compilation of its actual handshake class. They cover exact reviewed source
  hashes, CRLF normalization, rejection of source drift, exact packet splicing,
  failure/pre-auth/non-login pass-through, staged Asteroid Erosion hook orders,
  staged AutoMining expression orders, actual loader attachment, and native
  authentication with all three companions together.
- The loader also accepts an isolated fixture labeled 991231.99 with the
  unchanged reviewed handshake and rejects one with changed source. Server
  versions are advisory; no actual future server is claimed tested.
- The authentication fixture uses in-memory accounts and isolated config. Two
  connections of one account retain distinct new native client IDs. Native
  acknowledgment and GPSTransportClosed objectex1 packets pass through byte for
  byte. The actual AES sender retains valid framing and decryptable payloads.
- Nine focused Python client checks cover the real local Windows clock, both
  2026 European DST transitions through the Windows converter, negative and
  fractional UTC offsets, date rollover, Neocom scoping, five-second refresh,
  unchanged calendar click, reconnect/event cleanup, unknown widget rejection,
  later wrappers and OS fallback. Python 2.7 grammar parsing also passes.
- Clock tests execute authored code plus the previously inspected build-3396210
  widget classes, using UI and service doubles. The server protocol profile
  still targets client build 3396210.
- Seven release-contract checks verify deterministic public bytes, a complete
  ZIP/sidecar/checksum set, exact payload contents, required update source and
  rejection of mismatched tags, missing notes or changed release assets.
- The production Launcher checker accepts the matching release metadata for a
  0.1.0 installation after the one-time source addition and returns no update
  for an already installed 0.1.1. Its actual package replacement pipeline passes
  in separate enabled and disabled disposable roots, retaining those states and
  unrelated files. The initial 0.1.0/0.1.1 packages are confirmed to lack update
  discovery; this corrected package keeps all four original 0.1.1 runtime files
  byte for byte.

No live server or client was started or restarted for these checks. No account,
player database, operating-system clock or timezone setting was changed. The
native authentication fixture cannot write accounts and reports zero writes.

## Coverage limit

This compatibility update has not been visually confirmed in the running new
server/client combination. After enabling it, restart Game and reconnect each
client. Confirm its Neocom clock matches that computer and still opens Calendar.
The original 0.1.0 clock was user-confirmed in game on the previous server.

These focused checks do not establish live multi-client gameplay, every locale,
Docker support, or a different client build. Launcher install/enable validation
for the final combined deployment belongs to its installation receipt.

## Implementation reference

Windows documents that
[SystemTimeToTzSpecificLocalTime](https://learn.microsoft.com/en-us/windows/win32/api/timezoneapi/nf-timezoneapi-systemtimetotzspecificlocaltime)
uses the current active timezone when passed NULL and applies daylight saving
time for the instant being converted. The mod invokes that read-only API on
each display refresh. It never calls a system time or timezone setter.

Private client inspection and test fixtures are excluded from the release ZIP.
The package contains only authored mod source and documentation.
