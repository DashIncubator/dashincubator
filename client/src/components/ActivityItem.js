import React, { useState, useEffect } from "react";
import UserAvatar from "./UserAvatar";
import moment from "moment";
import { createUseStyles } from "react-jss";
import { BountyLocation, ConceptLocation, ProfileLocation } from "../Locations";
import { useHistory } from "react-router";
import { cleanString, truncate, Breakpoints } from "../utils/utils";
import { renderToString } from "react-dom/server";
import useGlobalState from "../state";
import Textarea from "../components/Textarea";
import { CircularProgress } from "@material-ui/core";
import { getBountyActivity, updateCommentBounty } from "../api/bountiesApi";
import { updateCommentTask, getTaskActivity } from "../api/tasksApi";

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
  contentContainer: (global) => ({
    fontSize: "12px",
    lineHeight: "15px",
    display: "flex",
    alignItems: "center",
    flexWrap: global ? "wrap" : "nowrap",
  }),
  quote: (global) => ({
    marginTop: "4px",
    backgroundColor: global ? "#D6E4EC" : "#074A73",
    borderRadius: "4px",
    padding: "8px",
    fontSize: "12px",
    wordBreak: "break-word",
  }),
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
  commentContainer: {
    marginTop: "6px",
    width: "100%",
    maxWidth: "160px",
  },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    commentContainer: {
      marginTop: "6px",
      width: "100%",
      maxWidth: "240px",
    },
  },
});

export default function ActivityItem({
  item,
  global,
  bounty,
  noMarginTop,
  search,
  onJobReview,
  task,
  setNewActivity,
  concept,
}) {
  const styles = useStyles(global);
  const history = useHistory();
  const [editing, setEditing] = useState(false);
  const [editComment, setEditComment] = useState(item.comment);
  const [loading, setLoading] = useState(false);
  const { loggedInUser } = useGlobalState();

  useEffect(() => {
    setEditComment(item.comment);
  }, [item.comment]);

  const highlightUsername = (username) =>
    search ? getHighlightedText(username, search) : username;

  const hyperLinkComment = (comment) => {
    const pattern = /\B@[a-z0-9_-]+/gi;
    const results = comment.match(pattern);
    if (results) {
      let newComment = comment.slice();
      results.forEach(
        (result) =>
          (newComment = newComment.replace(
            result,
            renderToString(
              <a href={ProfileLocation(result.replace("@", ""))}>{result}</a>
            )
          ))
      );
      return newComment;
    } else {
      return comment;
    }
  };

  const onComment = () => {
    if (editComment.length > 0 && editComment.length < 5000) {
      setEditComment("");
      setLoading(true);
      if (item.activityType === "commentBounty") {
        updateCommentBounty({ comment: editComment }, item.commentID)
          .then((data) => data.json())
          .then(() =>
            getBountyActivity(item.bountyID)
              .then((data) => data.json())
              .then((results) => {
                setEditing(false);
                setLoading(false);
                setNewActivity(results);
              })
          );
      } else if (item.activityType === "commentTask") {
        updateCommentTask({ comment: editComment }, item.commentID)
          .then((data) => data.json())
          .then(() =>
            getTaskActivity(item.taskID)
              .then((data) => data.json())
              .then((results) => {
                setEditing(false);
                setLoading(false);
                setNewActivity(results);
              })
          );
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        marginTop: noMarginTop ? 0 : "16px",
        cursor: bounty ? "auto" : global ? "pointer" : "auto",
      }}
      onClick={() =>
        global && !bounty
          ? item.activityType === "newUser"
            ? history.push(ProfileLocation(item.sourceUser.username))
            : item.activityType === "newConcept"
            ? history.push(ConceptLocation(item.bountyDisplayURL))
            : history.push(BountyLocation(item.bountyDisplayURL))
          : null
      }
    >
      <div style={{ marginRight: "8px" }}>
        <UserAvatar
          user={item.sourceUser}
          size={"18px"}
          fontSize={"8px"}
          lineHeight={"10px"}
        />
      </div>
      <div style={{ marginTop: "4px" }}>
        {item.activityType === "newTask" ? (
          <div className={styles.contentContainer}>
            <div
              style={{ fontWeight: 600, cursor: "pointer" }}
              onClick={() =>
                history.push(ProfileLocation(item.sourceUser.username))
              }
            >
              {highlightUsername(item.sourceUser.username, search)}
            </div>
            <div style={{ marginLeft: "4px" }}>
              created {global ? "a" : "this"} task
            </div>
          </div>
        ) : item.activityType === "reserveTask" ? (
          <div className={styles.contentContainer}>
            <div
              style={{ fontWeight: 600, cursor: "pointer" }}
              onClick={() =>
                history.push(ProfileLocation(item.sourceUser.username))
              }
            >
              {highlightUsername(item.sourceUser.username)}
            </div>
            <div style={{ marginLeft: "4px" }}>
              requested to reserve {global ? "a" : "this"} task
            </div>
          </div>
        ) : item.activityType === "assignTask" ? (
          <div className={styles.contentContainer}>
            <div
              style={{ fontWeight: 600, cursor: "pointer" }}
              onClick={() =>
                history.push(ProfileLocation(item.sourceUser.username))
              }
            >
              {highlightUsername(item.sourceUser.username)}
            </div>
            <div style={{ marginLeft: "4px" }}>
              assigned {global ? "a" : "this"} task to
            </div>
            <div
              style={{ fontWeight: 600, marginLeft: "4px", cursor: "pointer" }}
              onClick={() =>
                history.push(ProfileLocation(item.destinationUser.username))
              }
            >
              {highlightUsername(item.destinationUser.username)}
            </div>
          </div>
        ) : item.activityType === "requestCompleteTask" ? (
          <div>
            <div className={styles.contentContainer}>
              <div
                style={{ fontWeight: 600, cursor: "pointer" }}
                onClick={() =>
                  history.push(ProfileLocation(item.sourceUser.username))
                }
              >
                {highlightUsername(item.sourceUser.username)}
              </div>
              <div style={{ marginLeft: "4px" }}>
                requested task completion:
              </div>
            </div>
            <div
              className={styles.quote}
              dangerouslySetInnerHTML={{ __html: item.completionSummary }}
            ></div>
          </div>
        ) : item.activityType === "requestModifyTask" ? (
          <div>
            <div className={styles.contentContainer}>
              <div style={{ fontWeight: 600 }}>
                {highlightUsername(item.sourceUser.username)}
              </div>
              <div style={{ marginLeft: "4px" }}>
                requested changes to{" "}
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    history.push(ProfileLocation(item.destinationUser.username))
                  }
                >
                  <b>{highlightUsername(item.destinationUser.username)}</b>
                </span>
                's delivery:
              </div>
            </div>
            <div
              className={styles.quote}
              dangerouslySetInnerHTML={{ __html: item.reviewComments }}
            ></div>
          </div>
        ) : item.activityType === "requestApproveTask" ? (
          <div>
            <div className={styles.contentContainer}>
              <div
                style={{ fontWeight: 600, cursor: "pointer" }}
                onClick={() =>
                  history.push(ProfileLocation(item.sourceUser.username))
                }
              >
                {highlightUsername(item.sourceUser.username)}
              </div>
              <div style={{ marginLeft: "4px" }}>
                has{" "}
                <span style={{ color: global ? "green" : "#94F1CA" }}>
                  approved
                </span>{" "}
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    history.push(ProfileLocation(item.destinationUser.username))
                  }
                >
                  <b>{highlightUsername(item.destinationUser.username)}</b>
                </span>
                's delivery:
              </div>
            </div>
            <div
              className={styles.quote}
              dangerouslySetInnerHTML={{ __html: item.reviewComments }}
            ></div>
          </div>
        ) : item.activityType === "commentTask" ||
          item.activityType === "commentBounty" ? (
          <div>
            <div className={styles.contentContainer}>
              <div
                style={{ fontWeight: 600, cursor: "pointer" }}
                onClick={() =>
                  history.push(ProfileLocation(item.sourceUser.username))
                }
              >
                {highlightUsername(item.sourceUser.username)}
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                {global && (
                  <div style={{ marginLeft: "4px" }}>
                    commented on{" "}
                    {item.activityType === "commentBounty" && bounty
                      ? "this"
                      : "a"}{" "}
                    {concept
                      ? "concept"
                      : item.activityType === "commentTask"
                      ? "task"
                      : "bounty"}
                  </div>
                )}
                {loggedInUser && loggedInUser.username === item.sourceUser.username && (
                  <>
                    <span
                      style={{ marginLeft: "6px", cursor: "pointer" }}
                      onClick={() => setEditing(editing ? false : true)}
                    >
                      <u>{editing ? "cancel" : "edit"}</u>
                    </span>
                  </>
                )}
              </div>
            </div>
            {!editing ? (
              <div
                className={styles.quote}
                dangerouslySetInnerHTML={{
                  __html: hyperLinkComment(cleanString(item.comment)),
                }}
              />
            ) : (
              <div className={styles.commentContainer}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                >
                  <Textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
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
            )}
          </div>
        ) : item.activityType === "newConcept" ? (
          <div className={styles.contentContainer}>
            <div
              style={{ fontWeight: 600, cursor: "pointer" }}
              onClick={() =>
                history.push(ProfileLocation(item.sourceUser.username))
              }
            >
              {highlightUsername(item.sourceUser.username)}
            </div>
            <div style={{ marginLeft: "4px" }}>
              created {bounty ? "this" : global ? "a" : "this"} concept
            </div>
          </div>
        ) : item.activityType === "approveConcept" ? (
          <div className={styles.contentContainer}>
            <div
              style={{ fontWeight: 600, cursor: "pointer" }}
              onClick={() =>
                history.push(ProfileLocation(item.sourceUser.username))
              }
            >
              {highlightUsername(item.sourceUser.username)}
            </div>
            <div style={{ marginLeft: "4px" }}>
              approved {bounty ? "this" : global ? "a" : "this"} concept
            </div>
          </div>
        ) : item.activityType === "newUser" ? (
          <div className={styles.contentContainer}>
            <div
              style={{ fontWeight: 600, cursor: "pointer" }}
              onClick={() =>
                history.push(ProfileLocation(item.sourceUser.username))
              }
            >
              {highlightUsername(item.sourceUser.username)}
            </div>
            <div style={{ marginLeft: "4px" }}>created an account</div>
          </div>
        ) : item.activityType === "payoutTask" ? (
          <div className={styles.contentContainer}>
            <div
              style={{ fontWeight: 600, cursor: "pointer" }}
              onClick={() =>
                history.push(ProfileLocation(item.sourceUser.username))
              }
            >
              {highlightUsername(item.sourceUser.username)}
            </div>
            <div style={{ marginLeft: "4px" }}>
              paid out {global ? "a" : "this"} task completed by{" "}
              <b>{highlightUsername(item.destinationUser.username)}</b> and
              administered by{" "}
              <b>{highlightUsername(item.destinationUser2.username)}</b>
            </div>
          </div>
        ) : item.activityType === "payoutConcept" ? (
          <div className={styles.contentContainer}>
            <div
              style={{ fontWeight: 600, cursor: "pointer" }}
              onClick={() =>
                history.push(ProfileLocation(item.sourceUser.username))
              }
            >
              {highlightUsername(item.sourceUser.username)}
            </div>
            <div style={{ marginLeft: "4px" }}>
              paid out {global ? "a" : "this"} concept submission by{" "}
              <b>{highlightUsername(item.destinationUser.username)}</b>
            </div>
          </div>
        ) : null}
        {global && item.activityLevel === "task" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "4px",
              fontSize: "10px",
              lineHeight: "12px",
              cursor: "pointer",
            }}
            onClick={() => history.push(BountyLocation(item.bountyDisplayURL))}
          >
            {bounty ? (
              <div
                style={{ textDecoration: "underline" }}
                dangerouslySetInnerHTML={{
                  __html: truncate(item.taskDescription, 30),
                }}
              />
            ) : (
              <>
                <div
                  style={{ textDecoration: "underline" }}
                  dangerouslySetInnerHTML={{
                    __html: truncate(item.taskDescription, 20),
                  }}
                />
                <span style={{ margin: "0 4px" }}>in</span>
                <u>{truncate(item.bountyTitle, 20)}</u>
              </>
            )}
          </div>
        )}
        {global && item.activityLevel === "bounty" && !bounty && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "4px",
              fontSize: "10px",
              lineHeight: "12px",
              cursor: "pointer",
            }}
            onClick={() => history.push(BountyLocation(item.bountyDisplayURL))}
          >
            <u>{truncate(item.bountyTitle, 28)}</u>
          </div>
        )}
        <div
          style={{
            marginTop: "4px",
            fontSize: "10px",
            lineHeight: "12px",
            opacity: 0.5,
          }}
        >
          {moment(item.date).fromNow()}
        </div>
      </div>
      {item.completionID &&
        task?.reviews?.find(
          (comp) => comp.approvedCompletionID === item.completionID
        ) !== undefined && (
          <div style={{ boxSizing: "border-box", marginTop: "28px" }}>
            <div
              style={{
                marginLeft: "16px",
                fontSize: "13px",
                color: "#94f1ca",
              }}
            >
              APPROVED
            </div>
          </div>
        )}
      {onJobReview &&
        item.completionID &&
        loggedInUser?.username === task?.createdBy.username &&
        task?.reviews?.find(
          (comp) => comp.approvedCompletionID === item.completionID
        ) === undefined &&
        item.activityType === "requestCompleteTask" && (
          <div style={{ boxSizing: "border-box", marginTop: "20px" }}>
            <div
              style={{
                marginLeft: "16px",
                fontSize: "13px",
                cursor: "pointer",
                borderRadius: "4px",
                padding: "8px",
                backgroundColor: "#AD1D73",
              }}
              onClick={() => onJobReview(item.completionID, item.completionID)}
            >
              REVIEW COMPLETION
            </div>
          </div>
        )}
    </div>
  );
}
