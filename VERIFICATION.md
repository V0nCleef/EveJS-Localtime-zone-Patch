# Verification - 0.1.4 candidate

Target: EveJS 261115.2 Native, Windows client build 3396210. Release archive
SHA-256: `899ca7dd19abd4d9441966a60bbecc37008b459284c0601ae2af8edc29271be0`.

Focused tests compile the exact release handshake with isolated account/config
dependencies and use its real marshal codec, frame helpers and server-health
delivery module. They cover exact-source admission/drift rejection, Placebo
representations, byte-preserving replacement, once-only delivery, malformed or
failed pass-through, authentication success/failure, connection IDs, SSO keys,
transport closes, AES-CBC, frame bounds, loader attachment and exact optional
GridCheck instrumentation.

The new staff server-health payload is retained byte-exact inside Localtime.
Player and disabled-health controls omit it as upstream intends. Twenty-four
helper orders compose Localtime with the installed Asteroid Erosion and Buyers
helpers and AutoMining's shared login delivery runtime. Account roles and the
shared provider/receipt are fixtures; these checks do not establish the other
mods' gameplay or client execution. Zero account writes and no service starts.

Nine widget controls use the inspected build-3396210 classes with UI/service
doubles. They cover the real Windows clock, both 2026 European DST transitions,
fractional/negative offsets, date rollover, refresh, Neocom scoping, tooltip,
original Calendar handler, disconnect cleanup, repeated bootstrap, unknown
widgets and OS fallback. Python 2.7 grammar is checked; controls execute under
Python 3.11. The local-time reader is byte-identical to installed 0.1.3.

Actual new-version GridCheck/retail-client and combined-mod acceptance are
required and pending coordinator scheduling. These tests claim no 261115.2
visual, reconnect, multi-client or soak pass. Docker is undeclared/unqualified.
See COMPATIBILITY-261115.2.md. References and fixtures are excluded from the ZIP.

No physical client, server clock, OS timezone, saves, databases or live files
are changed. External report.json and receipts hold executed results, package
hashes and the pending runtime plan.
