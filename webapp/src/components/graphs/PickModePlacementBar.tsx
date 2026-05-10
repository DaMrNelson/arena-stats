import { useContext } from "react";
import { Bar } from "react-chartjs-2";

import FilterResultsContext from "../../context/FilterResultsContext";
import useCoreDataStore from "../../context/useCoreDataStore";
import { PLACEMENTS } from "../../model/Match";


export const PickModePlacementBar = () => {
  const matchRecords = useCoreDataStore((state) => state.enhanced?.matchRecords) ?? [];
  const { filterResults } = useContext(FilterResultsContext);

  const placementStats = Object.fromEntries(
    PLACEMENTS.map((placement) => [
      placement.toFixed(0),
      {
        numBravery: 0,
        numCrowdFav: 0,
        numTryhard: 0,
      }
    ])
  );
  let totalBravery = 0;
  let totalCrowdFav = 0;
  let totalTryhard = 0;

  for (const matchRecord of matchRecords) {
    for (const participant of matchRecord.body.match.info.participants) {
      if (filterResults.excludedParticipants.get(participant)) {
        continue;
      }

      const bin = placementStats[participant.placement.toFixed(0)];

      if (filterResults.braveryParticipants.get(participant)) {
        bin.numBravery++;
        totalBravery++;
      } else if (filterResults.crowdFavParticipants.get(participant)) {
        bin.numCrowdFav++;
        totalCrowdFav++;
      } else {
        bin.numTryhard++;
        totalTryhard++;
      }
    }
  }

  return (
    <Bar
      data={{
        labels: PLACEMENTS.map((placement) => placement.toFixed(0)),
        datasets: [
          {
            label: "Bravery",
            data: PLACEMENTS.map((placement) => (
              placementStats[placement.toFixed(0)].numBravery / totalBravery
            ))
          },
          {
            label: "Crowd Favorite",
            data: PLACEMENTS.map((placement) => (
              placementStats[placement.toFixed(0)].numCrowdFav / totalCrowdFav
            ))
          },
          {
            label: "Picked",
            data: PLACEMENTS.map((placement) => (
              placementStats[placement.toFixed(0)].numTryhard / totalTryhard
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

export default PickModePlacementBar;
