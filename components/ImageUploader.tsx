
import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles } from 'lucide-react';
import Button from './Button';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  onSkipUpload: () => void;
  t: any; // Accept translations object
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, onSkipUpload, t }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelect(e.dataTransfer.files[0]);
    }
  }, [onImageSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
      // Reset input value to allow selecting the same file again if needed
      e.target.value = '';
    }
  }, [onImageSelect]);

  return (
    <div className="w-full max-w-xl mx-auto animate-slide-up">
      <div
        className={`relative group rounded-3xl border-2 border-dashed transition-all duration-300 ease-in-out
          ${isDragging 
            ? 'border-blue-500 bg-blue-50/50 scale-[1.02]' 
            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
          }
          h-96 flex flex-col items-center justify-center text-center p-8 cursor-pointer overflow-hidden shadow-sm`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()} // Allow clicking anywhere in the box
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/0 to-purple-50/0 group-hover:from-blue-50/30 group-hover:to-purple-50/30 transition-all duration-500" />
        
        <div className="relative z-10 flex flex-col items-center space-y-6 pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
             {isDragging ? (
                <UploadCloud className="w-10 h-10 text-blue-500" />
             ) : (
                <ImageIcon className="w-10 h-10 text-gray-400 group-hover:text-gray-600" />
             )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {t.upload_title}
            </h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
              {t.upload_desc}
            </p>
          </div>

          <div className="pt-2 pointer-events-auto flex flex-col gap-3 w-full max-w-xs">
            <label htmlFor="file-upload" className="cursor-pointer inline-block w-full" onClick={(e) => e.stopPropagation()}>
               <Button as="span" variant="primary" className="w-full justify-center">
                  {t.upload_btn}
               </Button>
               <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
            
            <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-300 text-xs">OR</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <Button 
              variant="secondary" 
              className="w-full justify-center"
              onClick={(e) => {
                e.stopPropagation();
                onSkipUpload();
              }}
              icon={<Sparkles className="w-4 h-4 text-purple-500" />}
            >
              {t.generate_hair_only}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-center space-x-6 text-xs text-gray-400">
        <span className="flex items-center"><span className="w-1 h-1 bg-gray-300 rounded-full mr-2"></span>{t.ai_processing}</span>
        <span className="flex items-center"><span className="w-1 h-1 bg-gray-300 rounded-full mr-2"></span>{t.hd_quality}</span>
        <span className="flex items-center"><span className="w-1 h-1 bg-gray-300 rounded-full mr-2"></span>{t.privacy_protection}</span>
      </div>
    </div>
  );
};

export default ImageUploader;
