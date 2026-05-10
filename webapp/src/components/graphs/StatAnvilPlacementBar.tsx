import { useContext } from "react";
import { Bar } from "react-chartjs-2";

import FilterResultsContext from "../../context/FilterResultsContext";
import useCoreDataStore from "../../context/useCoreDataStore";
import { PLACEMENTS } from "../../model/Match";

export const StatAnvilPlacementBar = () => {
  const matchRecords = useCoreDataStore((state) => state.enhanced?.matchRecords) ?? [];
  const { filterResults } = useContext(FilterResultsContext);

  const placementStats = Object.fromEntries(
    PLACEMENTS.map((placement) => [
      placement.toFixed(0),
      {
        numDegenGamblers: 0,
        numSheeple: 0,
      }
    ])
  );
  let totalDegenGamblers = 0;
  let totalSheeple = 0;

  for (const matchRecord of matchRecords) {
    for (const participant of matchRecord.body.match.info.participants) {
      if (filterResults.excludedParticipants.get(participant)) {
        continue;
      }

      const bin = placementStats[participant.placement.toFixed(0)];

      if (filterResults.statRunParticipants.get(participant)) {
        bin.numDegenGamblers++;
        totalDegenGamblers++;
      } else if (filterResults.crowdFavParticipants.get(participant)) {
        bin.numSheeple++;
        totalSheeple++;
      }
    }
  }

  return (
    <Bar
      data={{
        labels: PLACEMENTS.map((placement) => placement.toFixed(0)),
        datasets: [
          {
            label: "Anvil Runners",
            data: PLACEMENTS.map((placement) => (
              placementStats[placement.toFixed(0)].numDegenGamblers / totalDegenGamblers
            ))
          },
          {
            label: "Item Buyers",
            data: PLACEMENTS.map((placement) => (
              placementStats[placement.toFixed(0)].numSheeple / totalSheeple
            ))
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
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
            display: true,
          },
          datalabels: {
            display: false,
          },
        }
      }}
    />
  );
};

export default StatAnvilPlacementBar;
