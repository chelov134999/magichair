
import React, { useState } from 'react';
import { Sparkles, MessageSquarePlus, Globe, User as UserIcon, LogOut } from 'lucide-react';
import { Language, User } from '../types';
import { translations } from '../utils/translations';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenFeedback: () => void;
  onOpenLogin: () => void;
  onOpenPricing: () => void;
  onLogout: () => void;
  user: User | null;
}

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'zh', label: '繁體中文' }, // Using Traditional Chinese label for ZH as per user context
  { code: 'en', label: 'English' },
  { code: 'jp', label: '日本語' },
  { code: 'kr', label: '한국어' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
];

const Header: React.FC<HeaderProps> = ({ 
  currentLanguage, 
  onLanguageChange, 
  onOpenFeedback,
  onOpenLogin,
  onOpenPricing,
  onLogout,
  user
}) => {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const t = translations[currentLanguage];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-gray-900 hidden sm:block">
              {t.app_name}
            </span>
          </div>

          <nav className="flex items-center gap-2 sm:gap-4">
            
            {/* Feedback Button */}
             <button 
               onClick={onOpenFeedback}
               className="flex items-center text-sm font-medium text-gray-500 hover:text-apple-blue transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full"
             >
               <MessageSquarePlus className="w-4 h-4 mr-1.5" />
               <span className="hidden md:inline">{t.feedback_btn}</span>
             </button>

            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
              >
                <Globe className="w-5 h-5" />
              </button>
              
              {isLangMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsLangMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 py-1 animate-fade-in">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onLanguageChange(lang.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${currentLanguage === lang.code ? 'text-apple-blue font-medium bg-blue-50' : 'text-gray-700'}`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Auth Button */}
            {user ? (
               <button 
                onClick={onLogout}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-900 px-3 py-1.5 rounded-full transition-colors text-sm font-medium"
              >
                 <span className="w-2 h-2 rounded-full bg-green-500"></span>
                 <span className="hidden md:inline max-w-[100px] truncate">{user.email.split('@')[0]}</span>
                 <LogOut className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button 
                onClick={onOpenLogin}
                className="bg-apple-dark text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-black transition-transform active:scale-95 shadow-lg"
              >
                {t.signin_btn}
              </button>
            )}

            <button
              onClick={onOpenPricing}
              className="bg-apple-blue text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-600 transition-transform active:scale-95 shadow-lg"
            >
              升級/購買
            </button>

          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
