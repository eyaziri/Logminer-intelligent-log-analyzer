import { Log } from "./Log";

export interface ParsingResult {
  id: number;
  log?: Log;
  extractedStructure: string;
  tokens: string[];
  vectorEmbeddings: number[]; // List<Float> → number[]
  anomalyDetected: boolean;
}
