'use client';

import React, { useState } from 'react';
import { ServerConfig } from '@/types/ServerConfig';
import { X } from 'lucide-react';

interface ServerFormProps {
  formData: Partial<ServerConfig>;
  editingServer: ServerConfig | null;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onClose: () => void;
}

const ServerForm: React.FC<ServerFormProps> = ({
  formData,
  editingServer,
  onSubmit,
  onInputChange,
  onClose,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    const requiredFieldsFilled =
      formData.name?.trim() &&
      (editingServer ? true : formData.password?.trim()) &&
      formData.ipAddress?.trim() &&
      formData.logPath?.trim();

    if (!requiredFieldsFilled) {
      e.preventDefault();
      setError('Please fill in all required fields marked with * before submitting.');
      return;
    }

    // Validation du seuil (errorThreshold) s'il est renseigné
    if (
      formData.errorThreshold !== undefined &&
      formData.errorThreshold !== 0 &&
      (isNaN(Number(formData.errorThreshold)) || Number(formData.errorThreshold) < 0)
    ) {
      e.preventDefault();
      setError('Error Threshold must be a positive number or empty.');
      return;
    }

    setError('');
    onSubmit(e);
  };

  const RequiredAsterisk = () => (
    <span className="text-red-600 ml-1 font-bold">*</span>
  );

  return (
    <div className="w-full h-full min-h-screen bg-white dark:bg-gray-900 overflow-y-auto scroll-smooth p-8">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {editingServer ? 'Edit Server' : 'Create New Server'}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Required fields note */}
      <div className="p-6 text-sm text-gray-700 dark:text-gray-300 italic">
        Fields marked with
        <span className="text-red-600 font-bold mx-1">*</span>
        are required.
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name<RequiredAsterisk />
          </label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={onInputChange}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Password */}
        {editingServer ? (
          !editPassword ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <button
                type="button"
                onClick={() => setEditPassword(true)}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Change password
              </button>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password || ''}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>
          )
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password<RequiredAsterisk />
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password || ''}
                onChange={onInputChange}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>
        )}

        {/* IP Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            IP Address<RequiredAsterisk />
          </label>
          <input
            type="text"
            name="ipAddress"
            value={formData.ipAddress || ''}
            onChange={onInputChange}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Log Path */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Log Path<RequiredAsterisk />
          </label>
          <input
            type="text"
            name="logPath"
            value={formData.logPath || ''}
            onChange={onInputChange}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Error Log Path */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Error Log Path </label>
          <input
            type="text"
            name="errorLogPath"
            value={formData.errorLogPath || ''}
            onChange={onInputChange}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Protocol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Protocol </label>
          <select
            name="protocol"
            value={formData.protocol || 'http'}
            onChange={onInputChange}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="http">HTTP</option>
            <option value="https">HTTPS</option>
            <option value="ssh">SSH</option>
          </select>
        </div>

        {/* Port */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Port </label>
          <input
            type="number"
            name="port"
            value={formData.port ?? ''}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Log Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Log Type</label>
          <input
            type="text"
            name="logType"
            value={formData.logType || ''}
            onChange={onInputChange}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Log Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Log Format</label>
          <input
            type="text"
            name="logFormat"
            value={formData.logFormat || ''}
            onChange={onInputChange}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Fetch Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fetch Frequency (mins)</label>
          <input
            type="number"
            name="fetchFrequencyMinutes"
            value={formData.fetchFrequencyMinutes ?? ''}
            onChange={onInputChange}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Auth Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Auth Method</label>
          <input
            type="text"
            name="authMethod"
            value={formData.authMethod || ''}
            onChange={onInputChange}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select
            name="status"
            value={formData.status || 'active'}
            onChange={onInputChange}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {/* Log Retrieval Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Log Retrieval Mode</label>
          <input
            type="text"
            name="logRetrievalMode"
            value={formData.logRetrievalMode || ''}
            onChange={onInputChange}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Log Rotation Policy */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Log Rotation Policy</label>
          <input
            type="text"
            name="logRotationPolicy"
            value={formData.logRotationPolicy || ''}
            onChange={onInputChange}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* --- Nouveaux champs ajoutés --- */}

        {/* Error Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Error Threshold (number of similar errors before triggering an alert)
          </label>
          <input
            type="number"
            min={0}
            name="errorThreshold"
            value={formData.errorThreshold ?? ''}
            onChange={onInputChange}
            placeholder="Ex: 10"
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Alert Keywords */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
           Alert Keywords (separated by commas)
          </label>
          <input
            type="text"
            name="alertKeywords"
            value={formData.alertKeywords || ''}
            onChange={onInputChange}
            placeholder="erreur,fail,critical"
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <p className="text-xs italic text-gray-500 dark:text-gray-400 mt-1">
            Keywords related to important logs to trigger an email alert..
          </p>
        </div>

        {/* Affichage de l'erreur (si besoin) au-dessus des boutons */}
        {error && (
          <div className="col-span-2 mb-2 text-red-600 font-medium text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex space-x-3 pt-4 col-span-2">
          <button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
          >
            {editingServer ? 'Update Server' : 'Create Server'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServerForm;
