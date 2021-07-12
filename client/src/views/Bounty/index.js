import { Button, CircularProgress } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import FadeIn from "react-fade-in";
import { createUseStyles } from "react-jss";
import {
  getBounty,
  getBountyActivity,
  commentBounty, updateCommentLastSeen,
} from "../../api/bountiesApi";
import MainLayout from "../../layouts/MainLayout";
import { ProfileLocation, RootLocation } from "../../Locations";
import { useHistory } from "react-router";
import editIcon from "../Concept/images/edit.svg";
import useGlobalState from "../../state";
import arrowIcon from "../Login/images/arrowRight.svg";
import UserAvatar from "../../components/UserAvatar";
import projectIcon from "../ApproveConcept/images/project.svg";
import serviceIcon from "../ApproveConcept/images/service.svg";
import jobIcon from "../ApproveConcept/images/job.svg";
import EditBountyView from "../EditBounty";
import {
  formatLink,
  longhandRelative,
  Breakpoints,
  addHTTPS,
} from "../../utils/utils";
import TaskView from "../EditTask";
import TaskItem from "../../components/TaskItem";
import addTaskIcon from "./images/add.svg";
import moment from "moment";
import ActivityItem from "../../components/ActivityItem";
import Textarea from "../../components/Textarea";
import programmeIcon from "../ApproveConcept/images/programme.svg";
import { isMobile } from "react-device-detect";

const useStyles = createUseStyles({
  container: {
    maxWidth: "100vw",
    margin: "auto",
    padding: "0 24px",
    marginTop: "32px",
    color: "#222",
    paddingBottom: "88px",
  },
  bountyTag: {
    fontSize: "10px",
    lineHeight: "12px",
    textTransform: "uppercase",
    padding: "2px 6px",
    backgroundColor: "#E0E0E0",
    borderRadius: "3px",
    fontWeight: 600,
    marginRight: "8px",
  },
  card: {
    padding: "16px",
    backgroundColor: "white",
    position: "relative",
    borderRadius: "4px",
  },
  header: {
    color: "#008DE4",
    letterSpacing: "0.1em",
    fontSize: "12px",
    fontWeight: 600,
    lineHeight: "15px",
  },
  link: {
    display: "block",
    marginBottom: "12px",
    fontSize: "12px",
    textDecoration: "underline",
    color: "#0B0F3B",
    overflowWrap: "break-word",
    wordWrap: "break-word",
    wordBreak: "break-word",
  },
  bountyTagContainer: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
  },
  richText: {
    minHeight: "62px",
    marginTop: "8px",
    fontSize: "12px",
    lineHeight: "18px",
  },
  bountyTypeContainer: {
    marginLeft: "26px",
    marginTop: "12px",
    display: "flex",
    alignItems: "center",
    color: "white",
    fontSize: "14px",
    flexWrap: "wrap",
    lineHeight: "24px",
  },
  title: {
    marginLeft: "12px",
    color: "white",
    fontWeight: 600,
    fontSize: "24px",
    lineHeight: "29px",
  },
  arrowBack: {
    width: "14px",
    height: "14px",
    transform: "rotate(180deg)",
    cursor: "pointer",
  },
  loader: {
    display: "flex",
    justifyContent: "center",
    marginTop: "64px",
    width: "100%",
  },
  bountyTypeItem: {
    padding: "3px 4px",
    display: "flex",
    alignItems: "center",
    borderRadius: "3px",
    marginRight: "8px",
  },
  bountyItemText: { fontWeight: 600, fontSize: "12px", lineHeight: "15px" },
  textarea: {
    resize: "none",
    width: "100%",
    padding: "8px !important",
    fontFamily: "inherit",
    borderRadius: "4px",
    fontSize: "12px",
  },
  commentCTA: {
    backgroundColor: "#0B0F3B",
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
    marginLeft: "8px",
    width: "60px",
    textAlign: "center",
  },
  rightColumn: { marginLeft: "0px", width: "100%", marginTop: "24px" },
  valueProposition: { flexShrink: 0, maxWidth: "100%" },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    card: {
      padding: "32px",
      backgroundColor: "white",
      position: "relative",
      borderRadius: "4px",
    },
    valueProposition: { flexShrink: 0, maxWidth: "400px" },

    container: {
      maxWidth: "1050px",
      margin: "auto",
      padding: "0 88px",
      marginTop: "32px",
      color: "#222",
      paddingBottom: "88px",
    },
    rightColumn: { marginLeft: "8px", width: "323px", marginTop: "0px" },
  },
});

export default function BountyView({ match }) {
  const [bounty, setBounty] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [activity, setActivity] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const styles = useStyles();
  const history = useHistory();
  const { loggedInUser } = useGlobalState();

  useEffect(() => {
    getBounty(match.params.id)
      .then((result) => result.json())
      .then(async (data) => {
        if (data.error) {
          history.push(RootLocation);
        } else {
          setBounty(data);
          const newActivity = await getBountyActivity(data._id)
            .then((result) => result.json());
          setActivity(newActivity);
          await updateCommentLastSeen(data._id);
        }
      });
    moment.updateLocale("en", {
      relativeTime: longhandRelative,
    });
    //eslint-disable-next-line
  }, [match.params.id]);

  const modifyTask = (i, task) => {
    const newBounty = { ...bounty };
    const taskIndex = newBounty.tasks.findIndex((x) => x._id === task._id);
    newBounty.tasks[taskIndex] = task;
    setBounty(newBounty);
  };

  const onComment = () => {
    if (comment.length > 0 && comment.length < 5000) {
      setLoading(true);
      setComment("");
      commentBounty &&
        commentBounty({ comment, commentUser: loggedInUser }, bounty._id)
          .then((data) => data.json())
          .then(() => {
            getBountyActivity(bounty._id)
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
    <MainLayout match={match}>
      {!bounty ? (
        <FadeIn>
          <div className={styles.loader}>
            <CircularProgress style={{ color: "white" }} />
          </div>
        </FadeIn>
      ) : (
        <FadeIn>
          <TaskView
            open={taskModal}
            onClose={(e, submit) => {
              if (submit) {
                setTaskModal(false);
                setBounty(null);
                getBounty(match.params.id)
                  .then((result) => result.json())
                  .then((data) => {
                    setBounty(data);
                  });
              } else {
                setTaskModal(false);
              }
            }}
            concept={bounty}
          />
          <EditBountyView
            open={editModal}
            onClose={(e, confirm) => {
              setEditModal(false);
              if (confirm) {
                setBounty(null);
                getBounty(match.params.id)
                  .then((result) => result.json())
                  .then((data) => {
                    setBounty(data);
                  });
              }
            }}
            concept={bounty}
          />

          <div className={styles.container}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={arrowIcon}
                alt="back"
                className={styles.arrowBack}
                onClick={() => history.goBack()}
              />
              <div className={styles.title}>{bounty.title}</div>
            </div>
            <div className={styles.bountyTypeContainer}>
              <div
                style={{
                  backgroundColor:
                    bounty.bountyType === "project"
                      ? "#EF8144"
                      : bounty.bountyType === "service"
                      ? "#4452EF"
                      : bounty.bountyType === "job"
                      ? "#00B6F0"
                      : "#AD1D73",
                }}
                className={styles.bountyTypeItem}
              >
                <img
                  src={
                    bounty.bountyType === "project"
                      ? projectIcon
                      : bounty.bountyType === "service"
                      ? serviceIcon
                      : bounty.bountyType === "job"
                      ? jobIcon
                      : programmeIcon
                  }
                  style={{ width: "12px", marginRight: "6px" }}
                  alt="icon"
                />
                <div className={styles.bountyItemText}>
                  {bounty.bountyType === "project"
                    ? "Project"
                    : bounty.bountyType === "service"
                    ? "Service"
                    : bounty.bountyType === "job"
                    ? "Job"
                    : bounty.bountyType === "programme"
                    ? "Programme"
                    : null}
                </div>
              </div>
              {bounty.primaryAdmin && (
                <>
                  <div style={{ marginRight: "8px" }}>Admins:</div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      history.push(
                        ProfileLocation(bounty.primaryAdmin.username)
                      )
                    }
                  >
                    <UserAvatar
                      user={bounty.primaryAdmin}
                      size={"18px"}
                      fontSize={"8px"}
                      lineHeight={"10px"}
                    />
                    <div style={{ marginLeft: "8px" }}>
                      <b>{bounty.primaryAdmin.username}</b> (
                      {bounty.approvedBy &&
                      bounty.primaryAdmin.username ===
                        bounty.approvedBy.username
                        ? "Owner"
                        : "Primary"}
                      )
                    </div>
                  </div>
                </>
              )}
              {bounty.secondaryAdmin && (
                <>
                  <div style={{ marginRight: "8px", marginLeft: "8px" }}>
                    and
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      history.push(
                        ProfileLocation(bounty.secondaryAdmin.username)
                      )
                    }
                  >
                    <UserAvatar
                      user={bounty.secondaryAdmin}
                      size={"18px"}
                      fontSize={"8px"}
                      lineHeight={"10px"}
                    />
                    <div style={{ marginLeft: "8px" }}>
                      <b>{bounty.secondaryAdmin.username}</b> (Secondary)
                    </div>
                  </div>
                </>
              )}
              {/*<span style={{ marginLeft: "8px" }}>
                Created {moment(bounty.approvedDate).fromNow()}
              </span>*/}
            </div>
            <div className={styles.card} style={{ marginTop: "24px" }}>
              {bounty &&
                loggedInUser &&
                bounty.approvedBy &&
                loggedInUser.isAdmin && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      position: isMobile ? "static" : "absolute",
                      marginBottom: isMobile ? "24px" : "0px",
                      top: "-48px",
                      right: 0,
                    }}
                  >
                    {(loggedInUser?.username === bounty.approvedBy?.username ||
                      loggedInUser?.username ===
                        bounty.primaryAdmin?.username) && (
                      <Button
                        style={{
                          fontWeight: 600,
                          lineHeight: "15px",
                          padding: "8px",
                          color: "white",
                          fontSize: "12px",
                          backgroundColor: "#0B0F3B",
                          display: "flex",
                          alignItems: "center",
                          textTransform: "none",
                        }}
                        className={styles.conceptCTA}
                        onClick={() => setEditModal(true)}
                      >
                        <img
                          src={editIcon}
                          alt="edit"
                          style={{ width: "16px", marginRight: "4px" }}
                        />
                        <div>Edit</div>
                      </Button>
                    )}
                    {(loggedInUser?.username ===
                      bounty.primaryAdmin?.username ||
                      loggedInUser?.username ===
                        bounty.secondaryAdmin?.username ||
                      loggedInUser?.username ===
                        bounty.approvedBy?.username) && (
                      <Button
                        style={{
                          marginLeft: "10px",
                          fontWeight: 600,
                          lineHeight: "15px",
                          padding: "8px",
                          color: "white",
                          fontSize: "12px",
                          backgroundColor: "#0B0F3B",
                          display: "flex",
                          alignItems: "center",
                          textTransform: "none",
                        }}
                        className={styles.conceptCTA}
                        onClick={() => setTaskModal(true)}
                      >
                        <img
                          src={addTaskIcon}
                          alt="edit"
                          style={{ width: "16px", marginRight: "4px" }}
                        />
                        <div>Add Task</div>
                      </Button>
                    )}
                  </div>
                )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <div
                  className={styles.valueProposition}
                  style={{ marginBottom: "24px" }}
                >
                  <div className={styles.header}>VALUE PROPOSITION</div>
                  <div
                    className={styles.richText}
                    dangerouslySetInnerHTML={{
                      __html: bounty.valueProposition,
                    }}
                  />
                  <div style={{ marginTop: "24px" }} className={styles.header}>
                    GENERAL REQUIREMENTS
                  </div>
                  <div
                    className={styles.richText}
                    dangerouslySetInnerHTML={{
                      __html: bounty.generalRequirements,
                    }}
                  />
                  {bounty.tasks.filter((item) => item.taskType === "spec")
                    .length > 0 && (
                    <div
                      style={{
                        marginTop: "24px",
                      }}
                      className={styles.header}
                    >
                      SPEC TASKS
                    </div>
                  )}
                  {bounty.tasks
                    .filter((item) => item.taskType === "spec")
                    .map((task, i) => (
                      <>
                        {i !== 0 && (
                          <hr
                            style={{
                              opacity: 0.3,
                              marginTop: "24px",
                              marginBottom: "24px",
                            }}
                          />
                        )}
                        <TaskItem
                          key={`${task._id}-${i}`}
                          taskData={task}
                          modifyTask={modifyTask}
                          i={i}
                          bounty={bounty}
                        />
                      </>
                    ))}
                  {bounty.tasks.filter((item) => item.taskType === "production")
                    .length > 0 && (
                    <div
                      style={{
                        marginTop: "24px",
                      }}
                      className={styles.header}
                    >
                      PRODUCTION TASKS
                    </div>
                  )}
                  {bounty.tasks
                    .filter((item) => item.taskType === "production")
                    .map((task, i) => (
                      <>
                        {i !== 0 && (
                          <hr
                            style={{
                              opacity: 0.3,
                              marginTop: "24px",
                              marginBottom: "24px",
                            }}
                          />
                        )}
                        <TaskItem
                          key={`${task._id}-${i}`}
                          taskData={task}
                          modifyTask={modifyTask}
                          i={i}
                          bounty={bounty}
                        />
                      </>
                    ))}

                  {bounty.tasks.filter((item) => item.taskType === "qa")
                    .length > 0 && (
                    <div
                      style={{
                        marginTop: "24px",
                      }}
                      className={styles.header}
                    >
                      QA TASKS
                    </div>
                  )}
                  {bounty.tasks
                    .filter((item) => item.taskType === "qa")
                    .map((task, i) => (
                      <>
                        {i !== 0 && (
                          <hr
                            style={{
                              opacity: 0.3,
                              marginTop: "24px",
                              marginBottom: "24px",
                            }}
                          />
                        )}
                        <TaskItem
                          key={`${task._id}-${i}`}
                          taskData={task}
                          modifyTask={modifyTask}
                          i={i}
                          bounty={bounty}
                        />
                      </>
                    ))}
                </div>
                <div className={styles.rightColumn}>
                  <div
                    className={styles.header}
                    style={{
                      marginBottom: "10px",
                    }}
                  >
                    STATUS
                  </div>
                  <div className={styles.bountyTagContainer}>
                    <div className={styles.bountyTag}>{bounty.status}</div>
                  </div>

                  {bounty.sourceURL && (
                    <>
                      <div
                        className={styles.header}
                        style={{
                          marginBottom: "10px",
                          marginTop: "28px",
                        }}
                      >
                        SOURCE URL
                      </div>

                      <a
                        href={addHTTPS(bounty.sourceURL)}
                        target={"_blank"}
                        rel="noreferrer"
                        className={styles.link}
                      >
                        {formatLink(bounty.sourceURL)}
                      </a>
                    </>
                  )}
                  {bounty.deployedURL && (
                    <>
                      <div
                        className={styles.header}
                        style={{
                          marginBottom: "10px",
                          marginTop: "28px",
                        }}
                      >
                        DEPLOYED URL
                      </div>

                      <a
                        href={addHTTPS(bounty.deployedURL)}
                        target={"_blank"}
                        rel="noreferrer"
                        className={styles.link}
                      >
                        {formatLink(bounty.deployedURL)}
                      </a>
                    </>
                  )}
                  {bounty.links.length > 0 && (
                    <>
                      <div
                        className={styles.header}
                        style={{
                          marginBottom: "10px",
                          marginTop: "28px",
                        }}
                      >
                        SUPPORTING LINKS
                      </div>
                      {bounty.links.map((link) => (
                        <a
                          href={addHTTPS(link)}
                          target={"_blank"}
                          rel="noreferrer"
                          className={styles.link}
                        >
                          {formatLink(link)}
                        </a>
                      ))}
                    </>
                  )}
                  <div
                    style={{
                      marginTop: "24px",
                    }}
                    className={styles.header}
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
                          onClick={() => !loading && onComment()}
                        >
                          {loading ? (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <CircularProgress
                                style={{ color: "white" }}
                                size={10}
                              />
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
                      global
                      bounty
                      setNewActivity={setNewActivity}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      )}
    </MainLayout>
  );
}
