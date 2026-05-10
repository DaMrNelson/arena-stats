import { useContext } from "react";
import { Bar } from "react-chartjs-2";

import FilterResultsContext from "../../context/FilterResultsContext";
import useCoreDataStore from "../../context/useCoreDataStore";


export const StatAnvilWRBar = ({ fixedChartBounds }: { fixedChartBounds?: boolean }) => {
  const matchRecords = useCoreDataStore((state) => state.enhanced?.matchRecords) ?? [];
  const { filterResults } = useContext(FilterResultsContext);

  let degenWins = 0;
  let degenLosses = 0;
  let sheepleWins = 0;
  let sheepleLosses = 0;

  for (const matchRecord of matchRecords) {
    for (const participant of matchRecord.body.match.info.participants) {
      if (filterResults.excludedParticipants.get(participant)) {
        continue;
      }

      if (participant.placement <= 4) {
        if (filterResults.statRunParticipants.get(participant)) {
          degenWins++;
        } else {
          sheepleWins++;
        }
      } else {
        if (filterResults.statRunParticipants.get(participant)) {
          degenLosses++;
        } else {
          sheepleLosses++;
        }
      }
    }
  }

  return (
    <Bar
      data={{
        labels: ["Anvil Runners", "Item Buyers"],
        datasets: [{
          data: [
            degenWins / (degenWins + degenLosses),
            sheepleWins / (sheepleWins + sheepleLosses),
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

export default StatAnvilWRBar;
