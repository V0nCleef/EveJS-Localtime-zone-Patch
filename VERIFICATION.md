# Verification - 0.1.0

Checked on 2026-10-10 against the installed EveJS 0.12.9 Native source and
build-3396210 client clock widget.

## Passed

- Nine focused client checks: the real Windows local clock; both 2026 European
  summer/winter transitions through the mod's native Windows converter;
  fractional/negative offsets and date rollover; different client timezone
  readings between refreshes; Neocom-only scoping; local tooltip and unchanged
  calendar click method; startup/event cleanup; reconnect/idempotency; unknown
  widgets; later mod wrappers; OS local-time fallback.
- Six Node checks using the actual EveJS marshal codec: supported builder
  identity; byte-preserving packet composition; malformed/non-login/pre-auth
  pass-through and delivery-error recovery; current installed Asteroid Erosion
  and NPC Market Buyers in both hook orders; AutoMining in both expression
  orders; loader attachment to the actual native handshake class and retention
  of its encryption path with account/config dependencies isolated.
- Python 2.7 grammar parsing. The client checks execute our authored code and
  inspected vendor widget classes in Python 3.11 with UI/service doubles.
- Launcher ZIP inspect/import/scan/enable/disable/remove in a separate fixture;
  ZIP CRC, explicit public-file list, SHA-256 receipt, and enabled-loader
  preflight after installation.

No live server was started or restarted by these checks. No Windows clock or
timezone setting was changed. DST inputs were injected into GetSystemTime
only inside the test process; Windows performed the timezone conversion.

## Coverage limit

On 2026-10-10, the user confirmed the installed mod works and supplied the
in-game screenshot in `docs/local-clock.png`, showing 16:08 and UTC+02:00.
This is user-reported live confirmation plus screenshot evidence. The agent
did not operate the live client. DST transitions, multiple timezone readings,
and calendar click preservation were checked in the focused offline tests;
they were not separately exercised in live gameplay.

Only EveJS 0.12.9 Native and the inspected build-3396210 widget contract are
declared supported. No live Docker or other client-build coverage is claimed.

## Implementation reference

Windows documents that
[SystemTimeToTzSpecificLocalTime](https://learn.microsoft.com/en-us/windows/win32/api/timezoneapi/nf-timezoneapi-systemtimetotzspecificlocaltime)
uses the current active timezone when passed NULL and applies daylight saving
time for the instant being converted. The mod invokes that read-only API on
each display refresh. It never calls a system time or timezone setter.

Private client inspection and test fixtures are excluded from the release ZIP.
The package contains only authored mod source and documentation.
