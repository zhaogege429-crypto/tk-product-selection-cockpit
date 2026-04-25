import React, { useState } from 'react';
import { TKReport } from '../types';
import { ShieldAlert, TrendingUp, Zap, Target, Lightbulb, AlertTriangle, CheckCircle2, Copy, Check } from 'lucide-react';

interface ReportDashboardProps {
  report: TKReport | null;
  isLoading: boolean;
}

export function ReportDashboard({ report, isLoading }: ReportDashboardProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6 text-slate-500 p-8">
        <div className="w-12 h-12 border-2 border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div>
        <div className="text-center space-y-2">
          <p className="font-bold text-sm text-slate-300 uppercase tracking-widest">TK SCOUT PROCESSING...</p>
          <p className="text-xs uppercase tracking-widest">正在评估内容表现力、流量转化与合规风险</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-8 space-y-6">
        <div className="w-16 h-16 border border-slate-800 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-slate-700" />
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 mb-2">等待输入</h3>
          <p className="max-w-md text-sm leading-relaxed text-slate-500">
            在左侧详细填写产品参数，系统将从 TikTok 电商的视角，帮您研判该产品的可卖性、转化潜力与雷区。
          </p>
        </div>
      </div>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case '优先做': return 'bg-emerald-500 text-slate-950 font-bold';
      case '可以测试': return 'bg-slate-800 text-slate-200 border border-slate-700';
      case '谨慎进入': return 'bg-amber-500/20 text-amber-500 border border-amber-500/30';
      case '不建议做': return 'bg-red-500/20 text-red-500 border border-red-500/30';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  const getBadgeColor = (val: string, reverse: boolean = false) => {
    const isGood = reverse ? val === '低' : val === '高';
    const isBad = reverse ? val === '高' : val === '低';
    
    if (isGood) return 'text-emerald-400 font-bold';
    if (isBad) return 'text-red-400 font-bold';
    return 'text-amber-400 font-bold';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      
      {/* 结论卡片 */}
      <div className="border border-slate-800 bg-slate-900/50 p-6 relative group">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between mb-4">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Target className="w-3 h-3 text-emerald-500" />
            司令部研判结论
          </h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleCopy(`【${report.conclusion.level}】${report.conclusion.summary}`, 'conclusion')}
              className="text-slate-600 hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100"
              title="复制结论"
            >
              {copiedId === 'conclusion' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <span className={`px-3 py-1 text-[10px] uppercase tracking-wider ${getLevelColor(report.conclusion.level)}`}>
              {report.conclusion.level}
            </span>
          </div>
        </div>
        <p className="text-lg font-medium leading-relaxed pr-8 text-slate-200">{report.conclusion.summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TK 适配性雷达 */}
        <div className="border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            TK生态适配分析
          </h3>
          <div className="grid grid-cols-2 gap-px bg-slate-800 border border-slate-800 mb-6">
            <div className="bg-slate-900 p-4">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">内容可卖性</span>
              <span className={`text-sm ${getBadgeColor(report.adaptability.contentSellability)}`}>{report.adaptability.contentSellability}</span>
            </div>
            <div className="bg-slate-900 p-4">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">成交转化力</span>
              <span className={`text-sm ${getBadgeColor(report.adaptability.conversionPotential)}`}>{report.adaptability.conversionPotential}</span>
            </div>
            <div className="bg-slate-900 p-4">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">流量放大性</span>
              <span className={`text-sm ${getBadgeColor(report.adaptability.trafficScaling)}`}>{report.adaptability.trafficScaling}</span>
            </div>
            <div className="bg-slate-900 p-4">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">风险等级</span>
              <span className={`text-sm ${getBadgeColor(report.adaptability.riskLevel, true)}`}>{report.adaptability.riskLevel}</span>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest border-b border-slate-800 pb-2">核心依据</p>
            <ul className="space-y-2.5">
              {(report.adaptability?.reasons || []).map((reason, i) => (
                <li key={i} className="text-[13px] text-slate-300 flex items-start gap-3">
                  <span className="text-emerald-500 font-bold text-sm lead-none mt-[-2px]">·</span>
                  <span className="leading-relaxed">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 策略与卖点 */}
        <div className="space-y-6 flex flex-col">
          {/* 打法路径 */}
          <div className="border border-slate-800 bg-slate-900/50 p-6 flex-1 relative group">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3 text-emerald-500" />
                最佳成交路径
              </h3>
              <button 
                onClick={() => handleCopy(`最佳成交路径：${report.recommendedPath.path}\n原因：${report.recommendedPath.reason}`, 'path')}
                className="text-slate-600 hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100"
                title="复制路径"
              >
                {copiedId === 'path' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="inline-block px-3 py-1 mb-4 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              {report.recommendedPath.path}
            </div>
            <p className="text-[13px] text-slate-400 leading-relaxed pr-4">
              {report.recommendedPath.reason}
            </p>
          </div>

          {/* 核心卖点 */}
          <div className="border border-slate-800 bg-slate-900/50 p-6 flex-1 relative group">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Lightbulb className="w-3 h-3 text-emerald-500" />
                提炼核心卖点 (前3秒)
              </h3>
              <button 
                onClick={() => handleCopy((report.sellingPoints || []).map((s, i) => `${i+1}. ${s}`).join('\n'), 'sellingPoints')}
                className="text-slate-600 hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100"
                title="复制卖点"
              >
                {copiedId === 'sellingPoints' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <ul className="space-y-4">
              {(report.sellingPoints || []).map((sp, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="text-[10px] font-mono text-emerald-500 font-bold bg-slate-800 px-2 py-0.5 border border-slate-700">0{i+1}</span>
                  <span className="text-[13px] text-slate-300 leading-relaxed pt-0.5">{sp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 运营建议 */}
      <div className="border border-slate-800 bg-slate-900/50 p-6 relative group">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2 flex-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            阶段性行动建议
          </h3>
          <button 
            onClick={() => handleCopy((report.operationsAdvice || []).map((a, i) => `- ${a}`).join('\n'), 'advice')}
            className="text-slate-600 hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100 ml-4 border-b border-slate-800 pb-2"
            title="复制建议"
          >
            {copiedId === 'advice' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
          {(report.operationsAdvice || []).map((advice, i) => (
            <div key={i} className="flex items-start gap-3 border-l-2 border-slate-800 pl-4 py-1">
              <span className="text-[13px] text-slate-300 leading-relaxed">{advice}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 缺失信息告警 */}
      {report.missingInfo?.missingFields?.length > 0 && (
        <div className="border border-amber-500/30 bg-amber-500/5 p-6 flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <h4 className="text-[11px] font-bold text-amber-500 mb-1 uppercase tracking-widest">评估降级警告</h4>
            <p className="text-[13px] text-amber-500/80 leading-relaxed mb-4">
              由于缺乏以下字段，当前评估存在局限性。{report.missingInfo.impact}
            </p>
            <div className="flex flex-wrap gap-2">
              {(report.missingInfo.missingFields || []).map((field, i) => (
                <span key={i} className="px-2 py-1 bg-amber-500/10 text-amber-400 text-[10px] uppercase tracking-wider border border-amber-500/20">
                  {field}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
