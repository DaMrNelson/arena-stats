import { useContext, useMemo } from "react";
import type { ChartDataset } from "chart.js";
import { Bar } from "react-chartjs-2";
import stats from "stats-lite";

import FilterResultsContext from "../../context/FilterResultsContext";
import useCoreDataStore from "../../context/useCoreDataStore";
import type { MatchRecord } from "../../model/Record";
import { AUTHOR_OWNS_ALL_CHAMPS_NAME_LOWER } from "../../data/filter";
import { CHARTJS_DEFAULT_COLORS, CHARTJS_DEFAULT_COLORS_BG } from "../theme";


type DataPoint = {
  x: string,
  y: number,
  count: number,
}

export const BraveryRoleDistBar = ({ includeAltRoles, doBraverySimulation }: { includeAltRoles?: boolean, doBraverySimulation?: boolean }) => {
  const matchRecords = useCoreDataStore((state) => state.enhanced?.matchRecords);
  const { filterResults: { braveryParticipants } } = useContext(FilterResultsContext);
  const championsByKey = useCoreDataStore((state) => state.res?.championsByKey) ?? {};
  const championTagsSorted = useCoreDataStore((state) => state.res?.championTagsSorted) ?? [];

  let consideredMatches: MatchRecord[] = [];

  // Gather actual distribution of champion roles (tags).
  // Banned champions are excluded from these counts per-match.
  let consideredActualTags = 0;
  const actualTagDist = Object.fromEntries(
    championTagsSorted.map((tag) => [
      tag,
      0
    ])
  );

  // Gather counts of actually encountered roles (tags)
  let consideredParticipantTags = 0;
  const participantTagDist = Object.fromEntries(
    championTagsSorted.map((tag) => [
      tag,
      0
    ])
  );

  for (const matchRecord of matchRecords ?? []) {
    // Add the champion I rolled to the tally (if I picked bravery)
    let consideredMatch = false;

    for (const participant of matchRecord.body.match.info.participants) {
      // Filter for the author who owns all champions and for bravery
      if (!braveryParticipants.get(participant) || `${participant.riotIdGameName}#${participant.riotIdTagline}`.toLowerCase() !== AUTHOR_OWNS_ALL_CHAMPS_NAME_LOWER) {
        continue;
      }

      // TODO: Exclusions too?

      // Find champion role
      const champ = championsByKey[participant.championId];

      if (!champ) {
        continue;
      }

      const tags = includeAltRoles ? champ.tags : [champ.tags[0]]; // Usually we only care about the primary role

      for (const tag of tags) {
        participantTagDist[tag]++;
        consideredParticipantTags++;
      }

      consideredMatch = true;
    }

    // Tally up actual distribution for any unbanned champs
    if (consideredMatch) {
      consideredMatches.push(matchRecord);

      for (const champ of Object.values(championsByKey)) {
        let banned = false;

        for (const team of matchRecord.body.match.info.teams) {
          for (const ban of team.bans) {
            if (ban.championId.toFixed(0) === champ.key) {
              banned = true;
              break;
            }
          }

          if (banned) {
            break;
          }
        }

        if (banned) {
          continue;
        }

        // If champ was not banned, tally up
        const tags = includeAltRoles ? champ.tags : [champ.tags[0]]; // Usually we only care about the primary role

        for (const tag of tags) {
          actualTagDist[tag]++;
          consideredActualTags++;
        }
      }
    };
  }

  const allSimulatedTagDists = useMemo(() => {
    if (!doBraverySimulation) {
      return null;
    }

    const allSimulatedTagDists = Object.fromEntries(
      championTagsSorted.map((tag) => [
        tag,
        [] as number[]
      ])
    );

    for (let i = 0; i < 1000; i++) {
      let consideredSimulatedTags = 0;
      const simulatedTagDist = Object.fromEntries(
        championTagsSorted.map((tag) => [
          tag,
          0
        ])
      );
      const champArr = Object.values(championsByKey);

      for (const matchRecord of consideredMatches) {
        // Select a random unbanned champion
        let chosenChamp;

        while (chosenChamp == null) {
          const champ = champArr[Math.floor(Math.random() * champArr.length)];
          let banned = false;

          for (const team of matchRecord.body.match.info.teams) {
            for (const ban of team.bans) {
              if (ban.championId.toFixed(0) === champ.key) {
                banned = true;
                break;
              }
            }

            if (banned) {
              break;
            }
          }

          if (!banned) {
            chosenChamp = champ; // Exit condition now met
          }
        }

        // Tally
        const tags = includeAltRoles ? chosenChamp.tags : [chosenChamp.tags[0]]; // Usually we only care about the primary role

        for (const tag of tags) {
          simulatedTagDist[tag]++;
          consideredSimulatedTags++;
        }
      }

      for (const tag of championTagsSorted) {
        allSimulatedTagDists[tag].push(simulatedTagDist[tag] / consideredParticipantTags);
      }
    }

    return allSimulatedTagDists;
  }, [doBraverySimulation]);

  const datasets: ChartDataset<"bar" | "line", DataPoint[]>[] = [
    {
      label: "Actual Bravery Rolls",
      //data: championTagsSorted.map((tag) => participantTagDist[tag]),
      data: championTagsSorted.map((tag) => ({
        x: tag,
        y: participantTagDist[tag] / consideredParticipantTags,
        count: participantTagDist[tag],
      })),
      order: 1,
    },
    {
      label: `Official Champion Distribution (Per-Match Bans Factored In)`,
      type: "line",
      //data: championTagsSorted.map((tag) => actualTagDist[tag] / consideredActualTags * consideredParticipantTags),
      data: championTagsSorted.map((tag) => ({
        x: tag,
        y: actualTagDist[tag] / consideredActualTags,
        count: actualTagDist[tag] / consideredActualTags * consideredParticipantTags
      })),
      order: 0,
    },
  ];

  if (doBraverySimulation) {
    datasets.push({
      label: `1000x Random Bravery Simulations (5th percentile)`,
      type: "line",
      //data: championTagsSorted.map((tag) => stats.percentile(allSimulatedTagDists![tag], 0.05) * consideredParticipantTags),
      data: championTagsSorted.map((tag) => ({
        x: tag,
        y: stats.percentile(allSimulatedTagDists![tag], 0.05),
        count: 0,
      })),
      order: 2,
      backgroundColor: CHARTJS_DEFAULT_COLORS_BG[2],
      borderColor: CHARTJS_DEFAULT_COLORS[2],
      fill: "+1",
    });
    datasets.push({
      label: "1000x Random Bravery Simulations (95th percentile)",
      type: "line",
      //data: championTagsSorted.map((tag) => stats.percentile(allSimulatedTagDists![tag], 0.95) * consideredParticipantTags),
      data: championTagsSorted.map((tag) => ({
        x: tag,
        y: stats.percentile(allSimulatedTagDists![tag], 0.95),
        count: 0,
      })),
      order: 2,
      backgroundColor: CHARTJS_DEFAULT_COLORS_BG[3],
      borderColor: CHARTJS_DEFAULT_COLORS[3],
    });
  }

  return (
    <Bar
      data={{
        labels: championTagsSorted,
        datasets: datasets as ChartDataset<"bar", DataPoint[]>[],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
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
          tooltip: {
            mode: "index",
            callbacks: {
              label: (tooltipItem) => {
                if (tooltipItem.datasetIndex === 0) { // Bar
                  return [
                    tooltipItem.dataset.label ?? "",
                    `${(tooltipItem.parsed.y ?? 0).toLocaleString(undefined, { style: "percent", maximumFractionDigits: 1 })} (${(tooltipItem.raw as DataPoint).count} rolls)`
                  ];
                  return;
                } else { // 1, Line
                  return [
                    tooltipItem.dataset.label ?? "",
                    `${(actualTagDist[championTagsSorted[tooltipItem.dataIndex]] / consideredActualTags).toLocaleString(undefined, { style: "percent", maximumFractionDigits: 1 })} (${actualTagDist[championTagsSorted[tooltipItem.dataIndex]].toLocaleString()} potential rolls)`,
                  ];
                }
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

export default BraveryRoleDistBar;
