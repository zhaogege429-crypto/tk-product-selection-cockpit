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
- 支持通过服务端代理调用 OpenAI 兼容接口，避免在前端暴露模型密钥

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Vercel Functions
- OpenAI 兼容接口

## 本地运行

```bash
npm install
cp .env.example .env.local
```

在 `.env.local` 中填入：

```bash
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4.1-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

然后启动开发环境：

```bash
npm run dev
```

默认访问地址：

```text
http://localhost:3000
```

本地开发时，Vite 会代理 `/api/analyze` 到同进程的服务端逻辑，所以不需要额外再起一个后端。

## 生产构建

```bash
npm run build
```

## 部署配置

部署到 Vercel 前，请先在项目环境变量里配置：

```bash
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4.1-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

如果你使用的是第三方或国内模型平台，只要它提供 OpenAI 兼容接口，替换 `OPENAI_BASE_URL` 和 `OPENAI_MODEL` 即可。

## 文档入口

- [产品需求文档](./docs/产品需求文档.md)
- [提示词文档](./docs/提示词文档.md)
- [项目说明文档](./docs/项目说明文档.md)
- [设计文档](./docs/设计文档.md)
- [背景知识文档](./docs/背景知识文档.md)

## 当前限制

- 当前依赖外部 OpenAI 兼容模型服务，输出质量与可用性受服务商模型能力影响
- 历史报告、批量分析、团队协作、权限控制、导出能力尚未接入
- 目前不支持直接解析商品链接、图片、视频或外部电商数据
