import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import type { ARFeature } from '../types';
import { XMarkIcon } from './icons';

interface ARViewProps {
  stream: MediaStream;
  features: ARFeature[];
  onBack: () => void;
}

interface LabelPosition {
  id: string;
  x: number;
  y: number;
  name: string;
}

const ARView: React.FC<ARViewProps> = ({ stream, features, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [positions, setPositions] = useState<LabelPosition[]>([]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const updatePositions = () => {
    if (!videoRef.current) return;
    const { clientWidth, clientHeight } = videoRef.current;
    const newPositions = features.map((feature, index) => ({
      id: `feature-${index}`,
      x: feature.x * clientWidth,
      y: feature.y * clientHeight,
      name: feature.name,
    }));
    setPositions(newPositions);
  };

  useLayoutEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const resizeObserver = new ResizeObserver(() => {
      updatePositions();
    });
    
    const handleLoadedMetadata = () => {
        updatePositions();
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    resizeObserver.observe(videoElement);

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      resizeObserver.unobserve(videoElement);
    };
  }, [features]);


  return (
    <div className="relative w-full h-full bg-black animate-fade-in">
      <button
        onClick={onBack}
        className="absolute top-6 right-6 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-gray-100/80 backdrop-blur-sm shadow-neumorphic active:shadow-neumorphic-inset transition-all"
        aria-label="Close AR view"
      >
        <XMarkIcon className="w-7 h-7 text-gray-800" />
      </button>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
        {positions.map((pos, index) => (
          <div
            key={pos.id}
            className="absolute"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
            }}
          >
            <div className="relative flex items-center justify-center animate-ar-pulse" style={{ animationDelay: `${index * 150}ms` }}>
              <div className="w-3 h-3 bg-gray-900 rounded-full shadow-lg border-2 border-white"></div>
              <div className="absolute whitespace-nowrap px-3 py-1 bg-gray-900/80 backdrop-blur-sm text-white text-sm rounded-full shadow-lg font-semibold" style={{ transform: 'translate(15px, -15px)' }}>
                {pos.name}
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes ar-pulse {
          0% { transform: scale(0.8) translate(-50%, -50%); opacity: 0; }
          60% { transform: scale(1.1) translate(-50%, -50%); opacity: 1; }
          100% { transform: scale(1) translate(-50%, -50%); opacity: 1; }
        }
        .animate-ar-pulse { 
            transform-origin: center;
            opacity: 0;
            animation: ar-pulse 0.6s ease-out forwards; 
        }
      `}</style>
    </div>
  );
};

export default ARView;