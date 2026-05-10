import { create } from "zustand";

export type Options = {
  fixedChartBounds: boolean,
};

export type OptionsStore = Options & {
  set: (stateUpdate: Partial<Options>) => void,
};

export const useOptionsStore = create<OptionsStore>((set) => ({
  fixedChartBounds: true,

  set,
}));

export default useOptionsStore;
