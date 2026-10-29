# Native integration checks

`native-login.test.cjs` is the authored focused integration test used for the
261028.1 compatibility pass, with personal paths removed. It requires an
inspected EveJS source tree containing the current AutoMining, Asteroid Erosion,
NPC Buyers delivery helpers and one captured Launcher shared Mods menu bridge.
No EveJS or game-client source/assets are included in this repository.

Set `EVEJS_TEST_ROOT` to that source root and `EVEJS_TEST_SCRATCH` to a disposable
directory inside your test project, then run:

```text
node --test tests/native-login.test.cjs
```

The test compiles the native handshake in memory with account/config/service
doubles; it opens no game database and starts no server or listener. It leaves
its small loader fixture in the specified scratch directory for inspection.
Remove that task-owned fixture when finished. Do not use a live player's state
as a test fixture or restart a player server to run this test.

The Python clock/widget pass uses separately retained inspected client classes
with UI doubles. Those private references are excluded from public source and
the release ZIP. See VERIFICATION.md for the performed checks and their limits.
