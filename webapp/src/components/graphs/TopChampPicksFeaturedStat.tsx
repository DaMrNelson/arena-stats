import { useContext } from "react";
import stats from "stats-lite";

import FilterResultsContext from "../../context/FilterResultsContext";
import useCoreDataStore from "../../context/useCoreDataStore";
import FeaturedStat from "../FeaturedStat";


export const TopChampPicksFeaturedStat = ({ top, alwaysExcludeBravery, alwaysExcludeCrowdFav }: { top?: number, alwaysExcludeBravery?: boolean, alwaysExcludeCrowdFav?: boolean }) => {
  const matchRecords = useCoreDataStore((state) => state.enhanced?.matchRecords) ?? [];
  const championsByKey = useCoreDataStore((state) => state.res?.championsByKey) ?? {};
  const { filterResults } = useContext(FilterResultsContext);

  top = top ?? 10;

  // First, count the pick rate by champion
  const champCounts: Record<string, number> = {};

  for (const matchRecord of matchRecords) {
    for (const participant of matchRecord.body.match.info.participants) {
      if (filterResults.excludedParticipants.get(participant)) {
        continue;
      }

      if (
        (alwaysExcludeBravery && filterResults.braveryParticipants.get(participant)) ||
        (alwaysExcludeCrowdFav && filterResults.crowdFavParticipants.get(participant))
      ) {
        continue;
      }

      const champ = championsByKey[participant.championId];

      if (!champ) {
        continue;
      }

      champCounts[champ.id] = (champCounts[champ.id] ?? 0) + 1;
    }
  }

  // Second, sort champs by pick rate
  const champIds = Object.keys(champCounts);
  champIds.sort((a, b) => champCounts[b] - champCounts[a]);
  const allCounts = champIds.map((champId) => champCounts[champId]);
  const allCount = stats.sum(allCounts);

  const topIds = champIds.slice(0, top);
  const topCounts = topIds.map((champId) => champCounts[champId]);
  const topCount = stats.sum(topCounts);

  return (
    <FeaturedStat
      val={(topCount / allCount).toLocaleString(undefined, { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 })}
      label={<div>Of Picks Were the Same <span style={{ textDecoration: "underline" }}>{top}</span> Champions</div>}
      sublabel={
        alwaysExcludeBravery && alwaysExcludeCrowdFav ?
          "Excluding bravery and crowd favorites."
        : alwaysExcludeBravery ?
          "Excluding bravery."
        : alwaysExcludeCrowdFav ?
          "Excluding crowd favorites."
        :
          "Including bravery and crowd favorites."
      }
    />
  );
};

export default TopChampPicksFeaturedStat;
