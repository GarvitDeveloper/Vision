import React, { useRef, useEffect, useCallback, useState } from 'react';
import { ArrowLeftIcon, BoltIcon, BoltSlashIcon } from './icons';

interface CameraViewProps {
  stream: MediaStream | null;
  onCapture: (imageData: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({ stream, onCapture, onBack, isLoading }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [track, setTrack] = useState<MediaStreamTrack | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isFlashSupported, setIsFlashSupported] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1);
  const [zoomStep, setZoomStep] = useState(0.1);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        setTrack(videoTrack);
        const capabilities = videoTrack.getCapabilities();
        
        // Fix: Property 'torch' does not exist on type 'MediaTrackCapabilities'. Cast to any to access it.
        if ((capabilities as any).torch) {
          setIsFlashSupported(true);
        }

        // Fix: Property 'zoom' does not exist on type 'MediaTrackCapabilities'. Cast to any to access it.
        if ((capabilities as any).zoom) {
          // Fix: Property 'zoom' does not exist on type 'MediaTrackCapabilities'. Destructure from casted capabilities.
          const { min, max, step } = (capabilities as any).zoom;
          setMinZoom(min ?? 1);
          setMaxZoom(max ?? 1);
          setZoomStep(step ?? 0.1);
          setZoom(min ?? 1);
        }
      }
    }
  }, [stream]);

  const handleCapture = useCallback(() => {
    if (isLoading || !videoRef.current?.srcObject) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(imageData);
      }
    }
  }, [onCapture, isLoading]);

  const handleZoomChange = useCallback(async (newZoom: number) => {
    if (track && newZoom >= minZoom && newZoom <= maxZoom) {
      try {
        // Fix: 'zoom' does not exist in type 'MediaTrackConstraintSet'. Cast constraints to any.
        await track.applyConstraints({ advanced: [{ zoom: newZoom }] } as any);
        setZoom(newZoom);
      } catch (error) {
        console.error('Failed to apply zoom:', error);
      }
    }
  }, [track, minZoom, maxZoom]);

  const toggleFlash = useCallback(async () => {
    if (track && isFlashSupported) {
      try {
        const newFlashState = !isFlashOn;
        // Fix: 'torch' does not exist in type 'MediaTrackConstraintSet'. Cast constraints to any.
        await track.applyConstraints({ advanced: [{ torch: newFlashState }] } as any);
        setIsFlashOn(newFlashState);
      } catch (error) {
        console.error('Failed to toggle flash:', error);
      }
    }
  }, [track, isFlashSupported, isFlashOn]);


  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
       <button 
        onClick={onBack}
        className="absolute top-6 left-6 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-gray-100/80 backdrop-blur-sm shadow-neumorphic active:shadow-neumorphic-inset transition-all"
        aria-label="Go back"
      >
        <ArrowLeftIcon className="w-6 h-6 text-gray-800" />
      </button>

      {isFlashSupported && (
        <button
          onClick={toggleFlash}
          className="absolute top-6 right-6 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-gray-100/80 backdrop-blur-sm shadow-neumorphic active:shadow-neumorphic-inset transition-all"
          aria-label="Toggle flash"
        >
          {isFlashOn ? <BoltIcon className="w-6 h-6 text-yellow-500" /> : <BoltSlashIcon className="w-6 h-6 text-gray-800" />}
        </button>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {maxZoom > minZoom && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center space-y-2">
           <span className="text-xs font-bold text-white bg-black/50 px-1.5 py-0.5 rounded-full">{maxZoom.toFixed(1)}x</span>
           <input
             type="range"
             min={minZoom}
             max={maxZoom}
             step={zoomStep}
             value={zoom}
             onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
             className="zoom-slider"
             aria-label="Zoom control"
           />
           <span className="text-xs font-bold text-white bg-black/50 px-1.5 py-0.5 rounded-full">{minZoom.toFixed(1)}x</span>
        </div>
      )}


      <div className="absolute bottom-10 left-0 w-full p-6 flex justify-center" style={{bottom: 'calc(4rem + env(safe-area-inset-bottom))'}}>
        <button
          onClick={handleCapture}
          disabled={isLoading || !stream}
          className="w-20 h-20 rounded-full bg-gray-100 p-1 flex items-center justify-center transition-all duration-200 shadow-neumorphic active:shadow-neumorphic-inset disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Capture photo"
        >
          <div className="w-full h-full bg-gray-100 rounded-full border-4 border-gray-300"></div>
        </button>
      </div>
      <style>{`
        .zoom-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 150px;
          height: 5px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 5px;
          outline: none;
          transform: rotate(-90deg);
          transition: background 0.2s;
        }
        .zoom-slider:hover {
          background: rgba(255, 255, 255, 0.6);
        }
        .zoom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 26px;
          height: 26px;
          background: white;
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(0,0,0,0.3);
        }
        .zoom-slider::-moz-range-thumb {
          width: 26px;
          height: 26px;
          background: white;
          cursor: pointer;
          border-radius: 50%;
          border: none;
          box-shadow: 0 0 8px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default CameraView;