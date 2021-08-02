import React, { useState, useEffect } from "react";
import { createUseStyles } from "react-jss";
import DashModal from "../../components/DashModal";
import doneIcon from "../Concept/images/done.svg";
import useGlobalState from "../../state";
import { payoutConcept, payoutTask } from "../../api/tasksApi";
import { CircularProgress } from "@material-ui/core";
import dashLogo from "../../components/images/dashLogo.svg";
import UserAvatar from "../../components/UserAvatar";
import { useHistory } from "react-router";
import { ProfileLocation } from "../../Locations";
import { addHTTPS } from "../../utils/utils";
import { Breakpoints } from "../../utils/breakpoint";

const useStyles = createUseStyles({
  input: {
    borderRadius: "4px",
    padding: "8px",
    fontSize: "12px",
    lineHeight: "18px",
    marginTop: "16px",
    width: "100%",
  },
  sectionHeader: {
    marginTop: "32px",
    color: "#008DE4",
    fontSize: "12px",
    fontWeight: 600,
    lineHeight: "15px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  container: { minWidth: "auto", maxWidth: "100vw" },
  CTA: { display: "flex", alignItems: "center", marginRight: "32px" },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    container: { minWidth: "550px", maxWidth: "646px" },
    CTA: { display: "flex", alignItems: "center", marginRight: 0 },
  },
});

export default function PayoutTaskView({ open, onClose, task }) {
  const [loading, setLoading] = useState(false);
  const [contributorTransactionID, setContributorTransactionID] = useState("");
  const [adminTransactionID, setAdminTransactionID] = useState("");
  const [error, setError] = useState(false);
  const { loggedInUser } = useGlobalState();
  const styles = useStyles();
  const history = useHistory();

  useEffect(() => {
    setAdminTransactionID("");
    setContributorTransactionID("");
  }, [open]);

  const onComplete = async () => {
    if (!contributorTransactionID || !adminTransactionID) {
      setError(true);
    } else {
      setLoading(true);
      if (task.isConcept) {
        await payoutConcept(
          {
            data: {
              contributorTransactionID,
              adminTransactionID,
              paidOutBy: loggedInUser,
            },
          },
          task._id
        );
        setLoading(false);
        onClose(null, {
          id: task._id,
          contributorTransactionID,
          adminTransactionID,
        });
      } else {
        await payoutTask(
          {
            data: {
              contributorTransactionID,
              adminTransactionID,
              paidOutBy: loggedInUser,
            },
            rid: task.rid,
          },
          task._id
        );
        setLoading(false);
        onClose(null, {
          id: task._id,
          contributorTransactionID,
          adminTransactionID,
        });
      }
    }
  };

  return (
    <DashModal
      open={open}
      onClose={() => {
        onClose();
      }}
    >
      <div className={styles.container}>
        {task && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  color: "white",
                  fontWeight: 600,
                  fontSize: "18px",
                  lineHeight: "22px",
                }}
              >
                Completed task
              </div>
              <div className={styles.CTA}>
                {!task.isPaid && (
                  <div
                    style={{
                      color: "#FCAFC6",
                      fontSize: "12px",
                      lineHeight: "15px",
                      fontWeight: 600,
                    }}
                  >
                    Unpaid
                  </div>
                )}
                {loggedInUser && loggedInUser.isSuperUser && !task.isPaid && (
                  <div
                    style={{
                      backgroundColor: "#008DE4",
                      cursor: "pointer",
                      marginLeft: "16px",
                      color: "white",
                      fontSize: "12px",
                      lineHeight: "15px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      padding: "8px",
                      borderRadius: "4px",
                    }}
                    onClick={() => !loading && onComplete()}
                  >
                    {!loading ? (
                      <>
                        <img
                          src={doneIcon}
                          alt="done"
                          style={{ marginRight: "6px" }}
                        />
                        <div>Pay out</div>
                      </>
                    ) : (
                      <CircularProgress color={"white"} size={12} />
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.sectionHeader}>TASK</div>
            <div style={{ color: "white" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "12px",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "12px",
                    lineHeight: "15px",
                  }}
                >
                  {task.bountyTitle}
                </div>
                <div
                  style={{
                    marginLeft: "12px",
                    fontSize: "12px",
                    lineHeight: "15px",
                    opacity: 0.5,
                  }}
                >
                  {task.taskType === "spec"
                    ? "Spec task"
                    : task.taskType === "production"
                    ? "Production task"
                    : task.taskType === "qa"
                    ? "QA task"
                    : null}
                </div>
              </div>
              <div
                style={{
                  marginTop: "12px",
                  fontSize: "16px",
                  lineHeight: "20px",
                }}
              >
                {task.description}
              </div>
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <img
                  src={dashLogo}
                  alt="logo"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
                <div
                  style={{
                    marginLeft: "10px",
                    fontWeight: 600,
                    fontSize: "12px",
                    lineHeight: "15px",
                  }}
                >
                  {parseFloat(task.payout).toFixed(3)} DASH
                </div>
                <div
                  style={{
                    marginLeft: "10px",
                    fontSize: "12px",
                    lineHeight: "15px",
                    marginRight: "10px",
                    opacity: 0.5,
                  }}
                >
                  Assigned to
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    history.push(
                      ProfileLocation(task.approvedContributor.username)
                    )
                  }
                >
                  <UserAvatar
                    size={"18px"}
                    fontSize={"8px"}
                    lineHeight={"10px"}
                    user={task.approvedContributor}
                  />
                  <div
                    style={{
                      marginLeft: "10px",
                      fontWeight: 500,
                      fontSize: "12px",
                      lineHeight: "18px",
                    }}
                  >
                    {task.approvedContributor.username}
                  </div>
                </div>
              </div>
              <div
                style={{
                  marginTop: "32px",
                  color: "#008DE4",
                  fontSize: "12px",
                  fontWeight: 600,
                  lineHeight: "15px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                TASK SOURCE URL
              </div>
              <div
                style={{
                  marginTop: "16px",
                  fontSize: "12px",
                  lineHeight: "15px",
                }}
              >
                <a
                  href={addHTTPS(task?.approvedOutputSourceURL)}
                  target={"_blank"}
                  rel="noreferrer"
                  style={{ color: "white", textDecoration: "underline" }}
                >
                  {task?.approvedOutputSourceURL}
                </a>
              </div>
              <div
                style={{
                  marginTop: "32px",
                  color: "#008DE4",
                  fontSize: "12px",
                  fontWeight: 600,
                  lineHeight: "15px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                TASK DEPLOY URL
              </div>
              <div
                style={{
                  marginTop: "16px",
                  fontSize: "12px",
                  lineHeight: "15px",
                }}
              >
                <a
                  href={addHTTPS(task?.approvedOutputDeployURL)}
                  target={"_blank"}
                  rel="noreferrer"
                  style={{ color: "white", textDecoration: "underline" }}
                >
                  {task?.approvedOutputDeployURL}
                </a>
              </div>
              <div className={styles.sectionHeader}>COMPLETION SUMMARY</div>
              <div
                style={{ marginTop: "12px", lineHeight: "20px" }}
                dangerouslySetInnerHTML={{ __html: task.approvedOutput }}
              />
            </div>
            <div className={styles.sectionHeader}>
              CONTRIBUTOR TRANSACTION ID
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "12px",
              }}
            >
              <img
                src={dashLogo}
                alt="logo"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <div
                style={{
                  marginLeft: "10px",
                  fontWeight: 600,
                  fontSize: "12px",
                  lineHeight: "15px",
                  marginRight: "10px",
                }}
              >
                {parseFloat(task.payout).toFixed(3)} DASH
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() =>
                  history.push(
                    ProfileLocation(task.approvedContributor.username)
                  )
                }
              >
                <UserAvatar
                  size={"18px"}
                  fontSize={"8px"}
                  lineHeight={"10px"}
                  user={task.approvedContributor}
                />
                <div
                  style={{
                    marginLeft: "10px",
                    fontWeight: 500,
                    fontSize: "12px",
                    lineHeight: "18px",
                  }}
                >
                  {task.approvedContributor.username}
                </div>
              </div>
              <div
                style={{
                  marginLeft: "10px",
                  fontWeight: 500,
                  fontSize: "12px",
                  lineHeight: "18px",
                }}
              >
                {task.approvedContributorAddress}
              </div>
            </div>
            {task.contributorTransactionID ? (
              <div style={{ marginTop: "12px" }}>
                <a
                  href={`http://insight.dash.org/insight/tx/${task.contributorTransactionID}`}
                  target={"_blank"}
                  rel={"noreferrer"}
                  style={{ textDecoration: "underline" }}
                >
                  http://insight.dash.org/insight/tx/
                  {task.contributorTransactionID}
                </a>
              </div>
            ) : loggedInUser.isSuperUser ? (
              <>
                <input
                  className={styles.input}
                  placeholder={"Enter Transaction ID"}
                  value={contributorTransactionID}
                  onChange={(e) => setContributorTransactionID(e.target.value)}
                />
                {error && (
                  <div style={{ marginTop: "8px", color: "red" }}>
                    ENTER TRANSACTION ID
                  </div>
                )}
              </>
            ) : (
              <div style={{ marginTop: "12px" }}>
                Pending payment{" "}
                <CircularProgress
                  size={12}
                  style={{ color: "white", marginLeft: "4px" }}
                />
              </div>
            )}
            <div className={styles.sectionHeader}>ADMIN TRANSACTION ID</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "12px",
              }}
            >
              <img
                src={dashLogo}
                alt="logo"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <div
                style={{
                  marginLeft: "10px",
                  fontWeight: 600,
                  fontSize: "12px",
                  lineHeight: "15px",
                  marginRight: "10px",
                }}
              >
                {(parseFloat(task.payout) * 0.1).toFixed(3)} DASH
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() =>
                  history.push(ProfileLocation(task.approvedAdmin.username))
                }
              >
                <UserAvatar
                  size={"18px"}
                  fontSize={"8px"}
                  lineHeight={"10px"}
                  user={task.approvedAdmin}
                />
                <div
                  style={{
                    marginLeft: "10px",
                    fontWeight: 500,
                    fontSize: "12px",
                    lineHeight: "18px",
                  }}
                >
                  {task.approvedAdmin.username}
                </div>
              </div>
              <div
                style={{
                  marginLeft: "10px",
                  fontWeight: 500,
                  fontSize: "12px",
                  lineHeight: "18px",
                }}
              >
                {task.approvedAdminAddress}
              </div>
            </div>
            {task.adminTransactionID ? (
              <div style={{ marginTop: "12px" }}>
                <a
                  style={{ textDecoration: "underline" }}
                  href={`http://insight.dash.org/insight/tx/${task.adminTransactionID}`}
                  target={"_blank"}
                  rel={"noreferrer"}
                >
                  http://insight.dash.org/insight/tx/{task.adminTransactionID}
                </a>
              </div>
            ) : loggedInUser.isSuperUser ? (
              <>
                <input
                  className={styles.input}
                  placeholder={"Enter Transaction ID"}
                  value={adminTransactionID}
                  onChange={(e) => setAdminTransactionID(e.target.value)}
                />
                {error && (
                  <div style={{ marginTop: "8px", color: "red" }}>
                    ENTER TRANSACTION ID
                  </div>
                )}
              </>
            ) : (
              <div style={{ marginTop: "12px" }}>
                Pending payment{" "}
                <CircularProgress
                  size={12}
                  style={{ color: "white", marginLeft: "4px" }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </DashModal>
  );
}
