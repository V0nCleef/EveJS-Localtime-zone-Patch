# EveJS 261028.1 compatibility

Localtime zone Patch 0.1.2 declares EveJS 261028.1 Native compatibility. The
installed 261028.1 handshake is byte-identical to 261018.1, including its signed
login builder, send hook and encryption. No additional source hash or runtime
transform is necessary. The existing strict source guard remains unchanged.

The normalized LF SHA-256 remains:
`c84cffe20c00cf075a97daa31ca53c435af4f14c814e46d828760dbbb55fb566`.

This package changes the manifest, 0.1.2 diagnostic strings and documentation.
The per-client Windows timezone reader, DST conversion, clock/tooltip hooks,
calendar click, disconnect cleanup and login payload composition are unchanged.
Server UTC/FILETIME, simulation, client archive, characters, inventory, market,
certificates and unrelated mods are not patch targets.

Keep the same mod ID and existing installation folder. Preserve its actual
enabled/disabled loader state. Apply while stopped under the Launcher's OS
lifecycle lock, update only this mod's registry row, then let the next normal
Game restart and client reconnect deliver the patch. This mod has no saved
preferences, configurable timezone, settings menu or database.

See VERIFICATION.md for the focused integration checks and retail-client limits.
The package itself does not install, restart or publish anything.
