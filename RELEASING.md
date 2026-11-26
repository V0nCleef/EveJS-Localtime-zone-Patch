# Release packaging

For 0.1.5, build and verify the complete new source package with:

```text
python -m unittest discover -s tools -p "test_release.py" -v
python tools/release.py --tag v0.1.5 --out dist
python tools/release.py --tag v0.1.5 --out dist --verify
```

The thirteen-file package allowlist includes COMPATIBILITY-261126.2.md. The
0.1.4 prepared-ZIP instructions below describe its preserved historical release;
do not reuse or replace the 0.1.4 assets when publishing 0.1.5.

The Launcher needs both a manifest update source and a matching release sidecar.
A ZIP alone is installable with Add ZIP but will not provide update discovery.

The manifest declares this source (Localtime has no configuration to preserve):

```json
"updates": {
  "provider": "github",
  "repository": "V0nCleef/EveJS-Localtime-zone-Patch",
  "asset": "EveJS-Localtime-zone-Patch-{version}.zip",
  "channel": "stable",
  "tagPrefix": "v"
}
```

The earlier 0.1.0 and original 0.1.1 packages omitted that object. Their installed
copies need the one-time reinstall described in README, or a backed-up,
author-reviewed addition of this exact object to their existing manifest.
No loader or client code needs replacement merely to enable discovery. Adding
the source does not force an update: an installed 0.1.1 remains current until a
higher version is published. Never silently change its version to force an offer.

## Build and verify

Use Python 3.11 or newer; the tools use only the standard library. From a clean
checkout, update the manifest version, changelog, README links and add
`releases/<version>.md`. Keep the source declaration unchanged unless a deliberate
manual migration is planned: the Launcher checks it again before installation.

```text
python -m unittest discover -s tools -p "test_release.py" -v
python tools/release.py --tag v0.1.4 --out dist --prepared-zip /path/to/approved/EveJS-Localtime-zone-Patch-0.1.4.zip
python tools/release.py --tag v0.1.4 --out dist --prepared-zip /path/to/approved/EveJS-Localtime-zone-Patch-0.1.4.zip --verify
```

Use the new version's tag for future releases. The builder rejects a mismatched
tag, missing update source, changed source contract, absent release notes, unsafe
public paths or an existing output with different bytes. It never runs mod code.
`--prepared-zip` validates every member against the exact public source allowlist
and retains the already qualified ZIP bytes without recompression. Missing,
extra, duplicate or changed members are rejected. This is the publication path
for 0.1.4, whose approved SHA-256 is
`500a936a19dd6d22da52d4f20fe232144669defcb673dadf30be3bbd77c29a71`.
Never replace that candidate to hide a different repack.

For 0.1.4 the packaged docs retain the candidate snapshot. Final Windows Native
qualification and release/install notes are in `releases/0.1.4.md`, outside the
immutable ZIP. Preserve every ZIP payload file in the tagged source verbatim.

Without `--prepared-zip`, the tool builds source artifacts for CI using fixed
container fields, compression and member order. Repeated builds on the same
runtime are identical; different zlib versions are not promised identical bytes.
In either path, exact uncompressed source members are enforced. The public-file
allowlist excludes private inspection material, test fixtures, `.git`, caches,
release tools and the repository-only screenshot/releasing guide. CI runs the
focused packaging checks, not a game server or client.

Publish all three generated files to the same GitHub release:

- `EveJS-Localtime-zone-Patch-<version>.zip`
- `EveJS-Localtime-zone-Patch-<version>.update.json`
- `SHA256SUMS.txt`

The sidecar names the same mod ID, version, ZIP and advisory EveJS versions as
the manifest. The Launcher also validates the downloaded ZIP's manifest before
swapping the installed package. Hashes and exact patch-source checks remain
enforced; a server version label alone does not establish compatibility.

Create a draft, upload the complete set, download it independently and verify
the bytes against the build before publishing. Then test the public release with
the production Launcher's `check_update`, download verification and Add ZIP
import in a disposable root. A newly published version must be offered to a
lower installed version with the matching source; the same installed version
must not be offered again. Do not overwrite an existing release's assets.

The corrected 0.1.1 re-release is an explicit exception requested after the
original release was deleted. Its old commit remains in Git history. Future
releases must increment the version normally.
