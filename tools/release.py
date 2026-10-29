"""Build and verify the complete public release set without running mod code."""
from __future__ import annotations

import argparse
import hashlib
import io
import json
from pathlib import Path
import re
import zipfile

MOD_ID = "evejs-localtime-zone-patch"
UPDATES = {
    "provider": "github",
    "repository": "V0nCleef/EveJS-Localtime-zone-Patch",
    "asset": "EveJS-Localtime-zone-Patch-{version}.zip",
    "channel": "stable",
    "tagPrefix": "v",
}
PUBLIC_FILES = (
    "CHANGELOG.md", "client/companion.py", "client/localtime.py",
    "COMPATIBILITY-261018.1.md", "COMPATIBILITY-261028.1.md",
    "evejs-launcher.mod.json", "lib/delivery.js", "loader.js", "README.md", "VERIFICATION.md",
)


class ReleaseError(ValueError):
    pass


def _unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ReleaseError(f"Duplicate JSON field: {key}")
        result[key] = value
    return result


def _read(source, name):
    path = source / name
    if path.is_symlink() or not path.is_file() or source not in path.resolve().parents:
        raise ReleaseError(f"Missing or unsafe public file: {name}")
    # Reject linked parent directories as well as linked leaf files.
    if any(parent.is_symlink() for parent in path.parents if parent != source and source in parent.parents):
        raise ReleaseError(f"Linked public directory: {name}")
    data = path.read_bytes()
    if not data or len(data) > 10 * 1024 * 1024:
        raise ReleaseError(f"Empty or oversized public file: {name}")
    return data


def expected_assets(source: Path, tag: str | None = None, prepared_zip: Path | None = None) -> dict[str, bytes]:
    source = source.resolve()
    files = {name: _read(source, name) for name in PUBLIC_FILES}
    manifest = json.loads(files["evejs-launcher.mod.json"], object_pairs_hook=_unique_object)
    version = manifest.get("version")
    if not isinstance(version, str) or not re.fullmatch(r"(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)", version):
        raise ReleaseError("A stable semantic version is required.")
    if tag is not None and tag != "v" + version:
        raise ReleaseError("The tag must match the manifest version.")
    if (manifest.get("schemaVersion") != 3 or manifest.get("id") != MOD_ID
            or manifest.get("kind") != "loader"
            or manifest.get("activation") != {"strategy": "loader_rename"}
            or manifest.get("supportedBackends") != ["native"]
            or manifest.get("restart") != "game_server"):
        raise ReleaseError("The reviewed Localtime manifest contract changed.")
    if manifest.get("updates") != UPDATES:
        raise ReleaseError("The complete, matching GitHub updates declaration is required.")
    versions = manifest.get("compatibility", {}).get("evejsVersions")
    if (not isinstance(versions, list) or not versions
            or any(not isinstance(value, str) or not value.strip() for value in versions)
            or len(set(versions)) != len(versions)):
        raise ReleaseError("List the advisory reviewed EveJS versions.")
    _read(source, f"releases/{version}.md")
    filename = UPDATES["asset"].replace("{version}", version)
    if prepared_zip is not None:
        if prepared_zip.is_symlink() or not prepared_zip.is_file():
            raise ReleaseError("The approved ZIP must be an ordinary file.")
        zip_bytes = prepared_zip.read_bytes()
        try:
            with zipfile.ZipFile(io.BytesIO(zip_bytes)) as archive:
                if archive.namelist() != ["LocaltimeZonePatch/" + name for name in files]:
                    raise ReleaseError("Approved ZIP members differ from the public allowlist.")
                if archive.testzip() is not None:
                    raise ReleaseError("Approved ZIP has a CRC failure.")
                for name, data in files.items():
                    if archive.read("LocaltimeZonePatch/" + name) != data:
                        raise ReleaseError(f"Approved ZIP payload differs from source: {name}")
        except zipfile.BadZipFile as exc:
            raise ReleaseError("The approved ZIP is invalid.") from exc
    else:
        # Match the 0.1.2 installed/tested package recipe. Set Windows metadata
        # explicitly so source builds on Linux use the same container fields.
        # --prepared-zip preserves already approved bytes without recompression.
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
            for name, data in files.items():
                entry = zipfile.ZipInfo("LocaltimeZonePatch/" + name, (2026, 10, 29, 0, 0, 0))
                entry.create_system = 0
                entry.external_attr = 0o600 << 16
                entry.compress_type = zipfile.ZIP_DEFLATED
                archive.writestr(entry, data)
        zip_bytes = buffer.getvalue()
    sidecar = dict(schemaVersion=1, id=MOD_ID, version=version, asset=filename, evejsVersions=versions)
    assets = {
        filename: zip_bytes,
        filename[:-4] + ".update.json": (json.dumps(sidecar, indent=2) + "\n").encode("utf-8"),
    }
    assets["SHA256SUMS.txt"] = "".join(
        f"{hashlib.sha256(data).hexdigest()}  {name}\n" for name, data in assets.items()
    ).encode("ascii")
    return assets


def build_or_verify(source: Path, output: Path, *, tag=None, verify=False, prepared_zip=None):
    assets = expected_assets(source, tag, prepared_zip)
    output = output.resolve()
    if output == source.resolve():
        raise ReleaseError("Use a separate output directory.")
    if verify:
        if not output.is_dir() or {path.name for path in output.iterdir()} != set(assets):
            raise ReleaseError("The release directory must contain exactly ZIP, sidecar and checksums.")
        for name, data in assets.items():
            path = output / name
            if path.is_symlink() or not path.is_file() or path.read_bytes() != data:
                raise ReleaseError(f"Release bytes differ: {name}")
    else:
        output.mkdir(parents=True, exist_ok=True)
        # Check every existing asset before creating any new file. Never overwrite.
        for name, data in assets.items():
            path = output / name
            if path.exists() and (path.is_symlink() or not path.is_file() or path.read_bytes() != data):
                raise ReleaseError(f"Refusing to overwrite a different release asset: {name}")
        for name, data in assets.items():
            path = output / name
            if not path.exists():
                with path.open("xb") as handle:
                    handle.write(data)
        build_or_verify(source, output, tag=tag, verify=True, prepared_zip=prepared_zip)
    return assets


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--out", type=Path, default=Path("dist"))
    parser.add_argument("--tag")
    parser.add_argument("--prepared-zip", type=Path, help="Validate and retain exact already-tested ZIP bytes.")
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    try:
        assets = build_or_verify(args.source, args.out, tag=args.tag, verify=args.verify, prepared_zip=args.prepared_zip)
    except (ReleaseError, OSError, json.JSONDecodeError) as exc:
        parser.exit(1, f"Release validation failed: {exc}\n")
    for name, data in assets.items():
        print(f"{hashlib.sha256(data).hexdigest()}  {len(data):>8}  {name}")


if __name__ == "__main__":
    main()
