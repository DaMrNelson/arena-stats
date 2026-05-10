import { useContext } from "react";
import { Bar } from "react-chartjs-2";

import { PLACEMENT_KEYS } from "../../model/Match";
import FilterResultsContext from "../../context/FilterResultsContext";
import useCoreDataStore from "../../context/useCoreDataStore";
import useOptionsStore from "../../context/useOptionsStore";

export const PlacementBar = () => {
  const coreMatchLength = useCoreDataStore((state) => state.enhanced?.matchRecords.length) ?? 0;
  const matchRecords = useCoreDataStore((state) => state.enhanced?.matchRecords) ?? [];
  const placementCounts = Object.fromEntries(PLACEMENT_KEYS.map((placement) => [placement, 0]));
  const fixedChartBounds = useOptionsStore((state) => state.fixedChartBounds);
  const { filterResults: { excludedParticipants } } = useContext(FilterResultsContext);

  for (const matchRecord of matchRecords) {
    for (const participant of matchRecord.body.match.info.participants) {
      if (excludedParticipants.get(participant)) {
        continue;
      }

      placementCounts[participant.placement.toFixed(0)]++;
    }
  }

  const placementCountNums = PLACEMENT_KEYS.map((placement) => placementCounts[placement]);
  const maxPlacementCount = Math.max(...Object.values(placementCounts));

  const defaultMax = (coreMatchLength ?? 1) * 2;
  const suggestedMax = (
    fixedChartBounds && maxPlacementCount >= defaultMax * 0.20 ?
      (coreMatchLength ?? 1) * 2
    :
      undefined
  );

  return (
    <Bar
      data={{
        labels: PLACEMENT_KEYS,
        datasets: [{
          data: placementCountNums,
          // @ts-expect-error - Library isn't well integrated
          trendlineLinear: {
            width: 2,
            lineStyle: "dotted",
          }
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            suggestedMax,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          datalabels: {
            display: false,
          }
        }
      }}
    />
  )
};

export default PlacementBar;
