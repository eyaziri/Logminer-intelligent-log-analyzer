'use client';

import React, { useState } from 'react';
import ComponentCard from '../../common/ComponentCard';
import Label from '../Label';
import Input from '../input/InputField';
import Select from '../Select';
import { ChevronDownIcon } from '../../../icons';

interface FormData {
  name: string;
  ipAddress: string;
  protocol: string;
  port: string;
  logPath: string;
  errorLogPath: string;
  logType: string;
  logFormat: string;
  fetchFrequencyMinutes: string;
  projectId: string;
  authMethod: string;
  status: string;
  tags: string;
  logRetrievalMode: string;
  logRotationPolicy: string;
}

export default function ServerConfigForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    ipAddress: '',
    protocol: '',
    port: '',
    logPath: '',
    errorLogPath: '',
    logType: '',
    logFormat: '',
    fetchFrequencyMinutes: '',
    projectId: '',
    authMethod: '',
    status: '',
    tags: '',
    logRetrievalMode: '',
    logRotationPolicy: '',
  });

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const protocolOptions = [
    { value: '', label: 'Select protocol' },
    { value: 'HTTP', label: 'HTTP' },
    { value: 'HTTPS', label: 'HTTPS' },
    { value: 'FTP', label: 'FTP' },
  ];

  const authMethodOptions = [
    { value: '', label: 'Select auth method' },
    { value: 'None', label: 'None' },
    { value: 'Basic', label: 'Basic' },
    { value: 'OAuth', label: 'OAuth' },
  ];

  const statusOptions = [
    { value: '', label: 'Select status' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  const logRetrievalModeOptions = [
    { value: '', label: 'Select retrieval mode' },
    { value: 'Pull', label: 'Pull' },
    { value: 'Push', label: 'Push' },
  ];

  const projectOptions = [
    { value: '', label: 'Select project' },
    { value: '1', label: 'Project Alpha' },
    { value: '2', label: 'Project Beta' },
    { value: '3', label: 'Project Gamma' },
  ];

  return (
    <ComponentCard title="Server Configuration Form">
      <form
        className="space-y-6 max-w-lg mx-auto"
        onSubmit={(e) => {
          e.preventDefault();
          console.log('Form submitted:', formData);
          // Ajoutez ici votre logique pour envoyer les données
        }}
      >
        <div>
          <Label>Name</Label>
          <Input
            type="text"
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        <div>
          <Label>IP Address</Label>
          <Input
            type="text"
            onChange={(e) => handleChange('ipAddress', e.target.value)}
          />
        </div>

        <div>
          <Label>Protocol</Label>
          <div className="relative">
            <Select
              options={protocolOptions}
              onChange={(val) => handleChange('protocol', val)}
              className="dark:bg-dark-900"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
        </div>

        <div>
          <Label>Port</Label>
          <Input
            type="number"
            onChange={(e) => handleChange('port', e.target.value)}
          />
        </div>

        <div>
          <Label>Log Path</Label>
          <Input
            type="text"
            onChange={(e) => handleChange('logPath', e.target.value)}
          />
        </div>

        <div>
          <Label>Error Log Path</Label>
          <Input
            type="text"
            onChange={(e) => handleChange('errorLogPath', e.target.value)}
          />
        </div>

        <div>
          <Label>Log Type</Label>
          <Input
            type="text"
            onChange={(e) => handleChange('logType', e.target.value)}
          />
        </div>

        <div>
          <Label>Log Format</Label>
          <Input
            type="text"
            onChange={(e) => handleChange('logFormat', e.target.value)}
          />
        </div>

        <div>
          <Label>Fetch Frequency (minutes)</Label>
          <Input
            type="number"
            onChange={(e) => handleChange('fetchFrequencyMinutes', e.target.value)}
          />
        </div>

        <div>
          <Label>Project</Label>
          <div className="relative">
            <Select
              options={projectOptions}
              onChange={(val) => handleChange('projectId', val)}
              className="dark:bg-dark-900"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
        </div>

        <div>
          <Label>Auth Method</Label>
          <div className="relative">
            <Select
              options={authMethodOptions}
              onChange={(val) => handleChange('authMethod', val)}
              className="dark:bg-dark-900"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
        </div>

        <div>
          <Label>Status</Label>
          <div className="relative">
            <Select
              options={statusOptions}
              onChange={(val) => handleChange('status', val)}
              className="dark:bg-dark-900"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
        </div>

        <div>
          <Label>Tags</Label>
          <Input
            type="text"
            onChange={(e) => handleChange('tags', e.target.value)}
            placeholder="Comma separated tags"
          />
        </div>

        <div>
          <Label>Log Retrieval Mode</Label>
          <div className="relative">
            <Select
              options={logRetrievalModeOptions}
              onChange={(val) => handleChange('logRetrievalMode', val)}
              className="dark:bg-dark-900"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
        </div>

        <div>
          <Label>Log Rotation Policy</Label>
          <Input
            type="text"
            onChange={(e) => handleChange('logRotationPolicy', e.target.value)}
            placeholder="Rotation policy description"
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
        >
          Save Configuration
        </button>
      </form>
    </ComponentCard>
  );
}