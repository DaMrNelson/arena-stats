import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useEffect, useState, type PropsWithChildren } from "react";
import type { MatchRecord, PlayerRecord } from "../model/Record";
import { parseJsonl } from "../data/jsonl";
import { useCoreDataStore } from "../context/useCoreDataStore";
import FilterResultsContext, { createEmptyFilterResults } from "../context/FilterResultsContext";
import { applyAllFilters } from "../data/filter";
import useFilterStore from "../context/useFilterStore";

const coreDataClient = new QueryClient();

export const CoreDataLoader = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={coreDataClient}>
    <CoreDataClient>
      {children}
    </CoreDataClient>
  </QueryClientProvider>
);

export const CoreDataClient = ({ children }: PropsWithChildren) => {
  const setCoreData = useCoreDataStore((state) => state.set);
  const [filterResults, setFilterResults] = useState(createEmptyFilterResults());

  const matchDataQuery = useQuery({
    queryKey: ["match-data"],
    queryFn: () =>
      fetch(`${import.meta.env.BASE_URL}db/target_matches.jsonl.gz`).then((res) =>
        parseJsonl<MatchRecord>(res)
      ),
    staleTime: Infinity,
  });

  const playerDataQuery = useQuery({
    queryKey: ["player-data"],
    queryFn: () =>
      fetch(`${import.meta.env.BASE_URL}db/players.jsonl.gz`).then((res) =>
        parseJsonl<PlayerRecord>(res)
      ),
    staleTime: Infinity,
  });

  const championDataQuery = useQuery({
    queryKey: ["champion-data"],
    queryFn: () =>
      fetch(`${import.meta.env.BASE_URL}res/dragontail/current/data/en_US/champion.json`).then((res) =>
        res.json()
      ),
    staleTime: Infinity,
  });

  // Update store when the status of the queries changes
  useEffect(() => { // TODO: Can I useMemo this? I don't like that its delayed by a frame
    console.log("Core data changed");
    const isSuccess = matchDataQuery.isSuccess && playerDataQuery.isSuccess && championDataQuery.isSuccess;
    const isPending = matchDataQuery.isPending || playerDataQuery.isPending || championDataQuery.isPending;
    const isError = !isPending && (matchDataQuery.isError || playerDataQuery.isError || championDataQuery.isError);

    const coreData = setCoreData({
      isSuccess, isPending, isError,
      matchDataQuery, playerDataQuery, championDataQuery,
    }, true);
    const filters = useFilterStore.getState();
    const filterResults = applyAllFilters(filters, coreData);
    setFilterResults(filterResults);
  // TODO: The below won't work if refetching is ever used
  }, [
    matchDataQuery.status, playerDataQuery.status, championDataQuery.status,
    setCoreData,
  ]);

  return (
    <FilterResultsContext.Provider value={{ filterResults, setFilterResults }}>
      {children}
    </FilterResultsContext.Provider>
  );
};


export default CoreDataLoader;
