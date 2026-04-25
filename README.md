# TK选品指挥舱

面向 TikTok 电商团队的 AI 选品研判工具。输入产品名称、类目、价格带、卖点、人群和补充背景后，系统会按 TikTok 电商操盘逻辑输出结构化判断，帮助团队快速回答三件事：

1. 这个产品适不适合在 TikTok 生态里卖。
2. 更适合短视频、直播、达人分销，还是暂时不建议做。
3. 核心卖点、行动建议和风险点分别是什么。

## 适合谁用

- TikTok 电商操盘手
- 选品团队与投流团队
- 需要快速统一选品判断口径的小团队

## 当前能力

- 结构化输出选品结论，不只给泛泛建议
- 从内容表现力、成交效率、流量放大性、风险可控性四个维度做判断
- 明确推荐更适合的承接路径：短视频、直播、达人分销或组合打法
- 支持在前端录入 Gemini API Key，本地保存到浏览器

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Gemini API

## 本地运行

```bash
npm install
cp .env.example .env.local
```

在 `.env.local` 中填入：

```bash
GEMINI_API_KEY=your_api_key
```

然后启动开发环境：

```bash
npm run dev
```

默认访问地址：

```text
http://localhost:3000
```

## 生产构建

```bash
npm run build
```

## GitHub Pages

仓库内已包含 GitHub Pages 自动部署工作流。推送到 `main` 后会自动构建并部署，站点地址将是：

```text
https://zhaogege429-crypto.github.io/tk-product-selection-cockpit/
```

前提是仓库已开启 GitHub Pages，并使用 GitHub Actions 作为发布来源。

## 文档入口

- [产品需求文档](./docs/产品需求文档.md)
- [提示词文档](./docs/提示词文档.md)
- [项目说明文档](./docs/项目说明文档.md)
- [设计文档](./docs/设计文档.md)
- [背景知识文档](./docs/背景知识文档.md)

## 当前限制

- 当前没有后端代理层，API Key 仍在前端使用链路中
- 历史报告、批量分析、团队协作、权限控制、导出能力尚未接入
- 目前不支持直接解析商品链接、图片、视频或外部电商数据
