# EveJS 261018.1 compatibility

Localtime zone Patch 0.1.1 adds the exact reviewed native handshake baseline
for EveJS 261018.1. Manifest server versions record tested builds and are
advisory. The loader accepts an exact reviewed handshake source regardless of
the server version string. An unrelated login-source edit stays inactive.

Approved SHA-256 values normalize CRLF to LF only:

| EveJS version | server/src/network/tcp/handshake.js |
| --- | --- |
| 0.12.9 | 4fc3c37ec83c443c1497a3daba57d7157d05bbe55af3be2d5545b6162398ebc9 |
| 261018.1 | c84cffe20c00cf075a97daa31ca53c435af4f14c814e46d828760dbbb55fb566 |

The native signedFunc builder, marshaled expression envelope, outgoing packet
hook and encryption implementation are unchanged. The new per-connection client
ID allocator and GPSTransportClosed objectex1 encoding sit outside the delivery
seam. The original signedFunc executes first and retains its result, including
TiDi, portrait upload and the skill extractor access-token setup.

Only the compatibility guards, package version/status and documentation change.
The clock and delivery logic retain their prior behavior. Server UTC timestamps,
simulation time, client archive and saved data are not patch targets.

An isolated fixture labeled `991231.99` loads when given the unchanged reviewed
261018.1 handshake, and rejects a changed handshake. This tests the advisory
version policy; it does not establish support for an actual future server.

## Installation and settings

For a new installation, use Mods -> Add ZIP and enable the Localtime entry.
When updating from 0.1.0, stop Game and remove the old Localtime entry through
Mods before adding the 0.1.1 ZIP. The package retains the same mod ID
`evejs-localtime-zone-patch` and has no saved configuration to transfer.

This mod has no settings file or configurable user state. Each client reads its
own operating-system timezone. Preserve all unrelated mods, Launcher state,
server config, client files and databases during installation. Restart Game and
reconnect clients after enabling the new version.

See VERIFICATION.md for performed checks and live
coverage limits. The package itself does not install or restart anything.
