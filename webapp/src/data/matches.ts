import type { MatchRecord } from "../model/Record";

export const ARENA_GAME_MODE = "CHERRY";
export const RUN_START = 1770000000000;
export const RUN_END = Infinity;

export function filterMatchesBasicLegacy(matches: MatchRecord[], requiredUsernames?: string[]): MatchRecord[] {
  return matches.filter((matchRecord) => {
    const info = matchRecord.body.match.info;
    const requiredUsernameParts = requiredUsernames?.map((username) => username.split("#", 2));

    // Arena game-mode filter
    if (info.gameMode !== ARENA_GAME_MODE) {
      return false;
    }

    // Match time filter
    if (info.gameCreation < RUN_START || info.gameCreation > RUN_END) { // TODO: Customizable?
      return false;
    }

    // Ensure our target player was present
    if (requiredUsernameParts && requiredUsernameParts.length) {
      let participantsFound = 0;

      for (const participant of info.participants) {
        for (const [gameName, tagLine] of requiredUsernameParts) {
          if (participant.riotIdGameName === gameName && participant.riotIdTagline === tagLine) {
            participantsFound += 1;
            break;
          }
        }
      }

      if (participantsFound !== requiredUsernameParts.length) {
        return false;
      }
    }

    // Remove bugged match reports
    for (const participant of info.participants) {
      if (participant.placement === 0) {
        console.warn(`Match ${matchRecord.body.match_id} skipped due to invalid placement value (assumed bugged match)`);
        return false;
      }
    }

    // Passed all filters!
    return true;
  });
}

/** In-place */
export function enhanceMatches(matches: MatchRecord[]) {
  // Sort matches, earliest to latest
  matches.sort((a, b) => a.body.match.info.gameCreation - b.body.match.info.gameCreation)
}