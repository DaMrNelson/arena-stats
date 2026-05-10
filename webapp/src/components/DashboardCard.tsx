import type { PropsWithChildren, ReactNode } from "react";
import Card from "react-bootstrap/Card";
import clsx from "clsx";

import styles from "./DashboardCard.module.scss";


export type DashboardCardProps = {
  title: string,
  titleExtra?: ReactNode,
  subtitle?: string | string[],
};

export const DashboardCard = ({ title, titleExtra, subtitle, ...props }: PropsWithChildren<DashboardCardProps>) => (
  <Card>
    <Card.Body className={clsx(styles.body, styles.specific)}>
      <div className={styles.titleRow}>
        <div className={styles.titles}>
          <span className={styles.title}>
            {title}
          </span>
          { subtitle != null && subtitle.length !== 0 &&
            <div className={styles.subtitles}>
              { (typeof(subtitle) === "string" ? [subtitle] : subtitle).map((subtitleLine, i) => (
                // TODO: Isn't using key={i} bad practice?
                <div key={i}>
                  {subtitleLine}
                </div>
              )) }
            </div>
          }
        </div>
        { titleExtra && <span>{titleExtra}</span> }
      </div>

      <div className={styles.content}>
        {props.children}
      </div>
    </Card.Body>
  </Card>
);

export default DashboardCard;
