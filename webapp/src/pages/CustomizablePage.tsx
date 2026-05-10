import { useState } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { ExclamationDiamond, HandThumbsUp, QuestionCircleFill } from "react-bootstrap-icons";
import clsx from "clsx";

import DashboardCard from "../components/DashboardCard";
import PlacementBar from "../components/graphs/PlacementBar";
import WRPie from "../components/graphs/WRPie";
import RoleWRBar from "../components/graphs/RoleWRBar";
import RolePicksPie from "../components/graphs/RolePicksPie";
import EnemyRankDistBar from "../components/graphs/EnemyRankDistBar";
import EnemyRankTimeSeriesCombo, { type EnemyRankSeriesMode } from "../components/graphs/EnemyRankTimeSeriesCombo";
import ChangeInEnemyRankBar from "../components/graphs/ChangeInEnemyRankBar";
import BraveryRoleDistBar from "../components/graphs/BraveryRoleDistBar";
import BraveryChampionDistTable from "../components/tables/BraveryChampionDistTable";
import RankedWRPie from "../components/graphs/RankedWRPie";
import RankedWRBar from "../components/graphs/RankedWRBar";
import TopChampPicksBar from "../components/graphs/TopChampPicksBar";
import ChampionsTable from "../components/tables/ChampionsTable";
import TopChampPicksWRBar from "../components/graphs/TopChampPicksWRBar";
import Sidebar from "../components/Sidebar";
import styles from "./CustomizablePage.module.scss";
import dashboardStyles from "./Dashboard.module.scss";
import PickModePie from "../components/graphs/PickModePie";


export const CustomizablePage = () => (
  <div className={styles.container}>
    <Sidebar />
    <div className={styles.main}>
      <CustomizableDashboard />
    </div>
  </div>
);

export const CustomizableDashboard = () => {
  const [showCautionDialog, setShowCautionDialog] = useState(true);

  // TODO: Scope these under the graphs they belong to!
  const [includeAltRoles, setIncludeAltRoles] = useState(false);

  const [enemyRankSeriesMode, setEnemyRankSeriesMode] = useState<EnemyRankSeriesMode>("average");
  const [doBraverySimulation, setDoBraverySimulation] = useState(false);

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
    <div className={dashboardStyles.dashboard}>
      <Modal show={showCautionDialog} onHide={ () => setShowCautionDialog(false) }>
        <Modal.Header>
          <Modal.Title><ExclamationDiamond /> Caution <ExclamationDiamond /></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>I was caught off guard by the new arena update and wanted to publish this quickly. As a result this page is of <i>much</i> lower quality than the "Hand-Picked" results page.</p>
          <ul>
            <li>Filters are not compatible with some graphs and may cause weird results, like how filtering for the author duo makes graphs focused on other people go empty.</li>
            <li>I haven't organized it yet</li>
            <li>Performance is pretty bad on this page</li>
            <li>I broke the header stats on the sidebar when I completely redid my approach to filtering.</li>
            <li>This popup was made in like 3 minutes and doesn't remember that it was closed. Half of that time was spent looking for an armadillo icon in my font pack.</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={ () => setShowCautionDialog(false) }>Ok <HandThumbsUp /></Button>
        </Modal.Footer>
      </Modal>

      <Row>
        <Col xs={8}>
          <DashboardCard title="Count by Placement">
            <PlacementBar />
          </DashboardCard>
        </Col>
        <Col xs={4}>
          <DashboardCard title="Win/Loss">
            <WRPie />
          </DashboardCard>
        </Col>
      </Row>
      <Row>
        <Col xs={8}>
          <DashboardCard
            title="WR by Champion Role"
            titleExtra={createAltRolesToggle("alt-roles-1")}
          >
            <RoleWRBar includeAltRoles={includeAltRoles} />
          </DashboardCard>
        </Col>
        <Col xs={4}>
          <DashboardCard
            title="Times Picked by Role"
            titleExtra={createAltRolesToggle("alt-roles-2")}
          >
            <RolePicksPie includeAltRoles={includeAltRoles} />
          </DashboardCard>
        </Col>
      </Row>
      <Row>
        <Col xs={8}>
          <DashboardCard title="Enemy Rank Distribution (Author Duo is Gold)">
            <EnemyRankDistBar />
          </DashboardCard>
        </Col>
        <Col xs={4}>
          <DashboardCard title="WR of Masters+ Players in Gold Lobbies">
            <RankedWRPie tiers={["MASTER", "GRANDMASTER", "CHALLENGER"]} />
          </DashboardCard>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <DashboardCard
            title="Enemy Rank Over Time (Match Average)"
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
                    ["average", "Average"],
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
      <Row>
        <Col xs={8}>
          <DashboardCard title="Change in Enemy Rank Following each Placement">
            <ChangeInEnemyRankBar mode="placement" />
          </DashboardCard>
        </Col>
        <Col xs={4}>
          <DashboardCard title="Change in Enemy Rank (W/L)">
            <ChangeInEnemyRankBar mode="win-loss" />
          </DashboardCard>
        </Col>
      </Row>
      <Row>
        <Col xs={8}>
          <DashboardCard
            title="Bravery Rolls for Author #1 (Owns All Champions)"
            /*subtitle={[
              "Bans per-match have been factored into the 'Official Champion Distribution'.",
              //"\u2022 Bans per-match have been factored into the 'Official Champion Distribution'.",
              //"\u2022 Since Author #1 owns all champions these two measures should be similar.",
            ]}*/
            titleExtra={
              <div style={{ display: "flex", flexDirection: "row", gap: "0.5em" }}>
                <Form.Check
                  type="switch"
                  className={clsx(styles.altRolesToggle, styles.specific)}
                  id="bravery-simulated-rolls"
                  label="Simulate Random Bravery Rolls"
                  checked={doBraverySimulation}
                  onChange={() => setDoBraverySimulation(!doBraverySimulation)}
                />
                <div style={{ width: "1px", height: "1em", background: "var(--bs-body-color)" }} />
                { createAltRolesToggle("alt-roles-3") }
              </div>
            }
          >
            <BraveryRoleDistBar includeAltRoles={includeAltRoles} doBraverySimulation={doBraverySimulation} />
          </DashboardCard>
        </Col>
        <Col xs={4}>
          <DashboardCard title="Bravery Rolls for Author #1 (Owns All Champions)">
            <BraveryChampionDistTable />
          </DashboardCard>
        </Col>
      </Row>
      <Row>
        <Col xs={8}>
          <DashboardCard title="WR by Rank">
            <RankedWRBar />
          </DashboardCard>
        </Col>
        <Col xs={4}>

        </Col>
      </Row>
      <Row>
        <Col xs={6}>
          <DashboardCard title="Pick Rate of Most Frequent Champions (Hint: Exclude Bravery & Crowd Fav)">
            <TopChampPicksBar top={10} />
          </DashboardCard>
        </Col>
        <Col xs={6}>
          <DashboardCard title="Win Rate of Most Frequent Champions (Hint: Exclude Bravery & Crowd Fav)">
            <TopChampPicksWRBar top={10} />
          </DashboardCard>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <DashboardCard title="Champion Stats">
            <ChampionsTable />
          </DashboardCard>
        </Col>
      </Row>
      <Row>
        <Col xs={4}>
          <DashboardCard title="Ive been coding too long to name or place this pie chart">
            <PickModePie />
          </DashboardCard>
        </Col>
      </Row>
    </div>
  );
};

export default CustomizablePage;
