# Changelog

## 0.1.5 - 2026-11-26

- Declare reviewed Native compatibility with EveJS 261125.3 and 261126.2,
  using the build-3724492 Windows client, to resolve the Launcher warning.
- Preserve every earlier supported version and the exact login-source guards.
- Keep local clock, timezone, tooltip and reconnect behavior unchanged.
- Verify native packets and exact client bytecode offline; full retail-client
  and Linux runtime qualification remain pending. Docker support is unchanged.

## 0.1.4 candidate - 2026-11-16

- Admit the exact reviewed EveJS 261115.2 handshake and optional GridCheck 0.3.6
  client-agent v1 variant. Other source changes remain rejected.
- Preserve the new conditional upstream staff server-health payload, Placebo
  signature, native framing, encryption and SSO acknowledgment.
- Keep the client-local clock reader and UI behavior unchanged.
- Actual 261115.2 retail-client and combined-stack qualification are pending.
  This is an unpublished Native compatibility candidate.

## 0.1.3 - 2026-11-09

- Support the reviewed EveJS 261108.1 handshake, numeric-zero Placebo signature
  and exact optional GridCheck client-agent v1 variant.

## 0.1.2 - 2026-10-29

- Record EveJS 261028.1 Native compatibility and update diagnostics/docs.
