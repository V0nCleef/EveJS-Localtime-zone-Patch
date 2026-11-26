# Verification - 0.1.5

Targets: EveJS 261125.3 and 261126.2 Native, Windows client build 3724492.
The 261115.2/build-3396210 stack is retained as a regression control.

## Server and delivery

Focused checks compile the exact inspected server handshake in memory with
account, configuration and service doubles. They use the real marshal codec,
frame helpers and staff-health delivery module. They exercise exact-source
admission and drift rejection, numeric-zero and legacy-false Placebo signatures,
byte-preserving replacement, once-per-connection delivery, malformed/failed
pass-through, authentication success/failure, distinct connection IDs, SSO keys,
transport closes, AES-CBC, frame bounds and loader attachment.

The conditional staff-health payload remains intact. Twenty-four delivery-hook
orders preserve the native expression and shared-provider receipt. These are
delivery-helper checks, not gameplay qualification of the other mods. Four
processes with different server timezones emit identical Localtime payloads.
The exact optional GridCheck client-agent v1 instrumentation is admitted and
reverts byte-exactly. No database or account writes or service starts occur.

## Client ABI and time

The exact compiled Authenticate, signed-function executor, Placebo verifier and
clock classes from builds 3724492 and 3396210 execute in each build's own copied
Python 2.7 Stackless runtime. Transport, challenge hashing, services and UI are
doubles. The harness verifies that it loaded the copied interpreter and did not
load blue.dll or exefile.exe.

Controls cover original-result preservation, invalid-signature rejection,
real Windows ctypes/time calls, separate machine timezone rules, fractional and
negative offsets, local-date rollover, DST and disabled DST, zone changes,
OS-localtime fallback, clock scope, date/offset tooltip, original Calendar
callback, disconnect restoration and three repeated login/reconnect cycles.
Separate widget controls also exercise both European DST transitions and
unsupported-widget rejection.

## Packaging and limits

The release ZIP uses an explicit public-file allowlist. Its manifest and update
sidecar agree on the mod ID, version, asset and advisory EveJS versions.
Packaging checks reject changed/extra members, duplicate JSON fields, mismatched
tags and incomplete update metadata. The production Launcher update/import
checks run in disposable local roots, preserving unrelated fixture files.

No rendered 3724492 client, real network/game integration or Linux/Proton runtime
pass is claimed. Docker remains outside the declared Native backend. Private
client bytecode, interpreters, fixture data, local paths and test receipts are
excluded from public source and release assets.
