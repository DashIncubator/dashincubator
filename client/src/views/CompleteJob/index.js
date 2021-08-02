import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import DashModal from "../../components/DashModal";
import doneIcon from "../Concept/images/done.svg";
import useGlobalState from "../../state";
import { isValidURL, toolbarConfig } from "../../utils/utils";
import { Breakpoints } from "../../utils/breakpoint";

import RichTextEditor from "react-rte";
import { getTask, requestToCompleteJob } from "../../api/tasksApi";
import { CircularProgress } from "@material-ui/core";

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
  CTA: {
    backgroundColor: "#008DE4",
    cursor: "pointer",
    color: "white",
    fontSize: "12px",
    lineHeight: "15px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    marginRight: "32px",
    padding: "8px",
    borderRadius: "4px",
  },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    container: { minWidth: "550px", maxWidth: "646px" },
    CTA: {
      backgroundColor: "#008DE4",
      cursor: "pointer",
      color: "white",
      fontSize: "12px",
      lineHeight: "15px",
      fontWeight: 600,
      marginRight: "0px",
      display: "flex",
      alignItems: "center",
      padding: "8px",
      borderRadius: "4px",
    },
  },
});

export default function CompleteJobView({ open, onClose, task }) {
  const [loading, setLoading] = useState(false);
  const [dashAddress, setDashAddress] = useState("");
  const [sourceURL, setSourceURL] = useState("");
  const [deployURL, setDeployURL] = useState("");
  const [error, setError] = useState(null);
  const [description, setDescription] = useState(
    RichTextEditor.createEmptyValue()
  );
  const { loggedInUser } = useGlobalState();
  const styles = useStyles();

  const onComplete = async () => {
    if (sourceURL.length < 1) {
      setError("Source link is required");
    } else if (!isValidURL(sourceURL)) {
      setError("Invalid source URL");
    } else if (deployURL.length > 0 && !isValidURL(deployURL)) {
      setError("Invalid deploy URL");
    } else if (dashAddress.length < 1) {
      setError("DASH address is required");
    } else if (description.toString("html").length < 12) {
      setError("Summary is required");
    } else {
      setLoading(true);
      await requestToCompleteJob(
        {
          completionDate: new Date(),
          completionDescription: description.toString("html"),
          completionAddress: dashAddress,
          completionUser: loggedInUser,
          completionSourceURL: sourceURL,
          completionDeployURL: deployURL,
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
            Submit job completion
          </div>
          <div className={styles.CTA} onClick={() => !loading && onComplete()}>
            {!loading ? (
              <>
                <img src={doneIcon} alt="done" style={{ marginRight: "6px" }} />
                <div>Submit completion</div>
              </>
            ) : (
              <CircularProgress color={"white"} size={12} />
            )}
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
            color: "#008DE4",
            fontSize: "12px",
            fontWeight: 600,
            lineHeight: "15px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Task details
        </div>
        <div
          style={{ fontSize: "15px", lineHeight: "18px", marginTop: "20px" }}
          dangerouslySetInnerHTML={{ __html: task.description }}
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
          Source link
        </div>
        <input
          className={styles.input}
          placeholder={"Enter source link"}
          value={sourceURL}
          onChange={(e) => setSourceURL(e.target.value)}
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
          Deploy link
        </div>
        <input
          className={styles.input}
          placeholder={"Enter deploy link"}
          value={deployURL}
          onChange={(e) => setDeployURL(e.target.value)}
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
          task completion summary
        </div>
        <div style={{ color: "#0B0F3B" }}>
          <RichTextEditor
            className={styles.rte}
            value={description}
            onChange={(val) => {
              setDescription(val);
            }}
            placeholder={"Enter completion summary"}
            toolbarClassName={styles.toolbar}
            editorClassName={styles.toolbar}
            toolbarConfig={toolbarConfig}
          />
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
          DASH ADDRESS
        </div>
        <input
          className={styles.input}
          placeholder={"Enter DASH address"}
          value={dashAddress}
          onChange={(e) => setDashAddress(e.target.value)}
        />
      </div>
    </DashModal>
  );
}
