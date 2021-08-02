import React, { useEffect, useState, useRef } from "react";
import { createUseStyles } from "react-jss";
import MainLayout from "../../layouts/MainLayout";
import searchIcon from "../Tasks/images/search.svg";
import caretDown from "../Tasks/images/caretDown.svg";
import { getCompletedTasks } from "../../api/tasksApi";
import { CircularProgress } from "@material-ui/core";
import useOutsideAlerter, { taskTypes, truncate } from "../../utils/utils";
import { Breakpoints } from "../../utils/breakpoint";

import moment from "moment";
import UserAvatar from "../../components/UserAvatar";
import PayoutTaskView from "../PayoutTask";
import { getAdminsSimple } from "../../api/usersApi";
import check from "../Tasks/images/check.svg";
import checked from "../Tasks/images/checked.svg";
import { isMobile } from "react-device-detect";

const getHighlightedText = (text, highlight) => {
  const parts = text.split(new RegExp(`(${highlight})`, "gi"));
  return (
    <span>
      {parts.map((part) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span style={{ backgroundColor: "#eaf194" }}>{part}</span>
        ) : (
          part
        )
      )}
    </span>
  );
};

const useStyles = createUseStyles({
  container: {
    maxWidth: "100vw",
    margin: "auto",
    padding: "0 24px",
    marginTop: "32px",
    color: "#0B0F3B",
    paddingBottom: "24px",
  },
  header: {
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: 600,
    letterSpacing: "0.1em",
    fontSize: "12px",
    lineHeight: "15px",
  },
  inputContainer: {
    marginTop: "16px",
    display: "flex",
    alignItems: "center",
    borderRadius: "4px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  searchInput: {
    height: "100%",
    width: "100%",
    backgroundColor: "transparent",
    border: "none",
    outline: "none",
    boxShadow: "none !important",
    color: "white",
    "&::placeholder": {
      color: "rgba(255, 255, 255, 0.5)",
    },
  },
  dropdownContainer: {
    display: "flex",
    alignItems: "center",
    color: "white",
    fontWeight: 600,
    fontSize: "12px",
    flexShrink: 0,
    cursor: "pointer",
    userSelect: "none",
    position: "relative",
  },
  loaderContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "48px",
  },
  taskContainer: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: "8px 16px 8px 16px",
    borderRadius: "4px",
    marginBottom: "8px",
    cursor: "pointer",
  },
  taskPaid: {
    fontSize: "10px",
    lineHeight: "12px",
    width: "48px",
    marginRight: "8px",
    flexShrink: 0,
  },
  taskBountyTitle: {
    fontWeight: 600,
    fontSize: "10px",
    lineHeight: "12px",
    marginRight: "8px",
    width: "64px",
    flexShrink: 0,
  },
  taskType: {
    fontSize: "10px",
    lineHeight: "12px",
    width: "60px",
    marginRight: "8px",
    flexShrink: 0,
  },
  taskDescription: {
    fontSize: "14px",
    lineHeight: "40px",
    fontWeight: 600,
    width: "100%",
    marginRight: "8px",
  },
  taskPayout: {
    fontSize: "10px",
    lineHeight: "12px",
    width: "50px",
    marginRight: "8px",
  },
  taskDate: {
    width: "64px",
    fontSize: "10px",
    lineHeight: "12px",
    color: "rgba(11, 15, 59, 0.5)",
    marginRight: "8px",
  },
  dropdownContent: {
    padding: "7px",
    borderRadius: "4px",
    backgroundColor: "#00B6F0",
    position: "absolute",
    left: 0,
    top: "28px",
    fontSize: "12px",
    color: "white",
    width: "100px",
    zIndex: 11,
  },
  detailsContainerFlex: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
  },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    detailsContainerFlex: {
      display: "flex",
      alignItems: "center",
      flexWrap: "nowrap",
    },
    taskBountyTitle: {
      fontWeight: 600,
      fontSize: "10px",
      lineHeight: "12px",
      marginRight: "8px",
      width: "106px",
      flexShrink: 0,
    },
    taskDescription: {
      fontSize: "14px",
      lineHeight: "18px",
      fontWeight: 600,
      width: "100%",
      marginRight: "8px",
    },
  },
  [`@media (min-width: ${Breakpoints.lg}px)`]: {
    container: {
      maxWidth: 1600,
      margin: "auto",
      padding: "0 88px",
      marginTop: 32,
      color: "#0B0F3B",
      paddingBottom: "24px",
    },
  },
});

export default function PaymentsView({ match }) {
  const styles = useStyles();
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTypes, setSearchTypes] = useState(taskTypes);
  const [searchingTypes, setSearchingTypes] = useState(false);
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [admins, setAdmins] = useState(null);
  const typeRef = useRef();
  const userRef = useRef();

  useOutsideAlerter(typeRef, () => setSearchingTypes(false));
  useOutsideAlerter(userRef, () => setSearchingUsers(false));

  useEffect(() => {
    /*moment.locale("en", {
      relativeTime: shorthandRelative,
    });*/
    setLoading(true);
    getCompletedTasks()
      .then((result) => result.json())
      .then((data) => {
        setLoading(false);
        setTasks(data);
      });
  }, []);

  useEffect(() => {
    getAdminsSimple()
      .then((res) => res.json())
      .then((data) => setAdmins(data));
  }, []);

  const filteredTasks = tasks?.filter(
    (task) =>
      (task.bountyTitle.toUpperCase().includes(search.toUpperCase()) ||
        task.description.toUpperCase().includes(search.toUpperCase())) &&
      searchTypes.includes(task.taskType) &&
      (searchUsers.length > 0
        ? searchUsers
            .map((user) => user?.username)
            .includes(task.approvedAdmin?.username)
        : true)
  );

  const modifyType = (category) => {
    const newCategories = searchTypes.slice();
    const catIndex = newCategories.indexOf(category);
    if (catIndex >= 0) {
      newCategories.splice(catIndex, 1);
      setSearchTypes(newCategories);
    } else {
      newCategories.push(category);
      setSearchTypes(newCategories);
    }
  };

  const modifyUsers = (category) => {
    const newCategories = searchUsers.slice();
    const catIndex = newCategories.indexOf(category);
    if (catIndex >= 0) {
      newCategories.splice(catIndex, 1);
      setSearchUsers(newCategories);
    } else {
      newCategories.push(category);
      setSearchUsers(newCategories);
    }
  };

  return (
    <MainLayout match={match}>
      <PayoutTaskView
        open={showPaymentModal}
        onClose={(e, data) => {
          if (data) {
            setShowPaymentModal(false);
            setSelectedTask(null);
            const newTasks = tasks.slice();
            const taskIndex = newTasks.findIndex((t) => t._id === data.id);
            newTasks[taskIndex].isPaid = true;
            newTasks[taskIndex].contributorTransactionID =
              data.contributorTransactionID;
            newTasks[taskIndex].adminTransactionID = data.adminTransactionID;
            setTasks(newTasks);
          } else {
            setShowPaymentModal(false);
            setSelectedTask(null);
          }
        }}
        task={selectedTask}
      />
      <div className={styles.container}>
        <div className={styles.header}>COMPLETED TASKS</div>
        <div className={styles.inputContainer}>
          <img src={searchIcon} alt="search" style={{ padding: "9px" }} />
          <input
            className={styles.searchInput}
            placeholder={"Find a completed task"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div
            className={styles.dropdownContainer}
            onClick={() => setSearchingTypes(true)}
          >
            {searchingTypes && (
              <div className={styles.dropdownContent} ref={typeRef}>
                {taskTypes.map((tag, i) => (
                  <div
                    style={{
                      marginTop: i > 0 && "8px",
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    onClick={() => modifyType(tag)}
                  >
                    <img
                      src={
                        searchTypes.find((cat) => cat === tag) ? checked : check
                      }
                      alt="check"
                      style={{
                        marginRight: "6px",
                        width: "16px",
                        height: "16px",
                      }}
                    />
                    {tag === "spec"
                      ? "Spec"
                      : tag === "production"
                      ? "Production"
                      : tag === "qa"
                      ? "QA"
                      : null}
                  </div>
                ))}
              </div>
            )}
            <img src={caretDown} alt="dropdown" />
            <div style={{ marginLeft: "8px" }}>
              {isMobile ? "Types" : "Filter types"}
            </div>
          </div>
          <div
            className={styles.dropdownContainer}
            style={{
              marginLeft: isMobile ? "8px" : "20px",
              paddingRight: "9px",
            }}
            onClick={() => setSearchingUsers(true)}
          >
            {searchingUsers && (
              <div className={styles.dropdownContent} ref={userRef}>
                {admins.map((tag, i) => (
                  <div
                    style={{
                      marginTop: i > 0 && "8px",
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    onClick={() => modifyUsers(tag)}
                  >
                    <img
                      src={
                        searchUsers.find((cat) => cat === tag) ? checked : check
                      }
                      alt="check"
                      style={{
                        marginRight: "6px",
                        width: "16px",
                        height: "16px",
                      }}
                    />
                    {tag.username}
                  </div>
                ))}
              </div>
            )}
            <img src={caretDown} alt="dropdown" />
            <div style={{ marginLeft: "8px" }}>
              {isMobile ? "Users" : "Filter users"}
            </div>
          </div>
        </div>
        <div style={{ marginTop: "12px" }}>
          {loading ? (
            <div className={styles.loaderContainer}>
              <CircularProgress style={{ color: "white" }} />
            </div>
          ) : (
            filteredTasks?.map((task) => (
              <div
                className={styles.taskContainer}
                onClick={() => {
                  setSelectedTask(task);
                  setShowPaymentModal(true);
                }}
              >
                <div className={styles.detailsContainerFlex}>
                  <div className={styles.taskDate} style={{ flexShrink: 0 }}>
                    {moment(task.approvedDate).format("MM.DD.YYYY")}
                  </div>
                  {/*<div
                    style={{
                      fontWeight: task.isPaid ? "normal" : 600,
                      color: task.isPaid ? "#0B0F3B" : "#AD1D73",
                    }}
                    className={styles.taskPaid}
                  >
                    {task.isPaid ? "Paid" : "Unpaid"}
                  </div>*/}
                  <div className={styles.taskBountyTitle}>
                    {getHighlightedText(truncate(task.bountyTitle, 20), search)}
                  </div>
                  <div className={styles.taskType}>
                    {task.taskType === "spec"
                      ? "Spec"
                      : task.taskType === "production"
                      ? "Production"
                      : task.taskType === "qa"
                      ? "QA"
                      : null}
                  </div>
                  <div className={styles.taskDescription}>
                    {getHighlightedText(truncate(task.description, 58), search)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <UserAvatar
                    user={task.approvedContributor}
                    size={"18px"}
                    fontSize={"8px"}
                    lineHeight={"10px"}
                  />
                  <div
                    className={styles.taskPayout}
                    style={{ marginLeft: "8px" }}
                  >
                    {task.isPaid
                      ? `${parseFloat(task.payout).toFixed(3)} Ð`
                      : "--"}
                  </div>
                  <div>
                    <UserAvatar
                      user={task.approvedAdmin}
                      size={"18px"}
                      fontSize={"8px"}
                      lineHeight={"10px"}
                    />
                  </div>
                  <div
                    className={styles.taskPayout}
                    style={{ marginLeft: "8px" }}
                  >
                    {task.isPaid
                      ? `${(parseFloat(task.payout) * 0.1).toFixed(3)} Ð`
                      : "--"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
