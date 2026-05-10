import { useContext } from "react";
import { Bar } from "react-chartjs-2";

import FilterResultsContext from "../../context/FilterResultsContext";
import { SORTED_TIERS } from "../../model/Leagues";
import useCoreDataStore from "../../context/useCoreDataStore";


type DataPoint = {
  x: string,
  y: number,
  wins: number,
  losses: number,
};

export const RankedWRBar = () => {
  const matchRecords = useCoreDataStore((state) => state.enhanced?.matchRecords) ?? [];
  const playersDb = useCoreDataStore((state) => state.enhanced?.playersDb) ?? {};
  const { filterResults: { excludedParticipants } } = useContext(FilterResultsContext);

  const TIERS = [
    ...SORTED_TIERS.filter((tier) => tier !== "CHALLENGER"),
    "UNRANKED"
  ];

  // Gather all valid placements
  const tierStats: Record<string, DataPoint> = Object.fromEntries(
    TIERS.map((tier) => [
      tier,
      { wins: 0, losses: 0, x: tier, y: 0 }
    ])
  );

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

      let tier = player.body.currentOr2025League?.tier ?? "UNRANKED"; // TODO: Option for current vs previous

      if (participant.placement <= 4) {
        tierStats[tier].wins++;
      } else {
        tierStats[tier].losses++;
      }
    }
  }

  for (const tier in tierStats) {
    const stats = tierStats[tier];
    stats.y = stats.wins / (stats.wins + stats.losses);
  }

  // TODO: Vertically center all WR graphs
  const distFrom50 = Math.max(...TIERS.map((tier) => Math.abs(0.50 - tierStats[tier].y)));

  return (
    <Bar
      data={{
        labels: TIERS,
        datasets: [{
          data: TIERS.map((tier) => tierStats[tier]),
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            suggestedMin: 0.50 - distFrom50,
            suggestedMax: 0.50 + distFrom50,
            /*suggestedMin: fixedChartBounds ? 0.35 : undefined,
            suggestedMax: fixedChartBounds ? 0.65 : undefined,*/
            ticks: {
              format: {
                style: "percent",
              },
              callback: (tickValue) => (
                tickValue.toLocaleString(undefined, { style: "percent" })
              ),
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const percent = tooltipItem.parsed.y?.toLocaleString(undefined, { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const point = tooltipItem.raw as DataPoint;
                return `${percent} (${point.wins}W : ${point.losses}L)`;
              },
            },
          },
          datalabels: {
            display: false,
          },
          annotation: {
            annotations: {
              evenWrLine: {
                type: "line",
                yMin: 0.5,
                yMax: 0.5,
                borderDash: [8, 12],
              },
            }
          },
        }
      }}
    />
  )
};

export default RankedWRBar;
