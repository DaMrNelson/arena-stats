import { useContext } from "react";
import { Pie } from "react-chartjs-2";

import FilterResultsContext from "../../context/FilterResultsContext";
import useCoreDataStore from "../../context/useCoreDataStore";


export const PickModePie = () => {
  const matchRecords = useCoreDataStore((state) => state.enhanced?.matchRecords) ?? [];
  const { filterResults } = useContext(FilterResultsContext);
  let numBravery = 0;
  let numCrowdFav = 0;
  let numTryhards = 0;

  for (const matchRecord of matchRecords) {
    for (const participant of matchRecord.body.match.info.participants) {
      if (filterResults.excludedParticipants.get(participant)) {
        continue;
      }

      if (filterResults.braveryParticipants.get(participant)) {
        numBravery++;
      } else if (filterResults.crowdFavParticipants.get(participant)) {
        numCrowdFav++;
      } else {
        numTryhards++;
      }
    }
  }

  const totalPicks = numBravery + numCrowdFav + numTryhards;

  return (
    <Pie
      data={{
        //labels: ["Bravery", "Crowd Favorite", "Needed a Win"],
        labels: ["Bravery", "Crowd Favorite", "Picked"],
        datasets: [{
          data: [numBravery, numCrowdFav, numTryhards],
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => (
                `${(tooltipItem.parsed / totalPicks).toLocaleString(undefined, { style: "percent" })} (${tooltipItem.parsed})`
              ),
            },
          },
          datalabels: {
            formatter: (value, context) => (
              value === 0 ?
                []
              : [
                context.chart.data.labels![context.dataIndex],
                `${(value / totalPicks).toLocaleString(undefined, { style: "percent" })} (${value})`,
              ]
            ),
            font: { weight: "bold" },
            textAlign: "center",
          }
        }
      }}
    />
  );
};

export default PickModePie;
