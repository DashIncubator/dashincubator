import React, { useState } from "react";
import ActivityItem from "./ActivityItem";
import moment from "moment";
import caretDown from "../views/Tasks/images/caretDown.svg";
import { Badge, makeStyles } from "@material-ui/core";
import { createUseStyles } from "react-jss";
import {Breakpoints} from "../utils/utils";

const useStyles = makeStyles((theme) => ({
  customBadge: { backgroundColor: "white" },
  [`@media (max-width: ${Breakpoints.sm}px)`]: {
    customBadge: {
      backgroundColor: "rgb(0, 0, 0, 0.6)",
      color: "white"
    }
  }
}));

const useStyles2 = createUseStyles({
  activityItem: {
    padding: "8px",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  },
});

export default function ActivityGroup({ activity, item, search }) {
  const [hide, setHide] = useState(false);
  const classes = useStyles();
  const styles = useStyles2();

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: "32px",
          marginBottom: "24px",
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={() => setHide(!hide)}
      >
        <Badge
          badgeContent={activity[item].length}
          color={"#fff"}
          classes={{ badge: classes.customBadge }}
        />
        <div
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "white",
            marginLeft: "20px",
          }}
        >
          {`Week of ${moment()
            .isoWeek(item - 1)
            .format("MMM Do, YYYY")}`}
        </div>
        <img
          src={caretDown}
          alt="toggle"
          style={{
            marginLeft: "8px",
            transition: "all 0.2s",
            transform: hide ? "rotate(0deg)" : "rotate(-180deg)",
          }}
        />
      </div>

      {!hide &&
        activity[item]
          //eslint-disable-next-line
          .filter((act) => {
            if (act.sourceUser) {
              if (act.destinationUser) {
                return (
                  act.sourceUser.username
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                  act.destinationUser.username
                    .toLowerCase()
                    .includes(search.toLowerCase())
                );
              } else {
                return act.sourceUser.username
                  .toLowerCase()
                  .includes(search.toLowerCase());
              }
            }
          })
          .map((entry) => (
            <div className={styles.activityItem}>
              <ActivityItem item={entry} global noMarginTop search={search} />
            </div>
          ))}
    </div>
  );
}
