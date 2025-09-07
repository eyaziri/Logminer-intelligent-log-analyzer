'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/userSlice';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import { Project } from '@/types/Project';
import {
  Server,
  Users,
  Edit3,
  Trash2,
  Settings,
  Activity,
} from 'lucide-react';

export interface ProjectTableProps {
  projects: Project[];
  loading: boolean;
  onOpenServerConfig: (projectId: number, projectName: string) => void;
  onOpenLogHistory: (projectId: number) => void;
  onManageUsers: (projectId: number, projectName: string) => void;
  onEditProject: (project?: Project) => void;
  onDeleteProject: (projectId: number) => void;
}

const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  onManageUsers,
  onEditProject,
  onDeleteProject,
  loading = false,
}) => {
  const router = useRouter();

  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = currentUser?.role === 'ADMIN';

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const getProjectAge = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) === 1 ? '' : 's'} ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) === 1 ? '' : 's'} ago`;
    return `${Math.ceil(diffDays / 365)} year${Math.ceil(diffDays / 365) === 1 ? '' : 's'} ago`;
  };

  const handleNavigateToServers = (projectId: number, projectName: string) => {
    router.push(`/serverConfig?projectId=${projectId}&projectName=${projectName}`);
  };

  if (loading) {
    return (
      <ComponentCard title="Projects">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </ComponentCard>
    );
  }

  if (projects.length === 0) {
    return (
      <ComponentCard title="Projects">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Server className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Projects Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Get started by creating your first project to manage servers and deployments.
          </p>
        </div>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Projects">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Project Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created
              </th>
              {isAdmin && (
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Server Management
                </th>
              )}
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Monitoring
              </th>
              {isAdmin && (
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Team
                </th>
              )}
              {isAdmin && (
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {projects.map((project) => (
              <tr key={project.idProject} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{project.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(project.dateOfCreation)} ({getProjectAge(project.dateOfCreation)})
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 text-center">
                    <Button
                      onClick={() => handleNavigateToServers(project.idProject, project.name)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                      startIcon={<Settings className="w-4 h-4" />}
                    >
                      Servers
                    </Button>
                  </td>
                )}
                <td className="px-6 py-4 text-center">
                  <Button
                    onClick={() => router.push(`/projectManagement/logs?projectId=${project.idProject}`)}

                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    startIcon={<Activity className="w-4 h-4" />}
                  >
                    Logs
                  </Button>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 text-center">
                    <Button
                      onClick={() => onManageUsers(project.idProject, project.name)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                      startIcon={<Users className="w-4 h-4" />}
                    >
                      Team
                    </Button>
                  </td>
                )}
                {isAdmin && (
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <Button
                        onClick={() => onEditProject(project)}
                        className="w-8 h-8 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg"
                        startIcon={<Edit3 className="w-4 h-4" />}
                        aria-label="Edit"
                      >
                        {/* Même si vide, tu dois mettre quelque chose */}
                        <span className="sr-only">Edit</span>
                      </Button>

                      <Button
                        onClick={() => onDeleteProject(project.idProject)}
                        className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg"
                        startIcon={<Trash2 className="w-4 h-4" />}
                        aria-label={`Delete project ${project.name}`}
                      >
                        {/* Même si vide, tu dois mettre quelque chose */}
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ComponentCard>
  );
};

export default ProjectTable;