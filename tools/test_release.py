"""Release-contract regression checks; no server, client or mod code executes."""
import io
import json
from pathlib import Path
import shutil
import tempfile
import unittest
import zipfile

import release


class ReleaseTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.source = self.root / "source"
        original = Path(__file__).resolve().parents[1]
        for name in release.PUBLIC_FILES:
            target = self.source / name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(original / name, target)
        self.manifest_path = self.source / "evejs-launcher.mod.json"
        self.manifest = json.loads(self.manifest_path.read_bytes())
        self.version = self.manifest["version"]
        notes = self.source / "releases" / f"{self.version}.md"
        notes.parent.mkdir()
        notes.write_text("Reviewed release notes.\n", encoding="utf-8")
        self.output = self.root / "dist"

    def write_manifest(self):
        self.manifest_path.write_text(json.dumps(self.manifest), encoding="utf-8")

    def test_complete_pair_and_exact_payload(self):
        assets = release.build_or_verify(self.source, self.output, tag="v" + self.version)
        release.build_or_verify(self.source, self.output, tag="v" + self.version, verify=True)
        name = release.UPDATES["asset"].replace("{version}", self.version)
        with zipfile.ZipFile(io.BytesIO(assets[name])) as archive:
            self.assertIsNone(archive.testzip())
            self.assertEqual(archive.namelist(), ["LocaltimeZonePatch/" + value for value in release.PUBLIC_FILES])
            for value in release.PUBLIC_FILES:
                self.assertEqual(archive.read("LocaltimeZonePatch/" + value), (self.source / value).read_bytes())
        sidecar = json.loads(assets[name[:-4] + ".update.json"])
        self.assertEqual(sidecar, dict(schemaVersion=1, id=release.MOD_ID, version=self.version,
                                     asset=name, evejsVersions=self.manifest["compatibility"]["evejsVersions"]))

    def test_repeated_build_has_identical_bytes(self):
        first = release.build_or_verify(self.source, self.output)
        self.assertEqual(first, release.build_or_verify(self.source, self.root / "second"))
        self.assertEqual(first, release.build_or_verify(self.source, self.output))

    def test_missing_sidecar_is_rejected(self):
        assets = release.build_or_verify(self.source, self.output)
        next(self.output.glob("*.update.json")).unlink()
        with self.assertRaisesRegex(release.ReleaseError, "exactly ZIP, sidecar"):
            release.build_or_verify(self.source, self.output, verify=True)
        self.assertEqual(len(assets), 3)

    def test_changed_asset_is_not_overwritten(self):
        release.build_or_verify(self.source, self.output)
        checksum = self.output / "SHA256SUMS.txt"
        checksum.write_bytes(b"wrong")
        with self.assertRaisesRegex(release.ReleaseError, "Refusing to overwrite"):
            release.build_or_verify(self.source, self.output)
        self.assertEqual(checksum.read_bytes(), b"wrong")
        with self.assertRaisesRegex(release.ReleaseError, "bytes differ"):
            release.build_or_verify(self.source, self.output, verify=True)

    def test_missing_or_different_update_contract_is_rejected(self):
        del self.manifest["updates"]
        self.write_manifest()
        with self.assertRaisesRegex(release.ReleaseError, "updates declaration"):
            release.expected_assets(self.source)
        self.manifest["updates"] = dict(release.UPDATES, repository="someone/else")
        self.write_manifest()
        with self.assertRaisesRegex(release.ReleaseError, "updates declaration"):
            release.expected_assets(self.source)

    def test_wrong_tag_and_missing_notes_are_rejected(self):
        with self.assertRaisesRegex(release.ReleaseError, "tag must match"):
            release.expected_assets(self.source, "v99.0.0")
        (self.source / "releases" / f"{self.version}.md").unlink()
        with self.assertRaisesRegex(release.ReleaseError, "Missing or unsafe"):
            release.expected_assets(self.source)

    def test_duplicate_manifest_fields_are_rejected(self):
        text = self.manifest_path.read_text(encoding="utf-8")
        self.manifest_path.write_text('{"id":"duplicate",' + text[1:], encoding="utf-8")
        with self.assertRaisesRegex(release.ReleaseError, "Duplicate JSON field"):
            release.expected_assets(self.source)


if __name__ == "__main__":
    unittest.main()
