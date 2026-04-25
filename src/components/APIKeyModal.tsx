import React, { useState } from 'react';
import { Settings, X, Save } from 'lucide-react';

interface APIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string;
}

export function APIKeyModal({ isOpen, onClose, onSave, currentKey }: APIKeyModalProps) {
  const [keyInput, setKeyInput] = useState(currentKey);

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
              您可以配置自定义的 Gemini API Key。如果不填写，系统将尝试使用环境变量中默认配置的 Key。
            </p>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Gemini API Key
              </label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-tk-dark border border-tk-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-tk-cyan focus:ring-1 focus:ring-tk-cyan transition-all font-mono"
              />
            </div>
            
            <div className="pt-4 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  onSave(keyInput);
                  onClose();
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-tk-cyan to-tk-pink text-white hover:opacity-90 transition-opacity shadow-lg shadow-tk-pink/20"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
