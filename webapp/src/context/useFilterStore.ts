import { create } from "zustand";
import { type FilterResults } from "./FilterResultsContext";
import { applyAllFilters } from "../data/filter";
import useCoreDataStore from "./useCoreDataStore";

export type ChampionRoleMode = "primary" | "any";

/** Filter modes:
 *    - off: Filter is not active
 *    - include: Entries must match this filter.
 *    - exclude: Entries must not match this filter
 */
export type IndividualFilterMode = "off" | "include" | "exclude";
/** Filter modes:
 *    - off: Filter is not active
 *    - include: Individual must match. Determined individually of any team.
 *    - include-1+: Entire team is included if 1+ players match.
 *    - include-2: Both teammates are included if both match, otherwise neither are.
 *    - exclude: Individual must not match. Determined individually of any team.
 *    - exclude-1+: Entire team is included if 1+ players do not match.
 *    - exclude-2: Both teammates are included if both do not match, otherwise neither are.
 */
export type TeamFilterMode = "off" | "include" | "include-1+" | "include-2" | "exclude" | "exclude-1+" | "exclude-2"

export type FilterStoreParameters = {
  ranking: IndividualFilterMode,
  rankPctFilter: [number, number],

  statRuns: TeamFilterMode,
  bravery: TeamFilterMode,
  crowdFav: TeamFilterMode,
  authorDuo: IndividualFilterMode,

  championKey: string | null,
  championRole: string | null,
  championRoleMode: ChampionRoleMode,
};

export type FilterStore = FilterStoreParameters & {
  /** Set filters AND, recalculates FilterResults, and updates the context using the useState setter. */
  update: (stateUpdate: Partial<FilterStoreParameters>, setFilterResults: React.Dispatch<React.SetStateAction<FilterResults>>) => void,

  /** Sets filters WITHOUT updating FilterResults context. */
  set: (stateUpdate: Partial<FilterStoreParameters>) => void,
};

export const useFilterStore = create<FilterStore>((set, get) => ({
  ranking: "off",
  rankPctFilter: [0, 100],

  statRuns: "off",
  bravery: "off",
  crowdFav: "off",
  authorDuo: "off",

  championKey: null,
  championRole: null,
  championRoleMode: "primary",

  update: (stateUpdate, setFilterResults) => {
    set(stateUpdate);
    const newFilters = get();
    const filterResults = applyAllFilters(newFilters, useCoreDataStore.getState());
    setFilterResults(filterResults);
  },

  set: (stateUpdate) => {
    set(stateUpdate);
  },
}));

export default useFilterStore;
