# EveJS 261125.3 and 261126.2 Native compatibility

Localtime 0.1.5 declares both reviewed releases for the Windows client build
3724492 (EVE 24.02). The declarations remove the Launcher's unsupported-version
warning while preserving all earlier supported versions.

The stock handshake is identical to the reviewed 261115.2 source after CRLF
normalization. Its SHA-256 remains:
`7aaa72247049b38d3f656f3b2c602877a8bcf0d9ff0af68f1795ff1327565ba7`.
The marshal codec, game-frame helper, protocol profile, global-config metadata
and staff-health delivery seam also match the inspected 261125.3 files.

The optional GridCheck client-agent v1 patch produces the already admitted
handshake hash:
`9547dda904196127bac88f72713731ac995d1ddb49e10c89f7d9a00bd34fe46e`.
Source drift remains rejected. No source guard is weakened or bypassed.

Focused Native checks exercise the exact server handshake, codec, framing,
authentication, SSO, encryption and delivery composition in memory. Exact
compiled login and clock methods from client builds 3724492 and 3396210 run
under their own copied Python 2.7 interpreters with transport and UI doubles.
These controls cover verification, original-result preservation, local time,
DST, tooltip, Calendar callback and repeated reconnect cleanup.

This is offline compatibility evidence. It does not establish rendered-client,
real-network or combined-mod gameplay acceptance. Linux and Proton runtime
qualification remain pending. Docker is not declared supported by this package.
No clock implementation, server timestamps or player data are changed.
