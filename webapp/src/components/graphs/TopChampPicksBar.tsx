import { useContext } from "react";
import { Bar } from "react-chartjs-2";
import stats from "stats-lite";

import FilterResultsContext from "../../context/FilterResultsContext";
import useCoreDataStore from "../../context/useCoreDataStore";


type DataPoint = {
  x: number,
  y: number,
  count: number,
};

export const TopChampPicksBar = ({ top, alwaysExcludeBravery, alwaysExcludeCrowdFav }: { top?: number, alwaysExcludeBravery?: boolean, alwaysExcludeCrowdFav?: boolean }) => {
  const matchRecords = useCoreDataStore((state) => state.enhanced?.matchRecords) ?? [];
  const championsByKey = useCoreDataStore((state) => state.res?.championsByKey) ?? {};
  const { filterResults } = useContext(FilterResultsContext);

  top = top ?? 0.10;

  // First, count the pick rate by champion
  const champCounts: Record<string, number> = {};

  for (const matchRecord of matchRecords) {
    for (const participant of matchRecord.body.match.info.participants) {
      if (filterResults.excludedParticipants.get(participant)) {
        continue;
      }

      if (
        (alwaysExcludeBravery && filterResults.braveryParticipants.get(participant)) ||
        (alwaysExcludeCrowdFav && filterResults.crowdFavParticipants.get(participant))
      ) {
        continue;
      }

      const champ = championsByKey[participant.championId];

      if (!champ) {
        continue;
      }

      champCounts[champ.id] = (champCounts[champ.id] ?? 0) + 1;
    }
  }

  // Second, sort champs by pick rate
  const champIds = Object.keys(champCounts);
  champIds.sort((a, b) => champCounts[b] - champCounts[a]);
  const allCounts = champIds.map((champId) => champCounts[champId]);
  const allCount = stats.sum(allCounts);

  const topIds = champIds.slice(0, top);
  const topCounts = topIds.map((champId) => champCounts[champId]);
  const topCount = stats.sum(topCounts);

  const otherIds = champIds.slice(top);
  const otherCounts = otherIds.map((champId) => champCounts[champId]);
  const otherCount = stats.sum(otherCounts);

  /*const hist = stats.histogram(allCounts, 10);
  console.log(hist);*/

  return (
    <Bar
      /*data={{
        labels: hist.values.map((_, i) => (hist.binLimits[0] + hist.binWidth * i).toFixed(2)),
        datasets: [{
          data: hist.values,
        }],
      }}*/
      data={{
        labels: [`Top ${top} Most Frequently Picked`, "Everyone Else"],
        datasets: [{
          data: [
            { x: 0, y: topCount / allCount, count: topCount },
            { x: 1, y: otherCount / allCount, count: otherCount }
          ] as DataPoint[],
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Percent of All Picks",
            },
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
                const percent = tooltipItem.parsed.y?.toLocaleString(undefined, { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });
                return `${percent} (${(tooltipItem.raw as DataPoint).count} picks)`;
              },
            },
          },
          datalabels: {
            display: false,
          },
        }
      }}
    />
  );
};

export default TopChampPicksBar;
