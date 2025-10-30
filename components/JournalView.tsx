import React from 'react';
import type { JournalEntry } from '../types';
import { BookmarkIcon } from './icons';

interface JournalViewProps {
  journal: JournalEntry[];
  onEntrySelect: (entry: JournalEntry) => void;
}

const JournalView: React.FC<JournalViewProps> = ({ journal, onEntrySelect }) => {
  return (
    <div className="w-full h-full bg-gray-100 overflow-y-auto pb-24 no-scrollbar">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-800 pt-4 pb-6">Journal</h1>
        
        {journal.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-gray-500 pt-16">
            <BookmarkIcon className="w-16 h-16 mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold">No Saved Items</h2>
            <p>Your saved discoveries will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {journal.map((entry) => (
              <button 
                key={entry.id} 
                onClick={() => onEntrySelect(entry)}
                className="w-full text-left flex items-center p-3 bg-gray-100 rounded-2xl shadow-neumorphic gap-4 transition-all active:shadow-neumorphic-inset"
              >
                <img src={entry.userImage} alt={entry.info.name} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="font-bold text-lg text-gray-800">{entry.info.name}</p>
                  <p className="text-sm text-gray-500">{entry.info.category}</p>
                   <p className="text-xs text-gray-400 mt-1">{new Date(entry.date).toLocaleDateString()}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
        <style>{`
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
    </div>
  );
};

export default JournalView;