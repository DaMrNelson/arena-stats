import stats from "stats-lite";
import _ from "lodash";

import { type CoreDataStoreParameters } from "../context/useCoreDataStore";
import { type FilterResults } from "../context/FilterResultsContext";
import { type FilterStoreParameters } from "../context/useFilterStore";
import type { EnhancedPlayerRecord, MatchRecord } from "../model/Record";
import type { Champion } from "../model/Champion";

/** Both author */
export const AUTHOR_DUO_NAMES_LOWER = [
  "3 Golden Teemos#NA1",
  "Glass Of Milm#69420",
].map((name) => name.toLowerCase());
/** Author who owns all characters (useful for bravery stats) */
export const AUTHOR_OWNS_ALL_CHAMPS_NAME_LOWER = "3 Golden Teemos#NA1".toLowerCase();

export const applyAllFilters = (filters: FilterStoreParameters, coreData: CoreDataStoreParameters): FilterResults => {
  const filterResults: FilterResults = { // New objects will result in remounts (desired)
    excludedParticipants: new Map(),

    braveryParticipants: new Map(),
    crowdFavParticipants: new Map(),
    statRunParticipants: new Map(),
  };

  if (!coreData.isSuccess) { // TODO: refresh useFilteredDataStore on coreData.isSuccess change!
    console.warn("Skipping filter update as core data is not ready yet");
    return filterResults;
  }

  let enhancedData = coreData.enhanced;
  const res = coreData.res;

  for (const matchRecord of enhancedData!.matchRecords) {
    applyRankFilters(filters, matchRecord, enhancedData.playersDb, filterResults);
    applyTimelineFilters(filters, matchRecord, filterResults);
    applyAuthorFilters(filters, matchRecord, filterResults);
    applyChampionFilters(filters, matchRecord, res.championsByKey, filterResults);
  }

  return filterResults;
};

export const applyRankFilters = (filters: FilterStoreParameters, matchRecord: MatchRecord, playersDb: Record<string, EnhancedPlayerRecord>, filterResults: FilterResults) => {
  if (filters.ranking == "off") {
    return;
  }

  // Get ranks of all players in the match
  const matchRanks: number[] = [];
  const matchInfo = matchRecord.body.match.info;

  for (const participant of matchInfo.participants) {
    const player = playersDb[participant.puuid];

    if (player == null) {
      console.warn(`Missing player in DB: ${participant.riotIdGameName}#${participant.riotIdTagline}`);
      continue;
    }

    const leagueNum = player.body.currentOr2025LeagueNum; // TODO: Allow user to choose between current+last or just current

    if (leagueNum != null) {
      matchRanks.push(leagueNum);
    }
  }

  // If empty, skip this match entirely
  if (!matchRanks.length) {
    matchInfo.participants = [];
  // If data is present, only remove all participants who don't fit within our filters
  } else {
    const rankMin = stats.percentile(matchRanks, Math.min(...filters.rankPctFilter) / 100);
    const rankMax = stats.percentile(matchRanks, Math.max(...filters.rankPctFilter) / 100);

    matchInfo.participants.forEach((participant) => {
      const player: EnhancedPlayerRecord | undefined = playersDb[participant.puuid];

      const leagueNum = player?.body.currentOr2025LeagueNum;

      if (filters.ranking === "exclude") {
        if (leagueNum != null) {
          filterResults.excludedParticipants.set(participant, true);
        }
        return;
      } else { // "include"
        if (leagueNum == null) {
          filterResults.excludedParticipants.set(participant, true);
          return;
        }

        if (leagueNum < rankMin || leagueNum > rankMax) {
          filterResults.excludedParticipants.set(participant, true);
          return;
        }

        return;
      }
    })
  }
};

export const applyTimelineFilters = (filters: FilterStoreParameters, matchRecord: MatchRecord, filterResults: FilterResults) => {
  // Always execute for the sake of the bravery chart!
  //
  //if (filters.statRuns === "off" && filters.bravery === "off") {
  //  return;
  //}

  const matchInfo = matchRecord.body.match.info;
  const timelineInfo = matchRecord.body.timeline.info; // TODO: Timeline type

  // Find who purchases an item before reaching the level threshold
  const LEVEL_THRESHOLD = 7; // If you reach level 7 before purchasing an item, you are considered an anvil runner
                             // Note: This value must be >= 4 as the first 3 levels don't actually track participant IDs but can be assumed for every player.
  const BRAVERY_ITEM_ID = 220011; // I've confirmed this isn't received by Xin or shop (at least recently)
  const CROWD_FAV_ITEM_ID = 220008; // I've confirmed this isn't received by Xin or shop (at least recently)
  const ALLOWED_STAT_RUN_ITEM_IDS = [
    220000,
    222141, // Cappa Juice
    2142, // Juice of Power
    2143, // Juice of Vitality
    2144, // Juice of Haste
    220008, // TODO: Are these extra ones needed?
    220009,
    220010,
    220011,
  ];

  const overLevelParticipants: Record<string, true> = {};
  const purchasedBeforeLevel7Participants: Record<string, true> = {};
  const braveryParticipants: Record<string, true> = {};
  const crowdFavParticipants: Record<string, true> = {};

  for (const frame of timelineInfo.frames) {
    for (const event of frame.events) {
      // Stat runs
      if (event.type === "LEVEL_UP") {
        if (event.level >= LEVEL_THRESHOLD) {
          overLevelParticipants[event.participantId.toFixed(0)] = true;
        }
        continue;
      } else if (event.type === "ITEM_PURCHASED") {
        // Only disqualify if they haven't already reached level 7 (enough time to buy a real item)
        if (!ALLOWED_STAT_RUN_ITEM_IDS.includes(event.itemId) && !overLevelParticipants[event.participantId.toFixed(0)]) {
          // Mark this participant as having bought an item before reaching the requisite level
          purchasedBeforeLevel7Participants[event.participantId.toFixed(0)] = true;
        }

        continue;

      // Bravery and crowd favorites
      } else if (event.type === "ITEM_DESTROYED") {
        if (event.itemId === BRAVERY_ITEM_ID) {
          braveryParticipants[event.participantId.toFixed(0)] = true;
          continue;
        } else if (event.itemId == CROWD_FAV_ITEM_ID) {
          crowdFavParticipants[event.participantId.toFixed(0)] = true;
          continue;
        }
      }
    }
  }

  // Apply bravery and stat run filters
  // Since the team metadata is wrong in this gamemode, teams are determined by selecting all players with the exact same placement
  // TODO: DRY
  const braveryPlacements: Record<string, number> = {};
  const statPlacements: Record<string, number> = {};
  const crowdFavPlacements: Record<string, number> = {};

  for (const participant of matchInfo.participants) {
    const participantIdStr = participant.participantId.toFixed(0);
    const isStatRun = !purchasedBeforeLevel7Participants[participantIdStr];
    const isBravery = braveryParticipants[participantIdStr];
    const isCrowdFav = crowdFavParticipants[participantIdStr];

    if (isStatRun)
      filterResults.statRunParticipants.set(participant, true);
    if (isBravery)
      filterResults.braveryParticipants.set(participant, true);
    if (isCrowdFav)
      filterResults.crowdFavParticipants.set(participant, true);

    if (isStatRun) {
      statPlacements[participant.placement.toFixed(0)] = (statPlacements[participant.placement.toFixed(0)] ?? 0) + 1;

      if (filters.statRuns === "exclude") {
        filterResults.excludedParticipants.set(participant, true);
      }
    } else { // !isStatRun
      if (filters.statRuns === "include") {
        filterResults.excludedParticipants.set(participant, true);
      }
    }

    if (isBravery) {
      braveryPlacements[participant.placement.toFixed(0)] = (braveryPlacements[participant.placement.toFixed(0)] ?? 0) + 1;

      if (filters.bravery === "exclude") {
        filterResults.excludedParticipants.set(participant, true);
      }
    } else { // !isBravery
      if (filters.bravery === "include") {
        filterResults.excludedParticipants.set(participant, true);
      }
    }

    if (isCrowdFav) {
      crowdFavPlacements[participant.placement.toFixed(0)] = (crowdFavPlacements[participant.placement.toFixed(0)] ?? 0) + 1;

      if (filters.crowdFav === "exclude") {
        filterResults.excludedParticipants.set(participant, true);
      }
    } else { // !isCrowdFav
      if (filters.crowdFav === "include") {
        filterResults.excludedParticipants.set(participant, true);
      }
    }
  }

  for (const participant of matchInfo.participants) {
    const placementStr = participant.placement.toFixed(0);
    const statTeamCount = statPlacements[placementStr] ?? 0;
    const braveryTeamCount = braveryPlacements[placementStr] ?? 0;
    const crowdFavTeamCount = crowdFavPlacements[placementStr] ?? 0;

    switch (filters.statRuns) {
      case "include-1+":
        if (statTeamCount < 1)
          filterResults.excludedParticipants.set(participant, true);
        break;

      case "include-2":
        if (statTeamCount < 2)
          filterResults.excludedParticipants.set(participant, true);
        break;

      case "exclude-1+":
        if (statTeamCount >= 1)
          filterResults.excludedParticipants.set(participant, true);
        break;

      case "exclude-2":
        if (statTeamCount >= 2)
          filterResults.excludedParticipants.set(participant, true);
        break;
    }

    switch (filters.bravery) {
      case "include-1+":
        if (braveryTeamCount < 1)
          filterResults.excludedParticipants.set(participant, true);
        break;

      case "include-2":
        if (braveryTeamCount < 2)
          filterResults.excludedParticipants.set(participant, true);
        break;

      case "exclude-1+":
        if (braveryTeamCount >= 1)
          filterResults.excludedParticipants.set(participant, true);
        break;

      case "exclude-2":
        if (braveryTeamCount >= 2)
          filterResults.excludedParticipants.set(participant, true);
        break;
    }

    switch (filters.crowdFav) {
      case "include-1+":
        if (crowdFavTeamCount < 1)
          filterResults.excludedParticipants.set(participant, true);
        break;

      case "include-2":
        if (crowdFavTeamCount < 2)
          filterResults.excludedParticipants.set(participant, true);
        break;

      case "exclude-1+":
        if (crowdFavTeamCount >= 1)
          filterResults.excludedParticipants.set(participant, true);
        break;

      case "exclude-2":
        if (crowdFavTeamCount >= 2)
          filterResults.excludedParticipants.set(participant, true);
        break;
    }
  }
};

export const applyAuthorFilters = (filters: FilterStoreParameters, matchRecord: MatchRecord, filterResults: FilterResults) => {
  if (filters.authorDuo == "off") {
    return;
  }

  for (const participant of matchRecord.body.match.info.participants) {
    if (AUTHOR_DUO_NAMES_LOWER.includes(`${participant.riotIdGameName}#${participant.riotIdTagline}`.toLowerCase())) {
      if (filters.authorDuo === "exclude") {
        filterResults.excludedParticipants.set(participant, true);
      }
    } else if (filters.authorDuo === "include") {
      filterResults.excludedParticipants.set(participant, true);
    }
  }
};

export const applyChampionFilters = (filters: FilterStoreParameters, matchRecord: MatchRecord, championsByKey: Record<string, Champion>, filterResults: FilterResults) => {
  if (filters.championKey == null && filters.championRole == null) {
    return;
  }

  for (const participant of matchRecord.body.match.info.participants) {
    if (filters.championKey != null) {
      if (participant.championId.toFixed(0) !== filters.championKey) {
        filterResults.excludedParticipants.set(participant, true);
        continue;
      }
    }

    if (filters.championRole != null) {
      const champ = championsByKey[participant.championId.toFixed()];

      if (filters.championRoleMode === "primary") {
        if (champ?.tags[0] !== filters.championRole) {
          filterResults.excludedParticipants.set(participant, true);
          continue;
        }
      } else { // championRoleMode === "any"
        if (!(champ?.tags ?? []).includes(filters.championRole)) {
          filterResults.excludedParticipants.set(participant, true);
          continue;
        }
      }
    }
  }
};
