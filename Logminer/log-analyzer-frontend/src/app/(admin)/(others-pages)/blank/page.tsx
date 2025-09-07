'use client';

import React, { useState } from 'react';
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from '@/components/ui/badge/Badge';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';

interface Project {
  id: number;
  name: string;
  description: string;
  dateOfCreation: string;
  status: 'Active' | 'Inactive';
}

export default function ProjectManagement() {
  // State pour le formulaire
  const [projectForm, setProjectForm] = useState({
    id: 0,
    name: '',
    description: '',
  });
  
  // State pour afficher/masquer le formulaire
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Données de démonstration pour les projets
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: 'Project Alpha',
      description: 'Site web pour client A',
      dateOfCreation: '2023-01-15',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Project Beta',
      description: 'Application mobile',
      dateOfCreation: '2023-03-22',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Project Gamma',
      description: 'Système de gestion',
      dateOfCreation: '2023-05-10',
      status: 'Inactive'
    },
  ]);

  // Gestion des changements du formulaire
  const handleChange = (field: string, value: string) => {
    setProjectForm(prev => ({ ...prev, [field]: value }));
  };

  // Préparation de l'édition
  const handleEdit = (project: Project) => {
    setProjectForm({
      id: project.id,
      name: project.name,
      description: project.description
    });
    setIsEditing(true);
    setShowForm(true);
  };

  // Soumission du formulaire (ajout ou édition)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      // Mise à jour du projet existant
      setProjects(projects.map(project => 
        project.id === projectForm.id 
          ? { ...project, name: projectForm.name, description: projectForm.description }
          : project
      ));
    } else {
      // Création d'un nouveau projet
      const newProject: Project = {
        id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
        name: projectForm.name,
        description: projectForm.description,
        dateOfCreation: new Date().toISOString().split('T')[0],
        status: 'Active'
      };
      setProjects([...projects, newProject]);
    }
    
    // Réinitialisation du formulaire
    setProjectForm({ id: 0, name: '', description: '' });
    setIsEditing(false);
    setShowForm(false);
  };

  // Annulation de l'édition
  const handleCancel = () => {
    setProjectForm({ id: 0, name: '', description: '' });
    setIsEditing(false);
    setShowForm(false);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Project Management" />
      
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mb-6 flex justify-end">
          <Button 
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) handleCancel();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {showForm ? 'Cancel' : 'Add Project'}
          </Button>
        </div>

        {/* Formulaire d'ajout/édition */}
        {showForm && (
          <div className="mb-8 p-6 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-dark-800">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">
              {isEditing ? 'Edit Project' : 'Add New Project'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
                <Input
                  type="text"
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="dark:bg-dark-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                <Input
                  type="text"
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="dark:bg-dark-900"
                />
              </div>
              
              <div className="pt-2 flex gap-2">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  {isEditing ? 'Update Project' : 'Save Project'}
                </Button>
                {isEditing && (
                  <Button 
                    onClick={handleCancel}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Tableau des projets */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-200 dark:border-gray-700">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-start">
                    ID
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-start">
                    Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-start">
                    Description
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-start">
                    Creation Date
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-start">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-start">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="px-5 py-4 text-start dark:text-gray-300">
                      {project.id}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start font-medium dark:text-white">
                      {project.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start dark:text-gray-300">
                      {project.description}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start dark:text-gray-300">
                      {project.dateOfCreation}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <Badge
                        color={project.status === 'Active' ? 'success' : 'error'}
                      >
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex gap-4">
                        <button 
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          onClick={() => handleEdit(project)}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => setProjects(projects.filter(p => p.id !== project.id))}
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};