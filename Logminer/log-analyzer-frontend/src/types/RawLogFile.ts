import { Project } from "./Project";
import { Log } from "./Log";

export interface RawLogFile {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadTime: string; // Instant → string (ISO)
  status: string;
  data?: Uint8Array; // byte[] → Uint8Array
  project?: Project;
  logs?: Log[];
}
