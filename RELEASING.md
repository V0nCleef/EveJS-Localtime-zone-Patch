# Release packaging

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
python tools/release.py --tag v0.1.2 --out dist --prepared-zip /path/to/approved/EveJS-Localtime-zone-Patch-0.1.2.zip
python tools/release.py --tag v0.1.2 --out dist --prepared-zip /path/to/approved/EveJS-Localtime-zone-Patch-0.1.2.zip --verify
```

Use the new version's tag for future releases. The builder rejects a mismatched
tag, missing update source, changed source contract, absent release notes, unsafe
public paths or an existing output with different bytes. It never runs mod code.
`--prepared-zip` validates every member against the exact public source allowlist
and retains the already installed/tested ZIP bytes without recompression. Missing,
extra, duplicate or changed members are rejected. This is the publication path
for 0.1.2, whose approved SHA-256 is
`84ae191c9084103cca6bdee6fb15faada59246e63e546d93d6aa3b47c67a5377`.
Never replace that candidate to hide a different repack.

Without `--prepared-zip`, the tool builds source artifacts for CI using fixed
container fields, compression and member order. Repeated builds on the same
runtime are identical; different zlib versions are not promised identical bytes.
In either path, exact uncompressed source members are enforced. The ten-file
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
