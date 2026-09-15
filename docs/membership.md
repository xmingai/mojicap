# MojiCap Plus 会员（Waffo 订阅）

会员方案移植自 PixFlow 的 Waffo 接入，去掉了积分、试用和内容审核。整套功能由一个开关控制：`NEXT_PUBLIC_MEMBERSHIP_ENABLED=true` 才会出现登录、定价页、会员入口；关闭时站点与之前完全一致（所有 SEO 页面仍是静态生成）。

## 权益与价格

| 权益 | 实现位置 |
|---|---|
| 去掉推广位（Vormly 横幅 / 弹窗） | `src/components/ads/*` 读取 `useMembership().me.isMember` |
| 云端同步收藏 / 最近使用 | `src/components/membership/use-cloud-sync.ts` → `/api/sync/favorites`、`/api/sync/recents` |
| 高级花体字体（10 种） | `src/lib/premium-fonts.ts`，只在 `/fancy-text/` 全部样式页出现 |
| 批量复制与自定义组合 | Emoji 页「选择」模式 `selection-bar.tsx` → `/api/combos`；组合页「我的组合」 |

价格定义在 `src/lib/membership/plans.ts`：`plus_monthly` $2.99/月，`plus_yearly` $19.99/年（无试用）。改价格后要重新运行 `waffo-setup.mjs`。

## 架构速览

- **数据库**：Turso（libSQL）+ drizzle。表结构 `src/lib/db/schema.ts`，迁移在 `drizzle/`。本地不配置时自动用 `file:.data/local.db`。
- **登录**：better-auth，邮箱验证码（Resend 发送），可选 Google。路由 `/api/auth/[...all]`，会去掉末尾斜杠后再交给 better-auth（站点开启了 `trailingSlash`）。
- **支付**：Waffo 托管收银台。`/api/checkout` 创建订单，metadata 带 `userId` 和 `sku`；Waffo 回调 `/api/webhooks/waffo/` 用 RSA 签名校验（没有 webhook secret）。
- **会员状态**：`process-event.ts` 在一个事务里处理事件，按投递 id 去重；订阅以 Waffo **订单 id** 为身份。状态 active / canceling / past_due / canceled / refunded，续费有 3 天宽限期（`entitlement.ts`）。
- **前端**：静态页面不读会员状态，由 `MembershipProvider` 在客户端请求 `/api/me/`。

## 环境变量（Vercel → Settings → Environment Variables）

| 变量 | 必需 | 说明 |
|---|---|---|
| `NEXT_PUBLIC_MEMBERSHIP_ENABLED` | ✅ | `true` 开启。构建时内联，改完需重新部署 |
| `TURSO_DATABASE_URL` | ✅ | `libsql://…turso.io` |
| `TURSO_AUTH_TOKEN` | ✅ | Turso 数据库 token |
| `BETTER_AUTH_SECRET` | ✅ | 随机 32 字节以上，`openssl rand -base64 32` |
| `BETTER_AUTH_URL` | ✅ | `https://www.mojicap.com` |
| `RESEND_API_KEY` | ✅ | 发送登录验证码 |
| `EMAIL_FROM` | ✅ | 如 `MojiCap <hello@mojicap.com>`，域名需在 Resend 验证 |
| `WAFFO_MERCHANT_ID` | ✅ | `MER_…` |
| `WAFFO_STORE_ID` | ✅ | `STO_0ip4NuuvjBGmQghudqq37j` |
| `WAFFO_PRIVATE_KEY_BASE64` | ✅ | 私钥 PEM 的 base64（也接受 `WAFFO_PRIVATE_KEY` 原文） |
| `WAFFO_ENV` | ✅ | 上线填 `production`；不填为 test，且只接受 test 模式回调 |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | 可选 | 配置后登录框出现 Google 按钮；回调地址 `https://www.mojicap.com/api/auth/callback/google` |

缺少数据库或 `BETTER_AUTH_SECRET` 时，所有会员 API 返回 503；缺少 Waffo 凭据时结账返回 `CHECKOUT_DISABLED`，前端提示暂不可用。私钥不要提交到仓库（`.gitignore` 已忽略 `*.pem` 和 `waffo-private*`）。

## 上线步骤

1. **建库并迁移**
   ```bash
   TURSO_DATABASE_URL=libsql://… TURSO_AUTH_TOKEN=… npm run db:migrate
   ```
2. **在 Waffo 创建商品（先在 test 环境）**，把生成的商品 id 写入 `waffo-catalog.generated.ts` 并提交
   ```bash
   WAFFO_MERCHANT_ID=MER_… WAFFO_STORE_ID=STO_0ip4NuuvjBGmQghudqq37j WAFFO_PRIVATE_KEY_FILE=./waffo-private.pem \
     node --experimental-strip-types scripts/waffo-setup.mjs --write
   ```
3. **测试**：在 Preview 部署里用 `WAFFO_ENV` 留空（test），注册 test webhook 指向 Preview 地址，用 Waffo 测试卡走完订阅 → 取消 → 恢复。
4. **发布到生产**：Store KYB 审核通过后
   ```bash
   … scripts/waffo-setup.mjs --publish
   WAFFO_ENV=production … scripts/waffo-setup.mjs --webhook https://www.mojicap.com/api/webhooks/waffo/
   ```
   webhook 地址必须带末尾斜杠，否则会被 308 重定向导致回调丢失（脚本会自动补）。
5. 在 Vercel 设置全部环境变量（`WAFFO_ENV=production`），重新部署。
6. 线上验证：登录 → `/pricing/` 订阅 → 回到 `/account/?checkout=success` 显示 Plus → 推广位消失 → 收藏跨设备同步。

## 本地开发

```bash
# .env.local
NEXT_PUBLIC_MEMBERSHIP_ENABLED=true
BETTER_AUTH_URL=http://localhost:3000
```

```bash
npm run db:migrate
```

没配 Resend 时验证码打印在 dev 服务器日志里。没有 Waffo 凭据时可以用测试里的 `processWaffoEvent` 夹具直接给账号开通会员。

## 测试

```bash
npm test
```

`tests/membership.test.ts` 覆盖会员状态机（开通、续费、重复投递、少付、取消 / 恢复、逾期、退款、他人订单、重新订阅），`tests/sync.test.ts` 覆盖同步列表清洗与合并，`tests/font-transform.test.ts` 覆盖高级字体。
