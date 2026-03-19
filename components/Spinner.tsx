
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="w-16 h-16 border-4 border-blue-500 border-solid rounded-full animate-spin border-t-transparent"></div>
      <p className="mt-4 text-lg font-semibold text-gray-700">Analyzing Global Climate Data...</p>
    </div>
  );
};

export default Spinner;
