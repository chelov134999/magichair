
import React, { useState } from 'react';
import Button from './Button';
import { X, Upload, Send, CheckCircle } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8 animate-slide-up overflow-hidden">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">收到您的建議了！</h3>
            <p className="text-gray-500">我們會盡快請設計師開發這款新髮型。</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">意見與許願池</h2>
              <p className="text-gray-500 text-sm">
                找不到喜歡的髮型嗎？上傳圖片或描述給我們，我們將在下次更新中加入！
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  髮型描述
                </label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all resize-none"
                  rows={3}
                  placeholder="例如：想要《梨泰院》朴敘俊的那種栗子頭..."
                  required
                />
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                  參考圖片 (選填)
                </label>
                <label className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer w-full">
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="text-xs">點擊上傳圖片</span>
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full" 
                  isLoading={isSubmitting}
                  icon={<Send className="w-4 h-4" />}
                >
                  發送建議
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
