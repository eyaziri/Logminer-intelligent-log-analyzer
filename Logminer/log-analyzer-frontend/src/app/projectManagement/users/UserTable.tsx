'use client';

import React from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import type { User } from '@/types/User';
import { Trash2 } from 'lucide-react';

interface UserTableProps {
  users: User[];
  loading: boolean;
  onRemove: (userId: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, loading, onRemove }) => {
  if (loading) {
    return (
      <ComponentCard title="Team Members">
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
          ))}
        </div>
      </ComponentCard>
    );
  }

  if (users.length === 0) {
    return (
      <ComponentCard title="Team Members">
        <p className="text-gray-500 dark:text-gray-400 p-6 text-center">No users assigned yet.</p>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Team Members">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Email</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map(u => (
              <tr key={u.idUser}>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{u.name} {u.lastName}</td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{u.email}</td>
                <td className="px-6 py-4 text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    startIcon={<Trash2 className="w-4 h-4" />}
                    onClick={() => onRemove(u.idUser)}
                  >
                    Delete
                  </Button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ComponentCard>
  );
};

export default UserTable;
