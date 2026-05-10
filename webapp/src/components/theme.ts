// TODO: License?

/** Copied from ChartJS source */
export const CHARTJS_DEFAULT_COLORS = [
  'rgb(54, 162, 235)',
  'rgb(255, 99, 132)',
  'rgb(255, 159, 64)',
  'rgb(255, 205, 86)',
  'rgb(75, 192, 192)',
  'rgb(153, 102, 255)',
  'rgb(201, 203, 207)'
];
/** Copied from ChartJS source */
export const CHARTJS_DEFAULT_COLORS_BG = CHARTJS_DEFAULT_COLORS.map((color)=>color.replace('rgb(', 'rgba(').replace(')', ', 0.5)'));

export const COLOR_WIN = 'rgb(54, 162, 235)';
export const COLOR_WIN_BG = 'rgba(54, 162, 235, 0.5)';
export const COLOR_LOSS = 'rgb(255, 99, 132)';
export const COLOR_LOSS_BG = 'rgba(255, 99, 132, 0.5)';
