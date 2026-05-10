import { useContext, useMemo } from "react";
import Table from "react-bootstrap/Table";
import { ChevronDown, ChevronUp, Dash } from "react-bootstrap-icons";
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type CellContext, type ColumnDefTemplate } from "@tanstack/react-table";
import stats from "stats-lite";

import FilterResultsContext from "../../context/FilterResultsContext";
import useCoreDataStore from "../../context/useCoreDataStore";
import type { Champion } from "../../model/Champion";


type ChampionStats = {
  champ: Champion,

  /** Total number of unique matches this champion was picked */
  matchesPicked: number,
  /** Total number of times this champion was picked */
  totalPicked: number,

  /** Total number of unique matches this champion was banned */
  matchesBanned: number,
  /** Total number of times this champion was banned (can be multiple per match if multiple players ban them) */
  totalBanned: number,

  wins: number,
  losses: number,

  placements: number[],
}
const columnHelper = createColumnHelper<ChampionStats>()

const getCellPercent: ColumnDefTemplate<CellContext<ChampionStats, any>> = ({ getValue }) => (
  fmtPercent(getValue<number | undefined>())
);

const fmtPercent = (p?: number) => (
  p === undefined ?
    "N/A"
  :
    p.toLocaleString(undefined, { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 })
);

export const ChampionsTable = () => {
  const matchRecords = useCoreDataStore((state) => state.enhanced?.matchRecords) ?? [];
  const championData = useCoreDataStore((state) => state.res?.championData) ?? [];
  const { filterResults: { excludedParticipants } } = useContext(FilterResultsContext);

  const columns = [
    columnHelper.accessor("champ.name", { header: "Champion" }),
    columnHelper.accessor(
      (row) => row.wins / (row.wins + row.losses) || undefined,
      { header: "W/L", cell: getCellPercent, sortUndefined: -1 }
    ),
    columnHelper.accessor(
      (row) => (row.matchesPicked + row.matchesBanned) / matchRecords.length || undefined,
      { header: "Pick+Ban", cell: getCellPercent, sortUndefined: -1 }
    ),
    columnHelper.accessor(
      (row) => row.matchesPicked / (matchRecords.length - row.matchesBanned) || undefined,
      { header: "Pick", cell: ({ row, getValue }) => `${fmtPercent(getValue<number>())} (${row.original.matchesPicked})`, sortUndefined: -1 }
    ),
    columnHelper.accessor(
      (row) => row.matchesBanned / matchRecords.length || undefined,
      { header: "Ban", cell: ({ row, getValue }) => `${fmtPercent(getValue<number>())} (${row.original.matchesBanned})`, sortUndefined: -1 }
    ),
    columnHelper.accessor(
      (row) => stats.mean(row.placements) || undefined,
      { header: "Avg Placement", cell: ({ getValue }) => (getValue<number>() ?? 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }), sortUndefined: -1 }
    ),
  ];

  const championStats: ChampionStats[] = useMemo(() => {
    const statsByKey: Record<string, ChampionStats> = Object.fromEntries(
      championData.map((champ) => [
        champ.key,
        {
          champ,
          matchesPicked: 0, totalPicked: 0,
          matchesBanned: 0, totalBanned: 0,
          wins: 0, losses: 0,
          placements: [],
        } as ChampionStats
      ])
    );

    for (const matchRecord of matchRecords) {
      const matchChampPicks: Record<string, true> = {};
      const matchChampBans: Record<string, true> = {};

      // Bans
      for (const team of matchRecord.body.match.info.teams) {
        for (const ban of team.bans) {
          if (ban.championId < 0) {
            continue;
          }

          const champKey = ban.championId.toFixed(0);
          matchChampBans[champKey] = true;
          statsByKey[champKey].totalBanned++;
        }
      }

      // Picks
      for (const participant of matchRecord.body.match.info.participants) {
        if (excludedParticipants.get(participant)) {
          continue;
        }

        const champKey = participant.championId.toFixed(0);
        matchChampPicks[champKey] = true;

        const stats = statsByKey[champKey];
        stats.totalPicked++;
        stats.placements.push(participant.placement);

        if (participant.placement <= 4) {
          stats.wins++;
        } else {
          stats.losses++;
        }
      }

      // Match stats
      for (const champKey of Object.keys(matchChampBans)) {
        statsByKey[champKey].matchesBanned++;
      }

      for (const champKey of Object.keys(matchChampPicks)) {
        statsByKey[champKey].matchesPicked++;
      }
    }

    return Object.values(statsByKey);
  }, [matchRecords, championData]);

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

  // TODO: Component for bootstrap table. This is my second use!

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

export default ChampionsTable;
