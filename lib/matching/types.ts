export type MatchKind = 'pair' | 'group';

export type MatchSuggestion = {
  id: string;
  runId: string;
  kind: MatchKind;
  memberIds: string[];                // for pairs: [aId,bId]
  fitIndex: number;                   // 0..100 (avg for groups)
  sectionScores?: Record<string, number>;
  reasons?: string[];                 // short, high-level "why"
  expiresAt: string;                  // ISO
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'confirmed';
  acceptedBy: string[];               // userIds who accepted
  createdAt: string;
};

export type SectionKey = 'personality' | 'schedule' | 'lifestyle' | 'social' | 'academic';

export type Student = {
  id: string;
  campusCity?: string;
  openCrossCity?: string;
  maxCommutePtBand?: number;
  answers: Record<string, any>;
  meta?: Record<string, any>;
};

export type ItemMeta = {
  id: string;
  section: string;
  weight: number;
  dealBreaker?: boolean;
};

export type Weights = {
  personality: number;
  schedule: number;
  lifestyle: number;
  social: number;
  academic: number;
};
