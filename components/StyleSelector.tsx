
import React, { useRef, useEffect } from 'react';
import { HAIRSTYLES, HAIR_COLORS } from '../constants';
import { Gender } from '../types';

interface StyleSelectorProps {
  selectedStyle: string | null;
  selectedColor: string;
  selectedGender: Gender;
  onSelectStyle: (styleId: string) => void;
  onSelectColor: (colorId: string) => void;
  onSelectGender: (gender: Gender) => void;
  disabled?: boolean;
  t: any; // Translation dictionary
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ 
  selectedStyle, 
  selectedColor,
  selectedGender,
  onSelectStyle, 
  onSelectColor,
  onSelectGender,
  disabled,
  t
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter styles based on gender
  const currentStyles = HAIRSTYLES.filter(s => s.gender === selectedGender || s.gender === 'both');

  // Reset scroll position when gender changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [selectedGender]);

  return (
    <div className="w-full space-y-6">
      
      {/* Gender & Color Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        
        {/* Gender Toggle */}
        <div className="bg-gray-200/50 p-1 rounded-lg inline-flex w-full md:w-auto">
          {(['male', 'female'] as Gender[]).map((gender) => (
            <button
              key={gender}
              onClick={() => !disabled && onSelectGender(gender)}
              disabled={disabled}
              className={`
                flex-1 md:w-32 py-2 text-sm font-semibold rounded-md transition-all duration-300
                ${selectedGender === gender 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {gender === 'male' ? t.gender_male : t.gender_female}
            </button>
          ))}
        </div>

        {/* Color Picker */}
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 no-scrollbar">
          <span className="text-xs text-gray-400 font-medium whitespace-nowrap mr-2">{t.hair_color}</span>
          {HAIR_COLORS.map((color) => {
            const colorName = t[`color_${color.id.replace('-', '_')}`] || color.name;
            return (
              <button
                key={color.id}
                onClick={() => !disabled && onSelectColor(color.id)}
                disabled={disabled}
                className={`
                  relative w-8 h-8 rounded-full flex-shrink-0 transition-transform duration-200
                  ${selectedColor === color.id ? 'scale-110 ring-2 ring-apple-blue ring-offset-2' : 'hover:scale-110'}
                `}
                style={{ backgroundColor: color.hex }}
                title={colorName}
              >
                {color.id === 'black' && <div className="absolute inset-0 rounded-full border border-white/10" />}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Styles List (Glassmorphism Text Cards) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-lg font-semibold text-gray-900">{t.select_style}</h2>
          <span className="text-xs text-gray-500 font-medium flex items-center">
            {t.scroll_hint}
            <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
        
        {/* Scrollable Container */}
        <div className="relative group">
          <div 
            ref={scrollContainerRef}
            className="flex space-x-4 overflow-x-auto pb-8 pt-2 px-1 snap-x scroll-smooth no-scrollbar touch-pan-x"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {currentStyles.map((style) => {
              // Dynamically look up translation based on ID
              const nameKey = `style_${style.id.replace(/-/g, '_')}_name`;
              const descKey = `style_${style.id.replace(/-/g, '_')}_desc`;
              const localizedName = t[nameKey] || style.name;
              const localizedDesc = t[descKey] || style.description;

              return (
                <button
                  key={style.id}
                  onClick={() => !disabled && onSelectStyle(style.id)}
                  disabled={disabled}
                  className={`
                    group snap-start flex-shrink-0 relative w-40 h-48 rounded-2xl overflow-hidden text-left transition-all duration-300
                    flex flex-col justify-between p-4
                    ${selectedStyle === style.id 
                      ? 'ring-2 ring-apple-blue ring-offset-2 scale-[1.02] shadow-xl' 
                      : 'hover:scale-[1.02] hover:shadow-lg opacity-90 hover:opacity-100'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {/* Background Gradient with Blur */}
                  <div className={`absolute inset-0 ${style.previewColor} opacity-80 transition-opacity duration-300 group-hover:opacity-100`}></div>
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
                  
                  {/* Glass Shine Effect */}
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end">
                    
                    {/* Selected Indicator */}
                    {selectedStyle === style.id && (
                      <div className="absolute top-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm animate-fade-in text-apple-blue">
                         <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                         </svg>
                      </div>
                    )}

                    <div className="mt-auto">
                      <span className="block text-lg font-bold text-gray-900 leading-tight mb-1 drop-shadow-sm">
                        {localizedName}
                      </span>
                      <span className="block text-xs text-gray-700 font-medium leading-relaxed opacity-80 line-clamp-3">
                        {localizedDesc}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
            {/* Spacer for right padding */}
            <div className="w-2 flex-shrink-0" />
          </div>
          
          {/* Fade indicator on the right for desktop */}
          <div className="absolute right-0 top-0 bottom-8 w-16 bg-gradient-to-l from-[#F5F5F7] to-transparent pointer-events-none md:block hidden" />
        </div>
      </div>
    </div>
  );
};

export default StyleSelector;
