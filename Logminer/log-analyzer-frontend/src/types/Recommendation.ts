import { Log } from "./Log";

export interface Recommendation {
  id: number;
  log?: Log;
  content: string;
  relevanceScore: number;
  generatedBy: string;
  creationDate: string; // LocalDateTime → ISO string
}
