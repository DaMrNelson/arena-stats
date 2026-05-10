import { useContext } from "react";
import { Chart } from "react-chartjs-2";
import stats from "stats-lite";
import { BarWithErrorBarsController } from "chartjs-chart-error-bars";

import { PLACEMENT_KEYS } from "../../model/Match";
import FilterResultsContext from "../../context/FilterResultsContext";
import { AUTHOR_DUO_NAMES_LOWER } from "../../data/filter";
import { rankToNum } from "../../data/players";
import useCoreDataStore from "../../context/useCoreDataStore";

export const ChangeInEnemyRankBar = ({ mode }: { mode: "placement" | "win-loss" }) => {
  const matchRecords = useCoreDataStore((state) => state.enhanced?.matchRecords) ?? [];
  const playersDb = useCoreDataStore((state) => state.enhanced?.playersDb) ?? {};
  const { filterResults: { excludedParticipants } } = useContext(FilterResultsContext);


  const KEY_WIN = "Win"; // Also labels
  const KEY_LOSS = "Loss";
  const bins = mode === "placement" ? PLACEMENT_KEYS : [KEY_WIN, KEY_LOSS];
  const binnedRankChanges = Object.fromEntries(bins.map((placement) => [placement, [] as number[]]));
  let lastMeanRank = null;

  for (const matchRecord of matchRecords) {
    const matchRanks = [];
    let authorPlacement = null;

    for (const participant of matchRecord.body.match.info.participants) {
      if (AUTHOR_DUO_NAMES_LOWER.includes(`${participant.riotIdGameName}#${participant.riotIdTagline}`.toLowerCase())) {
        authorPlacement = participant.placement;
        continue;
      }
      if (excludedParticipants.get(participant)) {
        continue;
      }

      // Find champion role
      // TODO: Shorthand fn with warnings, I am repeating this a lot
      const player = playersDb[participant.puuid];

      if (!player) {
        console.warn(`Missing player record ${participant.puuid} for match ${matchRecord.body.match_id}`);
        continue;
      }

      const role = player.body.currentOr2025League; // TODO: Option for current vs previous

      if (role == null) {
        continue;
      }

      // Aggregate
      matchRanks.push(rankToNum(role));
    }

    if (authorPlacement == null) {
      console.warn(`Unable to determine author duo placement in match ${matchRecord.body.match_id}`);
      lastMeanRank = null;
      continue;
    }
    if (!matchRanks.length) {
      lastMeanRank = null;
      continue;
    }

    // Compare with previous
    const meanRank = stats.mean(matchRanks);

    if (lastMeanRank == null) {
      lastMeanRank = meanRank;
      continue;
    }

    const binKey = (
      mode === "placement" ?
        authorPlacement
      :
        authorPlacement <= 4 ?
          KEY_WIN
        :
          KEY_LOSS
    );
    binnedRankChanges[binKey].push(meanRank - lastMeanRank)
    lastMeanRank = meanRank;
  }

  //const rankDeltas = bins.map((binKey) => stats.median(binnedRankChanges[binKey]));
  const rankDeltas = bins.map((binKey) => {
    const bin = binnedRankChanges[binKey];
    const stdErr = stats.stdev(bin) / Math.sqrt(bin.length);
    const mean = stats.mean(bin);
    // TODO: Is this correct?
    // TODO: Consider percentiles instead?

    return {
      y: mean,
      //yMin: stats.percentile(bin, 0.25),
      //yMax: stats.percentile(bin, 0.75),
      yMin: mean - stdErr,
      yMax: mean + stdErr,
    };
  });

  return (
    <Chart
      type={BarWithErrorBarsController.id}
      data={{
        labels: bins,
        datasets: [{
          data: rankDeltas,
          // @ts-expect-error - Library isn't well integrated
          trendlineLinear: {
            width: 2,
            lineStyle: "dotted",
          }
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            suggestedMin: -0.25,
            suggestedMax: 0.25,
            //afterTickToLabelConversion: (axis) => { // TODO: Custom ticks!
            //  axis.ticks = [];
            //},
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          datalabels: {
            display: false,
          }
        }
      }}
    />
  )
};

export default ChangeInEnemyRankBar;
