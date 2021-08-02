import React, { useState, useEffect } from "react";
import { createUseStyles } from "react-jss";
import { useHistory } from "react-router";
import checkIcon from "../views/Tasks/images/check.svg";
import checkedIcon from "../views/Tasks/images/checked.svg";
import { renderToString } from "react-dom/server";
import { BountyLocation, ProfileLocation } from "../Locations";
import moment from "moment";
import { truncate } from "../utils/utils";
import { Breakpoints } from "../utils/breakpoint";

import { CircularProgress } from "@material-ui/core";
import { readNotification } from "../api/notificationsApi";

const useStyles = createUseStyles({
  contentContainer: {
    fontSize: "12px",
    lineHeight: "15px",
    display: "flex",
    alignItems: "center",
  },
  quote: {
    marginTop: "4px",
    backgroundColor: "#D6E4EC",
    borderRadius: "4px",
    padding: "8px",
    fontSize: "12px",
  },
  hyperLinkContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: "4px",
    fontSize: "10px",
    lineHeight: "12px",
    cursor: "pointer",
  },
  container: {
    display: "flex",
    marginTop: "24px",
    alignItems: "center",
    maxWidth: "270px",
  },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    container: {
      display: "flex",
      marginTop: "24px",
      alignItems: "center",
      maxWidth: "100%",
    },
  },
});

export default function NotificationItem({ notification }) {
  const history = useHistory();
  const styles = useStyles();
  const [loading, setLoading] = useState(false);
  const [isRead, setIsRead] = useState(notification.isRead);

  const onRead = async () => {
    setLoading(true);
    await readNotification(notification._id);
    setIsRead(true);
    setLoading(false);
  };

  useEffect(() => {
    setIsRead(notification.isRead);
  }, [notification]);

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

  return (
    <div>
      <div className={styles.container}>
        <div
          style={{
            marginRight: "12px",
            cursor: !isRead ? "pointer" : "auto",
          }}
          onClick={() => !isRead && onRead()}
        >
          {loading ? (
            <CircularProgress style={{ color: "white" }} size={16} />
          ) : (
            <img
              src={isRead ? checkedIcon : checkIcon}
              alt="read"
              style={{ width: "16px", height: "16px" }}
            />
          )}
        </div>
        <div>
          {notification.notificationType === "mentionBounty" ||
          notification.notificationType === "mentionTask" ? (
            <div>
              <div className={styles.contentContainer}>
                <div
                  style={{ fontWeight: 600, cursor: "pointer" }}
                  onClick={() =>
                    history.push(
                      ProfileLocation(notification.sourceUser.username)
                    )
                  }
                >
                  {notification.sourceUser.username}
                </div>

                <div style={{ marginLeft: "4px" }}>
                  mentioned you on a{" "}
                  {notification.notificationType === "mentionTask"
                    ? "task"
                    : "bounty"}
                </div>
              </div>
              <div
                className={styles.quote}
                dangerouslySetInnerHTML={{
                  __html: hyperLinkComment(notification.comment),
                }}
              ></div>
            </div>
          ) : notification.notificationType === "assignTask" ? (
            <div className={styles.contentContainer}>
              <div
                style={{ fontWeight: 600, cursor: "pointer" }}
                onClick={() =>
                  history.push(
                    ProfileLocation(notification.sourceUser.username)
                  )
                }
              >
                {notification.sourceUser.username}
              </div>

              <div style={{ marginLeft: "4px" }}>assigned you to a task</div>
            </div>
          ) : notification.notificationType === "reserveTask" ? (
            <div className={styles.contentContainer}>
              <div
                style={{ fontWeight: 600, cursor: "pointer" }}
                onClick={() =>
                  history.push(
                    ProfileLocation(notification.sourceUser.username)
                  )
                }
              >
                {notification.sourceUser.username}
              </div>

              <div style={{ marginLeft: "4px" }}>
                requested to reserve a task you're admining
              </div>
            </div>
          ) : notification.notificationType === "requestCompleteTask" ? (
            <div>
              <div className={styles.contentContainer}>
                <div
                  style={{ fontWeight: 600, cursor: "pointer" }}
                  onClick={() =>
                    history.push(
                      ProfileLocation(notification.sourceUser.username)
                    )
                  }
                >
                  {notification.sourceUser.username}
                </div>

                <div style={{ marginLeft: "4px" }}>
                  is requesting your review on their task completion{" "}
                </div>
              </div>
              <div
                className={styles.quote}
                dangerouslySetInnerHTML={{
                  __html: hyperLinkComment(notification.completionSummary),
                }}
              ></div>
            </div>
          ) : notification.notificationType === "requestModifyTask" ? (
            <div>
              <div className={styles.contentContainer}>
                <div
                  style={{ fontWeight: 600, cursor: "pointer" }}
                  onClick={() =>
                    history.push(
                      ProfileLocation(notification.sourceUser.username)
                    )
                  }
                >
                  {notification.sourceUser.username}
                </div>

                <div style={{ marginLeft: "4px" }}>
                  is requesting modifications on your task completion{" "}
                </div>
              </div>
              <div
                className={styles.quote}
                dangerouslySetInnerHTML={{
                  __html: hyperLinkComment(notification.reviewComments),
                }}
              ></div>
            </div>
          ) : notification.notificationType === "requestApproveTask" ? (
            <div>
              <div className={styles.contentContainer}>
                <div
                  style={{ fontWeight: 600, cursor: "pointer" }}
                  onClick={() =>
                    history.push(
                      ProfileLocation(notification.sourceUser.username)
                    )
                  }
                >
                  {notification.sourceUser.username}
                </div>

                <div style={{ marginLeft: "4px" }}>
                  approved your task completion <span>🎉</span>
                </div>
              </div>
              <div
                className={styles.quote}
                dangerouslySetInnerHTML={{
                  __html: hyperLinkComment(notification.reviewComments),
                }}
              ></div>
            </div>
          ) : notification.notificationType === "payoutTask" ? (
            <div className={styles.contentContainer}>
              <div
                style={{ fontWeight: 600, cursor: "pointer" }}
                onClick={() =>
                  history.push(
                    ProfileLocation(notification.sourceUser.username)
                  )
                }
              >
                {notification.sourceUser.username}
              </div>

              <div style={{ marginLeft: "4px" }}>
                just paid you out {parseFloat(notification.payout).toFixed(3)}{" "}
                DASH 💸
              </div>
            </div>
          ) : notification.notificationType === "payoutConcept" ? (
            <div className={styles.contentContainer}>
              <div
                style={{ fontWeight: 600, cursor: "pointer" }}
                onClick={() =>
                  history.push(
                    ProfileLocation(notification.sourceUser.username)
                  )
                }
              >
                {notification.sourceUser.username}
              </div>

              <div style={{ marginLeft: "4px" }}>
                just paid you out {parseFloat(notification.payout).toFixed(3)}{" "}
                DASH 💸
              </div>
            </div>
          ) : notification.notificationType === "approveConcept" ? (
            <div className={styles.contentContainer}>
              <div
                style={{ fontWeight: 600, cursor: "pointer" }}
                onClick={() =>
                  history.push(
                    ProfileLocation(notification.sourceUser.username)
                  )
                }
              >
                {notification.sourceUser.username}
              </div>

              <div style={{ marginLeft: "4px" }}>approved your concept</div>
            </div>
          ) : (
            <div>...</div>
          )}
          {notification.notificationLevel === "task" && (
            <div
              className={styles.hyperLinkContainer}
              onClick={() =>
                history.push(BountyLocation(notification.bountyDisplayURL))
              }
            >
              <div
                style={{ textDecoration: "underline" }}
                dangerouslySetInnerHTML={{
                  __html: truncate(notification.taskDescription, 20),
                }}
              />
              <span style={{ margin: "0 4px" }}>in</span>
              <u>{truncate(notification.bountyTitle, 20)}</u>
            </div>
          )}
          {notification.notificationLevel === "bounty" && (
            <div
              className={styles.hyperLinkContainer}
              onClick={() =>
                history.push(BountyLocation(notification.bountyDisplayURL))
              }
            >
              <u>{truncate(notification.bountyTitle, 28)}</u>
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
            {moment(notification.date).fromNow()}
          </div>
        </div>
      </div>
    </div>
  );
}
