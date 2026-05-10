import { createContext } from "react";

import type { Participant } from "../model/Match";

export type FilterResults = {
  excludedParticipants: Map<Participant, true>;

  braveryParticipants: Map<Participant, true>;
  crowdFavParticipants: Map<Participant, true>;
  statRunParticipants: Map<Participant, true>;
};

export type FilterResultsContextType = {
  filterResults: FilterResults,
  setFilterResults: React.Dispatch<React.SetStateAction<FilterResults>>,
}

export const FilterResultsContext = createContext<FilterResultsContextType>(null!);

export const createEmptyFilterResults = () => ({
  excludedParticipants: new Map(),
  braveryParticipants: new Map(),
  crowdFavParticipants: new Map(),
  statRunParticipants: new Map(),
})

export default FilterResultsContext;
