import Placeholder from "react-bootstrap/Placeholder";

import styles from "./SidebarStat.module.scss";


export type SidebarStatProps = {
  /** Primary label */
  label: string,
  /** Current value */
  current?: number,
  /** Total value */
  total?: number,

  /** If true, displays a glowing placeholder instead */
  loading?: boolean,
  /** If set and loading=true, this is the ch width of the placeholder (default 3) */
  estSize?: number
};

const DEFAULT_EST_SIZE = 3;

export const SidebarStat = ({ label, current, total, loading, estSize }: SidebarStatProps) => (

  <div className={styles.container}>
    <span className={styles.label}>{label}</span>
    { loading ?
      <GlowingPlaceholder estSize={(estSize ?? DEFAULT_EST_SIZE) * 2 + 1 + 5} />
    :
      <>
        <span className={styles.current}>{ current?.toLocaleString() }</span>
        <span className={styles.divider}>/</span>
        <span className={styles.total}>{ total?.toLocaleString() }</span>
        <span className={styles.percent}>(
          {
            ((current ?? 0) / (total ?? 1)).toLocaleString(undefined, {
              style: "percent",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })
          }
        )</span>
      </>
    }
  </div>
);

const GlowingPlaceholder = ({ estSize }: { estSize?: number }) => (
  <Placeholder animation="glow">
    <Placeholder style={{ width: `${estSize ?? DEFAULT_EST_SIZE}ch` }} />
  </Placeholder>
);

export default SidebarStat;
