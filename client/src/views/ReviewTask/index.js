import React, { useState, useEffect } from "react";
import { createUseStyles } from "react-jss";
import DashModal from "../../components/DashModal";
import doneIcon from "../Concept/images/done.svg";
import useGlobalState from "../../state";
import { toolbarConfig, addHTTPS } from "../../utils/utils";
import RichTextEditor from "react-rte";
import {
  getTask,
  requestToApproveTask,
  requestToModifyTask,
} from "../../api/tasksApi";
import UserAvatar from "../../components/UserAvatar";
import commentIcon from "./images/comment.svg";
import { CircularProgress } from "@material-ui/core";
import { ProfileLocation } from "../../Locations";
import { useHistory } from "react-router";
import { Breakpoints } from "../../utils/breakpoint";

const useStyles = createUseStyles({
  rte: {
    backgroundColor: "white",
    border: "none",
    minHeight: "116px",
    fontSize: "12px",
    boxShadow: "none",
    borderRadius: "4px",
    marginTop: "16px",
    fontFamily: "inherit",
  },
  toolbar: { fontSize: "12px" },
  input: {
    borderRadius: "4px",
    padding: "8px",
    fontSize: "12px",
    lineHeight: "18px",
    marginTop: "16px",
    width: "100%",
  },
  container: { minWidth: "auto", maxWidth: "100vw" },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    container: { minWidth: "550px", maxWidth: "646px" },
  },
});

export default function ReviewTaskView({ open, onClose, task }) {
  const [loading, setLoading] = useState(false);
  const [addressMode, setAddressMode] = useState(false);
  const [dashAddress, setDashAddress] = useState("");
  const [error, setError] = useState("");
  const [reviewComments, setReviewComments] = useState(
    RichTextEditor.createEmptyValue()
  );
  const { loggedInUser } = useGlobalState();
  const styles = useStyles();
  const history = useHistory();

  useEffect(() => {
    setAddressMode(false);
  }, [open]);

  const completion =
    task?.completions?.length && task.completions[task.completions.length - 1];

  const onComplete = async () => {
    if (reviewComments.toString("html").length < 12) {
      setError("Comment is required");
    } else if (dashAddress.length < 1) {
      setError("DASH address is required");
    } else {
      setLoading(true);
      await requestToApproveTask(
        {
          approvedDate: new Date(),
          approvedComments: reviewComments.toString("html"),
          approvedAdmin: loggedInUser,
          approvedContributor: completion.completionUser,
          approvedAdminAddress: dashAddress,
          approvedContributorAddress: completion.completionAddress,
          approvedOutput: completion.completionDescription,
          approvedCompletionID: completion.cid,
          approvedOutputSourceURL: completion.completionSourceURL,
          approvedOutputDeployURL: completion.completionDeployURL,
        },
        task._id
      );
      const newTask = await getTask(task._id);
      const taskData = await newTask.json();
      setLoading(false);
      onClose(null, taskData);
    }
  };

  const onRequestChanges = async () => {
    if (reviewComments.toString("html").length < 12) {
      setError("Comment is required");
    } else {
      setLoading(true);
      await requestToModifyTask(
        {
          reviewDate: new Date(),
          reviewComments: reviewComments.toString("html"),
          reviewUser: loggedInUser,
          reviewCompletionID: completion.cid,
        },
        task._id
      );
      const newTask = await getTask(task._id);
      const taskData = await newTask.json();
      setLoading(false);
      onClose(null, taskData);
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
            Review task
          </div>
        </div>
        {error && (
          <div
            style={{
              marginTop: "16px",
              fontSize: "14px",
              fontWeight: 600,
              color: "red",
            }}
          >
            {error}
          </div>
        )}
        <div
          style={{
            marginTop: "32px",
            display: "flex",
            alignItems: "center",
            color: "#008DE4",
            fontSize: "12px",
            fontWeight: 600,
            lineHeight: "15px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          <div style={{ marginRight: "8px" }}>
            task completion summary - submitted by
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "white",
              cursor: "pointer",
            }}
            onClick={() =>
              history.push(ProfileLocation(completion?.completionUser.username))
            }
          >
            <UserAvatar
              size={18}
              fontSize={"8px"}
              lineHeight={"10px"}
              user={completion?.completionUser}
            />
            <div style={{ marginLeft: "6px" }}>
              {completion?.completionUser.username}
            </div>
          </div>
        </div>
        <div
          style={{ fontSize: "12px", lineHeight: "18px", marginTop: "12px" }}
          dangerouslySetInnerHTML={{
            __html: completion?.completionDescription,
          }}
        />
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
          style={{ marginTop: "16px", fontSize: "12px", lineHeight: "15px" }}
        >
          <a
            href={addHTTPS(completion?.completionSourceURL)}
            target={"_blank"}
            rel="noreferrer"
            style={{ color: "white", textDecoration: "underline" }}
          >
            {completion?.completionSourceURL}
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
          style={{ marginTop: "16px", fontSize: "12px", lineHeight: "15px" }}
        >
          <a
            href={addHTTPS(completion?.completionDeployURL)}
            target={"_blank"}
            rel="noreferrer"
            style={{ color: "white", textDecoration: "underline" }}
          >
            {completion?.completionDeployURL}
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
          TASK REVIEW COMMENTS
        </div>
        <div style={{ color: "#0B0F3B" }}>
          <RichTextEditor
            className={styles.rte}
            value={reviewComments}
            onChange={(val) => {
              setReviewComments(val);
            }}
            placeholder={"Enter review comments"}
            toolbarClassName={styles.toolbar}
            editorClassName={styles.toolbar}
            toolbarConfig={toolbarConfig}
          />
        </div>
        <div
          style={{
            marginTop: "32px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          {addressMode ? (
            <input
              className={styles.input}
              placeholder={"ENTER YOUR DASH ADDRESS TO COMPLETE TASK APPROVAL"}
              value={dashAddress}
              onChange={(e) => setDashAddress(e.target.value)}
              style={{ marginTop: 0 }}
            />
          ) : (
            <div
              style={{
                backgroundColor: "#4452EF",
                color: "white",
                fontSize: "12px",
                fontWeight: 600,
                padding: "8px",
                borderRadius: "4px",
                display: "flex",
                cursor: "pointer",
                alignItems: "center",
              }}
              onClick={() => !loading && onRequestChanges()}
            >
              {loading ? (
                <CircularProgress color="white" size={12} />
              ) : (
                <>
                  <img
                    src={commentIcon}
                    alt="comment"
                    style={{ marginRight: "6px" }}
                  />
                  <div>Request changes</div>
                </>
              )}
            </div>
          )}
          <div
            style={{
              backgroundColor: "#008DE4",
              color: "white",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: 600,
              padding: "8px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              marginLeft: "20px",
            }}
            onClick={() =>
              addressMode
                ? !loading && onComplete()
                : !loading && setAddressMode(true)
            }
          >
            {loading ? (
              <CircularProgress color="white" size={12} />
            ) : (
              <>
                <img src={doneIcon} alt="done" style={{ marginRight: "6px" }} />
                <div>{addressMode ? "Done" : "Approve task"}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashModal>
  );
}
