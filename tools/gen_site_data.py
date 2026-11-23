#!/usr/bin/env python3
"""Build ota.json / history.json for the ZeroWrt download site.

The site is pure static HTML, so this script only has to produce the two JSON
files it reads:

* ``ota.json``      - schema 2 index consumed by luci-app-ota and by the page
* ``history.json``  - the last few builds per device, for the changelog view

Source of truth is the GitHub release list of the firmware repository. Each
build publishes an ``ota.json`` (written by ``scripts/gen_ota_index.py`` in the
firmware repo) and an ``ota-meta.json``. Older releases that only have the
image + ``sha256sums`` are reconstructed from those assets, and
``data/seed.json`` keeps entries for devices that have not been rebuilt since
this site existed.

Usage::

    GITHUB_TOKEN=... python3 tools/gen_site_data.py --out .
"""

from __future__ import annotations

import argparse
import json
import os
import re
import urllib.error
import urllib.request
from pathlib import Path

API = "https://api.github.com"
DEFAULT_REPO = "MinimaxFlora/ZeroWrt"
HISTORY_LIMIT = 12

IMAGE_SUFFIXES = (
    "-squashfs-combined-efi.img.gz",
    "-squashfs-combined.img.gz",
    "-squashfs-sysupgrade.bin",
    "-squashfs-sysupgrade.itb",
)


def log(message: str) -> None:
    print(f"[site] {message}", flush=True)


def request(url: str, token: str = "") -> bytes:
    req = urllib.request.Request(url, headers={
        "User-Agent": "Zerowrt-Website/1.0",
        "Accept": "application/vnd.github+json",
    })
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.read()


def get_json(url: str, token: str = ""):
    return json.loads(request(url, token).decode("utf-8"))


def asset_text(asset: dict, token: str) -> str:
    """Download a small release asset as text."""
    url = asset.get("browser_download_url") or asset.get("url")
    try:
        return request(url, token).decode("utf-8", errors="replace")
    except Exception as exc:  # noqa: BLE001
        log(f"warning: cannot read {asset.get('name')}: {exc}")
        return ""


def parse_sha256sums(text: str) -> dict:
    out = {}
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        match = re.match(r"^([0-9a-fA-F]{64})\s+\*?(.+)$", line)
        if match:
            out[match.group(2).strip()] = match.group(1).lower()
    return out


def variant_of(name: str) -> str:
    if name.endswith("-squashfs-combined-efi.img.gz"):
        return "efi"
    if name.endswith("-squashfs-combined.img.gz"):
        return "bios"
    return ""


def human_label(device: str, product: str = "") -> str:
    if product and product.strip() and product.strip().lower() != "generic":
        return product.strip()
    if device.lower().startswith("x86"):
        return f"ZeroWrt {device}"
    return device.replace("_", " ")


def entries_from_ota_json(text: str) -> dict:
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return {}
    if not isinstance(data, dict) or not isinstance(data.get("devices"), dict):
        return {}
    return data["devices"]


def entries_from_meta(meta_text: str, sha_text: str, release: dict) -> dict:
    try:
        meta = json.loads(meta_text)
    except json.JSONDecodeError:
        return {}

    device = str(meta.get("device") or "")
    if not device:
        return {}

    sums = parse_sha256sums(sha_text)
    assets = {a["name"]: a for a in release.get("assets", [])}

    out = {}
    for name, asset in assets.items():
        if not name.endswith(IMAGE_SUFFIXES):
            continue
        sha = sums.get(name)
        if not sha:
            log(f"warning: no sha256 for {name} in {release.get('tag_name')}")
            continue

        variant = variant_of(name)
        key = f"{device}+{variant}" if variant else device
        label = human_label(device, meta.get("product", ""))
        if variant:
            label = f"{label} ({variant.upper()})"

        entry = {
            "version": str(meta.get("version") or release.get("tag_name") or ""),
            "build_date": int(meta.get("build_date") or 0),
            "url": asset["browser_download_url"],
            "sha256": sha,
            "size": int(asset.get("size") or 0),
            "file": name,
            "target": str(meta.get("target") or ""),
            "device": device,
            "label": label,
            "changelog": f"**{release.get('name') or release.get('tag_name')}**\n\n"
                         f"- build_date: {int(meta.get('build_date') or 0)}\n"
                         f"- release: {release.get('html_url', '')}",
        }
        if variant:
            entry["variant"] = variant
        out[key] = entry

    return out


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Generate the ZeroWrt site index")
    parser.add_argument("--repo", default=os.environ.get("FIRMWARE_REPO", DEFAULT_REPO))
    parser.add_argument("--out", default=".", help="repository root to write into")
    parser.add_argument("--seed", default="data/seed.json",
                        help="extra entries merged in (relative to --out)")
    parser.add_argument("--token", default=os.environ.get("GITHUB_TOKEN", ""))
    parser.add_argument("--print", action="store_true")
    args = parser.parse_args(argv)

    out_dir = Path(args.out)
    token = args.token

    releases = []
    page = 1
    while page <= 10:
        url = f"{API}/repos/{args.repo}/releases?per_page=100&page={page}"
        try:
            chunk = get_json(url, token)
        except Exception as exc:  # noqa: BLE001
            log(f"error: cannot list releases: {exc}")
            return 2
        if not isinstance(chunk, list) or not chunk:
            break
        releases.extend(chunk)
        if len(chunk) < 100:
            break
        page += 1

    releases = [r for r in releases if not r.get("draft")]
    log(f"{len(releases)} release(s) from {args.repo}")

    devices: dict[str, dict] = {}
    history: dict[str, list] = {}

    def remember(key: str, entry: dict) -> None:
        current = devices.get(key)
        if current is None or int(entry.get("build_date") or 0) > int(current.get("build_date") or 0):
            devices[key] = entry

    # Seed first: entries for devices that have not been rebuilt yet.
    seed_path = out_dir / args.seed
    if seed_path.exists():
        try:
            seed = json.loads(seed_path.read_text(encoding="utf-8"))
            for key, entry in (seed.get("devices") or {}).items():
                if not isinstance(entry, dict):
                    continue
                remember(key, entry)
                history.setdefault(key, []).append({
                    "version": entry.get("version", ""),
                    "build_date": int(entry.get("build_date") or 0),
                    "url": entry.get("url", ""),
                    "sha256": entry.get("sha256", ""),
                    "size": int(entry.get("size") or 0),
                })
            log(f"seeded {len(seed.get('devices') or {})} device(s) from {seed_path}")
        except (OSError, json.JSONDecodeError) as exc:
            log(f"warning: cannot read seed: {exc}")

    for release in releases:
        assets = {a["name"]: a for a in release.get("assets", [])}
        found: dict = {}

        if "ota.json" in assets:
            found = entries_from_ota_json(asset_text(assets["ota.json"], token))
        elif "ota-meta.json" in assets:
            meta_text = asset_text(assets["ota-meta.json"], token)
            sha_text = asset_text(assets["sha256sums"], token) if "sha256sums" in assets else ""
            found = entries_from_meta(meta_text, sha_text, release)

        if not found:
            continue

        log(f"{release.get('tag_name')}: {len(found)} entr(y/ies)")
        for key, entry in found.items():
            entry = dict(entry)
            entry.setdefault("label", human_label(entry.get("device") or key.split("+")[0], ""))
            remember(key, entry)

            item = {
                "version": entry.get("version", ""),
                "build_date": int(entry.get("build_date") or 0),
                "url": entry.get("url", ""),
                "sha256": entry.get("sha256", ""),
                "size": int(entry.get("size") or 0),
            }
            bucket = history.setdefault(key, [])
            if all(int(x.get("build_date") or 0) != item["build_date"] for x in bucket):
                bucket.append(item)

    for key in history:
        history[key].sort(key=lambda x: int(x.get("build_date") or 0), reverse=True)
        history[key] = history[key][:HISTORY_LIMIT]

    index = {
        "schema": 2,
        "generator": "Zerowrt-Website gen_site_data.py",
        "generated": __import__("time").time().__int__(),
        "dist": "ZeroWrt",
        "devices": dict(sorted(devices.items())),
    }

    history_doc = {
        "schema": 1,
        "generated": index["generated"],
        "dist": "ZeroWrt",
        "devices": history,
    }

    (out_dir / "ota.json").write_text(
        json.dumps(index, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    (out_dir / "history.json").write_text(
        json.dumps(history_doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    log(f"wrote ota.json ({len(devices)} device key(s)) and history.json")

    if args.print:
        print(json.dumps(index, indent=2, ensure_ascii=False))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
