'use client';

import React from 'react';
import LogUploader from './LogUploader';



const LogManagementPage = () => {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Upload New Log File</h2>
        <LogUploader />
      </div>
    
    </div>
  );
};

export default LogManagementPage;
