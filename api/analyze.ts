import { analyzeProduct } from '../src/server/analyze';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: '仅支持 POST 请求。' });
    return;
  }

  try {
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body;

    const report = await analyzeProduct(body);
    res.status(200).json(report);
  } catch (error: any) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      error: error.message || '服务端分析失败，请稍后重试。',
    });
  }
}
