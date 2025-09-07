'use client';
import React, { useEffect, useState } from 'react';
import DragAndDropUpload from './DragAndDropUpload';
import { Project } from '@/types/Project';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ErrorPage from '@/components/error/errorPage';
import { RawLogFile } from '@/types/RawLogFile';
const LogUploader: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetSignal, setResetSignal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [rawLogFiles] = useState<RawLogFile[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No authentication token found. Please login.');
    return { Authorization: `Bearer ${token}` };
  };
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE}/project/all`, { headers });
      if (!res.ok) {
        if (res.status === 401) throw new Error('Authentication failed. Please login again.');
        throw new Error(`Failed to fetch projects: ${res.statusText}`);
      }
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid project list format');
      setProjects(data);
      if (data.length > 0) setSelectedProjectId(data[0].idProject);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMsg);
      setAlert({ type: 'error', message: errorMsg });
      if (errorMsg.includes('token') || errorMsg.includes('Authentication')) {
        setTimeout(() => router.push('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProjects();
  }, []);
  useEffect(() => {
    if (alert) {
      const timeout = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [alert]);
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProjectId = parseInt(e.target.value, 10);
    setSelectedProjectId(newProjectId);
    setSelectedFile(null);
  };
  const handleFileSelect = (file: File) => {
    if (!file || file.size === 0) {
      toast.error('Invalid file or empty folder. Please select a valid log file.');
      setAlert({ type: 'error', message: 'Invalid file or empty folder. Please select a valid log file.' });
      return;
    }
    setSelectedFile(file);
  };
  const handleConfirmUpload = async () => {
    if (!selectedProjectId || !selectedFile) {
      toast.error('Please select both a project and a file.');
      setAlert({ type: 'error', message: 'Please select both a project and a file.' });
      return;
    }
    setUploading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Missing authentication token');
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await fetch(`${API_BASE}/raw-log/upload/${selectedProjectId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload raw log file');
      }
      setAlert({ type: 'success', message: ':white_tick: Raw log file uploaded successfully!' });
      toast.success(':white_tick: Raw log file uploaded successfully!');
      setSelectedFile(null);
      setResetSignal(prev => prev + 1);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      toast.error(msg);
      setAlert({ type: 'error', message: msg });
    } finally {
      setUploading(false);
    }
  };
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setResetSignal(prev => prev + 1);
    toast('File selection cleared');
    setAlert({ type: 'info', message: 'File selection cleared' });
  };
  if (error && !loading) {
    if (error.includes('token') || error.includes('Authentication')) return null;
    return <ErrorPage code={500} title="Error loading projects" message={error} />;
  }
  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded-lg shadow bg-white dark:bg-gray-900">
      {alert && (
        <div
          className={`mb-4 p-4 rounded text-white ${
            alert.type === 'success'
              ? 'bg-green-500'
              : alert.type === 'error'
              ? 'bg-red-500'
              : 'bg-blue-500'
          }`}
        >
          {alert.message}
          <button
            onClick={() => setAlert(null)}
            className="float-right text-white font-bold"
          >
            &times;
          </button>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Upload a Raw Log File</h2>
      <label className="block mb-4 text-gray-700 dark:text-gray-200">
        <span className="font-medium">Select Project:</span>
        {loading ? (
          <p className="mt-2 text-sm text-gray-500">Loading projects...</p>
        ) : projects.length > 0 ? (
          <select
            value={selectedProjectId ?? ''}
            onChange={handleProjectChange}
            className="mt-2 block w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
          >
            {projects.map(project => (
              <option key={project.idProject} value={project.idProject}>
                {project.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-red-500 mt-2">No available projects</p>
        )}
      </label>
      <DragAndDropUpload onUpload={handleFileSelect} resetSignal={resetSignal} />
      {selectedFile && (
        <div className="mt-4 flex flex-col items-start">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            Selected file: <strong>{selectedFile.name}</strong>
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleConfirmUpload}
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center"
            >
              {uploading && (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                  ></path>
                </svg>
              )}
              Confirm Upload
            </button>
            <button
              onClick={handleRemoveFile}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Remove File
            </button>
          </div>
        </div>
      )}
      {rawLogFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Uploaded Raw Logs:</h3>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
            {rawLogFiles.map(log => (
              <li key={log.id}>
                {log.fileName} ({Math.round(log.fileSize / 1024)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
export default LogUploader;
