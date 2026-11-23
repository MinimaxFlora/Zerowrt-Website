# Zerowrt-Website

ZeroWrt 的固件下载与在线升级站点：<https://ota.tatalvpai.vip/>

纯静态页面（无构建步骤），GitHub Pages 直接托管 `main` 分支根目录；`ota.json`
与 `history.json` 由 Actions 定时从 [MinimaxFlora/ZeroWrt](https://github.com/MinimaxFlora/ZeroWrt)
的 Release 生成并提交。

## 目录结构

```
index.html                  # 首页（中英切换，读取 ota.json / history.json）
assets/                     # 样式、脚本、图标
tools/gen_site_data.py      # 从 ZeroWrt Release 生成索引与更新日志
data/seed.json              # 尚未重建设备的兜底条目
ota.json                    # OTA 索引（schema 2，luci-app-ota 直接读取）
history.json                # 每台设备最近若干次构建
CNAME                       # ota.tatalvpai.vip
.github/workflows/update-index.yml
```

## 索引怎么来

`tools/gen_site_data.py` 遍历固件仓库的全部 Release，按优先级取值：

1. Release 里的 `ota.json`（ZeroWrt CI 用 `scripts/gen_ota_index.py` 生成，最准确）；
2. 没有就退回 `ota-meta.json` + `sha256sums` 重建条目；
3. 再合并 `data/seed.json`（老设备在下一次重建前的兜底）。

同一设备 key 取 `build_date` 较新的条目；x86 按 `+efi` / `+bios` 分条目，
不会把 EFI 镜像挂到裸 key 上。

本地运行：

```sh
GITHUB_TOKEN=ghp_xxx python3 tools/gen_site_data.py --out .
```

## 部署

- Pages：`main` 分支根目录，自定义域名 `ota.tatalvpai.vip`（仓库内 `CNAME`）。
- DNS：Cloudflare `ota` 记录 CNAME → `minimaxflora.github.io`，**仅 DNS（灰云）**，
  否则 GitHub 无法签发证书。
- 固件里默认写入 `https://ota.tatalvpai.vip/ota.json`；改域名时同步改
  ZeroWrt 的 `OTA_API_URL`。

## English

Static firmware download / OTA index site for ZeroWrt. `ota.json` (schema 2)
and `history.json` are generated from the firmware repository's GitHub releases
by `tools/gen_site_data.py` and committed by a scheduled workflow. GitHub Pages
serves the repository root with the custom domain `ota.tatalvpai.vip`.

## License

Site code: MIT. Firmware binaries are distributed through the
[ZeroWrt releases](https://github.com/MinimaxFlora/ZeroWrt/releases) and follow
that repository's licensing.
