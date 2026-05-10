import { create } from "zustand";
import { type UseQueryResult } from "@tanstack/react-query";
import type { EnhancedPlayerRecord, MatchRecord, PlayerRecord } from "../model/Record";
import { enhanceMatches } from "../data/matches";
import { buildPlayersDb, enhancePlayers } from "../data/players";
import type { Champion } from "../model/Champion";

type SuccessAndEnhancedType = {
  isSuccess: true,
  enhanced: EnhancedData,
  res: Resources,
} | {
  isSuccess: false,
  enhanced: null,
  res: null,
};
export type CoreDataStoreParameters = {
  /** True if ANY queries are still loading. */
  isPending: boolean,
  /** True if ALL queries have completed successfully without error. */
  isSuccess: boolean,
  /** True if ANY queries are have errors AND NO queries are still loading. */
  isError: boolean,

  matchDataQuery: UseQueryResult<MatchRecord[], Error>,
  playerDataQuery: UseQueryResult<PlayerRecord[], Error>,
  championDataQuery: UseQueryResult<{ data: Record<string, Champion> }, Error>,

  /** Enhanced data. Only set if isSuccess = true. */
  enhanced: EnhancedData | null,
  /** Resources. Only set if isSuccess = true. */
  res: Resources | null,
} & SuccessAndEnhancedType;

export type CoreDataStore = CoreDataStoreParameters & {
  /** Update state.
   *
   * If processData is true
   *   - newState must not be partial
   *   - enhanced and res will be set.
   *
   * Returns: A copy of the new state
  */
  set: (newState: Partial<CoreDataStoreParameters>, processData?: boolean) => CoreDataStore,
};

export type EnhancedData = {
  matchRecords: MatchRecord[],
  playerRecords: EnhancedPlayerRecord[],
  playersDb: Record<string, EnhancedPlayerRecord>,
};

export type Resources = {
  /** List of all champions, in no particular order. */
  championData: Champion[],
  /** Keys match participant.championId.toFixed(0) */
  championsByKey: Record<string, Champion>,
  /** Champion keys, sorted by champion name */
  championKeysSortedByName: string[],

  championTagCounts: Record<string, number>,
  championTagsSorted: string[],
};

export const useCoreDataStore = create<CoreDataStore>((set, get) => ({
  isPending: true,
  isSuccess: false,
  isError: false,

  matchDataQuery: null!, // TODO: Typing for this?
  playerDataQuery: null!,
  championDataQuery: null!,

  enhanced: null,
  res: null,

  set: (newState, processData) => {
    console.log("Update useCoreData!");

    if (processData) {
      if (newState.isSuccess) {
        // TODO: Allow this to be done without having to provide the entirety of newState for enhanced to work
        if (newState.matchDataQuery == null || newState.playerDataQuery == null) {
          throw "Cannot use updateEnhanced without providing matchDataQuery and playerDataQuery in the update.";
        }

        console.log("Enhance core data!");

        const matchRecords = newState.matchDataQuery.data!;
        enhanceMatches(matchRecords);

        const playerRecords = enhancePlayers(newState.playerDataQuery.data!);
        const playersDb = buildPlayersDb(playerRecords);

        newState.enhanced = {
          matchRecords, playerRecords, playersDb,
        };

        // Additional resources
        const championData = Object.values(newState.championDataQuery!.data!.data);
        const championTagCounts: Record<string, number> = {};
        const championsByKey: Record<string, Champion> = {};

        for (const champ of championData) {
          championsByKey[champ.key] = champ;

          for (const tag of champ.tags) {
            championTagCounts[tag] = (championTagCounts[tag] ?? 0) + 1;
          }
        }

        const championKeysSortedByName = championData
          .sort((a, b) => (a.name.localeCompare(b.name)))
          .map((champ) => champ.key);

        newState.res = {
          championData, championsByKey, championKeysSortedByName,
          championTagCounts, championTagsSorted: Object.keys(championTagCounts).sort(),
        }
      } else {
        newState.enhanced = null;
        newState.res = null;
      }
    }

    set(newState);
    return get();
  },
}));

export default useCoreDataStore;
