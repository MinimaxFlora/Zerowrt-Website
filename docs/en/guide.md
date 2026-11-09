---
title: Upgrade guide
---

## Upgrade from LuCI

1. Open the router administration page and go to **System → OTA Firmware Update**.
2. Click **Check for updates** and review the version, build time and changelog.
3. Click **Download** and wait for the SHA256 verification to finish.
4. Click **Install**; the device reboots automatically. Existing settings are kept by default.

> Do not power off the device during the upgrade. The LAN address, WiFi name and password remain unchanged.

## Manual download

Choose your device on the home page, download the `*-squashfs-sysupgrade.bin`
image, then upload it from **System → Backup / Flash Firmware** in LuCI. For a
major-version jump or a first install, do not keep the configuration.

## Verify the image

Each release shows its SHA256. You can verify the downloaded file locally:

```bash
sha256sum zerowrt-*.bin
```

Only flash the image when the hash matches the value on this page.

## FAQ

### "No firmware for this device" is shown

The device key under **Current firmware** is what the updater uses. Download the
image for that exact device, or set the device key manually in the OTA settings.

### Download fails

The image is downloaded to `/tmp`; free up memory if space is insufficient, or
use the manual download option.
