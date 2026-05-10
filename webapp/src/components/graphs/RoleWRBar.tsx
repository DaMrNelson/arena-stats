import { useContext } from "react";
import { Bar } from "react-chartjs-2";

import FilterResultsContext from "../../context/FilterResultsContext";
import useCoreDataStore from "../../context/useCoreDataStore";
import useOptionsStore from "../../context/useOptionsStore";


type TagRecord = {
  win: number,
  loss: number,
};
type TagRecordPoint = {
  x: string,
  y: number,
} & TagRecord;

export const RoleWRBar = ({ includeAltRoles }: { includeAltRoles?: boolean }) => {
  const matchRecords = useCoreDataStore((state) => state.enhanced?.matchRecords) ?? [];
  const championsByKey = useCoreDataStore((state) => state.res?.championsByKey) ?? {};
  const championTagsSorted = useCoreDataStore((state) => state.res?.championTagsSorted) ?? [];
  const { filterResults: { excludedParticipants } } = useContext(FilterResultsContext);

  const tagRecords = Object.fromEntries(
    championTagsSorted.map((tag) => [
      tag,
      { win: 0, loss: 0 } as TagRecord
    ])
  );
  const fixedChartBounds = useOptionsStore((state) => state.fixedChartBounds);

  for (const matchRecord of matchRecords) {
    for (const participant of matchRecord.body.match.info.participants) {
      if (excludedParticipants.get(participant)) {
        continue;
      }

      const champ = championsByKey[participant.championId];

      if (!champ) {
        continue;
      }

      const tags = includeAltRoles ? champ.tags : [champ.tags[0]]; // Usually we only care about the primary role

      for (const tag of tags) {
        const tagRecord = tagRecords[tag];

        if (participant.placement <= 4) {
          tagRecord.win++;
        } else {
          tagRecord.loss++;
        }
      }
    }
  }

  return (
    <Bar
      data={{
        labels: championTagsSorted,
        datasets: [{
          data: championTagsSorted.map((tag) => ({
            x: tag,
            y: tagRecords[tag].win / (tagRecords[tag].win + tagRecords[tag].loss),
            ...tagRecords[tag],
          })),
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
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const percent = tooltipItem.parsed.y?.toLocaleString(undefined, { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const tagRecordPoint = tooltipItem.raw as TagRecordPoint;
                return `${percent} (${tagRecordPoint.win}W : ${tagRecordPoint.loss}L)`;
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
  );
};

export default RoleWRBar;
