# EveJS 261108.1 local candidate

0.1.3 adds the exact reviewed handshake SHA-256 (LF normalized):
`5e6d7445213c89c8ad58d58ace38ac1f08d6ebfb40f7ef7c4a2491626a8dab15`.

The upstream Placebo signature changed from Boolean false to numeric zero.
The delivery hook now recognizes those two exact values and preserves the
received signature bytes. Verification is still handled by the native client.
The new native game-frame limits, encryption/IV handling and SSO acknowledgement
keys remain in the original upstream code. Unknown login source remains inactive.

The exact 261108.1 source with GridCheck 0.3.6's optional `client-agent` v1
patch is also reviewed and admitted by LF-normalized SHA-256:
`dc9786833306edda6e26ea9e181b31ba88308b5d2aacc308d5be6c45dc15994b`.
This is a second exact-source baseline, not marker-based admission or a general
guard bypass. Both opt-in hooks and exact patch reversion are checked locally.
Other instrumentation or source edits still leave the mod inactive.

Focused checks use the actual 261108.1 handshake, codec and frame helpers,
with isolated account/config dependencies and no database or service startup.
Clock-widget checks use the previously inspected client classes, whose archive
entry hashes were rechecked against the unchanged build-3396210 code.ccp.
They cover Windows local time, DST boundaries, offsets, date rollover, tooltip,
calendar handler, refresh, repeated bootstrap and disconnect cleanup.

Real-client GridCheck validation is pending an exclusive test slot. No visual
display, live reconnect, mixed-mod runtime or soak pass is claimed yet. Docker
and other client builds remain unqualified.

The candidate does not edit the client archive, cache, OS timezone, user
preferences or saves. The existing Windows timezone/DST choices remain the
only clock configuration. Disable and restart/reconnect restores native UI.
