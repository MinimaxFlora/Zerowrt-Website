'use strict';

const PROXY = 'https://gh-proxy.tatalvpai.vip/';
const REPO = 'https://github.com/MinimaxFlora/ZeroWrt';

const I18N = {
  zh: {
    'nav.firmware': '固件下载',
    'nav.ota': '在线升级',
    'nav.changelog': '更新日志',
    'hero.eyebrow': 'OpenWrt / LEDE · 自动构建',
    'hero.title': '为你的设备准备的',
    'hero.lede': '按设备查看最新构建、校验和与更新日志；固件内置在线升级，装好之后可以在 LuCI 里一键检查、下载并安装新版本。',
    'hero.cta': '查看固件',
    'hero.releases': '全部 Release',
    'hero.updated': '索引更新时间',
    'firmware.title': '最新固件',
    'firmware.note': '每张卡片对应更新索引里的一个设备标识；固件由 GitHub Actions 从源码编译并发布到 Release。',
    'firmware.loading': '正在读取更新索引…',
    'firmware.empty': '索引里还没有设备。等第一次构建完成后刷新本页。',
    'firmware.failed': '读取更新索引失败，请稍后重试。',
    'ota.title': '在线升级（OTA）',
    'ota.note': 'ZeroWrt 自带 luci-app-ota：在 LuCI 里检查、下载、校验并安装固件，无需手动上传文件。',
    'ota.s1.title': '打开升级页面',
    'ota.s1.body': 'LuCI → 系统 → OTA Firmware Update（在线升级）。',
    'ota.s2.title': '检查并下载',
    'ota.s2.body': '页面会自动比对构建时间；下载完成后强制校验 SHA256，并用 sysupgrade -T 预检镜像。',
    'ota.s3.title': '安装',
    'ota.s3.body': '默认保留配置升级；设备重启后即为新固件。也可以命令行执行 ota check / ota download / ota apply --keep 1。',
    'ota.url.label': '更新索引地址',
    'ota.proxy': 'GitHub 下载慢时，可在「配置」里选择加速站，默认 gh-proxy.tatalvpai.vip。',
    'changelog.title': '更新日志',
    'changelog.note': '按设备列出最近几次构建。',
    'changelog.loading': '正在读取更新日志…',
    'changelog.empty': '暂无历史记录。',
    'footer.built': '由 GitHub Actions 构建',
    'footer.disclaimer': '固件按现状提供，刷机有风险，请先备份配置。',
    'label.version': '版本',
    'label.build': '构建时间',
    'label.size': '大小',
    'label.file': '文件',
    'label.sha': 'SHA256',
    'label.download': '下载',
    'label.proxy': '加速下载',
    'label.copy': '复制',
    'label.copied': '已复制',
    'label.changelog': '更新说明',
    'label.latest': '最新',
    'label.older': '历史版本',
  },
  en: {
    'nav.firmware': 'Firmware',
    'nav.ota': 'OTA',
    'nav.changelog': 'Changelog',
    'hero.eyebrow': 'OpenWrt / LEDE · automated builds',
    'hero.title': 'Firmware built for your',
    'hero.lede': 'Browse the latest build per device with checksums and changelogs. The firmware itself ships an OTA page, so updates are one click away in LuCI.',
    'hero.cta': 'Browse firmware',
    'hero.releases': 'All releases',
    'hero.updated': 'Index updated',
    'firmware.title': 'Latest firmware',
    'firmware.note': 'Every card is one device key in the update index. Images are compiled from source by GitHub Actions and published as release assets.',
    'firmware.loading': 'Reading the update index…',
    'firmware.empty': 'No devices yet. Refresh after the first build has finished.',
    'firmware.failed': 'Could not load the update index. Please try again later.',
    'ota.title': 'Online update (OTA)',
    'ota.note': 'ZeroWrt ships luci-app-ota: check, download, verify and flash from LuCI, no manual upload needed.',
    'ota.s1.title': 'Open the OTA page',
    'ota.s1.body': 'LuCI → System → OTA Firmware Update.',
    'ota.s2.title': 'Check and download',
    'ota.s2.body': 'The page compares build timestamps, then verifies SHA256 and runs sysupgrade -T on the downloaded image.',
    'ota.s3.title': 'Install',
    'ota.s3.body': 'Settings are kept by default; the device reboots into the new build. The CLI works too: ota check / ota download / ota apply --keep 1.',
    'ota.url.label': 'Update index',
    'ota.proxy': 'Pick an acceleration site under Configuration if GitHub is slow; gh-proxy.tatalvpai.vip is the default.',
    'changelog.title': 'Changelog',
    'changelog.note': 'The most recent builds per device.',
    'changelog.loading': 'Reading the changelog…',
    'changelog.empty': 'No history yet.',
    'footer.built': 'Built by GitHub Actions',
    'footer.disclaimer': 'Firmware is provided as-is. Flashing has risks — back up your configuration first.',
    'label.version': 'Version',
    'label.build': 'Build',
    'label.size': 'Size',
    'label.file': 'File',
    'label.sha': 'SHA256',
    'label.download': 'Download',
    'label.proxy': 'Accelerated',
    'label.copy': 'Copy',
    'label.copied': 'Copied',
    'label.changelog': 'Notes',
    'label.latest': 'latest',
    'label.older': 'Earlier builds',
  }
};

let lang = localStorage.getItem('zerowrt-lang') ||
  ((navigator.language || 'zh').toLowerCase().startsWith('zh') ? 'zh' : 'en');

const t = (key) => (I18N[lang] && I18N[lang][key]) || (I18N.zh[key] || key);

function applyLang() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = lang === 'zh' ? 'ZeroWrt · 固件下载与在线升级' : 'ZeroWrt · Firmware downloads and OTA';
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (I18N[lang][key]) el.textContent = I18N[lang][key];
  });
  const toggle = document.getElementById('lang-toggle');
  if (toggle) toggle.textContent = lang === 'zh' ? 'EN' : '中文';
  render();
}

/* ---------------------------------------------------------------- */

const state = { index: null, history: null, error: false };

function fmtBytes(bytes) {
  if (!bytes || bytes < 0) return '—';
  const units = ['B', 'KiB', 'MiB', 'GiB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit++; }
  return (unit === 0 ? String(Math.round(value)) : value.toFixed(1)) + ' ' + units[unit];
}

function fmtDate(ts) {
  if (!ts) return '—';
  try {
    return new Date(ts * 1000).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-GB', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  } catch (e) {
    return String(ts);
  }
}

function esc(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function el(tag, attrs, children) {
  const node = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (v == null) return;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v;
    else node.setAttribute(k, v);
  });
  (children || []).forEach((child) => node.appendChild(child));
  return node;
}

function proxyUrl(url) {
  return (url || '').startsWith('https://github.com/') ? PROXY + url : url;
}

function deviceEntries() {
  const devices = (state.index && state.index.devices) || {};
  return Object.entries(devices)
    .map(([key, entry]) => ({ key, entry }))
    .sort((a, b) => {
      const x = (a.entry.label || a.key).toLowerCase();
      const y = (b.entry.label || b.key).toLowerCase();
      return x.localeCompare(y);
    });
}

function newestByDevice() {
  const devices = (state.index && state.index.devices) || {};
  const newest = {};
  Object.entries(devices).forEach(([key, entry]) => {
    const base = entry.device || key.split('+')[0];
    if (!newest[base] || (entry.build_date || 0) > (newest[base].build_date || 0)) newest[base] = entry;
  });
  return newest;
}

function renderCards() {
  const grid = document.getElementById('device-grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (state.error) {
    grid.appendChild(el('p', { class: 'empty', text: t('firmware.failed') }));
    return;
  }
  if (!state.index) {
    grid.appendChild(el('p', { class: 'empty', text: t('firmware.loading') }));
    return;
  }

  const rows = deviceEntries();
  if (!rows.length) {
    grid.appendChild(el('p', { class: 'empty', text: t('firmware.empty') }));
    return;
  }

  const newest = newestByDevice();

  rows.forEach(({ key, entry }) => {
    const card = el('article', { class: 'card' });

    const title = el('h3', { class: 'card-title', text: entry.label || key });
    const badge = el('span', {
      class: 'badge' + ((newest[entry.device || key.split('+')[0]] === entry) ? ' new' : ''),
      text: (newest[entry.device || key.split('+')[0]] === entry) ? t('label.latest') : (entry.variant || '')
    });
    card.appendChild(el('div', { class: 'card-head' }, [
      el('div', {}, [title, el('p', { class: 'card-key', text: key })]),
      badge
    ]));

    const kv = el('dl', { class: 'kv' });
    const addRow = (label, value) => {
      kv.appendChild(el('dt', { text: label }));
      kv.appendChild(el('dd', { text: value }));
    };
    addRow(t('label.version'), entry.version || '—');
    addRow(t('label.build'), fmtDate(entry.build_date));
    addRow(t('label.size'), fmtBytes(entry.size));
    addRow(t('label.file'), entry.file || '—');
    card.appendChild(kv);

    const shaRow = el('div', { class: 'sha' }, [
      el('span', { text: entry.sha256 || '—' })
    ]);
    const copy = el('button', { class: 'btn', type: 'button', text: t('label.copy') });
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(entry.sha256 || '');
        copy.textContent = t('label.copied');
        setTimeout(() => { copy.textContent = t('label.copy'); }, 1500);
      } catch (e) { /* ignore */ }
    });
    shaRow.appendChild(copy);
    card.appendChild(shaRow);

    const actions = el('div', { class: 'card-actions' });
    if (entry.url) {
      actions.appendChild(el('a', {
        class: 'btn btn-primary', href: entry.url, target: '_blank', rel: 'noopener',
        text: t('label.download')
      }));
      actions.appendChild(el('a', {
        class: 'btn', href: proxyUrl(entry.url), target: '_blank', rel: 'noopener',
        text: t('label.proxy')
      }));
    }
    card.appendChild(actions);

    if (entry.changelog) {
      const details = el('details', { class: 'changelog' }, [
        el('summary', { text: t('label.changelog') }),
        el('div', { class: 'changelog-body', text: entry.changelog })
      ]);
      card.appendChild(details);
    }

    grid.appendChild(card);
  });
}

function renderHistory() {
  const box = document.getElementById('history');
  if (!box) return;
  box.innerHTML = '';

  const devices = (state.history && state.history.devices) || {};
  const keys = Object.keys(devices);
  if (!keys.length) {
    box.appendChild(el('p', { class: 'empty', text: t('changelog.empty') }));
    return;
  }

  const labels = (state.index && state.index.devices) || {};

  keys.sort().forEach((key) => {
    const builds = (devices[key] || []).slice(0, 8);
    if (!builds.length) return;

    const block = el('section', { class: 'history-device' });
    const label = (labels[key] && labels[key].label) || key;
    block.appendChild(el('h3', { text: label + ' · ' + key }));

    const list = el('ul', { class: 'history-list' });
    builds.forEach((build) => {
      const li = el('li', {}, [
        el('span', { class: 'v', text: build.version || '—' }),
        el('span', { text: fmtDate(build.build_date) }),
        el('span', { class: 's' }, [
          el('a', { href: build.url || '#', target: '_blank', rel: 'noopener', text: fmtBytes(build.size) })
        ])
      ]);
      list.appendChild(li);
    });
    block.appendChild(list);
    box.appendChild(block);
  });
}

function render() {
  renderCards();
  renderHistory();
  const time = document.getElementById('index-time');
  if (time) time.textContent = state.index && state.index.generated ? fmtDate(state.index.generated) : '—';
}

async function load() {
  try {
    const indexRes = await fetch('ota.json', { cache: 'no-store' });
    if (!indexRes.ok) throw new Error('index ' + indexRes.status);
    state.index = await indexRes.json();
  } catch (e) {
    state.error = true;
  }

  try {
    const historyRes = await fetch('history.json', { cache: 'no-store' });
    if (historyRes.ok) state.history = await historyRes.json();
  } catch (e) { /* optional */ }

  render();
}

document.getElementById('lang-toggle')?.addEventListener('click', () => {
  lang = lang === 'zh' ? 'en' : 'zh';
  localStorage.setItem('zerowrt-lang', lang);
  applyLang();
});

applyLang();
load();
