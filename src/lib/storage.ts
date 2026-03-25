import { EncounterLog } from "@/types/consult";

// In-memory storage for PoC (Phase 4 で永続化)
const encounterLogs: EncounterLog[] = [];

export function saveEncounterLog(log: EncounterLog): void {
  const existing = encounterLogs.findIndex((l) => l.id === log.id);
  if (existing >= 0) {
    encounterLogs[existing] = log;
  } else {
    encounterLogs.push(log);
  }
}

export function getEncounterLogs(): EncounterLog[] {
  return [...encounterLogs].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );
}

export function getEncounterLogById(id: string): EncounterLog | undefined {
  return encounterLogs.find((l) => l.id === id);
}
