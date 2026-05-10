import type { RankedDivision, RankedTier } from "./Leagues";

export type PlayerRecordBody = {
  account: Account,
  leagues: FullLeague[],
  previous_leagues?: Record<
    "Season 2025" | string, // TODO: Full typescript
    Record<
      "Ranked Solo/Duo" | string, // TODO: Full typescript
      PreviousLeague
    >
  >,
};

export type EnhancedPlayerRecordBody = PlayerRecordBody & {
  currentSeasonLeague?: League,
  currentSeasonLeagueNum?: number,
  currentOr2025League?: League,
  currentOr2025LeagueNum?: number,
};

export type Account = {
  puuid: string,
  gameName: string,
  tagLine: string,
};

export type League = {
  tier: RankedTier,
  rank: RankedDivision,
  isFallback?: true,
}
export type FullLeague = League & {
  leagueId: string,
  queueType: "RANKED_SOLO_5x5" | string, // TODO: Full typescript
  puuid: string,
  leaguePoints: number,
  wins: number,
  losses: number,
  veteran: boolean,
  inactive: boolean,
  freshBlood: boolean,
  hotStreak: boolean,
};

export type PreviousLeague = {
  peak: string,
  final: string,
};
