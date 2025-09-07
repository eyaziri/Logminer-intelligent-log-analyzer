'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import UserTable from './UserTable';
import { User } from '@/types/User';

interface UserListProps {
  projectId: number;
}

const UserList: React.FC<UserListProps> = ({ projectId }) => {
  const [members, setMembers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Not authenticated');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  useEffect(() => {
    if (alert) {
      const timeout = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timeout);
    }
  }, [alert]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const [memRes, allRes] = await Promise.all([
        fetch(`${API}/project/${projectId}/users`, { headers: getAuthHeaders() }),
        fetch(`${API}/user/all`, { headers: getAuthHeaders() }),
      ]);
      if (!memRes.ok || !allRes.ok) throw new Error('Failed to fetch users');
      const [m, all] = await Promise.all([memRes.json(), allRes.json()]);
      setMembers(m);
      setAllUsers(all);
    } catch (e) {
      setAlert({ type: 'error', message: (e as Error).message });
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

const handleAdd = async (e: React.ChangeEvent<HTMLSelectElement>) => {
  const uid = Number(e.target.value);
  if (!uid) return;
  setAddingId(uid);
  try {
    const res = await fetch(`${API}/project/${projectId}/addUser/${uid}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to add user');
    
    await fetchMembers(); // 👈 Attends que les membres soient rechargés

    setAlert({ type: 'success', message: 'User added successfully' });
    toast.success('User added');
  } catch (e) {
    setAlert({ type: 'error', message: (e as Error).message });
    toast.error((e as Error).message);
  } finally {
    setAddingId(null);
    e.target.value = '';
  }
};

  const handleRemove = (userId: number) => {
    const user = members.find(u => u.idUser === userId);
    if (user) setUserToDelete(user);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`${API}/project/${projectId}/removeUser/${userToDelete.idUser}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to remove user');
      setAlert({ type: 'success', message: 'User removed successfully' });
      toast.success('User removed');
      fetchMembers();
    } catch (e) {
      setAlert({ type: 'error', message: (e as Error).message });
      toast.error((e as Error).message);
    } finally {
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setUserToDelete(null);
  };

  const candidates = allUsers.filter(u => !members.some(m => m.idUser === u.idUser));

  return (
    <div className="relative space-y-6">
      {/* Alert Banner */}
      {alert && (
        <div
          className={`p-4 rounded text-white text-sm font-medium ${
            alert.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {alert.message}
        </div>
      )}

      {/* Add existing user dropdown */}
      <div className="flex items-center space-x-2">
        <select
          onChange={handleAdd}
          disabled={addingId !== null}
          className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
        >
          <option value="">+ Add existing user…</option>
          {candidates.map(u => (
            <option key={u.idUser} value={u.idUser}>
              {u.name} {u.lastName} ({u.email})
            </option>
          ))}
        </select>
      </div>

      {/* User Table */}
      <UserTable users={members} loading={loading} onRemove={handleRemove} />
       {/* ✅ Modale de confirmation */}
      {userToDelete && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Confirm Deletion
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Are you sure you want to remove <strong>{userToDelete.name} {userToDelete.lastName}</strong> from the project?
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

export default UserList;
