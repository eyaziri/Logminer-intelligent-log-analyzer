import { User } from "./User"; // à créer si nécessaire
import { Log } from "./Log";
import { ServerConfig } from "./ServerConfig"; // à créer si nécessaire
import { RawLogFile } from "./RawLogFile";

export interface Project {
  idProject: number;
  name: string;
  description?: string;
  dateOfCreation: string; // Java Date → ISO string
  users?: User[];
  logs?: Log[];
  serverConfigs?: ServerConfig[];
  rawLogFiles?: RawLogFile[];
}
