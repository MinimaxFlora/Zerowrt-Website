---
title: 更新日志
aside: false
sidebar: false
---

<script setup>
import OtaChangelog from "./components/OtaChangelog.vue";
</script>

<p class="ota-lead">
每次构建都会追加一条记录。这里按时间倒序展示全部历史版本，可按设备筛选或搜索；
首页只显示每台设备的最新版本，不展开完整日志。
</p>

<OtaChangelog />
