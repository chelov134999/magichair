
import React, { useState } from 'react';
import { X, Mail, ArrowRight, Loader2, ShieldCheck, Apple, Chrome } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailSubmit: (mode: 'signin' | 'signup', email: string, password?: string) => Promise<void> | void;
  onGoogleLogin: () => Promise<void> | void;
  onAppleLogin: () => Promise<void> | void;
  statusMessage?: string | null;
  errorMessage?: string | null;
  language: Language;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onEmailSubmit, onGoogleLogin, onAppleLogin, statusMessage, errorMessage, language }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const t = translations[language];
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null);
    setLocalMessage(null);
    try {
      await onEmailSubmit(mode, email, password || undefined);
      setLocalMessage(t.login_link_sent || 'Login link sent. Please check your email.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setLocalError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 animate-slide-up border border-white/50">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl mx-auto mb-4 shadow-lg flex items-center justify-center text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{t.login_title}</h2>
          <p className="text-sm text-gray-500 mt-2">{t.login_desc}</p>
        </div>

        <div className="space-y-3 mb-4">
          <button
            type="button"
            onClick={async () => {
              setIsLoading(true);
              setLocalError(null);
              try {
                await onGoogleLogin();
              } catch (err) {
                const msg = err instanceof Error ? err.message : 'Login failed';
                setLocalError(msg);
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-[#4285F4] text-white font-semibold hover:bg-[#3367D6] transition-all shadow shadow-blue-200"
          >
            <Chrome className="w-5 h-5 mr-2 text-white" />
            <span className="text-sm">使用 Google 登入</span>
          </button>
          <button
            type="button"
            onClick={async () => {
              setIsLoading(true);
              setLocalError(null);
              try {
                await onAppleLogin();
              } catch (err) {
                const msg = err instanceof Error ? err.message : 'Login failed';
                setLocalError(msg);
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition-all shadow-sm"
          >
            <Apple className="w-5 h-5 mr-2" />
            <span className="text-sm">使用 Apple 登入</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-4">
          <div className="space-y-1">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder={t.email_label}
              />
            </div>
          </div>
          {mode === 'signup' && (
            <div className="space-y-1">
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="設定密碼"
                  minLength={6}
                />
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-medium shadow-lg hover:bg-black hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2 mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{mode === 'signup' ? '註冊' : t.signin_btn}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {(statusMessage || localMessage) && (
          <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg p-3 text-center">
            {statusMessage || localMessage}
          </p>
        )}

        {(errorMessage || localError) && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 text-center mt-2">
            {errorMessage || localError}
          </p>
        )}

        <div className="mt-4 text-center text-sm text-gray-600">
          {mode === 'signin' ? (
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              還沒有帳號？點此註冊
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              已有帳號？返回登入
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
