import { useContext, useMemo } from "react";
import Table from "react-bootstrap/Table";
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";

import FilterResultsContext from "../../context/FilterResultsContext";
import useCoreDataStore from "../../context/useCoreDataStore";
import { AUTHOR_OWNS_ALL_CHAMPS_NAME_LOWER } from "../../data/filter";
import { ChevronDown, ChevronUp, Dash } from "react-bootstrap-icons";
import type { Champion } from "../../model/Champion";


type ChampionStats = {
  champ: Champion,
  rolls: number,
}
const columnHelper = createColumnHelper<ChampionStats>()

export const BraveryChampionDistTable = () => {
  const matchRecords = useCoreDataStore((state) => state.enhanced?.matchRecords) ?? [];
  const championsByKey = useCoreDataStore((state) => state.res?.championsByKey) ?? {};
  const { filterResults: { braveryParticipants } } = useContext(FilterResultsContext);

  // Gather counts of actually encountered roles (tags)
  const championStats: ChampionStats[] = useMemo(() => {
    // Count actual rolls
    const champRolls = Object.fromEntries(
      Object.keys(championsByKey).map((champKey) => [
        champKey,
        0
      ])
    );

    for (const matchRecord of matchRecords) {
      for (const participant of matchRecord.body.match.info.participants) {
        // Filter for the author who owns all champions and for bravery
        if (!braveryParticipants.get(participant) || `${participant.riotIdGameName}#${participant.riotIdTagline}`.toLowerCase() !== AUTHOR_OWNS_ALL_CHAMPS_NAME_LOWER) {
          continue;
        }

        // TODO: Exclusions?

        // Find champion role
        champRolls[participant.championId]++;
      };
    }

    // Provide stats
    return Object.values(championsByKey).map((champ) => ({
      champ,
      rolls: champRolls[champ.key],
    }));
  }, [championsByKey]);

  const columns = [
    columnHelper.accessor("champ.name", { header: "Champion" }),
    columnHelper.accessor("rolls", { header: "Rolls" }),
  ];

  const table = useReactTable({
    columns,
    data: championStats,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [
        { id: "rolls", desc: true }
      ]
    }
  });

  return (
    <Table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => {
          return (
            <tr key={headerGroup.id}>
              { headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const isSorted = header.column.getIsSorted();

                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    onClick={ () => canSort ? header.column.toggleSorting() : undefined }
                    style={canSort ? { cursor: "pointer" } : {} }
                  >
                    { flexRender(header.column.columnDef.header, header.getContext()) }
                    { canSort &&
                      <span style={{ marginLeft: "0.5em" }}>
                        {
                          isSorted === "asc" ?
                            <ChevronUp />
                          : isSorted === "desc" ?
                            <ChevronDown />
                          :
                            <Dash />
                        }
                      </span>
                    }
                  </th>
                  );
              }) }
            </tr>
          )
        })}
      </thead>
      <tbody>
        { table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            { row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                { flexRender(cell.column.columnDef.cell, cell.getContext()) }
                </td>
            )) }
          </tr>
        )) }
      </tbody>
    </Table>
  );
};

export default BraveryChampionDistTable;
