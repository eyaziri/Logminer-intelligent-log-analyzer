import { Project } from "./Project";
import { ParsingResult } from "./ParsingResult";
import { Recommendation } from "./Recommendation";
import { RawLogFile } from "./RawLogFile";

export interface Log {
  idLog: number;
  project?: Project;
  timestamp: string; // LocalDateTime est mappé en string ISO (ex: "2025-07-07T21:35:00")
  level: string;
  source: string;
  message: string;
  analysisStatus: string;
  parsingResult?: ParsingResult;
  recommendations?: Recommendation[];
  rawLogFile?: RawLogFile;
}
