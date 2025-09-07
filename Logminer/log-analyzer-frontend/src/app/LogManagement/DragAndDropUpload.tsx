'use client';

import React, { useEffect, useState } from 'react';

interface Props {
  onUpload: (file: File) => void;
  resetSignal?: number; // à incrémenter depuis le parent pour déclencher une réinitialisation
}

const DragAndDropUpload: React.FC<Props> = ({ onUpload, resetSignal }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
      onUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onUpload(file);
    }
  };

  // 🧼 Reset fileName when resetSignal changes
  useEffect(() => {
    setFileName(null);
  }, [resetSignal]);

  return (
    <div
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onDragLeave={() => setDragActive(false)}
      className={`border-2 border-dashed p-10 text-center rounded-md cursor-pointer transition-all ${
        dragActive ? 'bg-blue-100 border-blue-400' : 'border-gray-400'
      }`}
    >
      <input type="file" id="fileUpload" hidden onChange={handleFileChange} />
      <label htmlFor="fileUpload">
        <p className="text-lg font-medium">Drag & Drop a file here</p>
        <p className="text-sm text-gray-600">or click to select a file</p>
      </label>
      {fileName && (
        <p className="mt-4 text-sm text-green-700">Selected file: {fileName}</p>
      )}
    </div>
  );
};

export default DragAndDropUpload;
