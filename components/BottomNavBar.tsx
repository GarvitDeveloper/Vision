import React from 'react';
import { HomeIcon, SparklesIcon, BookmarkIcon, UserIcon } from './icons';

type Tab = 'scan' | 'discover' | 'journal' | 'profile';

interface BottomNavBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const NavItem: React.FC<{
  tabName: Tab,
  label: string,
  icon: React.ElementType,
  isActive: boolean,
  onClick: () => void
}> = ({ tabName, label, icon: Icon, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 ${isActive ? 'shadow-neumorphic-inset' : ''}`}
      aria-label={label}
    >
      <Icon className={`w-7 h-7 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
      <span className={`text-xs font-semibold transition-colors ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>{label}</span>
    </button>
  );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div 
        className="fixed bottom-0 left-0 right-0 z-50 bg-gray-100"
        style={{paddingBottom: 'env(safe-area-inset-bottom)'}}
    >
        <div className="flex justify-around items-center h-20 p-2 gap-2 shadow-neumorphic">
            <NavItem
                tabName="scan"
                label="Scan"
                icon={HomeIcon}
                isActive={activeTab === 'scan'}
                onClick={() => onTabChange('scan')}
            />
            <NavItem
                tabName="discover"
                label="Discover"
                icon={SparklesIcon}
                isActive={activeTab === 'discover'}
                onClick={() => onTabChange('discover')}
            />
            <NavItem
                tabName="journal"
                label="Journal"
                icon={BookmarkIcon}
                isActive={activeTab === 'journal'}
                onClick={() => onTabChange('journal')}
            />
            <NavItem
                tabName="profile"
                label="Profile"
                icon={UserIcon}
                isActive={activeTab === 'profile'}
                onClick={() => onTabChange('profile')}
            />
        </div>
    </div>
  );
};

export default BottomNavBar;