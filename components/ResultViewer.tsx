
import React, { useState } from 'react';
import { ViewAngle, Language } from '../types';
import Button from './Button';
import { Rotate3D, Download, RefreshCw, Share2, Sparkles, Trash2, Eye } from 'lucide-react';

interface ResultViewerProps {
  originalImage: string | null;
  generatedImage: string | null;
  selectedStylePreview: string | null;
  currentAngle: ViewAngle;
  onAngleChange: (angle: ViewAngle) => void;
  onReset: () => void;
  isLoading: boolean;
  t: any;
}

const ResultViewer: React.FC<ResultViewerProps> = ({
  originalImage,
  generatedImage,
  selectedStylePreview,
  currentAngle,
  onAngleChange,
  onReset,
  isLoading,
  t
}) => {
  const [showOriginal, setShowOriginal] = useState(false);
  
  // Logic: 
  // 1. If showing original (held down) and it exists -> Original
  // 2. If generated image exists -> Generated
  // 3. If no generated, check original -> Original
  // 4. If no original (hair mode), check preview -> Preview
  const activeImage = 
    (showOriginal && originalImage) ? originalImage :
    (generatedImage || originalImage || selectedStylePreview);

  // Helper to draw image and watermark to canvas and return data URL
  const getWatermarkedImage = async (imageUrl: string): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Draw Watermark
        const fontSize = Math.max(24, img.width * 0.04);
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.textAlign = 'right';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText("Pulse Magic Hair", img.width - 20, img.height - 20);
        
        // Add sparkle icon text
        ctx.font = `${fontSize}px serif`;
        ctx.fillText("✨", img.width - 20 - (ctx.measureText("Pulse Magic Hair").width) - 10, img.height - 20);

        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      };
      img.onerror = () => resolve(null);
    });
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    const blob = await getWatermarkedImage(generatedImage);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pulse-magic-hair-${currentAngle.toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleShare = async () => {
    if (!generatedImage) return;
    try {
      const blob = await getWatermarkedImage(generatedImage);
      if (!blob) return;

      const file = new File([blob], `pulse-magic-hair.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: t.app_name,
          text: t.slogan_desc,
        });
      } else {
        // Fallback for desktop or unsupported browsers
        handleDownload();
        alert(t.share_fail);
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const getViewLabel = (angle: ViewAngle) => {
    switch (angle) {
      case ViewAngle.FRONT: return t.view_front;
      case ViewAngle.SIDE: return t.view_side;
      case ViewAngle.BACK: return t.view_back;
      default: return angle;
    }
  };

  // Determine if we are just showing the style preview (not generated yet, no original)
  const isStylePreview = !originalImage && !generatedImage && selectedStylePreview;

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in flex flex-col md:flex-row gap-8 items-start">
      
      {/* Main Visualizer Area */}
      <div className="flex-1 w-full space-y-6">
        <div className="relative aspect-[3/4] md:aspect-square w-full rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 bg-white group">
          {isLoading ? (
             <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
               <div className="flex flex-col items-center">
                 <div className="w-16 h-16 border-4 border-apple-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-apple-dark font-medium animate-pulse">{t.ai_processing}...</p>
               </div>
             </div>
          ) : (
            <>
              {activeImage ? (
                <>
                  <img 
                   src={activeImage} 
                   alt="Result" 
                   className={`w-full h-full object-cover transition-all duration-500 ease-out transform ${isStylePreview ? 'scale-100 opacity-90' : 'hover:scale-[1.01]'}`}
                 />
                 {isStylePreview && (
                   <div className="absolute top-6 right-6 px-3 py-1.5 bg-gray-900/60 backdrop-blur-md rounded-full flex items-center gap-1.5 text-white text-xs font-medium animate-fade-in">
                     <Eye className="w-3 h-3" />
                     Reference Style
                   </div>
                 )}
               </>
              ) : (
                // Placeholder for when no image is generated yet in hair-only mode AND no style selected
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>{t.select_style}</p>
                  </div>
                </div>
              )}
               
               {/* Watermark Overlay (Visual only, burned in on download) */}
               {!showOriginal && generatedImage && (
                 <div className="absolute bottom-4 right-4 flex items-center gap-1.5 opacity-70 pointer-events-none drop-shadow-md">
                   <Sparkles className="w-4 h-4 text-white" />
                   <span className="text-white font-bold tracking-wide text-sm font-sans shadow-black">Pulse Magic Hair</span>
                 </div>
               )}

               <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center z-20">
                 <div className="flex space-x-2">
                    {/* Only show "Hold for Original" if an original image exists */}
                    {originalImage && (
                      <button 
                        onMouseDown={() => setShowOriginal(true)}
                        onMouseUp={() => setShowOriginal(false)}
                        onTouchStart={() => setShowOriginal(true)}
                        onTouchEnd={() => setShowOriginal(false)}
                        className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-xs font-semibold shadow-lg text-gray-800 hover:bg-white transition active:scale-95 select-none"
                      >
                        {t.hold_for_original}
                      </button>
                    )}
                 </div>
                 
                 {generatedImage && (
                   <div className="flex gap-2">
                     {/* Share Button */}
                     <button 
                      onClick={handleShare}
                      className="bg-white/80 backdrop-blur-md p-3 rounded-full text-gray-800 shadow-lg hover:bg-white transition active:scale-95"
                      title={t.share_btn}
                     >
                       <Share2 className="w-5 h-5" />
                     </button>
                     
                     {/* Download Button */}
                     <button 
                      onClick={handleDownload}
                      className="bg-apple-dark/90 backdrop-blur-md p-3 rounded-full text-white shadow-lg hover:bg-black transition active:scale-95"
                      title={t.download_btn}
                     >
                       <Download className="w-5 h-5" />
                     </button>
                   </div>
                 )}
               </div>
            </>
          )}
          
          {/* Angle Indicator Overlay - only if generated or original, not preview */}
          {(!isStylePreview && activeImage) && (
            <div className="absolute top-6 left-6 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-white text-xs font-medium tracking-wide uppercase">
              {getViewLabel(currentAngle)}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="w-full md:w-80 flex flex-col space-y-8 pt-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Rotate3D className="w-5 h-5 text-apple-blue" />
            {t.pro_view}
          </h3>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
             {t.pro_view_desc}
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            {[ViewAngle.FRONT, ViewAngle.SIDE, ViewAngle.BACK].map((angle) => (
              <button
                key={angle}
                onClick={() => onAngleChange(angle)}
                disabled={isLoading}
                className={`
                  relative flex items-center justify-between p-4 rounded-xl transition-all duration-200
                  ${currentAngle === angle 
                    ? 'bg-white shadow-md border-2 border-apple-blue text-apple-blue' 
                    : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'
                  }
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <span className="font-semibold">{getViewLabel(angle)}</span>
                {currentAngle === angle && <div className="w-2 h-2 rounded-full bg-apple-blue shadow-glow"></div>}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col gap-3">
          <Button variant="secondary" onClick={onReset} className="w-full justify-center group" disabled={isLoading}>
            <Trash2 className="w-4 h-4 mr-2 text-gray-400 group-hover:text-red-500 transition-colors" />
            {t.change_photo}
          </Button>
        </div>
      </div>

    </div>
  );
};

export default ResultViewer;
