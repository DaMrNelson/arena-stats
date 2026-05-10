import type { Point } from "chart.js";
import dayjs from "dayjs";
import type { Duration } from "dayjs/plugin/duration";
import stats from "stats-lite";

// TODO: Size is actually +- 1
type NumberPoint = Point & {
  x: number,
  y: number,
};
/** Creates a moving average using chart.js points.
 *
 * NOTABLY DIFFERENT FROM movingDateAverage: size is like diameter (this function), not radius (other function).
 */
export const symmetricalMovingAverage = (data: NumberPoint[], size: number): NumberPoint[] => {
  if (Math.floor(size) !== size || Math.floor(size) % 2 === 0) {
    throw "size must be an uneven integer";
  }

  const hs = Math.floor(size / 2);
  const movingMean: NumberPoint[] = [];

  for (let i = hs; i < data.length - hs; i++) {
    let sum = 0;

    for (let j = -hs; j < hs + 1; j++) {
      sum += data[i + j].y;
    }

    movingMean.push({
      ...data[i],
      y: sum / size,
    });
  }

  return movingMean;
};

/** Creates a moving average from chart.js points.
 *
 * NOTABLY DIFFERENT FROM symmetricalMovingAverage: n is like radius (this function), not diameter (other function).
 */
export const movingDateAverage = (data: NumberPoint[], duration: Duration): NumberPoint[] => {
  const dataDates = data.map((point) => ({
    ...point,
    x: dayjs(point.x),
  }));

  return dataDates.map((point, i) => {
    const relevantYs = [point.y];
    const minDate = point.x.subtract(duration);
    const maxDate = point.x.add(duration);

    for (let j = i - 1; j > 0 && dataDates[j].x.isAfter(minDate); j--) {
      relevantYs.push(dataDates[j].y);
    }

    for (let j = i + 1; j < dataDates.length && dataDates[j].x.isBefore(maxDate); j++) {
      relevantYs.push(dataDates[j].y);
    }

    return {
      ...data[i],
      y: stats.mean(relevantYs),
    };
  })
};

/** Creates a moving average from chart.js points.
 *
 * NOTABLY DIFFERENT FROM symmetricalMovingAverage: n is like radius (this function), not diameter (other function).
 */
export type AveragedNumberPoint = NumberPoint & {
  averagedYs: number[]
};
export const dailyAverage = (data: NumberPoint[]): AveragedNumberPoint[] => {
  // Fix bins to account for timezone, daylight savings, and after-midnight games
  const TIME_OFF_ITEMS = dayjs.duration(4, "hours").asMilliseconds();
  // Better visual alignment
  const TIME_OFF_VISUAL = dayjs.duration(0, "hours").asMilliseconds();

  const minDate = dayjs(data[0].x).startOf("day");
  const maxDate = dayjs(data[data.length - 1].x).startOf("day").add(1, "days");

  let dayOff = 0;
  let lastIndex = 0;
  const averages: AveragedNumberPoint[] = [];
  let numEntriesTest = 0;

  // TODO: Rethink this. Didn't think much while coding it

  while (lastIndex < data.length) {
    const currentDate = minDate.add(dayOff, "day");
    dayOff++;

    if (currentDate.isAfter(maxDate)) {
      break;
    }

    // Get entries in this day
    const dayEntries = [];

    for (lastIndex; lastIndex < data.length; lastIndex++) {
      const date = dayjs(data[lastIndex].x + TIME_OFF_ITEMS);

      if (date.isSame(currentDate, "day")) {
        dayEntries.push(data[lastIndex].y);
        numEntriesTest++;
      } else if (date.isAfter(currentDate)) {
        break;
      }
    }

    if (dayEntries.length) {
      averages.push({
        x: currentDate.valueOf() + TIME_OFF_VISUAL,
        y: stats.mean(dayEntries),
        averagedYs: dayEntries,
      });
    }
  }

  return averages;
};
