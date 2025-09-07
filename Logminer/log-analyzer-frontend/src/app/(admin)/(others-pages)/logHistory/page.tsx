'use client';

import React from 'react';
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { FiSearch, FiFilter } from "react-icons/fi";

export default function LogHistory() {
  // Données d'exemple pour les logs
  const logData = [
    {
      id: 1,
      timestamp: "2023-10-15 08:30:45",
      user: "admin@example.com",
      action: "Connexion",
      status: "Succès",
      ipAddress: "192.168.1.1"
    },
    {
      id: 2,
      timestamp: "2023-10-15 09:15:22",
      user: "user@example.com",
      action: "Modification profil",
      status: "Succès",
      ipAddress: "192.168.1.2"
    },
    {
      id: 3,
      timestamp: "2023-10-15 10:05:33",
      user: "guest@example.com",
      action: "Tentative connexion",
      status: "Échec",
      ipAddress: "192.168.1.3"
    },
    {
      id: 4,
      timestamp: "2023-10-15 11:20:18",
      user: "admin@example.com",
      action: "Suppression utilisateur",
      status: "Succès",
      ipAddress: "192.168.1.1"
    },
    {
      id: 5,
      timestamp: "2023-10-15 14:45:07",
      user: "user@example.com",
      action: "Changement mot de passe",
      status: "Succès",
      ipAddress: "192.168.1.2"
    }
  ];

  return (
    <div>
      <PageBreadcrumb 
        items={[
          { title: "Home", path: "/" },
          { title: "Système", path: "/system" },
          { title: "Historique", path: "/system/logs" },
        ]} 
        pageTitle="Journal d'activité" 
      />
      
      <div className="space-y-6">
        <ComponentCard
          title="Filtres de recherche"
          action={
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm transition">
                <FiFilter /> Filtrer
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                Exporter
              </button>
            </div>
          }
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans les logs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select className="border border-gray-300 rounded-lg px-4 py-2">
              <option value="">Tous les statuts</option>
              <option value="success">Succès</option>
              <option value="failed">Échec</option>
            </select>
            
            <select className="border border-gray-300 rounded-lg px-4 py-2">
              <option value="">Toutes les actions</option>
              <option value="login">Connexion</option>
              <option value="profile">Modification profil</option>
              <option value="password">Changement mot de passe</option>
            </select>
          </div>

          {/* Tableau des logs */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="max-w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date/Heure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adresse IP
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logData.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.timestamp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {log.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.status === "Succès" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Affichage de <span className="font-medium">1</span> à <span className="font-medium">5</span> sur <span className="font-medium">25</span> entrées
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50">
                Précédent
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                2
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                Suivant
              </button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}