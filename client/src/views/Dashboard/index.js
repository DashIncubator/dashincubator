import React, { useState, useEffect } from "react";
import { createUseStyles } from "react-jss";
import MainLayout from "../../layouts/MainLayout";
import Lottie from "react-lottie";
import * as animationData from "./done.json";
import { fetchDashboard, fetchNotifications } from "../../api/global";
import NotificationItem from "../../components/NotificationItem";
import checkedIcon from "../Home/images/checked.svg";
import { CircularProgress } from "@material-ui/core";
import { readAllNotifications } from "../../api/notificationsApi";
import caretDown from "../Home/images/caretDown.svg";
import { truncate, Breakpoints } from "../../utils/utils";
import { useHistory } from "react-router";
import cx from "classnames";
import {
  BountyLocation,
  ConceptLocation,
  PaymentsLocation,
} from "../../Locations";

const defaultOptions = {
  loop: false,
  autoplay: true,
  animationData: animationData.default,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const useStyles = createUseStyles({
  container: { maxWidth: "100vw", margin: "auto", padding: "0 24px" },
  markAll: {
    marginLeft: "0px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    color: "white",
    fontSize: "12px",
    marginTop: 0,
  },
  mobileHeading: { display: "block", alignItems: "center" },
  notifBadge: {
    backgroundColor: "#AD1D73",
    borderRadius: "4px",
    color: "white",
    marginLeft: "6px",
    minWidth: "15px",
    minHeight: "17px",
    userSelect: "none",
    fontSize: "11px",
    fontWeight: 600,
    lineHeight: "13px",
    padding: "4px",
  },
  header: {
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: 600,
    letterSpacing: "0.1em",
    fontSize: "12px",
    lineHeight: "15px",
    marginTop: "32px",
  },
  dashboardItemContainer: {
    fontSize: "18px",
    fontWeight: 600,
    marginTop: "32px",
  },
  dashboardItemHeader: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    userSelect: "none",
  },
  index: {
    backgroundColor: "#E8E8E8",
    width: "18px",
    height: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    lineHeight: "15px",
    letterSpacing: "0.1em",
    marginRight: "12px",
    flexShrink: 0,
  },
  quote: {
    marginTop: "4px",
    backgroundColor: "#D6E4EC",
    borderRadius: "4px",
    padding: "8px",
    fontSize: "12px",
  },
  leftColumn: { marginRight: "0px", flexShrink: 0, marginTop: "24px" },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    container: { maxWidth: 1600, margin: "auto", padding: "0 88px" },
    markAll: {
      marginRight: "150px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      color: "white",
      fontSize: "12px",
      marginTop: 0,
    },
    mobileHeading: { display: "flex", alignItems: "center" },
    leftColumn: { marginRight: "150px", flexShrink: 0, marginTop: "0px" },
  },
});

export default function DashboardView({ match }) {
  const [notifications, setNotifications] = useState([]);
  const [dashboardItems, setDashboardItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [showPendingConcepts, setShowPendingConcepts] = useState(false);
  const [showPendingContributorModify, setShowPendingContributorModify] =
    useState(false);
  const [
    showPendingContributorCompletion,
    setShowPendingContributorCompletion,
  ] = useState(false);
  const [showPendingAdminApproval, setShowPendingAdminApproval] =
    useState(false);
  const [showUnpaidTasks, setShowUnpaidTasks] = useState(false);
  const history = useHistory();

  const styles = useStyles();

  const setAllRead = async () => {
    setLoading(true);
    await readAllNotifications();
    fetchNotifications()
      .then((data) => data.json())
      .then((result) => {
        setNotifications(result);
        setLoading(false);
      });
  };

  useEffect(() => {
    setDashboardLoading(true);
    fetchDashboard()
      .then((data) => data.json())
      .then((result) => {
        setDashboardItems(result);
        setDashboardLoading(false);
      });
    fetchNotifications()
      .then((data) => data.json())
      .then((result) => setNotifications(result));
  }, []);

  return (
    <MainLayout match={match}>
      <div className={styles.container}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '50px'}}>
      <div className={styles.leftColumn}>
            <>
              <div className={cx(styles.header, styles.mobileHeading)}>
                <div>
                  NOTIFICATIONS{" "}
                  {notifications.filter((notif) => !notif.isRead).length >
                    0 && (
                    <span className={styles.notifBadge}>
                      {notifications.filter((notif) => !notif.isRead).length}
                    </span>
                  )}
                </div>
                {notifications.filter((notif) => !notif.isRead).length > 0 && (
                  <div
                    className={cx(styles.header, styles.markAll)}
                    onClick={() => !loading && setAllRead()}
                  >
                    {loading ? (
                      <div style={{ marginRight: "12px" }}>
                        <CircularProgress
                          style={{ color: "white" }}
                          size={14}
                        />
                      </div>
                    ) : (
                      <img
                        src={checkedIcon}
                        alt="read"
                        style={{
                          marginRight: "8px",
                          width: "14px",
                          height: "14px",
                        }}
                      />
                    )}
                    Mark all notifications as read
                  </div>
                )}
              </div>
              <div style={{ marginTop: "32px" }}>
                {notifications?.map((notification) => (
                  <NotificationItem notification={notification} />
                ))}
              </div>
            </>
        </div>
        <div style={{ width: "100%" }}>
          <div className={styles.header}>DASHBOARD</div>
          <div style={{ marginTop: "32px", color: "white", fontSize: "18px" }}>
            {dashboardLoading || !dashboardItems ? (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress style={{ color: "white" }} />
              </div>
            ) : (dashboardItems.unpaidTasks?.length === 0 ||
                !dashboardItems.unpaidTasks) &&
              (dashboardItems.pendingAdminApproval?.length === 0 ||
                !dashboardItems.pendingAdminApproval) &&
              (dashboardItems.pendingConcepts?.length === 0 ||
                !dashboardItems.pendingConcepts) &&
              dashboardItems.pendingContributorCompletion.length === 0 &&
              dashboardItems.pendingContributorModify.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div>
                  <Lottie
                    options={defaultOptions}
                    height={50}
                    width={50}
                    isClickToPauseDisabled={true}
                  />
                  <div style={{ marginTop: "4px" }}>You're all caught up </div>
                </div>
              </div>
            ) : (
              <div>
                {dashboardItems.unpaidTasks?.length > 0 && (
                  <div className={styles.dashboardItemContainer}>
                    <div
                      className={styles.dashboardItemHeader}
                      onClick={() => setShowUnpaidTasks(!showUnpaidTasks)}
                    >
                      <div>
                        ⚠️ You have{" "}
                        <span
                          className={styles.notifBadge}
                          style={{ margin: "0px 2px" }}
                        >
                          {dashboardItems.unpaidTasks.length}
                        </span>{" "}
                        unpaid task
                        {dashboardItems.unpaidTasks.length > 1 && "s"} to payout
                      </div>
                      <img
                        src={caretDown}
                        alt="dropdown"
                        style={{
                          marginLeft: "6px",
                          transition: "all 0.2s",
                          transform: showUnpaidTasks
                            ? "rotate(-180deg)"
                            : "rotate(0deg)",
                        }}
                      />
                    </div>
                    {showUnpaidTasks && (
                      <div>
                        {dashboardItems.unpaidTasks.map((item, i) => (
                          <div
                            style={{
                              marginTop: "24px",
                              color: "#0B0F3B",
                              fontSize: "12px",
                              fontWeight: "normal",
                              display: "flex",
                              alignItems: "center",
                              cursor: "pointer",
                            }}
                            onClick={() => history.push(PaymentsLocation)}
                          >
                            <div className={styles.index}>{i + 1}</div>
                            <div
                              style={{ textDecoration: "underline" }}
                              dangerouslySetInnerHTML={{
                                __html: truncate(item.description, 60),
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {dashboardItems.pendingAdminApproval?.length > 0 && (
                  <div className={styles.dashboardItemContainer}>
                    <div
                      className={styles.dashboardItemHeader}
                      onClick={() =>
                        setShowPendingAdminApproval(!showPendingAdminApproval)
                      }
                    >
                      <div>
                        ⚠️ You have{" "}
                        <span
                          className={styles.notifBadge}
                          style={{ margin: "0px 2px" }}
                        >
                          {dashboardItems.pendingAdminApproval.length}
                        </span>{" "}
                        task completion
                        {dashboardItems.pendingAdminApproval.length > 1 &&
                          "s"}{" "}
                        pending your review
                      </div>
                      <img
                        src={caretDown}
                        alt="dropdown"
                        style={{
                          marginLeft: "6px",
                          transition: "all 0.2s",
                          transform: showPendingAdminApproval
                            ? "rotate(-180deg)"
                            : "rotate(0deg)",
                        }}
                      />
                    </div>
                    {showPendingAdminApproval && (
                      <div>
                        {dashboardItems.pendingAdminApproval.map((item, i) => (
                          <div
                            style={{
                              marginTop: "24px",
                              color: "#0B0F3B",
                              fontSize: "12px",
                              fontWeight: "normal",
                              display: "flex",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              history.push(
                                BountyLocation(item.bountyDisplayURL)
                              )
                            }
                          >
                            <div className={styles.index}>{i + 1}</div>
                            <div>
                              <div>
                                <b>
                                  {item.bountyType === "job"
                                    ? item.completionUser.username
                                    : item.completions[
                                        item.completions.length - 1
                                      ].completionUser.username}
                                </b>
                              </div>
                              <div
                                className={styles.quote}
                                dangerouslySetInnerHTML={{
                                  __html: truncate(
                                    item.bountyType === "job"
                                      ? item.completionDescription
                                      : item.completions[
                                          item.completions.length - 1
                                        ].completionDescription,
                                    60
                                  ),
                                }}
                              />
                              <div style={{ marginTop: "4px" }}>
                                Bounty: <u>{item.bountyTitle}</u>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {dashboardItems.pendingContributorCompletion?.length > 0 && (
                  <div className={styles.dashboardItemContainer}>
                    <div
                      className={styles.dashboardItemHeader}
                      onClick={() =>
                        setShowPendingContributorCompletion(
                          !showPendingContributorCompletion
                        )
                      }
                    >
                      <div>
                        ⚠️ You have{" "}
                        <span
                          className={styles.notifBadge}
                          style={{ margin: "0px 2px" }}
                        >
                          {dashboardItems.pendingContributorCompletion.length}
                        </span>{" "}
                        task
                        {dashboardItems.pendingContributorCompletion.length >
                          1 && "s"}{" "}
                        awaiting your completion
                      </div>
                      <img
                        src={caretDown}
                        alt="dropdown"
                        style={{
                          marginLeft: "6px",
                          transition: "all 0.2s",
                          transform: showPendingContributorCompletion
                            ? "rotate(-180deg)"
                            : "rotate(0deg)",
                        }}
                      />
                    </div>
                    {showPendingContributorCompletion && (
                      <div>
                        {dashboardItems.pendingContributorCompletion.map(
                          (item, i) => (
                            <div
                              style={{
                                marginTop: "24px",
                                color: "#0B0F3B",
                                fontSize: "12px",
                                fontWeight: "normal",
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                history.push(
                                  BountyLocation(item.bountyDisplayURL)
                                )
                              }
                            >
                              <div className={styles.index}>{i + 1}</div>
                              <div
                                style={{ textDecoration: "underline" }}
                                dangerouslySetInnerHTML={{
                                  __html: truncate(item.description, 60),
                                }}
                              />
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
                {dashboardItems.pendingContributorModify?.length > 0 && (
                  <div className={styles.dashboardItemContainer}>
                    <div
                      className={styles.dashboardItemHeader}
                      onClick={() =>
                        setShowPendingContributorModify(
                          !showPendingContributorModify
                        )
                      }
                    >
                      <div>
                        ⚠️ You have{" "}
                        <span
                          className={styles.notifBadge}
                          style={{ margin: "0px 2px" }}
                        >
                          {dashboardItems.pendingContributorModify.length}
                        </span>{" "}
                        task
                        {dashboardItems.pendingContributorModify.length > 1 &&
                          "s"}{" "}
                        awaiting your modifications
                      </div>
                      <img
                        src={caretDown}
                        alt="dropdown"
                        style={{
                          marginLeft: "6px",
                          transition: "all 0.2s",
                          transform: showPendingContributorModify
                            ? "rotate(-180deg)"
                            : "rotate(0deg)",
                        }}
                      />
                    </div>
                    {showPendingContributorModify && (
                      <div>
                        {dashboardItems.pendingContributorModify.map(
                          (item, i) => (
                            <div
                              style={{
                                marginTop: "24px",
                                color: "#0B0F3B",
                                fontSize: "12px",
                                fontWeight: "normal",
                                display: "flex",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                history.push(
                                  BountyLocation(item.bountyDisplayURL)
                                )
                              }
                            >
                              <div className={styles.index}>{i + 1}</div>
                              <div>
                                <div>
                                  <b>
                                    {
                                      item.reviews[item.reviews.length - 1]
                                        .reviewUser.username
                                    }
                                  </b>
                                </div>
                                <div
                                  className={styles.quote}
                                  dangerouslySetInnerHTML={{
                                    __html: truncate(
                                      item.reviews[item.reviews.length - 1]
                                        .reviewComments,
                                      60
                                    ),
                                  }}
                                />
                                <div style={{ marginTop: "4px" }}>
                                  Bounty: <u>{item.bountyTitle}</u>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
                {dashboardItems.pendingConcepts?.length > 0 && (
                  <div className={styles.dashboardItemContainer}>
                    <div
                      className={styles.dashboardItemHeader}
                      onClick={() =>
                        setShowPendingConcepts(!showPendingConcepts)
                      }
                    >
                      <div>
                        ⚠️ There{" "}
                        {dashboardItems.pendingConcepts.length > 1
                          ? "are"
                          : "is"}{" "}
                        <span
                          className={styles.notifBadge}
                          style={{ margin: "0px 2px" }}
                        >
                          {dashboardItems.pendingConcepts.length}
                        </span>{" "}
                        concept
                        {dashboardItems.pendingConcepts.length > 1 && "s"}{" "}
                        pending approval
                      </div>
                      <img
                        src={caretDown}
                        alt="dropdown"
                        style={{
                          marginLeft: "6px",
                          transition: "all 0.2s",
                          transform: showPendingConcepts
                            ? "rotate(-180deg)"
                            : "rotate(0deg)",
                        }}
                      />
                    </div>
                    {showPendingConcepts && (
                      <div>
                        {dashboardItems.pendingConcepts.map((item, i) => (
                          <div
                            style={{
                              marginTop: "24px",
                              color: "#0B0F3B",
                              fontSize: "12px",
                              fontWeight: "normal",
                              display: "flex",
                              alignItems: "center",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              history.push(ConceptLocation(item.displayURL))
                            }
                          >
                            <div className={styles.index}>{i + 1}</div>
                            <div style={{ textDecoration: "underline" }}>
                              {item.title}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </MainLayout>
  );
}
