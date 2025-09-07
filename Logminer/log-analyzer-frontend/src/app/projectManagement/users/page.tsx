'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import UserList from './UserList';
import { Users as UsersIcon, ArrowLeft } from 'lucide-react';

const UsersPage: React.FC = () => {
  const search = useSearchParams();
  const router = useRouter();
  const projectId   = search.get('projectId')!;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 space-x-4">
            <button onClick={() => router.back()} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">

                Users 

              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <UserList projectId={Number(projectId)} />
      </main>
    </div>
  );
};

export default UsersPage;
