'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import ServerForm from './ServerForm';
import ServerTable from './ServerTable';
import { ServerConfig } from '@/types/ServerConfig';

const ServerList: React.FC = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const projectName = searchParams.get('projectName');

  const [servers, setServers] = useState<ServerConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [editingServer, setEditingServer] = useState<ServerConfig | null>(null);
  const [formData, setFormData] = useState<Partial<ServerConfig>>({
    name: '',
    password: '',
    ipAddress: '',
    protocol: 'http',
    port: 80,
    logPath: '',
    errorLogPath: '',
    logType: '',
    logFormat: '',
    fetchFrequencyMinutes: 5,
    authMethod: '',
    status: 'stopped',
    logRetrievalMode: '',
    logRotationPolicy: '',
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const CFG_BASE = `${API_BASE}/server-config`;
  const PROJ_SERVERS = projectId
    ? `${API_BASE}/project/${projectId}/servers`
    : null;

  function getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Not authenticated');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  useEffect(() => {
    if (alert) {
      const timeout = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [alert]);

const fetchServers = async () => {
  setLoading(true);
  setError(null);
  try {
    // 1) fetch the raw server list
    const resCfg = await fetch(PROJ_SERVERS ?? `${CFG_BASE}/all`, {
      headers: getAuthHeaders(),
    });
    if (!resCfg.ok) throw new Error(resCfg.statusText);
    const cfgs: ServerConfig[] = await resCfg.json();

    // 2) fetch the tailing-status map
    const resStat = await fetch(`${CFG_BASE}/tailing-status`, {
      headers: getAuthHeaders(),
    });
    if (!resStat.ok) throw new Error(resStat.statusText);
    const statMap: Record<number, boolean> = await resStat.json();

    // 3) Merge them together
    const merged = cfgs.map(cfg => ({
      ...cfg,
      status: statMap[cfg.idServerConfig] ? 'running' : 'stopped',
    }));

    setServers(merged);

  } catch (err) {
    const msg = (err as Error).message || 'Failed to load servers';
    setError(msg);
    setAlert({ type: 'error', message: msg });
  } finally {
    setLoading(false);
  }
};



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingServer ? `${CFG_BASE}/update` : `${CFG_BASE}/create`;
      const method = editingServer ? 'PUT' : 'POST';
      const payload: Partial<ServerConfig> = {
        ...formData,
        project: projectId ? { idProject: Number(projectId) } : undefined,
      };
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      console.log("Sending to:", url);
      console.log("Payload:", payload);

      if (!res.ok) throw new Error('Save failed');
      await fetchServers();
      setShowForm(false);
      const msg = editingServer ? 'Server updated' : 'Server created';
      toast.success(msg);
      setAlert({ type: 'success', message: msg });
    } catch (err) {
      const msg = (err as Error).message || 'Save error';
      toast.error(msg);
      setAlert({ type: 'error', message: msg });
    }
  };

  // Toggle server status (start/stop)
  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'running' ? 'stopped' : 'running';
      const endpoint = newStatus === 'running' ? 'start' : 'stop';
      
      const res = await fetch(`${CFG_BASE}/${endpoint}/${id}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      if (!res.ok) throw new Error(`Failed to ${endpoint} server`);
      
      await fetchServers();
      
      const msg = `Server ${newStatus === 'running' ? 'started' : 'stopped'} successfully`;
      toast.success(msg);
      setAlert({ type: 'success', message: msg });
    } catch (err) {
      const msg = (err as Error).message || 'Failed to toggle server status';
      toast.error(msg);
      setAlert({ type: 'error', message: msg });
    }
  };

  // Fonction qui ouvre la modale de confirmation
  const onDeleteClick = (id: number) => {
    setPendingDeleteId(id);
  };

  // Fonction qui effectue la suppression après confirmation
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${CFG_BASE}/delete/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Delete failed');
      await fetchServers();
      toast.success('Server deleted');
      setAlert({ type: 'success', message: 'Server deleted successfully' });
    } catch (err) {
      const msg = (err as Error).message || 'Delete error';
      toast.error(msg);
      setAlert({ type: 'error', message: msg });
    }
  };

  // Confirmation dans la modale
  const confirmDelete = () => {
    if (pendingDeleteId !== null) {
      handleDelete(pendingDeleteId);
      setPendingDeleteId(null);
    }
  };

  // Annuler suppression
  const cancelDelete = () => {
    setPendingDeleteId(null);
  };

  const openForm = (server?: ServerConfig) => {
    if (server) {
      setEditingServer(server);
      setFormData(server);
    } else {
      setEditingServer(null);
      setFormData({
        name: '',
        password:'',
        ipAddress: '',
        protocol: 'http',
        port: 80,
        logPath: '',
        errorLogPath: '',
        logType: '',
        logFormat: '',
        fetchFrequencyMinutes: 5,
        authMethod: '',
        status: 'stopped',
        logRetrievalMode: '',
        logRotationPolicy: '',
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingServer(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'port' || name === 'fetchFrequencyMinutes' ? Number(value) : value,
    }));
  };

  useEffect(() => {
    fetchServers();
  }, [projectId]);

  return (
    <div className="space-y-6 relative">

      {/* Alert Banner */}
      {alert && (
        <div
          className={`p-4 rounded text-white ${
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

      
      {showForm ? (
  <ServerForm
    formData={formData}
    editingServer={editingServer}
    onSubmit={handleSubmit}
    onInputChange={handleChange}
    onClose={closeForm}
  />
) : (
  <>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {projectId ? `Servers for ${projectName}` : 'Your Servers'}
      </h2>
      <button
        onClick={() => openForm()}
        className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
      >
        <span>New Server</span>
      </button>
    </div>

    <ServerTable
      servers={servers}
      loading={loading}
      onEdit={openForm}
      onDelete={onDeleteClick}
      onToggleStatus={handleToggleStatus}
    />
  </>
)}


      {/* ✅ Modale de confirmation */}
      {pendingDeleteId && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Confirm Deletion
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Are you sure you want to delete this server?
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={cancelDelete}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ServerList;