
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Global Solar Suitability Dashboard
            </h1>
            <p className="text-indigo-200 mt-1">
              Analyzing Climate Data for Optimal Solar Site Selection
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
