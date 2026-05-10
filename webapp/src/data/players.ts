import { SORTED_DIVISIONS, SORTED_HUMAN_TIERS, SORTED_TIERS, type RankedDivision, type RankedTier } from "../model/Leagues";
import type { League } from "../model/Player";
import type { EnhancedPlayerRecord, MatchRecord, PlayerRecord } from "../model/Record";

export function filterPlayersBasicLegacy<T extends PlayerRecord>(players: T[], matches: MatchRecord[]): [T[], Record<string, T>] {
  const playerMap = Object.fromEntries(players.map((player) => [player.body.account.puuid, player]));
  const foundPlayers: Record<string, T> = {};

  // TODO: Rethink this function. Its bleh.

  for (const matchRecord of matches) {
    for (const participant of matchRecord.body.match.info.participants) {
      const puuid = participant.puuid;

      if (foundPlayers[puuid] === undefined) {
        const playerRecord = playerMap[puuid];

        if (playerRecord !== undefined) {
          foundPlayers[puuid] = playerMap[puuid];
        }
      }
    }
  }

  return [Object.values(foundPlayers), foundPlayers];
}

export function buildPlayersDb<T extends PlayerRecord>(players: T[]): Record<string, T> {
  return Object.fromEntries(
    players.map((player) => [
      player.body.account.puuid,
      player
    ])
  );
}

export function enhancePlayers(playerRecords: PlayerRecord[]): EnhancedPlayerRecord[] {
  return playerRecords.map((playerRecord) => {
    // Pre-calculate relevant rank data
    let currentSeasonLeague: League | undefined;
    const currentQueueName = "RANKED_SOLO_5x5";

    let currentOr2025League: League | undefined; // TODO: Dynamic! Not hardcoded to 2025
    const fallback2025SeasonName = "Season 2025";
    const fallback2025QueueName = "Ranked Solo/Duo";

    for (const league of playerRecord.body.leagues) {
      if (league.queueType === currentQueueName) {
        currentSeasonLeague = league;
        currentOr2025League = league;
        break;
      }
    }

    if (!currentOr2025League) {
      const final = playerRecord.body.previous_leagues?.[fallback2025SeasonName]?.[fallback2025QueueName]?.final;

      if (final) {
        const fallbackParts = final.toUpperCase().split(" ", 2);

        if (fallbackParts.length === 1) { // Master, Grandmaster, and Challenger
          // Ranked API treats as I
          currentOr2025League = {
            tier: fallbackParts[0] as RankedTier,
            rank: SORTED_DIVISIONS[0],
            isFallback: true,
          }
        } else {
          currentOr2025League = {
            tier: fallbackParts[0] as RankedTier,
            rank: fallbackParts[1] as RankedDivision,
            isFallback: true,
          }
        }
      }
    }

    return {
      ...playerRecord,
      body: {
        ...playerRecord.body,

        currentSeasonLeague,
        currentSeasonLeagueNum: currentSeasonLeague ? rankToNum(currentSeasonLeague) : undefined,

        currentOr2025League,
        currentOr2025LeagueNum: currentOr2025League ? rankToNum(currentOr2025League) : undefined,
      },
    } as EnhancedPlayerRecord;
  });
}

export function rankToNum(rank: League): number {
  const tierNum = SORTED_TIERS.indexOf(rank.tier)
  const levelNum = SORTED_DIVISIONS.indexOf(rank.rank);

  return tierNum + levelNum / SORTED_DIVISIONS.length;
}

export function rankNumToStr(rankNum: number, human?: boolean): string {
  const tier = (human ? SORTED_HUMAN_TIERS : SORTED_TIERS)[Math.floor(rankNum)];
  const level = SORTED_DIVISIONS[Math.floor((rankNum - Math.floor(rankNum)) * SORTED_DIVISIONS.length)]

  return `${tier} ${level}`;
}
