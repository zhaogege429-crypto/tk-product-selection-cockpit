import React, { useState, useEffect } from 'react';
import { Settings, Play, Archive, HelpCircle } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { APIKeyModal } from './components/APIKeyModal';
import { ReportDashboard } from './components/ReportDashboard';
import { TKReport, FormData } from './types';

// The system instruction requested by the user
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

// Expected schema matching exactly the interface
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    conclusion: {
      type: Type.OBJECT,
      properties: {
        level: { type: Type.STRING, description: "必选一项：优先做 | 可以测试 | 谨慎进入 | 不建议做" },
        summary: { type: Type.STRING, description: "一句话结论摘要" }
      },
      required: ["level", "summary"]
    },
    adaptability: {
      type: Type.OBJECT,
      properties: {
        contentSellability: { type: Type.STRING, description: "高 | 中 | 低" },
        conversionPotential: { type: Type.STRING, description: "高 | 中 | 低" },
        trafficScaling: { type: Type.STRING, description: "高 | 中 | 低" },
        riskLevel: { type: Type.STRING, description: "高 | 中 | 低" },
        reasons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "核心判断原因，1-3条" }
      },
      required: ["contentSellability", "conversionPotential", "trafficScaling", "riskLevel", "reasons"]
    },
    recommendedPath: {
      type: Type.OBJECT,
      properties: {
        path: { type: Type.STRING, description: "短视频自然流 | 短视频付费投流 | 达人分销 | 直播带货 | 组合打法 | 暂不建议" },
        reason: { type: Type.STRING, description: "原因说明" }
      },
      required: ["path", "reason"]
    },
    sellingPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "最适合主打的1-3个卖点" },
    operationsAdvice: { type: Type.ARRAY, items: { type: Type.STRING }, description: "至少1-3条行动建议" },
    missingInfo: {
      type: Type.OBJECT,
      properties: {
        missingFields: { type: Type.ARRAY, items: { type: Type.STRING }, description: "缺失的补充信息字段名称集合，如果无缺失则为空数组" },
        impact: { type: Type.STRING, description: "说明缺失信息对判断造成的影响" }
      },
      required: ["missingFields", "impact"]
    }
  },
  required: ["conclusion", "adaptability", "recommendedPath", "sellingPoints", "operationsAdvice", "missingInfo"]
};

export default function App() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    price: '',
    sellingPoints: '',
    audience: '',
    extra: ''
  });
  
  const [report, setReport] = useState<TKReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');

  // Hydrate custom api key from localstorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('GEMINI_API_KEY');
    if (saved) setApiKey(saved);
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('GEMINI_API_KEY', key);
  };

  const handleGenerate = async () => {
    if (!formData.name && !formData.category && !formData.sellingPoints) {
      setError('长官，请至少提供一点产品线索，哪怕只有一个名字。');
      return;
    }
    
    setError('');
    setIsLoading(true);
    setReport(null);

    const effectiveKey = apiKey || process.env.GEMINI_API_KEY;
    if (!effectiveKey) {
      setError('未检测到 Gemini API Key，点击右上角齿轮图标配置。');
      setIsLoading(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: effectiveKey });
      
      const userPrompt = `
请分析以下产品信息：
产品名称/链接/图片描述: ${formData.name || '未提供'}
类目: ${formData.category || '未提供'}
售价或价格带: ${formData.price || '未提供'}
核心卖点: ${formData.sellingPoints || '未提供'}
使用场景与目标人群: ${formData.audience || '未提供'}
补充信息与已测结果: ${formData.extra || '未提供'}
      `.trim();

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.2, // Low temp for analytical task
        }
      });

      if (response.text) {
        let rawText = response.text;
        // Strip markdown formatting if the model wrapped the JSON in it
        if (rawText.startsWith('```')) {
          rawText = rawText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        }
        try {
          const resultData = JSON.parse(rawText) as TKReport;
          setReport(resultData);
        } catch (e: any) {
          throw new Error('解析报告数据失败: ' + e.message + '\\n原文: ' + response.text.substring(0, 100));
        }
      } else {
        throw new Error('未收到有效的分析报告。');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || '生成报告时遇到未知错误，请检查网络或 API Key。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-200 font-sans">
      
      {/* Top Navigation / Brand Rail */}
      <nav className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-xs tracking-[0.3em] font-bold text-emerald-400">TK SCOUT / V1.0</span>
          <span className="h-4 w-px bg-slate-800"></span>
          <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">TikTok 电商选品决策中心</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="text-[10px] uppercase tracking-widest text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-2"
          >
            API 设置 <Settings className="w-3 h-3" />
          </button>
          <div className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center text-[10px] text-emerald-400 font-bold">TK</div>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Form Input */}
        <div className="w-full md:w-[400px] lg:w-[460px] flex-shrink-0 flex flex-col border-r border-slate-800 bg-slate-950 z-10 relative">
          
          <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">产品名称/型号</label>
                <input 
                  type="text" 
                  value={formData.name} onChange={handleChange('name')}
                  placeholder="例如：可折叠硅胶水杯 / 亚马逊链接..."
                  className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-600 text-slate-200"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">大类目</label>
                <select 
                  value={formData.category} onChange={handleChange('category')}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-300 appearance-none"
                >
                  <option value="">选择类目 (选填)</option>
                  <option value="美妆个护">美妆个护</option>
                  <option value="3C数码">3C数码</option>
                  <option value="家居日用">家居日用</option>
                  <option value="服饰鞋包">服饰鞋包</option>
                  <option value="玩具宠物">玩具宠物</option>
                  <option value="新奇特">新奇特</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">终端售价带 (USD/GBP)</label>
                <input 
                  type="text" 
                  value={formData.price} onChange={handleChange('price')}
                  placeholder="例如：$15 - $25 (利润率约 60%)"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-600 text-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">核心卖点描述</label>
                <textarea 
                  value={formData.sellingPoints} onChange={handleChange('sellingPoints')}
                  rows={3}
                  placeholder="它解决什么痛点？有什么明显的使用前后对比效果？..."
                  className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-600 resize-none text-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">使用场景与人群</label>
                <textarea 
                  value={formData.audience} onChange={handleChange('audience')}
                  rows={2}
                  placeholder="谁在什么情况下会买？例如：20-30岁女性睡前护肤..."
                  className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-600 resize-none text-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  其他背景信息
                  <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
                </label>
                <textarea 
                  value={formData.extra} onChange={handleChange('extra')}
                  rows={2}
                  placeholder="比如同行是否已经测爆过、自己测试的数据或侵权担忧..."
                  className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-600 resize-none text-slate-200"
                />
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-slate-800 bg-slate-950 shrink-0">
            {error && (
               <div className="mb-4 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded leading-relaxed">
                 {error}
               </div>
            )}
            <button 
              onClick={handleGenerate}
              disabled={isLoading}
              className={`w-full py-4 rounded text-[11px] uppercase tracking-[0.2em] font-bold flex justify-center items-center gap-3 transition-colors duration-300 ${
                isLoading 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="w-4 h-4" /> 分析中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Play className="w-3 h-3" /> 执行研判
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right Sidebar: Output Dashboard */}
        <div className="flex-1 overflow-y-auto bg-slate-950 relative custom-scrollbar">
          {/* Subtle grid background for technical feel */}
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{
            backgroundImage: 'linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>
          
          <div className="relative p-8 md:p-12 max-w-4xl mx-auto h-full">
            <ReportDashboard report={report} isLoading={isLoading} />
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <APIKeyModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveApiKey}
        currentKey={apiKey}
      />

    </div>
  );
}

// Simple internal generic spinner
function Spinner(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
