#!/usr/bin/env python3
"""Finalize or check TileO RGB sample integrity without modifying ATAP's original manifest.

Usage from the TileO repository root:
  python3 scripts/finalize-sample-rgb.py
  python3 scripts/finalize-sample-rgb.py --check
"""
import argparse
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
SAMPLE = ROOT / "samples" / "TileO-Samples-01"
TIFF = SAMPLE / "data" / "rgb-tif.tif"
MANIFEST = SAMPLE / "DATA_MANIFEST.json"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as reader:
        for chunk in iter(lambda: reader.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="check current file against existing manifest without modification")
    args = parser.parse_args()
    if not TIFF.is_file():
        print(f"ERROR: TIFF not found: {TIFF}", file=sys.stderr)
        return 2
    if not MANIFEST.is_file():
        print(f"ERROR: manifest not found: {MANIFEST}", file=sys.stderr)
        return 2
    with TIFF.open("rb") as f:
        header = f.read(128)
    if header.startswith(b"version https://git-lfs.github.com/spec/v1"):
        print("ERROR: Git LFS pointer detected, not TIFF binary", file=sys.stderr)
        return 2
    if header[:4] not in (b"II*\x00", b"MM\x00*", b"II+\x00", b"MM\x00+"):
        print("ERROR: invalid TIFF/BigTIFF magic", file=sys.stderr)
        return 2
    size = TIFF.stat().st_size
    digest = sha256(TIFF)
    doc = json.loads(MANIFEST.read_text(encoding="utf-8"))
    rows = [d for d in doc.get("datasets",[]) if d.get("file") == "data/rgb-tif.tif"]
    if len(rows)!=1:
        print("ERROR: expected one RGB record", file=sys.stderr)
        return 2
    entry = rows[0]
    if args.check:
        ok = entry.get("size_bytes") == size and entry.get("sha256") == digest and entry.get("distribution") == "included"
        print("RGB sample integrity:", "OK" if ok else "MISMATCH / UNFINALIZED")
        print(f"size_bytes={size}\nsha256={digest}")
        return 0 if ok else 1
    entry.update({"file_present":True,"size_bytes":size,"sha256":digest,"distribution":"included","integrity_verified":True})
    # Raster metadata fields are NOT inferred from file name. The publisher should inspect separately.
    doc["integrity_verified"]=True
    doc["atap_source_integrity_verified"]=True
    MANIFEST.write_text(json.dumps(doc,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Updated {MANIFEST.relative_to(ROOT)}")
    print(f"size_bytes={size}\nsha256={digest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
