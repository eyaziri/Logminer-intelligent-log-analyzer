"use client";

import React, { useEffect, useState, useCallback } from "react";
import LogsLineChart from "@/components/logs/LogsLineChart";
import LogsHeatmap from "@/components/logs/LogsHeatmap";
import LogsTimeline from "@/components/logs/LogsTimeline";
import { Log } from "@/types/Log";
import { Project } from "@/types/Project";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function LogsDashboardClient() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Récupérer token côté client
  useEffect(() => {
    setToken(localStorage.getItem("access_token"));
  }, []);

  // Charger les projets quand token est prêt
  useEffect(() => {
    if (!token) return;

    const fetchProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/project/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          if (res.status === 401) {
            setError("Authentication failed. Redirecting to login...");
            setTimeout(() => router.push("/login"), 2000);
            return;
          }
          throw new Error(`Failed to fetch projects: ${res.statusText}`);
        }
        const data: Project[] = await res.json();
        setProjects(data);

        // Par défaut, sélectionner le 1er projet si aucun sélectionné
        if (data.length > 0 && selectedProjectId === null) {
          setSelectedProjectId(data[0].idProject);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token, router, selectedProjectId]);

  // Fonction fetchLogsForProject qui retourne Promise<Log[]>
  const fetchLogsForProject = useCallback(
    async (projectId: number): Promise<Log[]> => {
      if (!token) return [];
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/project/logs/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch logs: ${res.statusText}`);
        }
        const data: Log[] = await res.json();
        setLogs(data);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (selectedProjectId !== null) {
      fetchLogsForProject(selectedProjectId);
    }
  }, [selectedProjectId, fetchLogsForProject]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <label htmlFor="projectSelect" className="mr-2 font-semibold">
          Select Project:
        </label>
        <select
          id="projectSelect"
          className="border border-gray-300 rounded px-2 py-1"
          value={selectedProjectId ?? ""}
          onChange={(e) => setSelectedProjectId(Number(e.target.value))}
        >
          {projects.map((project) => (
            <option key={project.idProject} value={project.idProject}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-8 space-y-6">
                   <LogsLineChart logs={logs} loadingLogs={loading} />


          <LogsHeatmap logs={logs} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <LogsTimeline logs={logs} />
        </div>
      </div>
    </div>
  );
}
