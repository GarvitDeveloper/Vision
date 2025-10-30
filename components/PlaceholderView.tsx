
import React from 'react';
import { SparklesIcon, UserIcon } from './icons';

interface PlaceholderViewProps {
  icon: 'sparkles';
  title: string;
  message: string;
}

const icons = {
  sparkles: SparklesIcon,
};

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ icon, title, message }) => {
  const IconComponent = icons[icon];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gray-100">
      <div className="flex flex-col items-center text-gray-500">
        <IconComponent className="w-16 h-16 mb-4 text-gray-400" />
        <h1 className="text-2xl font-bold mb-2 text-gray-700">{title}</h1>
        <p className="max-w-xs">{message}</p>
      </div>
    </div>
  );
};

export default PlaceholderView;