
import React, { useState, useEffect, useCallback } from 'react';
import { identifyItem } from './services/geminiService';
import { loadProfile, saveProfile, updateProfileWithJournal, getAchievements } from './services/profileService';
import type { ItemInfo, JournalEntry, Geolocation, UserProfile, Achievement } from './types';
import CameraView from './components/CameraView';
import ItemInfoCard from './components/SpeciesInfoCard';
import LoadingSpinner from './components/LoadingSpinner';
import StartView from './components/StartView';
import BottomNavBar from './components/BottomNavBar';
import JournalView from './components/JournalView';
import DiscoverView from './components/DiscoverView';
import ProfileView from './components/ProfileView';

type ScanView = 'start' | 'camera' | 'loading' | 'result' | 'error';
type Tab = 'scan' | 'discover' | 'journal' | 'profile';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('scan');
  const [scanView, setScanView] = useState<ScanView>('start');

  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [itemInfo, setItemInfo] = useState<ItemInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Geolocation | null>(null);
  const [selectedJournalEntry, setSelectedJournalEntry] = useState<JournalEntry | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    let loadedJournal: JournalEntry[] = [];
    try {
        const savedJournal = localStorage.getItem('visionJournal');
        if (savedJournal) {
            loadedJournal = JSON.parse(savedJournal);
            setJournal(loadedJournal);
        }
    } catch (error) {
        console.error("Failed to load journal from localStorage", error);
    }

    const profile = loadProfile();
    const updatedProfile = updateProfileWithJournal(profile, loadedJournal);
    setUserProfile(updatedProfile);
    setAchievements(getAchievements(loadedJournal));
    if (JSON.stringify(profile) !== JSON.stringify(updatedProfile)) {
      saveProfile(updatedProfile); // Save updated stats on initial load
    }
    
    getLocation();
  }, []);

  const cleanupStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);
  
  const setupCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera access is not supported by your browser.');
        setScanView('error');
        return;
      }
      cleanupStream();
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      setScanView('camera');
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError('Could not access the camera. Please grant permission and try again.');
      setScanView('error');
    }
  }, [cleanupStream]);

  useEffect(() => {
    return () => {
      cleanupStream();
    };
  }, [cleanupStream]);

  const getLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCurrentLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (err) => {
                console.warn(`Geolocation error: ${err.message}`);
                setCurrentLocation(null);
            }
        );
    } else {
        console.warn("Geolocation is not supported by this browser.");
        setCurrentLocation(null);
    }
  };

  const processImage = useCallback(async (imageData: string) => {
    setIsProcessing(true);
    setCapturedImage(imageData);
    setScanView('loading');
    setError(null);
    setItemInfo(null);
    cleanupStream();
    getLocation();

    try {
      const info = await identifyItem(imageData);
      setItemInfo(info);
      setScanView('result');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Sorry, I couldn't identify that. ${errorMessage}`);
      setScanView('error');
    } finally {
      setIsProcessing(false);
    }
  }, [cleanupStream]);

  const handleCapture = useCallback(async (imageData: string) => {
    await processImage(imageData);
  }, [processImage]);
  
  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      if (imageData) {
        await processImage(imageData);
      } else {
        setError('Could not read the uploaded image.');
        setScanView('error');
      }
    };
    reader.onerror = () => {
      setError('Failed to read file.');
      setScanView('error');
    };
    reader.readAsDataURL(file);
  }, [processImage]);

  const handleImagePaste = useCallback(async (imageData: string) => {
    await processImage(imageData);
  }, [processImage]);

  const handleReset = useCallback(() => {
    setCapturedImage(null);
    setItemInfo(null);
    setError(null);
    cleanupStream();
    setScanView('start');
  }, [cleanupStream]);

  const handleSaveToJournal = useCallback(() => {
    if (!itemInfo || !capturedImage) return;

    const newEntry: JournalEntry = {
        id: new Date().toISOString(),
        info: itemInfo,
        userImage: capturedImage,
        location: currentLocation ?? undefined,
        date: new Date().toISOString(),
    };

    const updatedJournal = [newEntry, ...journal];
    setJournal(updatedJournal);
    try {
        localStorage.setItem('visionJournal', JSON.stringify(updatedJournal));
    } catch (error) {
        console.error("Failed to save to localStorage", error);
        setError("Could not save to journal. Storage might be full.");
        setScanView('error');
    }

    if(userProfile) {
        const updatedProfile = updateProfileWithJournal(userProfile, updatedJournal);
        setUserProfile(updatedProfile);
        saveProfile(updatedProfile);
        setAchievements(getAchievements(updatedJournal));
    }

  }, [itemInfo, capturedImage, currentLocation, journal, userProfile]);

  const handleProfileUpdate = (name: string, avatarId: string) => {
    if (userProfile) {
        const updatedProfile = { ...userProfile, name, avatarId };
        setUserProfile(updatedProfile);
        saveProfile(updatedProfile);
    }
  };
  
  const isCurrentItemSaved = journal.some(entry => entry.info.name === itemInfo?.name && entry.userImage === capturedImage);

  const renderScanView = () => {
    switch(scanView) {
      case 'start':
        return <StartView onCameraSelect={setupCamera} onImageUpload={handleImageUpload} onImagePasted={handleImagePaste} />;
      case 'camera':
        return <CameraView stream={stream} onCapture={handleCapture} onBack={handleReset} isLoading={isProcessing} />;
      case 'loading':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
             <div className="relative z-10">
                <LoadingSpinner />
             </div>
          </div>
        );
      case 'error':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-gray-100">
            <p className="text-red-500 text-lg mb-6 max-w-sm">{error}</p>
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-gray-800 text-white font-bold rounded-full shadow-lg"
            >
              Try Again
            </button>
          </div>
        );
      case 'result':
        if (itemInfo && capturedImage) {
          return <ItemInfoCard info={itemInfo} onRetake={handleReset} onSave={handleSaveToJournal} isSaved={isCurrentItemSaved} />;
        }
        handleReset();
        return null;
      default:
        return <StartView onCameraSelect={setupCamera} onImageUpload={handleImageUpload} onImagePasted={handleImagePaste} />;
    }
  }

  const renderPageContent = () => {
    switch (activeTab) {
        case 'scan':
            return renderScanView();
        case 'discover':
            return <DiscoverView location={currentLocation} />;
        case 'journal':
            return <JournalView journal={journal} onEntrySelect={setSelectedJournalEntry} />;
        case 'profile':
            return userProfile ? <ProfileView profile={userProfile} achievements={achievements} onSave={handleProfileUpdate} /> : <div className="w-full h-full flex items-center justify-center"><LoadingSpinner /></div>;
        default:
            return renderScanView();
    }
  };

  return (
    <main className="w-screen h-screen bg-gray-100 text-gray-800 overflow-hidden">
      <div className="relative w-full h-full">
         <div className="w-full h-full">
            {renderPageContent()}
         </div>
         <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {selectedJournalEntry && (
        <div className="absolute inset-0 z-[100] bg-gray-100/50 backdrop-blur-md animate-fade-in-fast">
          <ItemInfoCard
            info={selectedJournalEntry.info}
            isReadOnly={true}
            onClose={() => setSelectedJournalEntry(null)}
          />
        </div>
      )}

      <style>{`
        .shadow-neumorphic { box-shadow: 7px 7px 15px #d1d5db, -7px -7px 15px #ffffff; }
        .shadow-neumorphic-inset { box-shadow: inset 7px 7px 15px #d1d5db, inset -7px -7px 15px #ffffff; }
        .animate-fade-in-fast {
          animation: fadeInFast 0.3s ease-in-out;
        }
        @keyframes fadeInFast {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </main>
  );
};

export default App;