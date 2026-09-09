export interface VendorStage {
  id: number;
  name: string;
  sortOrder: number;
  isTerminal: boolean;
}

export interface Coordinator {
  id: string;
  name: string;
}

export interface Session extends Coordinator {
  token: string;
}

export interface Vendor {
  id: string;
  name: string;
  region: string;
  stageId: number;
  stage: string;
  stageEnteredAt: string;
  notes: string | null;
  lastUpdatedByName: string | null;
  version: number;
  isTerminal: boolean;
  daysInStage: number;
  overdueDays: number;
  isStuck: boolean;
}

export interface StuckThreshold {
  thresholdDays: number;
}

export interface VendorHistory {
  id: string;
  previousStageId: number | null;
  previousStage: string | null;
  nextStageId: number;
  nextStage: string;
  changedByName: string;
  changedAt: string;
}
