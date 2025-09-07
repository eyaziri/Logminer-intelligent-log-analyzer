'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Server, Play, Square, RefreshCw } from 'lucide-react';
import LogTable from '../../components/LogTable'; // Adjust path as needed

interface ServerInfo {
  idServerConfig: number;
  name: string;
  ipAddress: string;
  status: string;
  protocol: string;
  port: number;
}

export default function ViewLogsPage() {
  const params = useSearchParams();
  const router = useRouter();
  const serverId = Number(params.get('serverId'));
  
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [serverStatus, setServerStatus] = useState<string>('unknown');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  function getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Not authenticated');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  const fetchServerInfo = async () => {
    if (!serverId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/server-config/get/${serverId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch server info: ${response.statusText}`);
      }

      const data = await response.json();
      setServerInfo(data);
      setServerStatus(data.status || 'stopped');
    } catch (err) {
      console.error('Error fetching server info:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const toggleServerStatus = async () => {
    if (!serverId) return;
    
    try {
      const newStatus = serverStatus === 'running' ? 'stopped' : 'running';
      const endpoint = newStatus === 'running' ? 'start' : 'stop';
      
      const response = await fetch(`${API_BASE}/server-config/${endpoint}/${serverId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${endpoint} server`);
      }

      setServerStatus(newStatus);
    } catch (err) {
      console.error('Error toggling server status:', err);
      setError((err as Error).message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'stopped':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  useEffect(() => {
    fetchServerInfo();
  }, [serverId]);

  if (!serverId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">No server selected.</p>
              <button
                onClick={() => router.back()}
                className="mt-4 inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin text-gray-500" />
              <span className="text-gray-500">Loading server information...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-700 p-6">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">Error: {error}</p>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Servers</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {serverInfo?.name || `Server #${serverId}`}
                  </h1>
                  {serverInfo && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {serverInfo.protocol}://{serverInfo.ipAddress}:{serverInfo.port}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(serverStatus)}`}>
                {serverStatus}
              </span>
              
              <button
                onClick={toggleServerStatus}
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                  serverStatus === 'running'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {serverStatus === 'running' ? (
                  <>
                    <Square className="w-4 h-4" />
                    <span>Stop Server</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Start Server</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Server Status Warning */}
          {serverStatus !== 'running' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-yellow-800 text-xs">!</span>
                </div>
                <p className="text-yellow-800 dark:text-yellow-200">
                  Server is currently {serverStatus}. Start the server to begin collecting logs.
                </p>
              </div>
            </div>
          )}

          {/* Log Table */}
          <LogTable 
            serverId={serverId} 
            autoRefresh={serverStatus === 'running'}
            refreshInterval={5000}
          />
        </div>
      </main>
    </div>
  );
}