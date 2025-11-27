
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import StyleSelector from './components/StyleSelector';
import ResultViewer from './components/ResultViewer';
import FeedbackModal from './components/FeedbackModal';
import AuthModal from './components/AuthModal';
import PricingModal from './components/PricingModal';
import { generateHairstyle, fileToDataURL } from './services/geminiService';
import { HairstyleOption, ViewAngle, GeneratedImage, Gender, Language, User } from './types';
import { HAIRSTYLES, HAIR_COLORS } from './constants';
import { Wand2 } from 'lucide-react';
import { translations } from './utils/translations';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';

export default function App() {
  // App Settings
  const [language, setLanguage] = useState<Language>('zh'); 
  
  // User & Auth State
  const [user, setUser] = useState<User | null>(null);
  
  // Image Generation State
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isHairOnlyMode, setIsHairOnlyMode] = useState(false); // New state for hair-only mode

  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<string>('black');
  const [selectedGender, setSelectedGender] = useState<Gender>('female');
  const [viewAngle, setViewAngle] = useState<ViewAngle>(ViewAngle.FRONT);
  
  // Modal Visibility State
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  // Cache generated images
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<{ message: string | null; error: string | null }>({ message: null, error: null });

  const t = translations[language];

  const mapSessionToUser = (session: Session): User => ({
    id: session.user.id,
    email: session.user.email || 'user@unknown.com',
    name: session.user.user_metadata?.name,
    avatarUrl: session.user.user_metadata?.avatar_url,
    isSubscribed: !!session.user.user_metadata?.is_subscribed,
    subscriptionType: session.user.user_metadata?.subscription_type,
    freeTrialsRemaining: session.user.user_metadata?.free_trials_remaining ?? 5,
  });

  // Initial session fetch + listener
  useEffect(() => {
    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(mapSessionToUser(data.session));
      }
    };
    syncSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(mapSessionToUser(session));
      } else {
        setUser(null);
        setGeneratedImages([]);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Auth Handlers
  const handleEmailAuth = async (mode: 'signin' | 'signup', email: string, password?: string) => {
    setAuthStatus({ message: null, error: null });
    try {
      if (mode === 'signup') {
        if (!password) throw new Error('請輸入密碼以完成註冊');
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setAuthStatus({ message: '註冊成功，請到信箱確認並登入。', error: null });
        return;
      }

      // Sign in
      if (password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      setAuthStatus({ message: t.login_link_sent || '已寄出登入連結，請至信箱查看。', error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setAuthStatus({ message: null, error: msg });
    }
  };

  const handleGoogleLogin = async () => {
    setAuthStatus({ message: null, error: null });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      setAuthStatus({ message: null, error: error.message });
    }
  };

  const handleAppleLogin = async () => {
    setAuthStatus({ message: null, error: null });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      setAuthStatus({ message: null, error: error.message });
    }
  };

  const handleOpenPricing = () => {
    if (!ensureAuthForCheckout()) return;
    setIsPricingOpen(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setGeneratedImages([]); // Clear private data
  };

  const ensureAuthForCheckout = () => {
    if (!user) {
      setIsAuthOpen(true);
      return false;
    }
    return true;
  };

  const handleImageSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const dataUrl = await fileToDataURL(file);
      setOriginalImage(dataUrl);
      setIsHairOnlyMode(false); // Disable hair-only mode when image is uploaded
      setGeneratedImages([]);
      setSelectedStyleId(null);
      setViewAngle(ViewAngle.FRONT);
    } catch (err) {
      setError("Failed to load image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipUpload = () => {
    setIsHairOnlyMode(true);
    setOriginalImage(null);
    setGeneratedImages([]);
    setSelectedStyleId(null);
    setViewAngle(ViewAngle.FRONT);
  };

  const handleReset = () => {
    setOriginalImage(null);
    setIsHairOnlyMode(false);
    setGeneratedImages([]);
    setSelectedStyleId(null);
  };

  const handleStyleSelect = (styleId: string) => {
    if (selectedStyleId !== styleId) {
      setSelectedStyleId(styleId);
      setViewAngle(ViewAngle.FRONT);
    }
  };

  const handleColorSelect = (colorId: string) => {
    if (selectedColorId !== colorId) {
      setSelectedColorId(colorId);
      if (selectedStyleId) {
        setViewAngle(ViewAngle.FRONT);
      }
    }
  };
  
  const handleGenderSelect = (gender: Gender) => {
    setSelectedGender(gender);
    setSelectedStyleId(null); 
  };

  const generateCurrentView = async (styleId: string, colorId: string, gender: Gender, angle: ViewAngle) => {
    // Allow generation if originalImage exists OR if in HairOnlyMode
    if (!originalImage && !isHairOnlyMode) return;

    // --- GATEKEEPER LOGIC ---
    // 1. Check Login
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    // 2. Check Subscription or Trials
    if (!user.isSubscribed && user.freeTrialsRemaining <= 0) {
      setIsPricingOpen(true);
      return;
    }
    // ------------------------
    
    setIsLoading(true);
    setError(null);

    try {
      const style = HAIRSTYLES.find(s => s.id === styleId);
      const color = HAIR_COLORS.find(c => c.id === colorId);
      
      if (!style || !color) throw new Error("Style or Color not found");

      const generatedUrl = await generateHairstyle(
        originalImage, 
        style.name + " " + style.description, 
        color.promptValue,
        gender,
        angle
      );

      // Deduct trial if not subscribed
      if (!user.isSubscribed) {
        setUser(prev => prev ? ({ ...prev, freeTrialsRemaining: prev.freeTrialsRemaining - 1 }) : null);
      }

      setGeneratedImages(prev => [
        ...prev,
        { url: generatedUrl, angle, styleId, colorId }
      ]);

    } catch (err) {
      console.error(err);
      setError(t.generate_error);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger generation logic
  useEffect(() => {
    if (!selectedStyleId) return;
    // Check if we need image (normal mode) or not (hair only mode)
    if (!isHairOnlyMode && !originalImage) return;

    const exists = generatedImages.find(
      img => img.styleId === selectedStyleId && 
             img.angle === viewAngle && 
             img.colorId === selectedColorId
    );

    if (!exists && !isLoading) {
      const timer = setTimeout(() => {
         // We perform the check here again to avoid loop if Auth/Pricing modal is open
         if (!isAuthOpen && !isPricingOpen) {
            generateCurrentView(selectedStyleId, selectedColorId, selectedGender, viewAngle);
         }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedStyleId, selectedColorId, viewAngle, originalImage, isHairOnlyMode, selectedGender, user, isAuthOpen, isPricingOpen]);

  const currentGeneratedImage = generatedImages.find(
    img => img.styleId === selectedStyleId && 
           img.angle === viewAngle &&
           img.colorId === selectedColorId
  )?.url || null;

  // Determine if we are in the "Editor" view (either uploaded image OR hair only mode)
  const isEditorActive = !!originalImage || isHairOnlyMode;
  
  // Find currently selected style object for preview
  const selectedStyleObj = HAIRSTYLES.find(s => s.id === selectedStyleId);

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans pb-20">
      <Header 
        currentLanguage={language}
        onLanguageChange={setLanguage}
        onOpenFeedback={() => setIsFeedbackOpen(true)} 
        onOpenLogin={() => setIsAuthOpen(true)}
        onOpenPricing={handleOpenPricing}
        onLogout={handleLogout}
        user={user}
      />
      
      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Trial Counter Badge */}
        {user && !user.isSubscribed && (
          <div className="fixed top-20 right-4 z-40 bg-white/90 backdrop-blur border border-gray-200 shadow-md rounded-full px-4 py-1 text-xs font-semibold text-apple-blue animate-fade-in">
             {t.trials_remaining}: {user.freeTrialsRemaining}
          </div>
        )}

        {!isEditorActive ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
             <div className="text-center mb-10 max-w-2xl">
               <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                 {t.slogan_title}
               </h1>
               <p className="text-lg text-gray-500">
                 {t.slogan_desc}
               </p>
             </div>
             <ImageUploader 
                onImageSelect={handleImageSelect} 
                onSkipUpload={handleSkipUpload}
                t={t} 
             />
          </div>
        ) : (
          <div className="flex flex-col gap-8 animate-fade-in">
            
            <div className="flex justify-between items-center md:hidden">
              <span className="text-sm font-medium text-gray-500">
                {selectedStyleId ? t.select_style : t.app_name}
              </span>
            </div>

            <div className="flex flex-col-reverse md:flex-col gap-8">
               <div className="w-full max-w-4xl mx-auto bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white/50 shadow-sm">
                  <StyleSelector 
                    selectedStyle={selectedStyleId}
                    selectedColor={selectedColorId}
                    selectedGender={selectedGender}
                    onSelectStyle={handleStyleSelect}
                    onSelectColor={handleColorSelect}
                    onSelectGender={handleGenderSelect}
                    disabled={isLoading}
                    t={t}
                  />
               </div>

               <ResultViewer 
                 originalImage={originalImage}
                 generatedImage={currentGeneratedImage}
                 selectedStylePreview={selectedStyleObj?.imageUrl || null}
                 currentAngle={viewAngle}
                 onAngleChange={setViewAngle}
                 onReset={handleReset}
                 isLoading={isLoading}
                 t={t}
               />
            </div>
          </div>
        )}

        {/* Floating Hint */}
        {!selectedStyleId && isEditorActive && !isLoading && (
           <div className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none animate-slide-up z-40">
              <div className="bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 pointer-events-auto">
                <Wand2 className="w-4 h-4" />
                <span className="text-sm font-medium">{t.select_style}</span>
              </div>
           </div>
        )}

        {error && (
          <div className="fixed bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 shadow-lg animate-slide-up z-50 flex items-start gap-3">
             <div className="mt-0.5">⚠️</div>
             <div>
               <p className="font-semibold text-sm">Error</p>
               <p className="text-xs mt-1 opacity-90">{error}</p>
             </div>
             <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-700">✕</button>
          </div>
        )}

      </main>
      
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onEmailSubmit={(mode, email, password) => handleEmailAuth(mode, email, password)}
        onGoogleLogin={handleGoogleLogin}
        onAppleLogin={handleAppleLogin}
        statusMessage={authStatus.message}
        errorMessage={authStatus.error}
        language={language}
      />
      
      <PricingModal 
        isOpen={isPricingOpen} 
        onClose={() => setIsPricingOpen(false)} 
        userId={user?.id}
        userEmail={user?.email}
      />
    </div>
  );
}
