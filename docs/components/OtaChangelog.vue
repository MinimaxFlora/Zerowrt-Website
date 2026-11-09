<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useData, withBase } from "vitepress";
import DOMPurify from "dompurify";
import { marked } from "marked";

interface Release {
  version?: string;
  build_date?: number;
  url?: string;
  sha256?: string;
  size?: number;
  file?: string;
  target?: string;
  device?: string;
  label?: string;
  changelog?: string;
}

const { lang } = useData();
const isEnglish = computed(() => String(lang.value).toLowerCase().startsWith("en"));
const ui = computed(() =>
  isEnglish.value
    ? {
        allDevices: "All devices",
        search: "Search versions, devices or changes…",
        records: "records",
        loading: "Loading changelog…",
        empty: "No matching releases.",
        download: "Download this build",
        noLog: "No changelog recorded for this build.",
        previous: "Previous",
        next: "Next",
        page: "Page",
        filter: "Filter by device",
        notRecorded: "Not recorded",
        unknownSize: "Unknown",
        unknown: "unknown",
      }
    : {
        allDevices: "全部设备",
        search: "搜索版本、设备或更新内容…",
        records: "条记录",
        loading: "正在加载更新日志…",
        empty: "没有匹配的更新记录。",
        download: "下载此版本",
        noLog: "此版本没有记录更新日志。",
        previous: "上一页",
        next: "下一页",
        page: "第",
        filter: "按设备筛选",
        notRecorded: "未记录",
        unknownSize: "未知",
        unknown: "未知",
      },
);
const loading = ref(true);
const error = ref("");
const releases = ref<Release[]>([]);
const selected = ref("");
const query = ref("");
const page = ref(1);
const pageSize = 8;

const devices = computed(() => {
  const map = new Map<string, string>();
  for (const release of releases.value) {
    const key = release.device || "unknown";
    if (!map.has(key)) map.set(key, release.label || key);
  }
  return [...map.entries()].map(([key, title]) => ({ key, title }));
});

const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase();
  return releases.value.filter((release) => {
    if (selected.value && release.device !== selected.value) return false;
    if (!needle) return true;
    return [release.version, release.device, release.label, release.changelog].some((value) =>
      String(value ?? "").toLowerCase().includes(needle),
    );
  });
});

const recordCount = computed(() => `${filtered.value.length} ${isEnglish.value ? (filtered.value.length === 1 ? "record" : "records") : "条记录"}`);

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)));
const paged = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize));

watch([selected, query], () => {
  page.value = 1;
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

function renderLog(value?: string): string {
  if (!value) return `<p>${ui.value.noLog}</p>`;
  return DOMPurify.sanitize(marked.parse(value) as string);
}

onMounted(async () => {
  const requested = new URLSearchParams(window.location.search).get("device");
  if (requested) selected.value = requested;
  try {
    const response = await fetch(withBase("/history.json"), { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as { releases?: Release[] };
    releases.value = Array.isArray(data.releases) ? data.releases : [];
  } catch (reason) {
    error.value = `无法读取更新日志：${reason instanceof Error ? reason.message : String(reason)}`;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="ota-log-page">
    <div class="ota-toolbar">
      <select v-model="selected" class="ota-select" :aria-label="ui.filter">
        <option value="">{{ ui.allDevices }}</option>
        <option v-for="device in devices" :key="device.key" :value="device.key">
          {{ device.title }}
        </option>
      </select>
      <input v-model="query" class="ota-search" type="search" :placeholder="ui.search" />
      <span class="ota-count">{{ recordCount }}</span>
    </div>

    <p v-if="loading" class="ota-index-time">{{ ui.loading }}</p>
    <p v-else-if="error" class="ota-alert">{{ error }}</p>
    <p v-else-if="!filtered.length" class="ota-index-time">{{ ui.empty }}</p>

    <template v-else>
      <article v-for="release in paged" :key="`${release.device}-${release.version}`" class="ota-release">
        <header class="ota-release-top">
          <div>
            <div class="ota-release-version">{{ release.version || ui.unknown }}</div>
            <div class="ota-release-date">{{ release.label || release.device }} · {{ formatDate(release.build_date) }}</div>
          </div>
          <span class="ota-badge">{{ release.device }}</span>
        </header>
        <div class="ota-release-meta">
          <span>{{ release.target || "mediatek/filogic" }}</span>
          <span>{{ formatSize(release.size) }}</span>
          <code v-if="release.sha256" :title="release.sha256">{{ release.sha256.slice(0, 16) }}…</code>
        </div>
        <div class="ota-release-body" v-html="renderLog(release.changelog)" />
        <footer class="ota-release-footer">
          <a v-if="release.url" class="ota-download" :href="release.url" target="_blank" rel="noopener noreferrer">
            {{ ui.download }}
          </a>
        </footer>
      </article>

      <nav v-if="pageCount > 1" class="ota-pager" aria-label="更新日志分页">
        <button type="button" :disabled="page <= 1" @click="page -= 1">{{ ui.previous }}</button>
        <span class="ota-count">{{ ui.page }} {{ page }} / {{ pageCount }}</span>
        <button type="button" :disabled="page >= pageCount" @click="page += 1">{{ ui.next }}</button>
      </nav>
    </template>
  </div>
</template>
