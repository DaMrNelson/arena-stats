import { useMemo, useState } from "react";
import Form from "react-bootstrap/Form";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import Container from "react-bootstrap/Container";
import { Link } from "react-router";
import clsx from "clsx";

import RoleWRBar from "../components/graphs/RoleWRBar";
import styles from "./CustomizablePage.module.scss";
import dashboardStyles from "./Dashboard.module.scss";
import { QuestionCircleFill } from "react-bootstrap-icons";
import DashboardCard from "../components/DashboardCard";
import RolePicksPie from "../components/graphs/RolePicksPie";
import useCoreDataStore from "../context/useCoreDataStore";
import FeaturedStat from "../components/FeaturedStat";
import { EnemyRankTimeSeriesCombo, type EnemyRankSeriesMode } from "../components/graphs/EnemyRankTimeSeriesCombo";
import EnemyRankDistBar from "../components/graphs/EnemyRankDistBar";
import RankedWRPie from "../components/graphs/RankedWRPie";
import BraveryRoleDistBar from "../components/graphs/BraveryRoleDistBar";
import BraveryChampionDistTable from "../components/tables/BraveryChampionDistTable";
import TopChampPicksFeaturedStat from "../components/graphs/TopChampPicksFeaturedStat";
import PickModePie from "../components/graphs/PickModePie";
import { applyAllFilters } from "../data/filter";
import useFilterStore from "../context/useFilterStore";
import { createEmptyFilterResults, FilterResultsContext, type FilterResults } from "../context/FilterResultsContext";
import RankedPresenceFeaturedStat from "../components/graphs/RankedPresenceFeaturedStat";
import PickModeWRBar from "../components/graphs/PickModeWRBar";
import PickModePlacementBar from "../components/graphs/PickModePlacementBar";
import StatAnvilPlacementBar from "../components/graphs/StatAnvilPlacementBar";
import StatAnvilWRBar from "../components/graphs/StatAnvilWRBar";
import StatAnvilPie from "../components/graphs/StatAnvilPie";

export const HandPickedPage = () => (
  <HandPickedDashboard />
);

export const HandPickedDashboard = () => {
  const coreData = useCoreDataStore();

  const [includeAltRoles, setIncludeAltRoles] = useState(false);
  const [enemyRankSeriesMode, setEnemyRankSeriesMode] = useState<EnemyRankSeriesMode>("average");

  const filterResults_ExcludeAuthors: FilterResults = useMemo(() => {
    if (coreData.enhanced == null) {
      return createEmptyFilterResults();
    }

    return applyAllFilters({
      ...useFilterStore.getInitialState(), // TODO: Does this work? I've never used it before.
      authorDuo: "exclude",
    }, coreData);
  }, [coreData, coreData.enhanced]);

  const createAltRolesToggle = (id: string) => (
    <Form.Check
      type="switch"
      className={clsx(styles.altRolesToggle, styles.specific)}
      id={id}
      label={
        <OverlayTrigger
          overlay={
            <Popover id="primary-role-filter-popover" className="widePopover">
              <Popover.Header>Most characters have multiple roles</Popover.Header>
              <Popover.Body>
                <p>Eg. Nunu, who is a Tank/Mage.</p>
                <p><b>When enabled</b>: only the primary role for a character is considered.</p>
                <p><b>When disabled</b>: all roles for a character are considered individually. For example, if a Tank/Mage gets wins it counts as a win both towards the Tank and to the Mage categories.</p>
              </Popover.Body>
            </Popover>
          }
        >
          <span>
            Primary Role Only <QuestionCircleFill />
          </span>
        </OverlayTrigger>
      }
      checked={!includeAltRoles}
      onChange={() => setIncludeAltRoles(!includeAltRoles)}
    />
  );

  return (
    <div className={dashboardStyles.dashboard} style={{ padding: 0 }}>
      <Container>
        <Row style={{ margin: "1em 0", paddingBottom: 0 }}>
          <Col xs={4}>
            <FeaturedStat
              val="1"
              label="Duo"
              sublabel="Playing exclusively with each other."
            />
          </Col>
          <Col xs={4}>
            <FeaturedStat
              val={coreData.enhanced?.matchRecords.length}
              label="Arenas Matches"
              sublabel="No breaks for other gamemodes, ever."
            />
          </Col>
          <Col xs={4}>
            <FeaturedStat
              //val={(coreData.enhanced?.matchRecords.length ?? 0) * 16}
              val={coreData.enhanced?.playerRecords.length}
              label="Unique Players"
              sublabel={`Avg of ${((coreData.enhanced?.playerRecords.length ?? 0) / (coreData.enhanced?.matchRecords.length ?? 1 )).toLocaleString(undefined, { maximumFractionDigits: 1 })} new players per match.`}
            />
          </Col>
        </Row>
      </Container>

      <div className="text-center" style={{ margin: "1em 0" }}>
        <p style={{ fontStyle: "italic" }}>
          The author duo has been excluded from most charts as our presence in every match makes us an outlier and would lead to skewed data (eg. increased Mage pick rate).
          <br/>
          See <Link to="/customize">Customize</Link> to set your own filters.
        </p>
      </div>


      <SectionHeader
        title="Meta Slavery"
        subtitle="Am I the only one tired of playing against the same dozen champions?"
        //subtitle="It was fun for the first 6 months"
        //subtitle="Results that will surprise no one"
        //subtitle="Fighters Reign Supreme"
        style={{ marginTop: "4em" }}
      />

      <FilterResultsContext value={{ filterResults: filterResults_ExcludeAuthors, setFilterResults: () => {} }}>
        <Row>
          <Col xs={12} lg={6}>
            <DashboardCard
              title="WR by Champion Role"
              titleExtra={createAltRolesToggle("alt-roles-1")}
            >
              <RoleWRBar includeAltRoles={includeAltRoles} />
            </DashboardCard>
          </Col>
          <Col xs={12} lg={3}>
            <DashboardCard
              title="Pick Rate by Role"
              titleExtra={createAltRolesToggle("alt-roles-2")}
            >
              <RolePicksPie includeAltRoles={includeAltRoles} />
            </DashboardCard>
          </Col>
          <Col xs={12} lg={3}>
            <DashboardCard title="Top Picks">
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-evenly", height: "100%" }}>
                <TopChampPicksFeaturedStat top={10} alwaysExcludeBravery />
                <TopChampPicksFeaturedStat top={20} alwaysExcludeBravery />
              </div>
            </DashboardCard>
          </Col>
        </Row>
      </FilterResultsContext>


      <SectionHeader
        title="Bravery, Crowd Favorites, and Stat Anvil Runs"
        subtitle="Degen gamblers or brave pioneers?"
      />
      <FilterResultsContext value={{ filterResults: filterResults_ExcludeAuthors, setFilterResults: () => {} }}>
        <Row>
          <Col xs={12} lg={6}>
            <DashboardCard title="Placement by Pick Type">
              <PickModePlacementBar />
            </DashboardCard>
          </Col>
          <Col xs={6} lg={3}>
            <DashboardCard title="WR by Pick Type">
              <PickModeWRBar fixedChartBounds />
            </DashboardCard>
          </Col>
          <Col xs={6} lg={3}>
            <DashboardCard title="Pick Types">
              <PickModePie />
            </DashboardCard>
          </Col>
        </Row>

        <Row>
          <Col xs={12} lg={6}>
            <DashboardCard title="Placement of Stat Anvil Runners">
              <StatAnvilPlacementBar />
            </DashboardCard>
          </Col>
          <Col xs={6} lg={3}>
            <DashboardCard title="WR of Stat Anvil Runners">
              <StatAnvilWRBar fixedChartBounds />
            </DashboardCard>
          </Col>
          <Col xs={6} lg={3}>
            <DashboardCard title="Frequency of Stat Anvil Runners">
              <StatAnvilPie />
            </DashboardCard>
          </Col>
        </Row>
      </FilterResultsContext>


      <SectionHeader
        title="League of RNG"
        subtitle="Made after I bravery'd into Heimerdinger two games in a row"
      />

      <Row>
        <Col xs={12} lg={8}>
          <DashboardCard
            title="Bravery Rolls for Author #1 (Owns All Champions)"
            titleExtra={createAltRolesToggle("alt-roles-3")}
          >
            <BraveryRoleDistBar includeAltRoles={includeAltRoles} doBraverySimulation={false} />
          </DashboardCard>
        </Col>
        <Col xs={12} lg={4}>
          <DashboardCard title="Bravery Rolls for Author #1 (Owns All Champions)">
            <BraveryChampionDistTable />
          </DashboardCard>
        </Col>
      </Row>


      <SectionHeader
        title="Ranked Stats"
        subtitle="Less relevant to you, but very relevant to me"
      />

      <Row>
        <Col xs={12} lg={6}>
          <DashboardCard title="Enemy Rank Distribution (Author Duo is Gold)">
            <EnemyRankDistBar />
          </DashboardCard>
        </Col>
        <Col xs={12} lg={3}>
          <DashboardCard title="WR of Masters+ Players in Gold Lobbies">
            <RankedWRPie tiers={["MASTER", "GRANDMASTER", "CHALLENGER"]} />
          </DashboardCard>
        </Col>
        <Col xs={12} lg={3}>
          <DashboardCard title="Masters+ Frequency">
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-evenly", height: "100%" }}>
              <RankedPresenceFeaturedStat
                tiers={["MASTER", "GRANDMASTER", "CHALLENGER"]}
                label="Of Matches Had Masters+ Players"
                sublabel="Masters/GM/Challenger"
              />
              <FeaturedStat
                val={(1 / (coreData.enhanced?.playerRecords.length ?? 1e9)).toLocaleString(undefined, { style: "percent", maximumFractionDigits: 2 })}
                label="Of People Cared"
                sublabel="Its me. I care."
              />
            </div>
          </DashboardCard>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <DashboardCard
            title="Enemy Rank Over Time"
            titleExtra={
              <Form>
                <ToggleButtonGroup
                  type="radio"
                  name="rank-time-series-mode"
                  size="sm"
                  defaultValue="average"
                  onChange={ (e) => setEnemyRankSeriesMode(e) }
                >
                  {[
                    ["average", "Match Average"],
                    ["highest", "Highest"],
                    ["lowest", "Lowest"]
                  ].map(([val, label]) => (
                    <ToggleButton
                      key={val}
                      id={`rank-time-series-mode-${val}`}
                      value={val}
                    >
                      {label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Form>
            }
          >
            <EnemyRankTimeSeriesCombo mode={enemyRankSeriesMode} />
          </DashboardCard>
        </Col>
      </Row>

    </div>
  );
};

export const SectionHeader = ({ title, subtitle, ...props }: { title: string, subtitle: string } & React.ComponentProps<'div'>) => (
  <div style={{ padding: "4em 1em 1em 1em", ...(props.style ?? {}) }} {...props}>
    <div style={{ borderTop: "1px solid gray", borderBottom: "1px solid gray", padding: "1em 0" }}>
      <h5 className="display-5 text-center">{title}</h5>
      <div className="text-center" style={{ marginBottom: "0.5em" }}>{subtitle}</div>
    </div>
  </div>
);

export default HandPickedPage;
