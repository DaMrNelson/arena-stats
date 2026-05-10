import { Link, Outlet, useLocation } from "react-router";
import useCoreDataStore from "../context/useCoreDataStore";
import Spinner from "react-bootstrap/Spinner";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import clsx from "clsx";

import styles from "./CoreLayout.module.scss";

export const CoreLoader = () => {
  const coreData = useCoreDataStore(); // TODO: Selector?

  return (
    coreData.isError ?
      <>
        <h1>ERROR</h1>
        <h4>Match Data Error</h4>
        <pre>{JSON.stringify(coreData.matchDataQuery.error)}</pre>
        <h4>Match Data Error</h4>
        <pre>{JSON.stringify(coreData.playerDataQuery.error)}</pre>
        <h4>Champion Data Error</h4>
        <pre>{JSON.stringify(coreData.championDataQuery.error)}</pre>
      </>
    : coreData.isPending ?
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    :
      <CoreLayout />
  )
};

export const CoreLayout = () => {
  const location = useLocation();

  return (
    <div className={styles.layoutContainer}>
      <Navbar className={clsx(styles.navbar, styles.specific)}>
        <Navbar.Brand as={Link} to="/">LoL Arena Stats</Navbar.Brand>
        <Nav className={styles.navPages}>
          <Nav.Link as={Link} to="/" active={location.pathname === "/"}>Hand-Picked Stats</Nav.Link>
          <Nav.Link as={Link} to="/customize" active={location.pathname === "/customize"}>Customize</Nav.Link>
        </Nav>
        <Nav>
          <Nav.Link href="https://github.com/DaMrNelson/arena-stats">View Source</Nav.Link>
          <Nav.Link as={Link} to="/methodology">Methodology</Nav.Link>
        </Nav>
      </Navbar>

      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};

export default CoreLayout;
