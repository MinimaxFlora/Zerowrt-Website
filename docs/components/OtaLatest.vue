<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useData, withBase } from "vitepress";

interface DeviceEntry {
  version?: string;
  build_date?: number;
  url?: string;
  sha256?: string;
  size?: number;
  file?: string;
  target?: string;
  device?: string;
  label?: string;
}

interface OtaIndex {
  generated?: number;
  dist?: string;
  devices?: Record<string, DeviceEntry>;
}

interface DeviceCard extends DeviceEntry {
  key: string;
  title: string;
}

const { lang } = useData();
const isEnglish = computed(() => String(lang.value).toLowerCase().startsWith("en"));
const ui = computed(() =>
  isEnglish.value
    ? {
        kicker: "Latest builds",
        title: "Latest firmware",
        indexUpdated: "Index updated",
        readingIndex: "Reading index…",
        loading: "Loading firmware index…",
        search: "Search devices or versions…",
        devices: "devices",
        noMatch: "No matching devices.",
        buildTime: "Build time",
        fileSize: "File size",
        target: "Target",
        deviceKey: "Device key",
        latest: "Latest",
        copy: "Copy SHA256",
        copied: "Copied",
        download: "Download",
        changelog: "Changelog",
        unknown: "unknown",
        notRecorded: "Not recorded",
        unknownSize: "Unknown",
        notProvided: "Not provided",
      }
    : {
        kicker: "Latest builds",
        title: "最新固件",
        indexUpdated: "索引更新于",
        readingIndex: "正在读取索引…",
        loading: "正在加载固件索引…",
        search: "搜索设备或版本…",
        devices: "个设备",
        noMatch: "没有匹配的设备。",
        buildTime: "构建时间",
        fileSize: "文件大小",
        target: "目标平台",
        deviceKey: "设备标识",
        latest: "最新",
        copy: "复制 SHA256",
        copied: "已复制",
        download: "下载固件",
        changelog: "更新日志",
        unknown: "未知",
        notRecorded: "未记录",
        unknownSize: "未知",
        notProvided: "未提供",
      },
);
const loading = ref(true);
const error = ref("");
const index = ref<OtaIndex>({});
const query = ref("");
const copied = ref("");

const cards = computed<DeviceCard[]>(() => {
  const devices = index.value.devices ?? {};
  return Object.entries(devices)
    .map(([key, entry]) => ({
      ...entry,
      key,
      title: entry.label || entry.device || key,
    }))
    .sort((left, right) => (right.build_date ?? 0) - (left.build_date ?? 0));
});

const deviceCount = computed(() => `${filtered.value.length} ${isEnglish.value ? (filtered.value.length === 1 ? "device" : "devices") : "个设备"}`);

const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase();
  if (!needle) return cards.value;
  return cards.value.filter((card) =>
    [card.title, card.key, card.device, card.version].some((value) =>
      String(value ?? "").toLowerCase().includes(needle),
    ),
  );
});

function formatDate(value?: number): string {
  if (!value) return ui.value.notRecorded;
  return new Intl.DateTimeFormat(isEnglish.value ? "en-US" : "zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value * 1000));
}

function formatSize(value?: number): string {
  if (!value || value < 0) return ui.value.unknownSize;
  const units = ["B", "KiB", "MiB", "GiB"];
  let size = value;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${unit === 0 ? Math.round(size) : size.toFixed(1)} ${units[unit]}`;
}

function shortSha(value?: string): string {
  if (!value) return ui.value.notProvided;
  return value.length > 22 ? `${value.slice(0, 12)}…${value.slice(-8)}` : value;
}

async function copySha(card: DeviceCard): Promise<void> {
  if (!card.sha256) return;
  await navigator.clipboard.writeText(card.sha256);
  copied.value = card.key;
  window.setTimeout(() => {
    if (copied.value === card.key) copied.value = "";
  }, 1800);
}

onMounted(async () => {
  try {
    const response = await fetch(withBase("/ota.json"), { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    index.value = (await response.json()) as OtaIndex;
  } catch (reason) {
    error.value = `无法读取 OTA 索引：${reason instanceof Error ? reason.message : String(reason)}`;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section id="firmware" class="ota-section">
    <div class="ota-section-head">
      <div>
        <p class="ota-kicker">{{ ui.kicker }}</p>
        <h2>{{ ui.title }}</h2>
        <p class="ota-index-time">
          <template v-if="index.generated">{{ ui.indexUpdated }} {{ formatDate(index.generated) }}</template>
          <template v-else>{{ ui.readingIndex }}</template>
        </p>
      </div>
      <div class="ota-toolbar">
        <input v-model="query" class="ota-search" type="search" :placeholder="ui.search" />
        <span class="ota-count">{{ deviceCount }}</span>
      </div>
    </div>

    <p v-if="loading" class="ota-index-time">{{ ui.loading }}</p>
    <p v-else-if="error" class="ota-alert">{{ error }}</p>
    <p v-else-if="!filtered.length" class="ota-index-time">{{ ui.noMatch }}</p>

    <div v-else class="ota-grid">
      <article v-for="card in filtered" :key="card.key" class="ota-card">
        <div class="ota-card-top">
          <span class="ota-device" :title="card.title">{{ card.title }}</span>
          <span class="ota-badge">{{ ui.latest }}</span>
        </div>
        <div class="ota-version">{{ card.version || ui.unknown }}</div>
        <div class="ota-meta">
          <div><strong>{{ ui.buildTime }}</strong>{{ formatDate(card.build_date) }}</div>
          <div><strong>{{ ui.fileSize }}</strong>{{ formatSize(card.size) }}</div>
          <div><strong>{{ ui.target }}</strong>{{ card.target || "mediatek/filogic" }}</div>
          <div><strong>{{ ui.deviceKey }}</strong>{{ card.key }}</div>
        </div>
        <div class="ota-sha">
          <code :title="card.sha256">{{ shortSha(card.sha256) }}</code>
          <button type="button" @click="copySha(card)">
            {{ copied === card.key ? ui.copied : ui.copy }}
          </button>
        </div>
        <div class="ota-actions">
          <a v-if="card.url" class="ota-download" :href="card.url" target="_blank" rel="noopener noreferrer">
            {{ ui.download }}
          </a>
          <a class="ota-log-link" :href="withBase(`${isEnglish ? '/en/changelog' : '/changelog'}?device=${encodeURIComponent(card.key)}`)">
            {{ ui.changelog }}
          </a>
        </div>
      </article>
    </div>
  </section>
</template>
