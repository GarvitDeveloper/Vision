
import React, { useState, useEffect, useCallback } from 'react';
import { getDiscoveryContent } from '../services/geminiService';
import type { Geolocation, DiscoveryItem } from '../types';
import { ArrowPathIcon, LightBulbIcon, MapPinIcon, MagnifyingGlassIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

interface DiscoverViewProps {
  location: Geolocation | null;
}

const categoryIcons: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  'Local Discovery': MapPinIcon,
  'Fun Fact': LightBulbIcon,
  'Challenge': MagnifyingGlassIcon,
};

const categoryColors: { [key: string]: string } = {
  'Local Discovery': 'text-green-600',
  'Fun Fact': 'text-purple-600',
  'Challenge': 'text-blue-600',
}

const DiscoveryCard: React.FC<{ item: DiscoveryItem }> = ({ item }) => {
    const Icon = categoryIcons[item.category] || LightBulbIcon;
    const color = categoryColors[item.category] || 'text-gray-600';

    return (
        <div className="bg-gray-100 rounded-3xl shadow-neumorphic p-5 animate-fade-in space-y-3">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full shadow-neumorphic-inset ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className={`text-sm font-bold ${color}`}>{item.category}</p>
                    <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                </div>
            </div>
            <p className="text-gray-600 leading-relaxed pl-1">
                {item.description}
            </p>
        </div>
    );
};

const DiscoverView: React.FC<DiscoverViewProps> = ({ location }) => {
  const [items, setItems] = useState<DiscoveryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const content = await getDiscoveryContent(location);
      setItems(content);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Could not load discoveries. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return (
    <div className="w-full h-full bg-gray-100 overflow-y-auto pb-24 no-scrollbar">
      <div className="max-w-md mx-auto p-4">
        <div className="flex justify-between items-center pt-4 pb-6">
            <h1 className="text-3xl font-bold text-gray-800">Discover</h1>
            <button 
                onClick={fetchContent} 
                disabled={isLoading}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 shadow-neumorphic active:shadow-neumorphic-inset disabled:opacity-50"
                aria-label="Refresh discoveries"
            >
                <ArrowPathIcon className={`w-6 h-6 text-gray-700 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
        </div>
        
        {isLoading && (
            <div className="pt-16">
                 <LoadingSpinner />
            </div>
        )}

        {error && (
            <div className="flex flex-col items-center justify-center text-center text-gray-500 pt-16">
                <p className="text-red-500">{error}</p>
            </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-6">
            {items.map((item, index) => (
              <DiscoveryCard key={index} item={item} />
            ))}
          </div>
        )}
      </div>
       <style>{`
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
             .animate-fade-in {
              animation: fadeIn 0.5s ease-in-out;
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
        `}</style>
    </div>
  );
};

export default DiscoverView;
