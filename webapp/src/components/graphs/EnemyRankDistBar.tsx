import { useContext } from "react";
import { Bar } from "react-chartjs-2";

import FilterResultsContext from "../../context/FilterResultsContext";
import useCoreDataStore from "../../context/useCoreDataStore";
import { SORTED_DIVISIONS, SORTED_TIERS, type RankedDivision, type RankedTier } from "../../model/Leagues";
import { AUTHOR_DUO_NAMES_LOWER } from "../../data/filter";
import type { ChartDataset } from "chart.js";


type TierStats = { [key in RankedDivision]: number };
type TierStatsPoint = {
  x: string,
  y: number,
} & TierStats;


// https://www.leagueofgraphs.com/rankings/rank-distribution
// Don't forget to set region filter to NA!
const OPGG_RANK_DISTRIBUTION_UPDATED_TS = "2026-04-22";
const OPGG_RANK_DISTRIBUTION = [
  2.7, // Iron
  17, // Bronze
  23, // Silver
  25, // Gold
  18, // Plat
  10, // Emerald
  3.4, // Diamond
  1.1, // Master
  0.066, // GrandMaster
  0.028, // Challenger
];

export const EnemyRankDistBar = () => {
  const matchRecords = useCoreDataStore((state) => state.enhanced?.matchRecords) ?? [];
  const playersDb = useCoreDataStore((state) => state.enhanced?.playersDb) ?? {};
  const { filterResults: { excludedParticipants } } = useContext(FilterResultsContext);
  let consideredParticipants = 0;

  // Initialize points object with counts at 0
  const points = Object.fromEntries(
    SORTED_TIERS.map((tier) => [
      tier,
      {
        x: tier,
        y: 0,
        ...Object.fromEntries(SORTED_DIVISIONS.map((level) => [level, 0]))
      }
    ])
  ) as Record<RankedTier, TierStatsPoint>;

  for (const matchRecord of matchRecords) {
    for (const participant of matchRecord.body.match.info.participants) {
      if (excludedParticipants.get(participant) || AUTHOR_DUO_NAMES_LOWER.includes(`${participant.riotIdGameName}#${participant.riotIdTagline}`.toLowerCase())) {
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

      // Aggregate
      consideredParticipants++;
      points[rank.tier][rank.rank]++;
      points[rank.tier].y++;
    }
  }

  return (
    <Bar
      data={{
        labels: SORTED_TIERS as unknown as string[],
        datasets: [
          {
            label: "Participants Encountered",
            data: SORTED_TIERS.map((tier) => points[tier]),
            order: 1,
          },
          {
            label: `OP.GG Rank Distribution for All NA Players - ${OPGG_RANK_DISTRIBUTION_UPDATED_TS}`,
            type: "line",
            data: OPGG_RANK_DISTRIBUTION.map((p) => p / 100 * consideredParticipants),
            order: 0,
          },
        ] as ChartDataset<"bar", TierStatsPoint[]>[],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Participants Seen",
            }
          },
        },
        plugins: {
          legend: {
            display: true,
          },
          tooltip: {
            mode: "index",
            callbacks: {
              label: (tooltipItem) => {
                if (tooltipItem.datasetIndex === 0) { // Bar
                  const point = tooltipItem.raw as TierStatsPoint;
                  return [
                    `Seen in Our Games: ${point.y}`,
                    (point.y / consideredParticipants).toLocaleString(undefined, { style: "percent", maximumFractionDigits: 1 }),
                    "",
                    ...SORTED_DIVISIONS.map((level) =>
                      `${point.x} ${level}: ${point[level]} (${(point[level] / point.y).toLocaleString(undefined, { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${(point[level] / consideredParticipants).toLocaleString(undefined, { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
                    ),
                  ];
                } else { // 1, Line
                  return [
                    "OP.GG Rank Distribution for All Players:",
                    (OPGG_RANK_DISTRIBUTION[tooltipItem.dataIndex] / 100).toLocaleString(undefined, { style: "percent", maximumFractionDigits: 3 }),
                  ];
                }
              },
            },
          },
          datalabels: {
            display: false,
          },
        }
      }}
    />
  );
};

export default EnemyRankDistBar;
