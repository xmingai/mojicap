# EmojiKit 部署指南

## 线上地址

- **生产环境**: https://emojikit-five.vercel.app
- **Vercel 项目**: truiosacer543-9368s-projects/emojikit（网页端管理）
- **GitHub 仓库**: https://github.com/xmingai/emojikit

---

## 部署方式（二选一）

### 方式 A：Git Push 自动部署 ✅（推荐，已配置）

GitHub 仓库已与 Vercel 项目关联。**只需 push 即可自动部署**：

```bash
git add -A && git commit -m "your message" && git push
```

Push 后 Vercel 会自动拉取代码 → 构建 → 部署到生产环境，无需任何手动操作。

### 方式 B：CLI 手动部署（备用）

当需要跳过 Git 直接从本地部署时使用：

```bash
export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"
cd /Users/sgx/Desktop/Social/Dev/emojikit
vercel --prod --yes --archive=tgz
```

> **关键参数说明**：
> - `--prod`：部署到生产环境（更新 emojikit-eight.vercel.app）
> - `--yes`：跳过交互确认
> - `--archive=tgz`：**必须加！** 将文件打包为 tgz 上传，避免 Vercel 15,000 文件上限

---

## 常见问题 & 根因分析

### ❌ 问题 1：Vercel 构建失败 — TypeScript 类型错误

**现象**：
```
Property 'asChild' does not exist on type...
Property 'delay' does not exist on type...
Property 'delayDuration' does not exist on type...
```

**根因**：
本项目使用的是 **shadcn/ui v4**，底层从 Radix UI 迁移到了 **Base UI**。
大量旧版 Radix 的 API 在 Base UI 中已不存在：

| 旧版 Radix API | Base UI 替代方案 |
|---|---|
| `asChild` | ❌ 不存在。直接在组件上放 props（如 className, onClick）|
| `delayDuration` | `delay`（在 Provider 层），但部分组件无此 prop |
| `<Button asChild><Link>` | 改用 `<Link className="...">` 手动样式化 |

**预防措施**：
- 添加新的 shadcn 组件后，**先查看 `src/components/ui/xxx.tsx` 的类型定义**
- 在 `npm run build` 本地验证通过后再 push

### ❌ 问题 2：Vercel CLI 上传失败 — 15,000 文件上限

**现象**：
```
Error: `files` should NOT have more than 15000 items, received 17304.
Try using `--archive=tgz` to limit the amount of files you upload.
```

**根因**：
Vercel CLI 默认逐个上传项目目录中的所有文件。本项目存在以下大目录：

| 目录 | 文件数（约） | 说明 |
|---|---|---|
| `.next/` | ~10,000+ | Next.js 构建产物（SSG 页面、缓存、chunk） |
| `node_modules/` | ~5,000+ | npm 依赖 |
| `.git/` | ~2,000+ | Git 历史 |

**这与 1,906 个 emoji 无关**。emoji 的 SSG 页面是在 Vercel 云端构建时生成的，不计入上传文件数。

**解决方案**：
1. **`.vercelignore` 文件**（已配置）— 排除不需要上传的目录
2. **`--archive=tgz` 参数** — 打包压缩上传，绕过文件数限制

### ❌ 问题 3：GitHub 自动部署未触发

**现象**：push 到 GitHub 后 Vercel 不自动构建。

**根因**：Vercel 项目所属账户（`stepwisecode`）与 GitHub 仓库所属账户（`xmingai`）不是同一身份，且未在 Vercel 网页端手动关联。

**解决方案**：参见上方「方式 B」的一次性配置步骤。

---

## 快速操作备忘

```bash
# 开发
npm run dev

# 本地构建验证（部署前必做）
npm run build

# 部署到 Vercel 生产环境
vercel --prod --yes --archive=tgz

# 查看当前部署状态
vercel ls

# 查看部署日志
vercel inspect <deployment-url> --logs
```

---

## 项目构建数据

| 指标 | 数值 |
|---|---|
| SSG 页面总数 | 1,916 |
| 构建时间（本地） | ~12s |
| 构建产物大小 | ~180KB (上传包) |
| Node.js 版本 | v22 |
| 框架 | Next.js 16.2.3 |
