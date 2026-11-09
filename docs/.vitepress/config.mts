import { defineConfig } from "vitepress";
import { teekConfig } from "./teek-config";

const zhThemeConfig = {
  logo: "/logo.png",
  siteTitle: "ZeroWrt OTA",
  nav: [
    { text: "固件下载", link: "/" },
    { text: "更新日志", link: "/changelog" },
    { text: "升级指南", link: "/guide" },
    { text: "GitHub", link: "https://github.com/MinimaxFlora/ZeroWrt" },
  ],
  socialLinks: [{ icon: "github", link: "https://github.com/MinimaxFlora/ZeroWrt" }],
  search: { provider: "local" as const },
  outline: { level: [2, 3] as [number, number], label: "本页目录" },
  docFooter: { prev: "上一页", next: "下一页" },
  lastUpdated: { text: "更新于" },
  returnToTopLabel: "回到顶部",
  darkModeSwitchLabel: "主题",
  sidebarMenuLabel: "菜单",
};

const enThemeConfig = {
  ...zhThemeConfig,
  nav: [
    { text: "Firmware", link: "/en/" },
    { text: "Changelog", link: "/en/changelog" },
    { text: "Guide", link: "/en/guide" },
    { text: "GitHub", link: "https://github.com/MinimaxFlora/ZeroWrt" },
  ],
  outline: { level: [2, 3] as [number, number], label: "On this page" },
  docFooter: { prev: "Previous", next: "Next" },
  lastUpdated: { text: "Updated" },
  returnToTopLabel: "Back to top",
  darkModeSwitchLabel: "Theme",
  sidebarMenuLabel: "Menu",
};

export default defineConfig({
  extends: teekConfig,
  lang: "zh-CN",
  title: "ZeroWrt OTA",
  titleTemplate: ":title | ZeroWrt",
  description:
    "ZeroWrt 固件下载与在线升级：按设备查看最新构建、SHA256、更新日志与 OTA 升级方式。",
  cleanUrls: true,
  lastUpdated: false,
  head: [
    ["link", { rel: "icon", type: "image/png", href: "/logo.png" }],
    ["meta", { name: "theme-color", content: "#EC4899" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:locale", content: "zh_CN" }],
    ["meta", { property: "og:title", content: "ZeroWrt 固件下载与在线升级" }],
    ["meta", { property: "og:description", content: "按设备下载最新 ZeroWrt 固件，或直接在 LuCI 中在线升级。" }],
    ["meta", { property: "og:image", content: "/logo.png" }],
  ],
  themeConfig: zhThemeConfig,
  locales: {
    root: {
      label: "简体中文",
      lang: "zh-CN",
      themeConfig: zhThemeConfig,
    },
    en: {
      label: "English",
      lang: "en-US",
      link: "/en/",
      themeConfig: enThemeConfig,
    },
  },
});

