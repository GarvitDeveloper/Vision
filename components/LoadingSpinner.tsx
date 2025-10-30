import React from 'react';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-gray-800"></div>
    <p className="text-lg text-gray-600 font-medium">Identifying...</p>
  </div>
);

export default LoadingSpinner;