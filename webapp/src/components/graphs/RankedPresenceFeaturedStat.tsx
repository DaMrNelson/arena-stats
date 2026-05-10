import { useContext } from "react";

import FilterResultsContext from "../../context/FilterResultsContext";
import type { RankedTier } from "../../model/Leagues";
import useCoreDataStore from "../../context/useCoreDataStore";
import FeaturedStat from "../FeaturedStat";


export const RankedPresenceFeaturedStat = ({ tiers, label, sublabel }: { tiers: RankedTier[], label: string, sublabel: string }) => {
  const matchRecords = useCoreDataStore((state) => state.enhanced?.matchRecords) ?? [];
  const playersDb = useCoreDataStore((state) => state.enhanced?.playersDb) ?? {};
  const { filterResults: { excludedParticipants } } = useContext(FilterResultsContext);

  // Gather all valid placements
  let rankSeen = 0;

  for (const matchRecord of matchRecords) {
    let seenThisMatch = false;

    for (const participant of matchRecord.body.match.info.participants) {
      if (excludedParticipants.get(participant)) {
        continue;
      }

      // Find player rank
      const player = playersDb[participant.puuid];

      if (!player) {
        console.warn(`Missing player record ${participant.puuid} for match ${matchRecord.body.match_id}`);
        continue;
      }

      const rank = player.body.currentOr2025League; // TODO: Option for current vs previous

      if (rank == null) {
        continue;
      }

      // Only include players who match our rank filter
      if (!tiers.includes(rank.tier)) {
        continue;
      }

      seenThisMatch = true;
    }

    if (seenThisMatch) {
      rankSeen++;
    }
  }

  return (
    <FeaturedStat
      val={(rankSeen / matchRecords.length).toLocaleString(undefined, { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 })}
      label={label}
      sublabel={sublabel}
    />
  )
};

export default RankedPresenceFeaturedStat;
