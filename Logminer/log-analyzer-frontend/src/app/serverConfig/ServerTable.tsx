'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import { ServerConfig } from '@/types/ServerConfig';
import { Edit3, Trash2, Play, Square, Eye } from 'lucide-react';

interface ServerTableProps {
  servers: ServerConfig[];
  loading: boolean;
  onEdit: (s: ServerConfig) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, currentStatus: string) => void;
}

const ServerTable: React.FC<ServerTableProps> = ({ 
  servers, 
  loading, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}) => {
  const router = useRouter();

  const handleViewLogs = (serverId: number) => {
    router.push(`/logStream?serverId=${serverId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'stopped':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <ComponentCard title="Servers">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </ComponentCard>
    );
  }

  if (servers.length === 0) {
    return (
      <ComponentCard title="Servers">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No servers found.</p>
        </div>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Servers">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">IP</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Protocol</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Port</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {servers.map(s => (
              <tr key={s.idServerConfig} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{s.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{s.ipAddress}</td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{s.protocol}</td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{s.port}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(s.status || 'stopped')}`}>
                    {s.status || 'stopped'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center space-x-2">
                    <Button 
                      size="sm" 
                      className="w-8 h-8" 
                      startIcon={<Edit3 className="w-4 h-4" />} 
                      onClick={() => onEdit(s)}
                      title="Edit Server"
                    >
                      
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-8 h-8" 
                      startIcon={<Trash2 className="w-4 h-4" />} 
                      onClick={() => onDelete(s.idServerConfig)}
                      title="Delete Server"
                    >
                     
                    </Button>
                    <Button 
                      size="sm" 
                      variant={s.status === 'running' ? 'outline' : 'primary'}
                      className="w-8 h-8" 
                      startIcon={s.status === 'running' ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      onClick={() => onToggleStatus(s.idServerConfig, s.status || 'stopped')}
                      title={s.status === 'running' ? 'Stop Server' : 'Start Server'}
                    >
                    
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-8 h-8 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800" 
                      startIcon={<Eye className="w-4 h-4" />}
                      onClick={() => handleViewLogs(s.idServerConfig)}
                      title="View Logs"
                                        >
                      
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile fallback */}
      <div className="lg:hidden space-y-4 mt-4">
        {servers.map(s => (
          <div key={s.idServerConfig} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{s.name}</h3>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(s.status || 'stopped')}`}>
                {s.status || 'stopped'}
              </span>
            </div>
            <div className="space-y-1 mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">IP: {s.ipAddress}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Protocol: {s.protocol}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Port: {s.port}</p>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" startIcon={<Edit3 className="w-4 h-4" />} onClick={() => onEdit(s)}                     >
                      Edit
                    </Button>
              <Button size="sm" variant="outline" startIcon={<Trash2 className="w-4 h-4" />} onClick={() => onDelete(s.idServerConfig)}                     >
                      
                    </Button>
              <Button 
                size="sm" 
                variant={s.status === 'running' ? 'outline' : 'primary'}
                startIcon={s.status === 'running' ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                onClick={() => onToggleStatus(s.idServerConfig, s.status || 'stopped')}
                                  >
                    
                    </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800"
                startIcon={<Eye className="w-4 h-4" />}
                onClick={() => handleViewLogs(s.idServerConfig)}
                                  >
                      
                    </Button>
            </div>
          </div>
        ))}
      </div>
    </ComponentCard>
  );
};

export default ServerTable;