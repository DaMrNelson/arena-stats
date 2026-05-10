import { useContext } from "react";
import { Line,} from "react-chartjs-2";
import type { ChartDataset, Point } from "chart.js";
import stats from "stats-lite";

import FilterResultsContext from "../../context/FilterResultsContext";
import useCoreDataStore from "../../context/useCoreDataStore";
import useOptionsStore from "../../context/useOptionsStore";
import { SORTED_TIERS } from "../../model/Leagues";
import { AUTHOR_DUO_NAMES_LOWER } from "../../data/filter";
import { COLOR_LOSS, COLOR_LOSS_BG, COLOR_WIN, COLOR_WIN_BG } from "../theme";
import { dailyAverage, type AveragedNumberPoint } from "../../data/stats";
import { rankNumToStr, rankToNum } from "../../data/players";


type MatchPoint = Point & {
  type: "MatchPoint",

  /** x = match start time (ms) */
  x: number,
  /** y = average match rank */
  y: number,

  sortedRanks: number[],
  authorWin?: boolean,
};

type AveragedMatchPoint = AveragedNumberPoint & {
  type: "AveragedPoint"
};

export type EnemyRankSeriesMode = "average" | "highest" | "lowest";

export const EnemyRankTimeSeriesCombo = ({ mode }: { mode?: EnemyRankSeriesMode }) => {
  const matchRecords = useCoreDataStore((state) => state.enhanced?.matchRecords) || [];
  const playersDb = useCoreDataStore((state) => state.enhanced?.playersDb) ?? {};
  const { filterResults: { excludedParticipants } } = useContext(FilterResultsContext);
  const fixedChartBounds = useOptionsStore((state) => state.fixedChartBounds);

  // Initialize points object with counts at 0
  // TODO: useMemo this and all other charts!
  //       Don't forget averagePoints!
  const matchPoints: MatchPoint[] = [];

  for (const matchRecord of matchRecords) {
    const matchRanks = [];
    let authorWin = undefined;

    for (const participant of matchRecord.body.match.info.participants) {
      // Exclude authors. This is an "enemy" chart
      if (AUTHOR_DUO_NAMES_LOWER.includes(`${participant.riotIdGameName}#${participant.riotIdTagline}`.toLowerCase())) {
        authorWin = participant.placement <= 4;
        continue;
      }

      if (excludedParticipants.get(participant)) {
        continue;
      }

      // Find player and their role
      const player = playersDb[participant.puuid];

      if (!player) {
        console.warn(`Missing player record ${participant.puuid} for match ${matchRecord.body.match_id}`);
        continue;
      }

      const roleNum = player.body.currentOr2025LeagueNum; // TODO: Option for current vs previous

      if (roleNum != null) {
        matchRanks.push(roleNum);
      }
    }

    if (authorWin === undefined) {
      console.warn(`Unable to determine if the author duo won or lost match ${matchRecord.body.match_id}`);
      continue;
    }

    if (matchRanks.length) {
      const matchAggRank = (
        (mode ?? "average") === "average" ?
          stats.mean(matchRanks)
        :
          mode === "highest" ?
            Math.max(...matchRanks)
          : mode === "lowest" ?
            Math.min(...matchRanks)
          :
            0
      );
      //const matchAggRank = stats.mean(matchRanks);
      const matchPoint: MatchPoint = {
        type: "MatchPoint",

        x: matchRecord.body.match.info.gameCreation,
        y: matchAggRank,

        sortedRanks: matchRanks.sort(),
        authorWin,
      };

      matchPoints.push(matchPoint);
    }
  }

  // TODO: Is filtering 2x faster than sorting 3x?
  //       Or does sorting even matter now that its a line chart?
  matchPoints.sort((a, b) => a.x - b.x);
  const winPoints = matchPoints.filter((point) => point.authorWin);
  const lossPoints = matchPoints.filter((point) => !point.authorWin);
  //const pointColors = matchPoints.map((point) => point.color);

  //const averagePoints = symmetricalMovingAverage(matchPoints, 21)
  //const averagePoints = movingDateAverage(matchPoints, dayjs.duration(72, "hours"));
  const averagePoints: AveragedMatchPoint[] = matchPoints.length ? dailyAverage(matchPoints).map((point) => ({
    ...point,
    type: "AveragedPoint"
  })) : [];
  const averageColor = "rgba(0,0,0,0.8)";
  const averageColorBg = "rgba(0,0,0,0.5)";

  return (
    <Line
      data={{
        datasets: [
          {
            label: "Win",
            data: winPoints,
            showLine: false,
            borderColor: COLOR_WIN,
            backgroundColor: COLOR_WIN_BG,
          },
          {
            label: "Loss",
            data: lossPoints,
            showLine: false,
            borderColor: COLOR_LOSS,
            backgroundColor: COLOR_LOSS_BG,
          },
          {
            label: "Daily Average",
            data: averagePoints,
            showLine: true,
            tension: 0.4,
            //pointRadius: 0,
            borderColor: averageColor,
            backgroundColor: averageColorBg,
          },
        ] as ChartDataset<"line", (MatchPoint | AveragedMatchPoint)[]>[]
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "time",
          },
          y: {
            suggestedMin: fixedChartBounds ? rankToNum({ tier: "SILVER", rank: "IV"}) : undefined,
            suggestedMax: fixedChartBounds ? rankToNum({ tier: "EMERALD", rank: "IV"}) : undefined,
            ticks: {
              callback: (tickValue) => (
                rankNumToStr(tickValue as number, true).replace(" IV", "")
              ),
            },
            afterBuildTicks(axis) {
              axis.ticks = SORTED_TIERS.map((tier) => ({
                value: rankToNum({ tier: tier, rank: "IV" })
              }))
            },
          },
        },
        plugins: {
          legend: {
            display: true,
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                if ((tooltipItem.raw as MatchPoint).type === "MatchPoint") {
                  const point = tooltipItem.raw as MatchPoint;

                  type RankStats = {
                    rankNum: number;
                    human: string;
                    count: number;
                  }
                  const rankMap: Record<string, RankStats> = {};

                  for (const rankNum of point.sortedRanks) {
                    const human = rankNumToStr(rankNum, true);

                    if (rankMap[human] == null) {
                      rankMap[human] = {
                        rankNum,
                        human,
                        count: 0,
                      };
                    }

                    rankMap[human].count++;
                  }

                  const uniqueRanks = Object.keys(rankMap).sort((a, b) => rankMap[a].rankNum - rankMap[b].rankNum);

                  return [
                    `Average: ${rankNumToStr(point.y, true)}`,
                    `Ranked Players: ${point.sortedRanks.length}`,
                    "",
                    ...uniqueRanks.map((human) => `${human}: ${rankMap[human].count}`)
                  ];
                } else {
                  const point = tooltipItem.raw as AveragedNumberPoint;
                  return [
                    `${rankNumToStr(point.y, true)}`,
                    `Averaged ${point.averagedYs.length} matches`,
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

export default EnemyRankTimeSeriesCombo;
