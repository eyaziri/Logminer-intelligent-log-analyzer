'use client';

import React, { useState, useEffect } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import { useSearchParams } from 'next/navigation';

interface Recommendation {
  id: number;
  content: string;
}

interface Log {
  idLog: number;
  timestamp: string;
  level: string;
  source: string;
  message: string;
  analysisStatus: string;
  recommendations?: Recommendation[];
}

const levelColors: Record<string, string> = {
  ERROR: 'bg-red-500 text-white',
  WARN: 'bg-yellow-400 text-black',
  WARNING: 'bg-yellow-400 text-black',
  INFO: 'bg-blue-500 text-white',
  DEBUG: 'bg-gray-500 text-white',
};

const statusColors: Record<string, string> = {
  processed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
};

const LogTable: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalLog, setModalLog] = useState<Log | null>(null);

  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      try {
        if (!projectId || !token) {
          setLogs([]);
          setLoading(false);
          return;
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/project/logs/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data: Log[] = await response.json();
        const sortedLogs = data.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setLogs(sortedLogs);
      } catch (err) {
        console.error(err);
        setError('Failed to load logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [projectId, token]);

  const openModal = (log: Log) => {
    setModalLog(log);
  };

  const closeModal = () => {
    setModalLog(null);
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600 dark:text-gray-300">Loading logs...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600 dark:text-red-400">{error}</div>;
  }

  return (
    <>
      <ComponentCard title="Logs">
        {/* Blur seulement si modal ouverte */}
        <div
          className={`overflow-x-auto rounded-lg shadow-md transition-filter duration-300 ${
            modalLog ? 'filter blur-sm' : ''
          }`}
        >
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                {['ID', 'Timestamp', 'Level', 'Source', 'Message', 'Status'].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500 dark:text-gray-400 italic">
                    No logs found for this project.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.idLog}
                    className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {log.idLog}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          levelColors[log.level.toUpperCase()] ?? 'bg-gray-300 text-gray-800'
                        }`}
                      >
                        {log.level.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{log.source}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 max-w-xs whitespace-normal break-words">
                      {log.message}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <span
                        className={`inline-block min-w-[80px] text-center px-3 py-1 rounded text-sm font-semibold cursor-pointer ${
                          log.analysisStatus
                            ? statusColors[log.analysisStatus.toLowerCase()] ?? 'bg-gray-200 text-gray-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                        onClick={() => openModal(log)}
                      >
                        {log.analysisStatus?.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ComponentCard>

      {/* Modal centered without dark overlay */}
      {modalLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="pointer-events-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full p-6"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Recommendations for Log #{modalLog.idLog}
            </h3>
            {modalLog.recommendations && modalLog.recommendations.length > 0 ? (
              <ul className="list-disc list-inside max-h-60 overflow-y-auto space-y-2 text-gray-800 dark:text-gray-200 mb-6">
                {modalLog.recommendations.map((rec) => (
                  <li key={rec.id}>{rec.content}</li>
                ))}
              </ul>
            ) : (
              <p className="mb-6 text-gray-600 dark:text-gray-400">No hints available.</p>
            )}
            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LogTable;
