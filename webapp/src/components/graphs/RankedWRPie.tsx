import { useContext } from "react";
import { Doughnut } from "react-chartjs-2";
import { sum } from "lodash";

import FilterResultsContext from "../../context/FilterResultsContext";
import { COLOR_LOSS, COLOR_WIN } from "../theme";
import type { RankedTier } from "../../model/Leagues";
import useCoreDataStore from "../../context/useCoreDataStore";


export const RankedWRPie = ({ tiers }: { tiers: RankedTier[] }) => {
  const matchRecords = useCoreDataStore((state) => state.enhanced?.matchRecords) ?? [];
  const playersDb = useCoreDataStore((state) => state.enhanced?.playersDb) ?? {};
  const { filterResults: { excludedParticipants } } = useContext(FilterResultsContext);

  // Gather all valid placements
  let wins = 0;
  let losses = 0;

  for (const matchRecord of matchRecords) {
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

      if (participant.placement <= 4) {
        wins += 1;
      } else {
        losses += 1;
      }
    }
  }

  return (
    <Doughnut
      data={{
        labels: ["Win (placement 1-4)", "Loss (placement 5-8)"],
        datasets: [{
          data: [wins, losses],
          backgroundColor: [COLOR_WIN, COLOR_LOSS],
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          datalabels: {
            formatter: (value, context) => [
              context.dataIndex === 0 ? "Win" : "Loss",
              (value / sum(context.dataset.data)).toLocaleString(undefined, { style: "percent" }),
            ],
            font: { weight: "bold" },
            textAlign: "center",
          }
        }
      }}
    />
  )
};

export default RankedWRPie;
