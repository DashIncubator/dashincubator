import { Button, CircularProgress } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import FadeIn from "react-fade-in";
import { createUseStyles } from "react-jss";
import {
  commentBounty,
  getBounty,
  getBountyActivity,
} from "../../api/bountiesApi";
import MainLayout from "../../layouts/MainLayout";
import moment from "moment";
import { ProfileLocation } from "../../Locations";
import { useHistory } from "react-router";
import editIcon from "./images/edit.svg";
import doneIcon from "./images/done.svg";
import useGlobalState from "../../state";
import arrowIcon from "../Login/images/arrowRight.svg";
import UserAvatar from "../../components/UserAvatar";
import RequestNewConceptView from "../RequestNewConcept";
import ApproveConceptView from "../ApproveConcept";

import { formatLink, addHTTPS } from "../../utils/utils";
import { Breakpoints } from "../../utils/breakpoint";
import { isMobile } from "react-device-detect";
import ActivityItem from "../../components/ActivityItem";
import Textarea from "../../components/Textarea";

const useStyles = createUseStyles({
  container: {
    maxWidth: "100vw",
    margin: "auto",
    padding: "0 24px",
    marginTop: "32px",
    color: "#222",
    paddingBottom: "88px",
  },
  richText: {
    minHeight: "62px",
    marginTop: "8px",
    fontSize: "12px",
    lineHeight: "18px",
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
  headerDesc: {
    marginLeft: "26px",
    marginTop: "12px",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    color: "white",
    lineHeight: "24px",
    fontSize: "14px",
  },
  title: {
    marginLeft: "12px",
    color: "white",
    fontWeight: 600,
    fontSize: "16px",
    lineHeight: "29px",
    overflowWrap: "break-word",
    wordWrap: "break-word",
    wordBreak: "break-word",
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
  rightColumn: { marginLeft: "0px", width: "100%" },
  textContainer: { flexShrink: 0, maxWidth: "100%", marginBottom: "16px" },
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
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    textContainer: { flexShrink: 0, maxWidth: "516px", marginBottom: "16px" },
    title: {
      marginLeft: "12px",
      color: "white",
      fontWeight: 600,
      fontSize: "24px",
      lineHeight: "29px",
      overflowWrap: "break-word",
      wordWrap: "break-word",
      wordBreak: "break-word",
    },
    card: {
      padding: "32px",
      backgroundColor: "white",
      position: "relative",
      borderRadius: "4px",
    },
    rightColumn: { marginLeft: "8px", width: "323px" },
  },
  [`@media (min-width: ${Breakpoints.lg}px)`]: {
    container: {
      maxWidth: 1600,
      margin: "auto",
      padding: "0 88px",
      marginTop: 32,
      color: "#0B0F3B",
      paddingBottom: "88px",
    },
  },
});

export default function ConceptView({ match }) {
  const [concept, setConcept] = useState(null);
  const [activity, setActivity] = useState([]);
  const [approveModal, setApproveModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const styles = useStyles();
  const history = useHistory();
  const { loggedInUser } = useGlobalState();

  useEffect(() => {
    getBounty(match.params.id)
      .then((result) => result.json())
      .then((data) => {
        getBountyActivity(data._id)
          .then((data) => data.json())
          .then((results) => {
            setActivity(results);
            setConcept(data);
          });
      });
  }, [match.params.id]);

  const onComment = () => {
    if (comment.length > 0 && comment.length < 5000) {
      setLoading(true);
      setComment("");
      commentBounty &&
        commentBounty({ comment, commentUser: loggedInUser }, concept._id)
          .then((data) => data.json())
          .then(() => {
            getBountyActivity(concept._id)
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
      {!concept ? (
        <FadeIn>
          <div className={styles.loader}>
            <CircularProgress style={{ color: "white" }} />
          </div>
        </FadeIn>
      ) : (
        <FadeIn>
          <RequestNewConceptView
            open={editModal}
            onClose={(e, confirm) => {
              setEditModal(false);
              if (confirm) {
                setConcept(null);
                getBounty(match.params.id)
                  .then((result) => result.json())
                  .then((data) => {
                    setConcept(data);
                  });
              }
            }}
            concept={concept}
          />
          <ApproveConceptView
            open={approveModal}
            onClose={() => setApproveModal(false)}
            concept={concept}
          />
          <div className={styles.container}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={arrowIcon}
                alt="back"
                className={styles.arrowBack}
                onClick={() => history.goBack()}
              />
              <div className={styles.title}>{concept.title}</div>
            </div>
            <div className={styles.headerDesc}>
              <div style={{ marginRight: "8px" }}>Concept requested by</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() =>
                  history.push(ProfileLocation(concept.user.username))
                }
              >
                <UserAvatar
                  user={concept.user}
                  size={"18px"}
                  fontSize={"8px"}
                  lineHeight={"10px"}
                />
                <div style={{ marginLeft: "8px" }}>
                  <b>{concept.user.username}</b>
                  <span style={{ marginLeft: "8px" }}>
                    {moment(concept.dateCreated).fromNow()}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.card} style={{ marginTop: "24px" }}>
              {loggedInUser &&
                loggedInUser.isAdmin &&
                concept.user.username !== loggedInUser.username && (
                  <Button
                    style={{
                      fontWeight: 600,
                      position: isMobile ? "static" : "absolute",
                      top: "-48px",
                      lineHeight: "15px",
                      padding: "8px",
                      right: "0px",
                      color: "white",
                      fontSize: "12px",
                      backgroundColor: "#0B0F3B",
                      display: "flex",
                      alignItems: "center",
                      textTransform: "none",
                      marginBottom: isMobile ? "24px" : "0px",
                    }}
                    onClick={() => setApproveModal(true)}
                  >
                    <img
                      src={doneIcon}
                      alt="approve"
                      style={{
                        width: "16px",
                        marginRight: "4px",
                      }}
                    />
                    <div>Approve Concept</div>
                  </Button>
                )}
              {loggedInUser && loggedInUser.username === concept.user.username && (
                <Button
                  style={{
                    fontWeight: 600,
                    position: isMobile ? "static" : "absolute",
                    top: "-48px",
                    lineHeight: "15px",
                    padding: "8px",
                    right:
                      loggedInUser.isAdmin &&
                      loggedInUser.username !== concept.user.username
                        ? "152px"
                        : "0px",
                    color: "white",
                    fontSize: "12px",
                    backgroundColor: "#0B0F3B",
                    display: "flex",
                    alignItems: "center",
                    marginBottom: isMobile ? "24px" : "0px",
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <div className={styles.textContainer}>
                  <div className={styles.header}>VALUE PROPOSITION</div>
                  <div
                    className={styles.richText}
                    dangerouslySetInnerHTML={{
                      __html: concept.valueProposition,
                    }}
                  />
                  <div style={{ marginTop: "16px" }} className={styles.header}>
                    GENERAL REQUIREMENTS
                  </div>
                  <div
                    className={styles.richText}
                    dangerouslySetInnerHTML={{
                      __html: concept.generalRequirements,
                    }}
                  />
                </div>
                <div className={styles.rightColumn}>
                  <div
                    className={styles.header}
                    style={{
                      marginBottom: "12px",
                    }}
                  >
                    SUPPORTING LINKS
                  </div>
                  {concept.links.map((link) => (
                    <a
                      href={addHTTPS(link)}
                      target={"_blank"}
                      rel="noreferrer"
                      className={styles.link}
                    >
                      {formatLink(link)}
                    </a>
                  ))}
                </div>
              </div>
              <div>
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
                        readOnly={!loggedInUser}
                      />
                      <div
                        className={styles.commentCTA}
                        onClick={() => !loading && loggedInUser && onComment()}
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
                    concept
                  />
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      )}
    </MainLayout>
  );
}
