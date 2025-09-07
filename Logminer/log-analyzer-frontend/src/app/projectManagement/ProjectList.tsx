'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProjectTable from './ProjectTable';
import ProjectForm from './ProjectForm';
import { Project } from '@/types/Project';
import ErrorPage from '@/components/error/errorPage';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { selectCurrentUser } from '@/store/userSlice';


const ProjectList: React.FC = () => {
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => selectCurrentUser(state));
  const isAdmin = currentUser?.role === 'ADMIN';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [projects, setProjects] = useState<Project[]>([]);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [confirmDeleteProject, setConfirmDeleteProject] = useState<{ id: number; name: string } | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No authentication token found. Please login.');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE}/project/all`, { headers });
      if (!response.ok) {
        if (response.status === 401) throw new Error('Authentication failed. Please login again.');
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      if (errorMessage.includes('token') || errorMessage.includes('Authentication')) {
        setTimeout(() => router.push('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = getAuthHeaders();
      let url = `${API_BASE}/project/create`;
      let method = 'POST';
      let bodyData;

      if (editingProject) {
        url = `${API_BASE}/project/update`;
        method = 'PUT';
        bodyData = { ...editingProject, ...formData };
      } else {
        bodyData = formData;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) throw new Error(`Failed to ${editingProject ? 'update' : 'create'} project`);

      await fetchProjects();
      handleCloseForm();
      setAlert({
        type: 'success',
        message: editingProject
          ? `Project "${formData.name}" updated successfully!`
          : `Project "${formData.name}" created successfully!`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Operation failed';
      setError(errorMessage);
      setAlert({ type: 'error', message: errorMessage });
    }
  };

  const handleDeleteProject = (projectId: number) => {
  const project = projects.find((p) => p.idProject === projectId);
  if (project) {
    setConfirmDeleteProject({ id: project.idProject, name: project.name });
  }
};




  const confirmDelete = async () => {
  if (!confirmDeleteProject) return;
  try {
    const headers = getAuthHeaders();
    const response = await fetch(
      `${API_BASE}/project/delete/${confirmDeleteProject.id}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    if (!response.ok) throw new Error('Failed to delete project');

    setAlert({
      type: 'success',
      message: `Project "${confirmDeleteProject.name}" deleted successfully!`,
    });
    await fetchProjects();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
    setError(errorMessage);
    setAlert({ type: 'error', message: errorMessage });
  } finally {
    setConfirmDeleteProject(null);
  }
};

  const cancelDelete = () => setConfirmDeleteProject(null);


  const handleOpenForm = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({ name: project.name, description: project.description ?? '' });
    } else {
      setEditingProject(null);
      setFormData({ name: '', description: '' });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProject(null);
    setFormData({ name: '', description: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenServerConfig = (projectId: number, projectName: string) => {
    router.push(
      `/servers?projectId=${projectId}&projectName=${encodeURIComponent(projectName)}&section=config`
    );
  };

  const handleOpenLogHistory = (projectId: number) =>
    router.push(`/projects/${projectId}/servers?section=logs`);

  const handleManageUsers = (projectId: number, projectName: string) => {
    router.push(
      `/projectManagement/users?projectId=${projectId}&projectName=${encodeURIComponent(projectName)}`
    );
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  if (error && !loading && !(error.includes('token') || error.includes('Authentication'))) {
    return <ErrorPage code={500} title="Error Loading Projects" message={error} />;
  }

  return (
    <div className="space-y-6 relative">
      {/* ✅ Alerte personnalisée */}
      {alert && (
        <div
          className={`rounded-md px-4 py-3 text-sm font-medium mb-4 ${
            alert.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          {alert.message}
        </div>
      )}

      {/* ✅ Modale de confirmation */}
      {confirmDeleteProject && (
  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg rounded-lg p-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      Confirm Deletion
    </h3>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      Are you sure you want to delete this project ?
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


      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Projects</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your development projects and server configurations
          </p>
        </div>
        {isAdmin && (
            <button
              onClick={() => handleOpenForm()}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Project</span>
            </button>
          )}
      </div>

      {showForm && (
        <ProjectForm
          formData={formData}
          editingProject={editingProject}
          onSubmit={handleSubmit}
          onInputChange={handleInputChange}
          onClose={handleCloseForm}
        />
      )}

      <ProjectTable
        projects={projects}
        loading={loading}
        onOpenServerConfig={handleOpenServerConfig}
        onOpenLogHistory={handleOpenLogHistory}
        onManageUsers={handleManageUsers}
        onEditProject={handleOpenForm}
        onDeleteProject={handleDeleteProject}
      />
    </div>
  );
};

export default ProjectList;