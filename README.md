# ZeroWrt OTA

ZeroWrt 固件下载与在线升级页面，基于 VitePress 和
[vitepress-theme-teek](https://github.com/Kele-Bingtang/vitepress-theme-teek)。

## 页面

- `/`：最新固件、设备筛选、SHA256 与下载入口
- `/changelog`：完整更新日志，按设备筛选、搜索和分页
- `/guide`：LuCI 在线升级与手动刷机说明
- `/en/`：English version of the same pages

更新日志只在 `/changelog` 展示，首页不展开完整历史，避免页面越来越长。

## 本地开发

需要 Node.js 20+ 和 pnpm：

```bash
pnpm install
pnpm dev
```

构建：

```bash
pnpm build
pnpm preview
```

## 数据

`docs/public/ota.json` 和 `docs/public/history.json` 是页面数据。部署前会由
ZeroWrt 构建流程写入最新内容；也可以手动同步：

```bash
pnpm sync:data
```

`OTA_BASE_URL` 可以覆盖数据源，默认是 `https://ota.tatalvpai.vip`。

## 部署

ZeroWrt 的构建流程会：

1. 生成最新的 `ota.json` / `history.json`；
2. checkout 本仓库并写入 `docs/public`；
3. 执行 `pnpm build`；
4. 将 `docs/.vitepress/dist` 部署到 Cloudflare Pages 项目 `zerowrt-ota`。

GitHub Actions 的 `Build` workflow 只负责构建检查，不直接部署。
