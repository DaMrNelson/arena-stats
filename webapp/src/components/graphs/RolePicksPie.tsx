import { useContext } from "react";
import { Pie } from "react-chartjs-2";
import { sum } from "lodash";

import FilterResultsContext from "../../context/FilterResultsContext";
import useCoreDataStore from "../../context/useCoreDataStore";


export const RolePicksPie = ({ includeAltRoles }: { includeAltRoles?: boolean }) => {
  const matchRecords = useCoreDataStore((state) => state.enhanced?.matchRecords) ?? [];
  const championsByKey = useCoreDataStore((state) => state.res?.championsByKey) ?? {};
  const championTagsSorted = useCoreDataStore((state) => state.res?.championTagsSorted) ?? [];
  const { filterResults: { excludedParticipants } } = useContext(FilterResultsContext);

  const tagCounts = Object.fromEntries(
    championTagsSorted.map((tag) => [
      tag,
      0
    ])
  );

  for (const matchRecord of matchRecords) {
    for (const participant of matchRecord.body.match.info.participants) {
      if (excludedParticipants.get(participant)) {
        continue;
      }

      const champ = championsByKey[participant.championId];

      if (!champ) {
        continue;
      }

      if (!includeAltRoles) { // Usually we only care about the primary role
        tagCounts[champ.tags[0]]++;
      } else {
        for (const tag of champ.tags) {
          tagCounts[tag]++;
        }
      }
    }
  }

  return (
    <Pie
      data={{
        labels: championTagsSorted,
        datasets: [{
          data: championTagsSorted.map((tag) => tagCounts[tag]),
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
                `${(tooltipItem.parsed / sum(tooltipItem.dataset.data)).toLocaleString(undefined, { style: "percent" })} (${tooltipItem.parsed})`
              ),
            },
          },
          datalabels: {
            formatter: (value, context) => (
              value === 0 ?
                []
              : [
                championTagsSorted[context.dataIndex],
                `${(value / sum(context.dataset.data)).toLocaleString(undefined, { style: "percent" })} (${value})`,
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

export default RolePicksPie;
