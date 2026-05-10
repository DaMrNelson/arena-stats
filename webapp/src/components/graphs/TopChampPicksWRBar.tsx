import { useContext } from "react";
import { Bar } from "react-chartjs-2";

import FilterResultsContext from "../../context/FilterResultsContext";
import useCoreDataStore from "../../context/useCoreDataStore";


type ChampRecord = {
  picks: number,
  wins: number,
  losses: number,
};
type ChampRecordPoint = {
  x: number,
  y: number,
} & ChampRecord;

export const TopChampPicksWRBar = ({ top, alwaysExcludeBravery, alwaysExcludeCrowdFav }: { top?: number, alwaysExcludeBravery?: boolean, alwaysExcludeCrowdFav?: boolean }) => {
  const matchRecords = useCoreDataStore((state) => state.enhanced?.matchRecords) ?? [];
  const championData = useCoreDataStore((state) => state.res?.championData) ?? [];
  const { filterResults } = useContext(FilterResultsContext);

  top = top ?? 0.10;

  // First, count the pick rate by champion
  const champRecords: Record<string, ChampRecord> = Object.fromEntries(
    championData.map((champ) => [
      champ.key,
      { picks: 0, wins: 0, losses: 0 }
    ])
  );

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

      const champRecord = champRecords[participant.championId.toFixed(0)];
      champRecord.picks++;

      if (participant.placement <= 4) {
        champRecord.wins++;
      } else {
        champRecord.losses++;
      }
    }
  }

  // Second, sort champs by pick rate
  const champIds = Object.keys(champRecords);
  champIds.sort((a, b) => champRecords[b].picks - champRecords[a].picks);
  //const allRecords = champIds.map((champId) => champRecords[champId]);

  const topIds = champIds.slice(0, top);
  const topRecords = topIds.map((champId) => champRecords[champId]);
  const topCombinedRecord: ChampRecordPoint = topRecords.reduce<ChampRecordPoint>((agg, record) => {
    agg.picks += record.picks;
    agg.wins += record.wins;
    agg.losses += record.losses;
    return agg;
  }, { picks: 0, wins: 0, losses: 0, x: 0, y: 0 });
  topCombinedRecord.y = topCombinedRecord.wins / (topCombinedRecord.wins + topCombinedRecord.losses);

  const otherIds = champIds.slice(top);
  const otherRecords = otherIds.map((champId) => champRecords[champId]);
  const othersCombinedRecord: ChampRecordPoint = otherRecords.reduce<ChampRecordPoint>((agg, record) => {
    agg.picks += record.picks;
    agg.wins += record.wins;
    agg.losses += record.losses;
    return agg;
  }, { picks: 0, wins: 0, losses: 0, x: 1, y: 0 });
  othersCombinedRecord.y = othersCombinedRecord.wins / (othersCombinedRecord.wins + othersCombinedRecord.losses);

  return (
    <Bar
      data={{
        labels: [`Top ${top} Most Frequently Picked`, "Everyone Else"],
        datasets: [{
          data: [
            topCombinedRecord,
            othersCombinedRecord,
          ],
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
              text: "Winrate",
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
                const point = tooltipItem.raw as ChampRecordPoint;
                return `${percent} (${point.wins}W ${point.losses}L)`;
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

export default TopChampPicksWRBar;
