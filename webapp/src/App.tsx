import { HashRouter, Route, Routes } from "react-router";
import { Chart as ChartJS } from "chart.js/auto";
import ChartJSTrendline from "chartjs-plugin-trendline";
import ChartJSDataLabels from "chartjs-plugin-datalabels";
import ChartJSAnnotation from "chartjs-plugin-annotation";
import { BarWithErrorBarsController, BarWithErrorBar } from "chartjs-chart-error-bars";
import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import duration from "dayjs/plugin/duration";

import CoreDataLoader from "./components/CoreDataLoader";
import HandPickedPage from "./pages/HandPickedPage";
import CustomizablePage from "./pages/CustomizablePage";
import MethodologyPage from "./pages/Methodology";
import { CoreLoader } from "./layout/CoreLayout";

ChartJS.register(
  ChartJSTrendline, ChartJSDataLabels, ChartJSAnnotation,
  BarWithErrorBarsController, BarWithErrorBar,
);
dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);


export const App = () => (
  <CoreDataLoader>
    <HashRouter>
      <Routes>
        <Route element={<CoreLoader />}>
          <Route path="/" element={<HandPickedPage />} />
          <Route path="/customize" element={<CustomizablePage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
        </Route>
      </Routes>
    </HashRouter>

  </CoreDataLoader>
);

export default App;
