
import { Project } from "./Project";
import { ServerConfig } from "./ServerConfig";

export interface User {
  idUser: number;
  name: string;
  lastName: string;
  email: string;
  role: "ADMIN" | "ANALYST" | "VIEWER"; // à adapter selon ton enum Java
  projects?: Project[];
  serverConfigs?: ServerConfig[];
}
