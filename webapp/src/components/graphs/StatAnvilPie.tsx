import { useContext } from "react";
import { Pie } from "react-chartjs-2";

import FilterResultsContext from "../../context/FilterResultsContext";
import useCoreDataStore from "../../context/useCoreDataStore";


export const StatAnvilPie = () => {
  const matchRecords = useCoreDataStore((state) => state.enhanced?.matchRecords) ?? [];
  const { filterResults } = useContext(FilterResultsContext);
  let numDegenGamblers = 0;
  let numSheeple = 0;

  for (const matchRecord of matchRecords) {
    for (const participant of matchRecord.body.match.info.participants) {
      if (filterResults.excludedParticipants.get(participant)) {
        continue;
      }

      if (filterResults.statRunParticipants.get(participant)) {
        numDegenGamblers++;
      } else {
        numSheeple++;
      }
    }
  }

  const totalPicks = numDegenGamblers + numSheeple;

  return (
    <Pie
      data={{
        labels: ["Anvil Runners", "Item Buyers"],
        datasets: [{
          data: [numDegenGamblers, numSheeple],
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
            formatter: (value, context) => (
              value === 0 ?
                []
              : [
                context.chart.data.labels![context.dataIndex],
                `${(value / totalPicks).toLocaleString(undefined, { style: "percent" })})`,
                ...(context.dataIndex === 0 ? [] : [
                  "(Dataset is Post-Nerf)",
                ])
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

export default StatAnvilPie;
