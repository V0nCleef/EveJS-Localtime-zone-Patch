# EveJS Localtime zone Patch

**Your Neocom clock, in your timezone.**

Shows each player's computer time in the in-game clock, with automatic
summer/winter adjustment. No settings or extra menus required.

![In-game clock showing local time and UTC offset](docs/local-clock.png)

*User-provided in-game screenshot: 16:08, UTC+02:00.*

## Download

[**Download v0.1.0**](https://github.com/V0nCleef/EveJS-Localtime-zone-Patch/releases/latest/download/EveJS-Localtime-zone-Patch-0.1.0.zip)
or visit the [releases page](https://github.com/V0nCleef/EveJS-Localtime-zone-Patch/releases).

Use the release ZIP when installing through the Launcher.

## Install with the EveJS Launcher

1. Download `EveJS-Localtime-zone-Patch-0.1.0.zip` from Releases.
2. Open **Mods -> Add ZIP** in the EveJS Launcher.
3. Select the downloaded ZIP and **enable** the mod.
4. Restart **Game**, then reconnect your EVE clients.

Install it once on the server. Each connecting player automatically sees the
time and timezone configured on their own computer.

## What changes

- The Neocom clock displays the player's local time and refreshes every five seconds.
- Summer/winter adjustment follows the computer's daylight saving settings.
- Hovering over the clock shows the local date, time and UTC offset.
- Clicking the clock still opens the normal calendar.
- No timezone configuration, location lookup or external service is needed.

**Actual server time stays unchanged.** Skill queues, market expiry, calendar
events, simulation time and other game timestamps keep their original behavior.
The mod never edits `code.ccp`, EveJS source, player databases or Windows time settings.

## Compatibility

- **EveJS:** 0.12.9, Native backend.
- **EVE client:** Windows build 3396210.
- **Verified login composition:** AutoMining, NPC Market Buyers and Asteroid Erosion.

Docker and other client/server builds are not declared supported in this release.
If automatic daylight saving adjustment is disabled in Windows, the mod respects that setting.

## Disable or remove

Disable or remove the mod in the Launcher, restart **Game**, then reconnect
clients. The runtime clock hooks are restored on disconnect.

## Manual Native launch

Extract the release ZIP into `mods/LocaltimeZonePatch` and preload `loader.js`
with Node's `--require` before `server/index.js`.

## Troubleshooting and verification

The server prints `[EveJS Localtime zone Patch]` status. The client records a
small status log at `cache:/evejs-localtime-zone-patch.log`; successful attachment
is `EVEJS_LOCALTIME:READY:0.1.0`. No character or account data is recorded.

An unsupported login builder or clock widget leaves the mod inactive while
preserving normal login and time behavior.

The running mod was confirmed working by its user, with the screenshot above.
Fifteen focused automated checks passed, including both DST transitions.
See [VERIFICATION.md](VERIFICATION.md) for the checks and coverage limits.
