import { defineTeekConfig } from "vitepress-theme-teek/config";

export const teekConfig = defineTeekConfig({
  teekTheme: true,
  teekHome: false,
  vpHome: true,
  loading: false,
  sidebarTrigger: true,
  banner: {
    enabled: false,
  },
  author: {
    name: "MinimaxFlora",
    link: "https://github.com/MinimaxFlora",
  },
  footerInfo: {
    theme: {
      name: "Theme By Teek",
    },
    copyright: {
      createYear: 2026,
      suffix: "ZeroWrt",
    },
  },
  themeEnhance: {
    enabled: true,
  },
});
