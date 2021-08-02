import { CircularProgress } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import {isMobile} from "react-device-detect";
import { createUseStyles } from "react-jss";
import { fetchActivity } from "../../api/global";
import moment from "moment";
import ActivityGroup from "../../components/ActivityGroup";
import searchIcon from "../Tasks/images/search.svg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { longhandRelative, Breakpoints } from "../../utils/utils";

function datesGroupByComponent(dates, token) {
  return dates.reduce(function (val, obj) {
    let comp = moment(obj["date"]).format(token);
    (val[comp] = val[comp] || []).push(obj);
    return val;
  }, {});
}

const useStyles = createUseStyles({
  container: {
    marginTop: 28,
    color: "#0B0F3B",
  },
  activityTitle: {
    color: "white",
  },
  searchInput: {
    border: "none",
    backgroundColor: "transparent",
    boxShadow: "none !important",
    width: "100%",
    color: "white",
    lineHeight: "15px",
    fontSize: 12,
    "&::placeholder": {
      color: "rgba(255, 255, 255, 0.5)",
    },
  },
  dateInput: {
    border: "none",
    backgroundColor: "transparent",
    color: "white",
    fontSize: "12px",
    linHeight: "15px",
    fontWeight: 600,
    padding: "4px",
    width: "82px",
    textDecoration: "underline",
    cursor: "pointer",
  },
  searchContainer: {
    marginTop: "16px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "space-between",
    height: 32,
  },
  searchIcon: {
    margin: "8px",
    width: "12px",
    height: "12px",
    marginRight: "8px",
  },
  searchIconContainer: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    flex: 1,
  },
  filterContainer: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    userSelect: "none",
    position: "relative",
  },
  filterItemsContainer: {
    padding: "7px",
    borderRadius: "4px",
    backgroundColor: "#00B6F0",
    position: "absolute",
    left: 0,
    top: "28px",
    fontSize: "12px",
    color: "white",
    zIndex: 11,
  },
  toDate: {
    color: "white",
    fontSize: "12px",
    marginRight: "6px",
    marginLeft: "8px",
  },
  filterCaret: { width: "9px", marginRight: "8px", transition: "all 0.2s" },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    container: {
      maxWidth: "1050px",
      color: "#0B0F3B",
    },
    searchContainer: {
      marginTop: "16px",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: "4px",
      display: "flex",
      alignItems: "center",
      flexWrap: "nowrap",
      justifyContent: "space-between",
    },
  },
  [`@media (max-width: ${Breakpoints.sm}px)`]: {
    searchContainer: {
      marginTop: 0,
      backgroundColor: "rgba(0, 0, 0, 0.3)"
    },
    container: {
      marginTop: 0,
    }
  }
});

export default function ActivityView({ match }) {
  const [activity, setActivity] = useState(null);
  const [search, setSearch] = useState("");
  const [activityData, setActivityData] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const styles = useStyles();

  useEffect(() => {
    moment.locale("en", {
      relativeTime: longhandRelative,
    });
    fetchActivity()
      .then((response) => response.json())
      .then((data) => {
        setStartDate(new Date(data[data.length - 1].date));
        setEndDate(new Date(data[0].date));
        setActivityData(data);
        setActivity(datesGroupByComponent(data, "W"));
      });
  }, []);

  useEffect(() => {
    if (activityData) {
      const newActivity = activityData.slice();
      const filteredDates = newActivity.filter((item) => {
        return (
          new Date(item.date) >= new Date(startDate) &&
          new Date(item.date) <= new Date(endDate)
        );
      });
      setActivity(datesGroupByComponent(filteredDates, "W"));
    }
  }, [startDate, endDate, activityData]);

  return (
      <div className={styles.container}>
        {
          !isMobile &&
          <div className={styles.activityTitle}>Activities</div>
        }
        {activity && (
          <div className={styles.searchContainer}>
            <div className={styles.searchIconContainer}>
              <img
                src={searchIcon}
                alt="search"
                className={styles.searchIcon}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={"Search by username"}
                className={styles.searchInput}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{ color: "white", fontSize: "12px", marginRight: "6px" }}
              >
                From:{" "}
              </div>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                customInput={<input type="text" className={styles.dateInput} />}
              />
              <div className={styles.toDate}>To: </div>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                customInput={
                  <input
                    type="text"
                    style={{
                      marginRight: "8px",
                    }}
                    className={styles.dateInput}
                  />
                }
              />
            </div>
          </div>
        )}
        {activity ? (
          Object.keys(activity)
            .reverse()
            .map((item) => (
              <ActivityGroup activity={activity} item={item} search={search} />
            ))
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "88px",
            }}
          >
            <CircularProgress style={{ color: "white" }} />
          </div>
        )}
      </div>
  );
}
