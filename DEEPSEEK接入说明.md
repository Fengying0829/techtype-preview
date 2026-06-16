# TechType 接入 DeepSeek 教程

目标：微信群分享时，每次测评结果都由 DeepSeek 生成 500-1000 字点评；页面仍然放在 GitHub Pages，API Key 放在 Cloudflare Workers Secret 里。

## 1. 创建 Cloudflare Worker

1. 打开 https://dash.cloudflare.com/
2. 进入 `Workers & Pages`
3. 点击 `Create`
4. 选择 `Worker`
5. 名字建议填：`techtype-ai-feedback`
6. 创建后进入代码编辑页
7. 删除默认代码
8. 复制本仓库里的 `cloudflare-worker-deepseek.js` 全部内容粘贴进去
9. 点击 `Deploy`

## 2. 填入 DeepSeek API Key

这一步由你自己操作，不要把 Key 发给任何人。

1. 进入刚创建的 Worker
2. 打开 `Settings`
3. 找到 `Variables and Secrets`
4. 点击 `Add`
5. 类型选择 `Secret`
6. 名字必须填：

```text
DEEPSEEK_API_KEY
```

7. 值填你的 DeepSeek API Key
8. 保存
9. 回到 Worker 代码页，再点一次 `Deploy`

## 3. 复制 Worker 地址

Cloudflare 会给你一个地址，类似：

```text
https://techtype-ai-feedback.xxxxx.workers.dev
```

复制这个地址。

## 4. 填到 HTML 里

打开 `TechType-preview.html`，找到：

```js
const AI_FEEDBACK_API = "";
```

改成你的 Worker 地址，例如：

```js
const AI_FEEDBACK_API = "https://techtype-ai-feedback.xxxxx.workers.dev";
```

注意：这里只能填 Worker 地址，不能填 DeepSeek API Key。

## 5. 更新 GitHub

如果你用命令行：

```powershell
cd "C:\Users\15576\Documents\mbti练习"
git add .
git commit -m "Connect DeepSeek feedback"
git push origin main
```

如果命令行不熟，也可以在 GitHub 网页直接编辑 `TechType-preview.html`，把 Worker 地址填进去后提交。

## 6. 打开 GitHub Pages

仓库页面：

```text
https://github.com/Fengying0829/techtype-preview
```

进入：

```text
Settings -> Pages
```

设置：

```text
Source: Deploy from a branch
Branch: main
Folder: /root
```

保存后等待 1-3 分钟，页面地址通常是：

```text
https://fengying0829.github.io/techtype-preview/TechType-preview.html
```

这个链接可以发微信群。

## 7. 测试方法

1. 打开 GitHub Pages 链接
2. 完成测评
3. 结果页先会显示本地兜底内容
4. Worker 请求成功后，会替换成 DeepSeek 生成的彩色点评卡片
5. 如果一直显示本地兜底，检查：
   - `AI_FEEDBACK_API` 是否已经填 Worker 地址
   - Cloudflare Secret 名字是否是 `DEEPSEEK_API_KEY`
   - DeepSeek 账号是否有余额
   - Worker 是否已经重新 Deploy
   - Worker 里的 `allowedOrigins` 是否包含你的 GitHub Pages 域名

## 8. 安全提醒

不要把 DeepSeek API Key 写进：

- `TechType-preview.html`
- GitHub 仓库
- 微信群
- 截图
- 前端 JS 文件

如果 API Key 不小心暴露，立刻去 DeepSeek 平台删除旧 Key，重新创建一个。
