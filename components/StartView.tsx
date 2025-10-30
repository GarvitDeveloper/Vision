
import React, { useRef, useEffect } from 'react';
import { CameraIcon, ArrowUpTrayIcon, ClipboardIcon } from './icons';

interface StartViewProps {
  onCameraSelect: () => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImagePasted: (imageData: string) => void;
}

const StartView: React.FC<StartViewProps> = ({ onCameraSelect, onImageUpload, onImagePasted }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
        const items = event.clipboardData?.items;
        if (!items) return;

        for (const item of Array.from(items)) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const imageData = e.target?.result as string;
                        if (imageData) {
                            onImagePasted(imageData);
                        }
                    };
                    reader.readAsDataURL(file);
                    event.preventDefault();
                    return;
                }
            }
        }
    };

    window.addEventListener('paste', handlePaste);

    return () => {
        window.removeEventListener('paste', handlePaste);
    };
  }, [onImagePasted]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gray-100 animate-fade-in">
        <div className="max-w-xs w-full">
            <h1 className="text-5xl font-bold text-gray-800 mb-2">Vision</h1>
            <p className="text-lg text-gray-500 mb-16">Identify anything with a tap.</p>

            <div className="space-y-6">
                <button
                    onClick={onCameraSelect}
                    className="w-full flex items-center justify-center gap-4 px-6 py-5 bg-gray-100 text-gray-800 font-bold rounded-2xl shadow-neumorphic transition-all duration-150 active:shadow-neumorphic-inset"
                >
                    <CameraIcon className="w-7 h-7" />
                    <span className="text-lg">Scan with Camera</span>
                </button>
                <button
                    onClick={handleUploadClick}
                    className="w-full flex items-center justify-center gap-4 px-6 py-5 bg-gray-100 text-gray-800 font-bold rounded-2xl shadow-neumorphic transition-all duration-150 active:shadow-neumorphic-inset"
                >
                    <ArrowUpTrayIcon className="w-7 h-7" />
                    <span className="text-lg">Upload an Image</span>
                </button>
                
                <div className="relative text-center !mt-8">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-gray-100 px-2 text-sm text-gray-500">or</span>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-3 text-gray-500 !mt-4">
                    <ClipboardIcon className="w-6 h-6" />
                    <p className="font-semibold">Paste an image (Ctrl+V)</p>
                </div>
            </div>
            
            <input
                type="file"
                ref={fileInputRef}
                onChange={onImageUpload}
                className="hidden"
                accept="image/*"
            />
        </div>
         <style>{`
            .animate-fade-in {
              animation: fadeIn 0.5s ease-in-out;
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
        `}</style>
    </div>
  );
};

export default StartView;
