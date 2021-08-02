import { CircularProgress } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { getUserByUsername } from "../../api/usersApi";
import UserAvatar from "../../components/UserAvatar";
import MainLayout from "../../layouts/MainLayout";
import useGlobalState from "../../state";
import arrowIcon from "../Login/images/arrowRight.svg";
import editIcon from "../Concept/images/edit.svg";
import { createUseStyles } from "react-jss";
import moment from "moment";
import { formatTask, longhandRelative } from "../../utils/utils";
import { Breakpoints } from "../../utils/breakpoint";

import {
  BountyLocation,
  ConceptLocation,
  ProfileLocation,
  UserManagementLocation,
} from "../../Locations";
import dashLogo from "../../components/images/dashLogo.svg";
import ActivityItem from "../../components/ActivityItem";
import EditProfileView from "../EditProfile";

const useStyles = createUseStyles({
  container: {
    maxWidth: "100vw",
    margin: "auto",
    padding: "0 24px 88px 24px",
    marginTop: "32px",
    color: "#0B0F3B",
    backgroundColor: "#008DE4",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "64px",
  },
  userBarContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backArrow: {
    width: "14px",
    height: "14px",
    transform: "rotate(180deg)",
    cursor: "pointer",
    marginRight: "12px",
  },
  userBarUsername: {
    fontSize: "20px",
    fontWeight: 600,
    color: "white",
  },
  editCTA: {
    backgroundColor: "#0B0F3B",
    color: "white",
    borderRadius: "4px",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    fontSize: "12px",
    lineHeight: "15px",
    fontWeight: 600,
    userSelect: "none",
  },
  contentContainer: {
    backgroundColor: "white",
    borderRadius: "6px",
    padding: "32px",
    marginTop: "24px",
  },
  sectionHeader: {
    color: "#008DE4",
    fontSize: "12px",
    lineHeight: "15px",
    fontWeight: 600,
    letterSpacing: "0.1em",
  },
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
  rightColumn: { width: "100%", marginLeft: "0px", marginTop: "24px" },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    rightColumn: { width: "324px", marginLeft: "24px", marginTop: "0px" },
  },
  [`@media (min-width: ${Breakpoints.lg}px)`]: {
    container: {
      maxWidth: 1600,
      margin: "auto",
      padding: "0 88px 88px 88px",
      marginTop: 32,
      color: "#0B0F3B",
      backgroundColor: "#008DE4",
    },
  },
});

export default function ProfileView({ match }) {
  const history = useHistory();
  const { loggedInUser } = useGlobalState();
  const [currentUser, setCurrentUser] = useState(null);
  const [editProfile, setEditProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const styles = useStyles();

  useEffect(() => {
    moment.updateLocale("en", {
      relativeTime: longhandRelative,
    });
    setLoading(true);
    getUserByUsername(match.params.username)
      .then((data) => data.json())
      .then((response) => {
        setCurrentUser(response);
        setLoading(false);
      });
  }, [match]);

  return (
    <MainLayout match={match}>
      {loggedInUser && currentUser && (
        <EditProfileView
          open={editProfile}
          onClose={() => setEditProfile(false)}
        />
      )}
      <div className={styles.container}>
        <div>
          {loading ? (
            <div className={styles.loadingContainer}>
              <CircularProgress style={{ color: "white" }} />
            </div>
          ) : currentUser?.error ? (
            <div
              style={{ color: "white", textAlign: "center", marginTop: "88px" }}
            >
              User not found
            </div>
          ) : currentUser ? (
            <div style={{ backgroundColor: "#008DE4" }}>
              <div className={styles.userBarContainer}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={arrowIcon}
                    alt="back"
                    className={styles.backArrow}
                    onClick={() => history.goBack()}
                  />
                  <UserAvatar disabled user={currentUser} />
                  <div style={{ marginLeft: "12px" }}>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "rgba(255, 255, 255, 0.8)",
                        fontWeight: 600,
                      }}
                    >
                      Incubator{" "}
                      {currentUser.isAdmin
                        ? "admin"
                        : currentUser.isContributor
                        ? "contributor"
                        : currentUser.isSuperUser
                        ? "Proposal Owner"
                        : "member"}
                    </div>
                    <div className={styles.userBarUsername}>
                      {currentUser.username}
                    </div>
                  </div>
                </div>
                <div>
                  {loggedInUser &&
                    loggedInUser.username === currentUser.username && (
                      <div>
                        {loggedInUser.isSuperUser && (
                          <div
                            onClick={() => history.push(UserManagementLocation)}
                            className={styles.editCTA}
                            style={{
                              marginBottom: "8px",
                              backgroundColor: "#AD1D73",
                            }}
                          >
                            User management
                          </div>
                        )}
                        <div
                          className={styles.editCTA}
                          onClick={() => setEditProfile(true)}
                        >
                          <img
                            src={editIcon}
                            alt="edit"
                            style={{ marginRight: "4px", width: "14px" }}
                          />
                          <div>Edit Profile</div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
              <div className={styles.contentContainer}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div className={styles.sectionHeader}>BIO</div>
                    <div
                      style={{
                        marginTop: "24px",
                        fontSize: "14px",
                        lineHeight: "18px",
                      }}
                    >
                      {currentUser.bio}
                    </div>
                    <div
                      className={styles.sectionHeader}
                      style={{ marginTop: "48px" }}
                    >
                      SUBMITTED CONCEPTS
                    </div>
                    <div style={{ marginTop: "24px" }}>
                      {currentUser.bounties?.map((bounty) => (
                        <div
                          style={{ cursor: "pointer", marginBottom: "20px" }}
                          onClick={() =>
                            history.push(ConceptLocation(bounty.displayURL))
                          }
                        >
                          <div
                            style={{
                              fontSize: "14px",
                              lineHeight: "17px",
                              fontWeight: 600,
                            }}
                          >
                            {bounty.title}
                          </div>
                          <div
                            style={{
                              fontSize: "10px",
                              lineHeight: "12px",
                              marginTop: "6px",
                            }}
                          >
                            {moment(bounty.dateCreated).fromNow()}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div
                      className={styles.sectionHeader}
                      style={{ marginTop: "44px" }}
                    >
                      TASKS
                    </div>
                    <div style={{ marginTop: "24px" }}>
                      {currentUser.tasks?.map((task) => (
                        <div
                          style={{ cursor: "pointer", marginBottom: "24px" }}
                          onClick={() =>
                            history.push(BountyLocation(task.bountyDisplayURL))
                          }
                        >
                          <div
                            style={{
                              fontSize: "14px",
                              lineHeight: "17px",
                              fontWeight: 600,
                            }}
                          >
                            {task.bountyTitle}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              lineHeight: "15px",
                              fontWeight: 600,
                              color: "rgba(11, 15, 59, 0.5)",
                              marginTop: "6px",
                            }}
                          >
                            {formatTask(task, currentUser)}
                          </div>
                          <div
                            style={{
                              marginTop: "6px",
                              fontSize: "14px",
                              lineHeight: "18px",
                              textDecoration:
                                task.status === "complete"
                                  ? "line-through"
                                  : "none",
                            }}
                            dangerouslySetInnerHTML={{
                              __html: task.description,
                            }}
                          />
                          <div
                            style={{
                              marginTop: "6px",
                              display: "flex",
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
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
                                      history.push(
                                        ProfileLocation(task.assignee.username)
                                      )
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
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.rightColumn}>
                    <div className={styles.sectionHeader}>ACTIVITY</div>
                    <div>
                      {currentUser.activity?.map((item) => (
                        <ActivityItem item={item} global />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{ color: "white", textAlign: "center", marginTop: "88px" }}
            >
              User not found
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
