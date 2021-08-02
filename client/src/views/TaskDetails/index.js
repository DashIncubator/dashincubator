import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { createUseStyles } from "react-jss";
import useGlobalState from "../../state";

import {
  commentTask,
  getTaskActivity,
  updateTaskActivityView,
  requestToReserveTask,
} from "../../api/tasksApi";
import { getBounty } from "../../api/bountiesApi";

import { CircularProgress } from "@material-ui/core";
import DashModal from "../../components/DashModal";
import UserAvatar from "../../components/UserAvatar";
import ActivityItem from "../../components/ActivityItem";
import Textarea from "../../components/Textarea";

import { ProfileLocation, BountyLocation } from "../../Locations";
import { Breakpoints } from "../../utils/breakpoint";

import dashLogo from "./images/dashWhite.svg";
import doneIcon from "../Concept/images/done.svg";
import moment from "moment";

const useStyles = createUseStyles({
  assignment: {
    opacity: 0.5,
    fontSize: "12px",
    lineHeight: "15px",
    marginRight: "10px",
  },
  assignee: {
    marginLeft: "10px",
    fontWeight: 500,
    fontSize: "12px",
    lineHeight: "15px",
  },
  CTA: {
    backgroundColor: "#008DE4",
    borderRadius: "4px",
    padding: "8px",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "12px",
    lineHeight: "15px",
    marginRight: "32px",
    display: "flex",
    alignItems: "center",
  },
  commentCTA: {
    backgroundColor: "rgb(7, 74, 115)",
    display: "block",
    color: "white",
    fontSize: "10px",
    lineHeight: "12px",
    height: "30px",
    borderRadius: "4px",
    padding: "8px",
    cursor: "pointer",
    userSelect: "none",
    fontWeight: 600,
    width: "56px",
    marginLeft: "8px",
    textAlign: "center",
  },
  container: { minWidth: "auto", maxWidth: "100vw" },
  taskDescription: {
    fontSize: "16px",
    lineHeight: "20px",
    width: "256px",
    overflowWrap: "break-word",
    wordWrap: "break-word",
    wordBreak: "break-word",
  },
  taskProgress: {
    marginLeft: "20px",
    fontSize: "12px",
    lineHeight: "15px",
    marginRight: "32px",
  },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    taskProgress: {
      marginLeft: "20px",
      fontSize: "12px",
      lineHeight: "15px",
      marginRight: "0px",
    },
    container: { minWidth: "550px", maxWidth: "646px" },
    CTA: {
      backgroundColor: "#008DE4",
      borderRadius: "4px",
      padding: "8px",
      color: "white",
      fontWeight: 600,
      cursor: "pointer",
      fontSize: "12px",
      lineHeight: "15px",
      display: "flex",
      marginRight: 0,
      alignItems: "center",
    },
    taskDescription: {
      fontSize: "14px",
      lineHeight: "18px",
      width: "auto",
      overflowWrap: "normal",
      wordWrap: "normal",
      wordBreak: "normal",
    },
  },
  bountyLink: {
    fontSize: "11px",
    textDecoration: "underline",
    fontWeight: 500,
    cursor: "pointer",
    marginLeft: "24px",
    "&:hover": {
      color: "aliceblue",
    },
  },
});

export default function TaskDetailsView({
  open,
  onClose,
  task,
  onEdit,
  bounty,
  onComplete,
  onReview,
  onJobComplete,
  onJobReview,
}) {
  const [loading, setLoading] = useState(false);
  const { loggedInUser } = useGlobalState();
  const [comment, setComment] = useState("");
  const [requested, setRequested] = useState(
    task.requests &&
      task.requests.length > 0 &&
      task.requests.find(
        (user) => user?.username === loggedInUser?.username
      ) !== undefined
  );
  const [activity, setActivity] = useState(null);
  const [bountyData, setBountyData] = useState(bounty ?? null);
  const styles = useStyles();
  const history = useHistory();

  const onReserve = async () => {
    setLoading(true);
    await requestToReserveTask(
      { ...loggedInUser, requestedAt: new Date() },
      task._id
    );
    setRequested(true);
    setLoading(false);
  };

  useEffect(() => {
    getTaskActivity(task._id)
      .then((data) => data.json())
      .then((results) => {
        setActivity(results);
        updateTaskActivityView(task._id);

        if (!bountyData) {
          getBounty(task.bountyDisplayURL)
            .then((data) => data.json())
            .then((results) => {
              setBountyData(results);
            });
        }
      });
    //eslint-disable-next-line
  }, [open]);

  const onComment = () => {
    if (comment.length > 0 && comment.length < 5000) {
      setLoading(true);
      setComment("");
      commentTask &&
        commentTask({ comment, commentUser: loggedInUser }, task._id)
          .then((data) => data.json())
          .then(() => {
            getTaskActivity(task._id)
              .then((data) => data.json())
              .then((results) => {
                setLoading(false);
                setActivity(results);
              });
          });
    }
  };

  const setNewActivity = (results) => {
    setActivity(results);
  };

  return (
    <DashModal
      open={open}
      onClose={() => {
        onClose();
      }}
    >
      <div className={styles.container}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              lineHeight: "22px",
              fontWeight: 600,
            }}
          >
            {task.taskType === "spec"
              ? "Spec Task"
              : task.taskType === "production"
              ? "Production Task"
              : task.taskType === "qa"
              ? "QA Task"
              : null}
          </div>
          {task.status !== "complete" && (
            <div style={{ display: "flex", alignItems: "center" }}>
              {loggedInUser?.isAdmin &&
                loggedInUser?.username === task.createdBy.username && (
                  <div
                    style={{
                      backgroundColor: "#4452EF",
                    }}
                    className={styles.CTA}
                    onClick={() => onEdit()}
                  >
                    Edit task
                  </div>
                )}
              {bountyData?.bountyType === "job" &&
              task.assignee?.username === loggedInUser?.username &&
              loggedInUser?.username !== task.createdBy.username ? (
                <div
                  className={styles.CTA}
                  style={{
                    cursor: requested ? "auto" : "pointer",
                    marginLeft: "20px",
                    textAlign: "center",
                  }}
                  onClick={() => !loading && onJobComplete()}
                >
                  Submit job completion request
                </div>
              ) : (
                !task.assignee &&
                loggedInUser?.username !== task.createdBy.username && (
                  <div
                    className={styles.CTA}
                    style={{
                      cursor: requested ? "auto" : "pointer",
                      marginLeft: "20px",
                    }}
                    onClick={() => !loading && !requested && onReserve()}
                  >
                    {loading ? (
                      <CircularProgress size={12} color={"white"} />
                    ) : requested ? (
                      <>
                        <div>You've requested to reserve this task</div>
                        <img
                          style={{ marginLeft: "6px" }}
                          src={doneIcon}
                          alt="done"
                        />
                      </>
                    ) : (
                      "Request to Reserve Task"
                    )}
                  </div>
                )
              )}

              {task.assignee && (
                <>
                  {task.status === "pending" ? (
                    <>
                      {loggedInUser?.username === task.createdBy.username ? (
                        <div
                          className={styles.CTA}
                          style={{
                            marginLeft: "20px",
                          }}
                          onClick={() => onReview()}
                        >
                          Review completion
                        </div>
                      ) : (
                        <>
                          <div
                            style={{
                              marginLeft: "20px",
                              fontSize: "12px",
                              lineHeight: "15px",
                            }}
                          >
                            Task complete, pending admin review
                            <CircularProgress
                              style={{ marginLeft: "8px" }}
                              size={12}
                              color={"white"}
                            />
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {task.assignee.username === loggedInUser?.username ? (
                        <div
                          className={styles.CTA}
                          style={{
                            marginLeft: "20px",
                          }}
                          onClick={() => onComplete()}
                        >
                          Complete task
                        </div>
                      ) : (
                        <div className={styles.taskProgress}>
                          Task in progress{" "}
                          <CircularProgress
                            style={{ marginLeft: "8px" }}
                            size={12}
                            color={"white"}
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        <div
          style={{
            fontSize: "10px",
            marginTop: "4px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{ marginRight: "6px" }}>Task owner:</div>
          <div
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={() =>
              history.push(ProfileLocation(task.createdBy.username))
            }
          >
            <UserAvatar
              size={15}
              fontSize={"8px"}
              lineHeight={"10px"}
              user={task.createdBy}
            />
            <div
              style={{ marginLeft: "6px", fontWeight: 600, fontSize: "10px" }}
            >
              {task.createdBy.username}
            </div>
          </div>
        </div>
        {task.dueDate && (
          <div
            style={{
              fontSize: "10px",
              marginTop: "4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            Due date:
            <div style={{ fontWeight: "bold", marginLeft: "4px" }}>
              {moment(task.dueDate).format("MMM Do, YYYY")}
            </div>
          </div>
        )}
        <div style={{ marginTop: "36px" }}>
          <div
            className={styles.taskDescription}
            dangerouslySetInnerHTML={{ __html: task.description }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "32px",
            }}
          >
            <div style={{ display: "flex" }}>
              <img src={dashLogo} alt="dash" />
              <div
                style={{
                  marginLeft: "10px",
                  fontWeight: 600,
                  fontSize: "12px",
                  lineHeight: "15px",
                }}
              >
                {task.payout} DASH
              </div>
              <div style={{ marginLeft: "10px" }}>
                {task.assignee ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <div className={styles.assignment}>
                      {task.status === "complete"
                        ? "Completed by"
                        : "Assigned to"}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        history.push(ProfileLocation(task.assignee.usernname))
                      }
                    >
                      <UserAvatar
                        size={18}
                        fontSize={"8px"}
                        lineHeight={"10px"}
                        user={task.assignee}
                      />
                      <div className={styles.assignee}>
                        {task.assignee.username}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      opacity: 0.5,
                      fontSize: "12px",
                      lineHeight: "15px",
                    }}
                  >
                    Unassigned
                  </div>
                )}
              </div>
            </div>
            <div
              className={styles.bountyLink}
              onClick={() =>
                history.push(BountyLocation(task.bountyDisplayURL))
              }
            >
              {task.bountyTitle}
            </div>
          </div>
        </div>
        <div style={{ marginTop: "32px" }}>
          <div
            style={{
              color: "#008DE4",
              fontSize: "12px",
              lineHeight: "15px",
              fontWeight: 600,
              letterSpacing: "0.1em",
            }}
          >
            ACTIVITY
          </div>
          <div style={{ display: "flex", marginTop: "20px" }}>
            <div style={{ marginRight: "8px" }}>
              <UserAvatar
                size={"18px"}
                fontSize={"8px"}
                lineHeight={"10px"}
                user={loggedInUser}
              />
            </div>
            <div style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  loading={loading}
                />

                <div
                  className={styles.commentCTA}
                  onClick={() => !loading && loggedInUser && onComment()}
                >
                  {loading ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CircularProgress style={{ color: "white" }} size={10} />
                    </div>
                  ) : (
                    "Submit"
                  )}
                </div>
              </div>
            </div>
          </div>
          {activity?.map((item) => (
            <ActivityItem
              item={item}
              task={task}
              onJobReview={task.bountyType === "job" && onJobReview}
              setNewActivity={setNewActivity}
            />
          ))}
        </div>
      </div>
    </DashModal>
  );
}
