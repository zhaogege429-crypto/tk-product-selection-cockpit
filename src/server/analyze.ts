import type { FormData as ProductFormData, TKReport } from '../types';

const systemInstruction = `你是“TK选品判断智能体”，是一个专门服务于TikTok电商团队的选品决策助手。
你的核心职责不是泛泛分析产品，而是帮助用户判断：
1. 这个产品是否适合在TikTok生态中销售
2. 这个产品更适合短视频带货、直播带货、达人分销，还是不建议做
3. 这个产品的核心卖点、成交逻辑和运营风险分别是什么

你必须站在资深TikTok电商操盘手的角度输出结果，重点关注“内容可卖性、流量可放大性、转化可成交性”。

分析原则：
1. TikTok适合的是“能被内容卖出去的货”，不是所有能卖的货都适合TK
2. 选品判断要优先考虑：内容表现力、卖点理解门槛、冲动消费属性、转化效率、售后和合规风险
3. 产品“便宜”不等于“适合TK”，必须能形成内容吸引力和购买驱动
4. 不允许只说“可以试试”，必须给出明确分级
5. 如果信息不足，先说明缺失信息，再基于现有信息输出初步判断
6. 所有结论必须先结论，再原因，再建议
7. 禁止编造平台内部数据和虚假行业数据
8. 输出必须像懂TikTok卖货的人，而不是泛化电商顾问

核心判断维度：
一、内容可卖性（是否有明显展示感、前后对比、结果感、适合演示、前3秒抓人）
二、成交可转化性（卖点一句话讲清、低决策门槛、冲动下单、价格/价值优势、短链路成交）
三、流量可放大性（适合自然流测款、投流放大、达人分发、直播承接）
四、风险可控性（差评、夸大宣传、合规、退货率、尺码/效果因人而异、教育成本高）
五、货盘角色判断（引流款、爆款、利润款、直播福利款、达人测款）

如果你觉得信息不足以做出完全准确的判断，请在缺失信息字段中指明，但基于已有信息，你必须给出你的推测和判断结论，不能完全拒绝回答。`;

const jsonContract = `请严格只返回一个 JSON 对象，不要输出 markdown 代码块，不要添加解释文字。
JSON 结构必须为：
{
  "conclusion": {
    "level": "优先做 | 可以测试 | 谨慎进入 | 不建议做",
    "summary": "一句话结论摘要"
  },
  "adaptability": {
    "contentSellability": "高 | 中 | 低",
    "conversionPotential": "高 | 中 | 低",
    "trafficScaling": "高 | 中 | 低",
    "riskLevel": "高 | 中 | 低",
    "reasons": ["核心判断原因1", "核心判断原因2"]
  },
  "recommendedPath": {
    "path": "短视频自然流 | 短视频付费投流 | 达人分销 | 直播带货 | 组合打法 | 暂不建议",
    "reason": "原因说明"
  },
  "sellingPoints": ["卖点1", "卖点2"],
  "operationsAdvice": ["建议1", "建议2"],
  "missingInfo": {
    "missingFields": ["缺失字段1", "缺失字段2"],
    "impact": "缺失信息对判断的影响"
  }
}`;

export async function analyzeProduct(formData: ProductFormData): Promise<TKReport> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
  const baseUrl = normalizeBaseUrl(process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1');

  if (!apiKey) {
    throw createError(
      '服务端尚未配置模型密钥，请到 Vercel 项目设置里添加 OPENAI_API_KEY。',
      500,
    );
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: `${systemInstruction}\n\n${jsonContract}`,
        },
        {
          role: 'user',
          content: buildUserPrompt(formData),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw createError(await extractProviderError(response), response.status);
  }

  const payload = await response.json();
  const rawText = extractAssistantText(payload);

  if (!rawText) {
    throw createError('模型没有返回可解析的内容，请稍后重试。', 502);
  }

  try {
    return validateReport(JSON.parse(stripCodeFence(rawText)));
  } catch (error: any) {
    throw createError(`模型返回内容无法解析为标准报告：${error.message}`, 502);
  }
}

function buildUserPrompt(formData: ProductFormData) {
  return `
请分析以下产品信息：
产品名称/链接/图片描述: ${formData.name || '未提供'}
类目: ${formData.category || '未提供'}
售价或价格带: ${formData.price || '未提供'}
核心卖点: ${formData.sellingPoints || '未提供'}
使用场景与目标人群: ${formData.audience || '未提供'}
补充信息与已测结果: ${formData.extra || '未提供'}
  `.trim();
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, '');
}

function stripCodeFence(text: string) {
  if (!text.startsWith('```')) {
    return text.trim();
  }

  return text.replace(/^```(?:json)?\s*/, '').replace(/```$/, '').trim();
}

function extractAssistantText(payload: any) {
  const content = payload?.choices?.[0]?.message?.content;

  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item?.text === 'string' ? item.text : ''))
      .join('')
      .trim();
  }

  return '';
}

async function extractProviderError(response: Response) {
  const fallback = `模型服务调用失败（HTTP ${response.status}）。`;

  try {
    const payload = await response.json();
    const message =
      payload?.error?.message ||
      payload?.message ||
      payload?.detail ||
      payload?.error;

    if (!message) {
      return fallback;
    }

    return `模型服务调用失败：${String(message)}`;
  } catch {
    const text = await response.text();
    return text ? `模型服务调用失败：${text}` : fallback;
  }
}

function validateReport(payload: any): TKReport {
  const requiredKeys = [
    'conclusion',
    'adaptability',
    'recommendedPath',
    'sellingPoints',
    'operationsAdvice',
    'missingInfo',
  ];

  for (const key of requiredKeys) {
    if (!(key in payload)) {
      throw new Error(`缺少字段 ${key}`);
    }
  }

  return payload as TKReport;
}

function createError(message: string, statusCode: number) {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
}
