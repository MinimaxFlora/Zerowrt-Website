---
layout: home
title: ZeroWrt
titleTemplate: Firmware download & OTA
tk:
  teekHome: false

hero:
  name: ZeroWrt
  text: Lightweight firmware for MT798x
  tagline: Download the latest build, or update directly from LuCI.
  image:
    src: /hero-login.png
    alt: ZeroWrt login screen
  actions:
    - theme: brand
      text: Download firmware
      link: "#firmware"
    - theme: alt
      text: View changelog
      link: /en/changelog

features:
  - icon: 🚀
    title: OTA updates
    details: Check, download, verify and install new builds from System → OTA Firmware Update in LuCI.
  - icon: 🧩
    title: Multiple devices
    details: Independent builds for Ruijie, Netcore and Super Gateway devices, matched by device key.
  - icon: 🛡️
    title: Verified images
    details: Every image is checked against its SHA256 hash before installation; mismatches are discarded.
  - icon: 💾
    title: Keep settings
    details: Upgrades keep the current configuration, LAN address, WiFi and package settings by default.
---

<script setup>
import OtaLatest from "../components/OtaLatest.vue";
</script>

<OtaLatest />
