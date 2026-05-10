import { useCallback, useContext, useMemo, useState } from "react";
import Form from "react-bootstrap/Form";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Accordion from "react-bootstrap/Accordion";
import Popover from "react-bootstrap/Popover";
import { Typeahead } from "react-bootstrap-typeahead";
import { QuestionCircleFill } from "react-bootstrap-icons";
import _ from "lodash";
import clsx from "clsx";

import styles from "./Sidebar.module.scss";
import SidebarStat from "./SidebarStat";
import StyledRange, { THUMB_SIZE } from "./StyledRange";
import useCoreDataStore from "../context/useCoreDataStore";
import useFilterStore from "../context/useFilterStore";
import useOptionsStore from "../context/useOptionsStore";
import { IndividualFilterSelect, TeamFilterSelect } from "./FilterSelect";
import FilterResultsContext from "../context/FilterResultsContext";
import type { Champion } from "../model/Champion";
import type { Option } from "react-bootstrap-typeahead/types/types";


export const Sidebar = () => {
  const coreData = useCoreDataStore();
  const filters = useFilterStore();
  const options = useOptionsStore();
  const { filterResults, setFilterResults } = useContext(FilterResultsContext);

  // TODO: NOTE: CONTINUE:
  //   1. Upgrade filter for most:
  //     - Exclude entire team if one player do it
  //     - Exclude entire team only if both players do it
  //     - No filter
  //     - Filter out all teams EXCEPT teams with both players doing it
  //     - Filter out all teams EXCEPT teams with one player doing it
  //   2. Similar for ranked. "Exclude unranked players" / "Exclude ranked players"

  // Rank PCT filter
  // Mode: Throttled
  const _setRankPctFilterThrottled = useCallback(
    _.throttle((val) => {
      filters.update({ rankPctFilter: val }, setFilterResults);
    }, 100, { leading: false }
  ), []);
  const [rankPctFilterUI, _setRankPctFilterUI] = useState(filters.rankPctFilter); // Always-updated filter state in the UI (may not have reached the next throttled update yet, aka this is desynced from rankPctFilter)
  const setRankPctFilter = (val: [number, number]) => {
    _setRankPctFilterUI(val);
    _setRankPctFilterThrottled(val);
  }

  // Compute filter stats
  const {
    consideredPlayers,
    totalParticipants, consideredParticipants,
    consideredMatches,
  } = useMemo(() => {
    const consideredPuuids: Record<string, true> = {};
    let totalParticipants = 0;
    let consideredParticipants = 0;
    let consideredMatches = 0;

    // Gather all valid placements
    const allPlacements = [];

    for (const matchRecord of coreData.enhanced?.matchRecords ?? []) {
      let anyParticipantsValid = false;

      for (const participant of matchRecord.body.match.info.participants) {
        totalParticipants++;

        if (filterResults.excludedParticipants.get(participant)) {
          continue;
        }

        allPlacements.push(participant.placement);
        consideredPuuids[participant.puuid] = true;
        consideredParticipants++;
        anyParticipantsValid = true;
      }

      if (anyParticipantsValid) {
        consideredMatches++;
      }
    }

    return {
      consideredPlayers: Object.keys(consideredPuuids).length,
      totalParticipants, consideredParticipants,
      consideredMatches,
    };
  }, [coreData.enhanced]);

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarPad}>
        <div className="mb-4">
          <SidebarStat label="Matches" current={consideredMatches} total={coreData.enhanced?.matchRecords.length} loading={!coreData.isSuccess} estSize={3} />
          <SidebarStat label="Participants" current={consideredParticipants} total={totalParticipants} loading={!coreData.isSuccess} estSize={5} />
          <SidebarStat label="Accounts" current={consideredPlayers} total={coreData.enhanced?.playerRecords.length} loading={!coreData.isSuccess} estSize={5} />
        </div>
      </div>

      <Accordion defaultActiveKey={["filters", "options"]} alwaysOpen>

        <Accordion.Item eventKey="filters" className={clsx(styles.accordionItem, styles.specific)}>
          <Accordion.Header>Filters</Accordion.Header>
          <Accordion.Body>
            <div className="mb-4">
              <IndividualFilterSelect label="Ranking" filterName="ranking"
                text={{
                  include: "Must be Ranked (Solo/Duo)",
                  exclude: "Must Not be Ranked (Solo/Duo)"
                }}
              />
              <TeamFilterSelect label="Stat Runs" filterName="statRuns" />
              <TeamFilterSelect label="Bravery" filterName="bravery" />
              <TeamFilterSelect label="Crowd Fav" filterName="crowdFav" />
              <IndividualFilterSelect label="Author Duo" filterName="authorDuo" />
            </div>

            <div className="mb-4">
              <OverlayTrigger
                placement="right"
                overlay={
                  <Popover id="rank-slider-popover" className="widePopover">
                    <Popover.Header>What does this mean?</Popover.Header>
                    <Popover.Body>
                      <p>
                        Filter participants by their Solo/Duo Rank (5v5 Summoner's Rift).
                      </p>
                      <p className="mb-0">
                        Applied on a per-match basis:
                      </p>
                      <ul style={{ margin: 0, paddingLeft: 12, paddingRight: 2 }}>
                        <li><b>0: </b> <i>Lowest ranked</i> player in the match.</li>
                        <li><b>25: </b> 1/4th of players in the match are ranked lower than this, and 75% are higher.</li>
                        <li><b>75: </b> 3/4th of players in the match are ranked lower than this, and 25% are higher.</li>
                        <li><b>100: </b> <i>Highest ranked</i> player in the match.</li>
                      </ul>
                    </Popover.Body>
                  </Popover>
                }
              >
                <div className={clsx(styles.filterLabelWithQ, filters.ranking !== "include" && "text-muted")}>
                  <span>Solo/Duo Rank (In-Match Pctl)</span>
                  <QuestionCircleFill />
                </div>
              </OverlayTrigger>
              <div style={{ padding: `0 ${THUMB_SIZE / 2}px ${THUMB_SIZE + 5}px ${THUMB_SIZE / 2}px` }}>
                <StyledRange // TODO: Fix optional props showing as required
                  min={0}
                  max={100}
                  step={1}
                  values={rankPctFilterUI}
                  allowOverlap
                  draggableTrack
                  onChange={(val) => setRankPctFilter(val as [number, number])}
                  //onChange={(val) => setRankPctFilterUI(val as [number, number])}
                  //onFinalChange={(val) => setRankPctFilter(val as [number, number])}
                  disabled={ filters.ranking !== "include" }
                />
              </div>
            </div>

            <div>
              <Typeahead
                placeholder="Champion..."
                labelKey="name"
                options={ coreData.res?.championKeysSortedByName.map((champKey) => coreData.res?.championsByKey[champKey] ?? {}) as Option[] } // TODO: Guarantee consistent and alphabetical order
                onChange={ (val) => filters.update({ championKey: (val[0] as Champion)?.key ?? null }, setFilterResults) }
                maxResults={Infinity}
                clearButton // TODO: Fix multiple clear buttons bug
                positionFixed
                flip
              />
              <Typeahead
                placeholder="Role..."
                options={ coreData.res?.championTagsSorted ?? [] }
                onChange={ (val) => filters.update({ championRole: (val[0] as string) ?? null }, setFilterResults) }
                maxResults={Infinity}
                clearButton
                positionFixed
                flip
              />
              <div className={styles.filterLabelWithQ}>
                <Form.Check
                  type="switch"
                  id="role-primary-only"
                  label="Primary role only"
                  checked={filters.championRoleMode === "primary"}
                  onChange={() => filters.update({ championRoleMode: filters.championRoleMode === "primary" ? "any" : "primary" }, setFilterResults) }
                />
                <OverlayTrigger
                  placement="right"
                  overlay={
                    <Popover id="primary-role-filter-popover" className="widePopover">
                      <Popover.Header>Most characters have multiple roles</Popover.Header>
                      <Popover.Body>
                        <p>Eg. Nunu, who is a Tank/Mage.</p>
                        <p>
                          <b>When enabled</b>: the primary role for a character must match.
                          <br/>
                          <b>When disabled</b>: any of a character's roles may match.
                        </p>
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <QuestionCircleFill />
                </OverlayTrigger>
              </div>
            </div>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="options" className={clsx(styles.accordionItem, styles.specific)}>
          <Accordion.Header>Options</Accordion.Header>
          <Accordion.Body>
            <div>
              <Form.Check
                type="switch"
                id="fixed-chart-bounds"
                label="Fixed chart bounds"
                checked={options.fixedChartBounds}
                onChange={ () => options.set({ fixedChartBounds: !options.fixedChartBounds }) }
              />
            </div>
          </Accordion.Body>
        </Accordion.Item>

      </Accordion>
    </div>
  );
};

export default Sidebar;
