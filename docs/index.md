---
layout: home
title: ZeroWrt
titleTemplate: 固件下载与在线升级
tk:
  teekHome: false

hero:
  name: ZeroWrt
  text: 为 MT798x 打造的轻量固件
  tagline: 下载最新构建，或直接在 LuCI 里检查并安装更新。
  actions:
    - theme: brand
      text: 下载最新固件
      link: "#firmware"
    - theme: alt
      text: 查看更新日志
      link: /changelog

features:
  - icon: 🚀
    title: 在线升级
    details: 固件内置 OTA，在 LuCI 的「系统 → 在线升级」里即可检查、下载、校验并安装。
  - icon: 🧩
    title: 多设备
    details: 锐捷、Netcore、Super Gateway 等设备独立构建，索引按设备分别匹配。
  - icon: 🛡️
    title: 完整性校验
    details: 下载完成后强制校验 SHA256，不匹配的镜像不会被写入。
  - icon: 💾
    title: 保留配置
    details: 默认保留当前配置升级，管理地址、WiFi 与插件设置不会丢失。
---

<script setup>
import OtaLatest from "./components/OtaLatest.vue";
</script>

<OtaLatest />
