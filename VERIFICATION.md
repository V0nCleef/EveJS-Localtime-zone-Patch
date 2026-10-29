# Verification - 0.1.2

Checked on 2026-10-29 against the current EveJS 261028.1 Native installation.
This is a compatibility/package update. Clock and login behaviour are unchanged;
only the descriptor, version diagnostic strings and documentation change.

Seven focused Node checks pass using the actual new marshal codec and isolated
compilation of the actual handshake class. They cover reviewed source hashes,
line-ending normalization, source-drift rejection, malformed payload bounds,
exact login packet splicing, unchanged timestamps, pre-authentication/non-login
pass-through, error fallback, loader attachment and encryption framing.

The native authentication fixture composes Localtime with the currently
installed AutoMining, Asteroid Erosion and NPC Buyers delivery helpers, plus the
exact Launcher shared Mods menu bridge. Both send-hook orders pass. Two sessions
for one in-memory account retain distinct connection IDs; acknowledgments and
transport-close packets remain byte-identical and the native AES payload decrypts.
The fixture attempts zero account writes. It starts no game server, network
listener or market daemon and opens no player database. This tests Localtime's
composition; it does not establish the other mods' gameplay compatibility.

Nine Python client checks pass using the inspected build-3396210 widget classes
with UI/service doubles. They cover this computer's real Windows local clock,
both European 2026 DST transitions through the Windows converter, fractional and
negative UTC offsets, date rollover, a timezone change between refreshes, Neocom
scoping, the five-second refresh, tooltip, unchanged calendar click, disconnect
events, repeated bootstrap/reconnect, later wrappers, unknown widgets and OS
fallback. Python 2.7 grammar parsing passes. Windows time settings are read-only.

The three relevant entries in the actual configured client's code.ccp match
their previously inspected hashes exactly. Localtime does not edit that archive,
add a menu/configuration, or alter server FILETIME, simulation time or saved data.
The 261028.1 handshake is byte-identical to the supported 261018.1 handshake.

## Retail-client evidence and limits

Josh reports the existing 0.1.1 clock working on 261028.1. An existing local
retail-client log also records EVEJS_LOCALTIME:READY:0.1.1 on 2026-10-29. That
establishes client attachment, not a new screenshot/visual or reconnect test.
No retail client or live server was started/restarted for this update. The 0.1.2
version diagnostics have therefore not been observed in a new retail session.
They appear after the next normal Game restart and client reconnect.

Docker, other client builds, visual multi-client gameplay and every Windows
timezone/language combination remain outside this focused check. Existing
translation payloads are preserved; Localtime's clock and ISO-style tooltip use
the same locale-independent display as before.

The local compatibility folder retains focused test receipts, source/widget
hashes, the prior payload ZIP, package hashes and the narrow installation receipt.
Private client references and test doubles are excluded from the distributable ZIP.
