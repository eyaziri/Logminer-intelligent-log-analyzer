import { Project } from "./Project";
import { User } from "./User";

export interface ServerConfig {
  idServerConfig: number;
  password:string;
  name: string;
  ipAddress: string;
  protocol: string;
  port: number;
  logPath: string;
  errorLogPath: string;
  logType: string;
  logFormat: string;
  fetchFrequencyMinutes: number;
  authMethod: string;
  status: string;
  logRetrievalMode: string;
  logRotationPolicy: string;
  user?: User;
  project?: Partial<Project>;
  errorThreshold?: number;         // ✅ Le seuil d'erreurs déclenchant une alerte
  alertKeywords?: string[];       // ✅ Mots-clés importants pour déclencher des alertes
}