import React, { useState } from 'react';
import { Settings, Play, Archive, HelpCircle } from 'lucide-react';
import { APIKeyModal } from './components/APIKeyModal';
import { ReportDashboard } from './components/ReportDashboard';
import { TKReport, FormData } from './types';

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

  const handleGenerate = async () => {
    if (!formData.name && !formData.category && !formData.sellingPoints) {
      setError('长官，请至少提供一点产品线索，哪怕只有一个名字。');
      return;
    }
    
    setError('');
    setIsLoading(true);
    setReport(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || '服务端分析失败，请稍后重试。');
      }

      setReport(payload as TKReport);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || '生成报告时遇到未知错误，请检查服务端配置。');
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
