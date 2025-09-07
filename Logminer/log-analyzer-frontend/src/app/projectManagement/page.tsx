
'use client';

import React from 'react';
import ProjectList from './ProjectList';
import { FolderOpen, Server, Users, Activity } from 'lucide-react';

const ProjectManagementPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Icon + Title */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Project Management
                </h1>
              </div>
            </div>

            {/* Right: Quick Stats */}
            <div className="hidden md:flex items-center space-x-6 text-gray-600 dark:text-gray-400 text-sm">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4" />
                <span>Server Management</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Real-time Monitoring</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>User Management</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* The ProjectList component internally manages state,
            shows the project table and form modals. */}
        <ProjectList />
      </main>
    </div>

  );
};

export default ProjectManagementPage;
