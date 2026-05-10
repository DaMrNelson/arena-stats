import type { EnhancedPlayerRecordBody, PlayerRecordBody } from "./Player"
import type { MatchRecordBody } from "./Match"

export type Record = {
  mt: {
    recorded_at: number,
  },
  body: PlayerRecordBody | MatchRecordBody,
};

export type PlayerRecord = Record & {
  body: PlayerRecordBody,
};
export type EnhancedPlayerRecord = Record & {
  body: EnhancedPlayerRecordBody,
};

export type MatchRecord = Record & {
  body: MatchRecordBody,
};
