import React from 'react';
import { X } from 'lucide-react';

interface APIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function APIKeyModal({ isOpen, onClose }: APIKeyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-tk-gray border border-tk-border w-full max-w-md rounded-2xl shadow-2xl shadow-tk-pink/10 overflow-hidden transform transition-all">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-tk-cyan to-tk-pink pb-1">
              API 配置
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              当前版本已改为服务端代理模式，浏览器里不再直接保存模型密钥。请在部署平台的环境变量里配置 OpenAI 兼容接口参数。
            </p>
            
            <div className="rounded-xl border border-tk-border bg-tk-dark/80 p-4 space-y-3">
              <div>
                <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider">必填</div>
                <div className="mt-1 font-mono text-sm text-tk-cyan">OPENAI_API_KEY</div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider">推荐</div>
                <div className="mt-1 font-mono text-sm text-gray-200">OPENAI_MODEL=gpt-4.1-mini</div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider">可选</div>
                <div className="mt-1 font-mono text-sm text-gray-200">OPENAI_BASE_URL=https://api.openai.com/v1</div>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-gray-500">
              如果你使用的是国内或第三方模型平台，只要它提供 OpenAI 兼容接口，就把对应的 Base URL、模型名和密钥配置到服务端环境变量即可。
            </p>
            
            <div className="pt-2 flex justify-end">
              <button 
                onClick={onClose}
                className="px-5 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-tk-cyan to-tk-pink text-white hover:opacity-90 transition-opacity shadow-lg shadow-tk-pink/20"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
