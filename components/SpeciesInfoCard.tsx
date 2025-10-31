
import React from 'react';
import type { ItemInfo } from '../types';
import { ArrowPathIcon, BookmarkIcon, XMarkIcon, ShareIcon } from './icons';

interface ItemInfoCardProps {
  info: ItemInfo;
  onRetake?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  isReadOnly?: boolean;
  onClose?: () => void;
}

const getConfidencePill = (confidence: number) => {
    let textColor = 'text-gray-800';
    let borderColor = 'border-gray-300';
    if (confidence > 85) {
        borderColor = 'border-green-500';
        textColor = 'text-green-800';
    } else if (confidence > 60) {
        borderColor = 'border-yellow-500';
        textColor = 'text-yellow-800';
    } else {
        borderColor = 'border-red-500';
        textColor = 'text-red-800';
    }

    return (
        <div className={`absolute top-4 right-4 px-3 py-1 text-sm font-semibold rounded-full border-2 bg-gray-100/50 backdrop-blur-sm ${borderColor} ${textColor}`}>
            {confidence.toFixed(1)}% Confidence
        </div>
    );
};

const InfoDetail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="p-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-base text-gray-800 font-semibold">{value}</p>
    </div>
);

const NeumorphicButton: React.FC<{onClick: () => void, disabled?: boolean, children: React.ReactNode, 'aria-label': string}> = ({onClick, disabled, children, 'aria-label': ariaLabel}) => (
     <button
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className="flex-1 flex flex-col items-center justify-center gap-1 p-3 bg-gray-100 rounded-2xl shadow-neumorphic active:shadow-neumorphic-inset transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:shadow-neumorphic"
    >
        {children}
    </button>
)

const ItemInfoCard: React.FC<ItemInfoCardProps> = ({ info, onRetake, onSave, isSaved, isReadOnly, onClose }) => {
  const handleShare = async () => {
    if (!navigator.share) {
      alert("Sharing is not supported on your browser.");
      return;
    }

    const title = `Vision Find: ${info.name}`;
    const text = `${info.description}\n\nDid you know? ${info.funFact}`;

    try {
        const response = await fetch(info.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `${info.name.replace(/\s/g, '_')}.jpg`, { type: 'image/jpeg' });
        
        const shareData: ShareData = {
            title,
            text,
        };

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            shareData.files = [file];
        }

        await navigator.share(shareData);
    } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
             console.error('Error sharing:', error);
             alert(`Could not share: ${error.message}`);
        }
    }
  };

  const renderDetails = () => {
    const details: {label: string, value: string}[] = [];
    switch (info.category) {
        case 'Animal':
        case 'Plant':
            if (info.habitat) details.push({ label: 'Habitat', value: info.habitat });
            if (info.diet) details.push({ label: 'Diet', value: info.diet });
            if (info.lifespan) details.push({ label: 'Lifespan', value: info.lifespan });
            if (info.conservationStatus) details.push({ label: 'Conservation', value: info.conservationStatus });
            break;
        case 'Food':
            if (info.cuisine) details.push({ label: 'Cuisine', value: info.cuisine });
            if (info.ingredients?.length) details.push({ label: 'Key Ingredients', value: info.ingredients.join(', ') });
            break;
        case 'Object':
            if (info.material) details.push({ label: 'Material', value: info.material });
            if (info.era) details.push({ label: 'Era', value: info.era });
            break;
        default:
            return null;
    }
    
    if (details.length === 0) return null;

    const detailPairs = [];
    for (let i = 0; i < details.length; i += 2) {
        detailPairs.push(details.slice(i, i + 2));
    }

    return (
        <div className="bg-gray-100 rounded-2xl shadow-neumorphic-inset divide-y divide-gray-200">
            {detailPairs.map((pair, index) => (
                <div key={index} className="grid grid-cols-2 divide-x divide-gray-200">
                    <InfoDetail label={pair[0].label} value={pair[0].value} />
                    {pair[1] ? <InfoDetail label={pair[1].label} value={pair[1].value} /> : <div className="p-3"></div>}
                </div>
            ))}
        </div>
    );
  };

  return (
    <div className="w-full h-full bg-gray-100 overflow-y-auto pb-32 no-scrollbar animate-fade-in">
        {isReadOnly && onClose && (
             <button 
                onClick={onClose}
                className="absolute top-6 left-6 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-gray-100/80 backdrop-blur-sm shadow-neumorphic active:shadow-neumorphic-inset transition-all"
                aria-label="Close details"
            >
                <XMarkIcon className="w-7 h-7 text-gray-800" />
            </button>
        )}
        {isReadOnly && navigator.share && (
            <button 
                onClick={handleShare}
                className="absolute top-6 right-6 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-gray-100/80 backdrop-blur-sm shadow-neumorphic active:shadow-neumorphic-inset transition-all"
                aria-label="Share this find"
            >
                <ShareIcon className="w-6 h-6 text-gray-800" />
            </button>
        )}
        <div className="max-w-md mx-auto p-4 space-y-6">
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden shadow-neumorphic">
                <img src={info.imageUrl} alt={info.name} className="w-full h-full object-cover" />
                {getConfidencePill(info.confidence)}
            </div>

            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900">{info.name}</h1>
                {info.scientificName && <h2 className="text-xl text-gray-500 italic">{info.scientificName}</h2>}
            </div>
            
            <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-6 space-y-4">
                 <p className="text-base text-gray-700 leading-relaxed text-center">
                  {info.description}
                </p>
                {renderDetails()}
            </div>

             <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-4">
                 <div className="text-center">
                    <h3 className="font-bold text-gray-500 mb-1">Did you know?</h3>
                    <p className="text-gray-800 px-2">{info.funFact}</p>
                 </div>
            </div>
            
            {!isReadOnly && onRetake && onSave && (
                <div className="flex justify-center items-center gap-4 pt-2">
                    <NeumorphicButton onClick={onRetake} aria-label="New Scan">
                        <ArrowPathIcon className="w-6 h-6 text-gray-700" />
                        <span className="text-xs font-semibold text-gray-700">New Scan</span>
                    </NeumorphicButton>
                    {navigator.share && (
                         <NeumorphicButton onClick={handleShare} aria-label="Share this find">
                            <ShareIcon className="w-6 h-6 text-gray-700" />
                            <span className="text-xs font-semibold text-gray-700">Share</span>
                        </NeumorphicButton>
                    )}
                    <NeumorphicButton onClick={onSave} disabled={isSaved} aria-label={isSaved ? 'Saved to journal' : 'Save to journal'}>
                        <BookmarkIcon className={`w-6 h-6 ${isSaved ? 'text-blue-600' : 'text-gray-700'}`} />
                        <span className={`text-xs font-semibold ${isSaved ? 'text-blue-600' : 'text-gray-700'}`}>{isSaved ? 'Saved' : 'Save'}</span>
                    </NeumorphicButton>
                </div>
            )}
        </div>
       <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ItemInfoCard;