import { useContext } from "react";
import { Bar } from "react-chartjs-2";

import FilterResultsContext from "../../context/FilterResultsContext";
import useCoreDataStore from "../../context/useCoreDataStore";


export const PickModeWRBar = ({ fixedChartBounds }: { fixedChartBounds?: boolean }) => {
  const matchRecords = useCoreDataStore((state) => state.enhanced?.matchRecords) ?? [];
  const { filterResults } = useContext(FilterResultsContext);

  let braveryWins = 0;
  let braveryLosses = 0;
  let crowdFavWins = 0;
  let crowdFavLosses = 0;
  let tryhardWins = 0;
  let tryhardLosses = 0;

  for (const matchRecord of matchRecords) {
    for (const participant of matchRecord.body.match.info.participants) {
      if (filterResults.excludedParticipants.get(participant)) {
        continue;
      }

      if (participant.placement <= 4) {
        if (filterResults.braveryParticipants.get(participant)) {
          braveryWins++;
        } else if (filterResults.crowdFavParticipants.get(participant)) {
          crowdFavWins++;
        } else {
          tryhardWins++;
        }
      } else {
        if (filterResults.braveryParticipants.get(participant)) {
          braveryLosses++;
        } else if (filterResults.crowdFavParticipants.get(participant)) {
          crowdFavLosses++;
        } else {
          tryhardLosses++;
        }
      }
    }
  }

  return (
    <Bar
      data={{
        labels: ["Bravery", "Crowd Favorite", "Picked"],
        datasets: [{
          data: [
            braveryWins / (braveryWins + braveryLosses),
            crowdFavWins / (crowdFavWins + crowdFavLosses),
            tryhardWins / (tryhardWins + tryhardLosses),
          ],
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            suggestedMin: fixedChartBounds ? 0.35 : undefined,
            suggestedMax: fixedChartBounds ? 0.65 : undefined,
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
  );
};

export default PickModeWRBar;
