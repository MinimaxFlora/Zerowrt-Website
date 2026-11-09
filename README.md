# ZeroWrt OTA / 1Panel-Website

ZeroWrt 固件下载与在线升级页面，基于 VitePress 和
[vitepress-theme-teek](https://github.com/Kele-Bingtang/vitepress-theme-teek)。

## 页面

- `/`：最新固件、设备筛选、SHA256 与下载入口
- `/changelog`：完整更新日志，按设备筛选、搜索和分页
- `/guide`：LuCI 在线升级与手动刷机说明
- `/en/`：English version of the same pages

更新日志只在 `/changelog` 展示，首页不展开完整历史，避免页面越来越长。

## 语言规范

- 中文：`zh-CN`，路径 `/`
- English：`en-US`，路径 `/en/`
- 每个页面都有对应语言的 `.md`，导航、标题、按钮和空状态通过
  `OtaLatest.vue` / `OtaChangelog.vue` 内的 `zh` / `en` 字典切换
- 日期使用 `Intl.DateTimeFormat` 按 `zh-CN` / `en-US` 格式化
- 页面 head 输出 `hreflang` 的 `zh-CN` / `en` alternate 链接
- 语言切换使用 VitePress `locales`，不依赖 URL 查询参数

## 数据流

ZeroWrt 固件构建完成后，**只发送一个 `repository_dispatch`**，事件类型为
`firmware-release`，payload 包含：

```json
{
  "entry": { "device": "...", "version": "...", "url": "...", "sha256": "...", "size": 0 },
  "device_keys": ["..."],
  "dist": "ZeroWrt"
}
```

本仓库的 `Deploy Site` workflow 负责：

1. 校验 payload，把 entry 合并进 `docs/public/ota.json`；
2. 追加 `history.json`，保留最近 500 条；
3. 提交数据（`[skip ci]`，避免循环构建）；
4. `pnpm install --frozen-lockfile && pnpm build`；
5. 推送到 Cloudflare Pages 项目 `zerowrt-ota`。

普通 push 会用 `pnpm sync:data` 拉取线上数据后重新构建部署。

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

## 部署

`Deploy Site` workflow 在以下情况运行：

- `repository_dispatch`：ZeroWrt 发布新固件（推荐路径）
- `push` 到 `main`：页面/样式改动
- `workflow_dispatch`：手动重新部署

Cloudflare Pages 使用仓库 Secrets：

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

