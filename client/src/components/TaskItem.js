import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import { useHistory } from "react-router";
import { ProfileLocation } from "../Locations";
import useGlobalState from "../state";
import { formatTask } from "../utils/utils";
import { Breakpoints } from "../utils/breakpoint";

import CompleteJobView from "../views/CompleteJob";
import CompleteTaskView from "../views/CompleteTask";
import EditTaskView from "../views/EditTask";
import ReviewJobView from "../views/ReviewJob";
import ReviewTaskView from "../views/ReviewTask";
import TaskDetailsView from "../views/TaskDetails";
import dashLogo from "./images/dashLogo.svg";
import UserAvatar from "./UserAvatar";

const useStyles = createUseStyles({
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
  payout: {
    marginLeft: "10px",
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "15px",
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
  editCTA: {
    marginLeft: "10px",
    textDecoration: "underline",
    fontSize: "12px",
    lineHeight: "15px",
    fontWeight: 600,
    color: "rgba(0, 0, 0, 0.5)",
    cursor: "pointer",
  },
  taskDescription: {
    fontSize: "14px",
    lineHeight: "18px",
    width: "200px",
    overflowWrap: "break-word",
    wordWrap: "break-word",
    wordBreak: "break-word",
  },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    taskDescription: {
      fontSize: "14px",
      lineHeight: "18px",
      width: "auto",
      overflowWrap: "normal",
      wordWrap: "normal",
      wordBreak: "normal",
    },
  },
});

export default function TaskItem({ taskData, i, bounty, modifyTask }) {
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCompleteJobModal, setShowCompleteJobModal] = useState(false);
  const [showJobReviewModal, setShowJobReviewModal] = useState(false);
  const [completionID, setCompletionID] = useState(null);
  const { loggedInUser } = useGlobalState();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [task, setTask] = useState(taskData);
  const styles = useStyles();

  const history = useHistory();

  return (
    <div
      style={{
        display: "flex",
        marginTop: "16px",
        color: "#0B0F3B",
      }}
    >
      <TaskDetailsView
        task={task}
        open={showDetailsModal}
        bounty={bounty}
        onClose={() => setShowDetailsModal(false)}
        onReview={() => {
          setShowDetailsModal(false);
          setShowReviewModal(true);
        }}
        onComplete={() => {
          setShowDetailsModal(false);
          setShowCompleteModal(true);
        }}
        onJobComplete={() => {
          setShowDetailsModal(false);
          setShowCompleteJobModal(true);
        }}
        onEdit={() => {
          setShowDetailsModal(false);
          setShowModal(true);
        }}
        onJobReview={(e, item) => {
          setCompletionID(item);
          setShowDetailsModal(false);
          setShowJobReviewModal(true);
        }}
      />
      <CompleteJobView
        open={showCompleteJobModal}
        onClose={(e, data) => {
          if (!data) {
            setShowCompleteJobModal(false);
          } else {
            setShowCompleteJobModal(false);
            setTask(data);
            modifyTask(i, data);
          }
        }}
        task={task}
      />
      <CompleteTaskView
        open={showCompleteModal}
        onClose={(e, data) => {
          if (!data) {
            setShowCompleteModal(false);
          } else {
            setShowCompleteModal(false);
            setTask(data);
            modifyTask(i, data);
          }
        }}
        task={task}
      />
      <ReviewJobView
        open={showJobReviewModal}
        onClose={(e, data) => {
          if (!data) {
            setShowJobReviewModal(false);
          } else {
            setShowJobReviewModal(false);
            setTask(data);
            modifyTask(i, data);
          }
        }}
        task={task}
        completionID={completionID}
      />
      <ReviewTaskView
        open={showReviewModal}
        onClose={(e, data) => {
          if (!data) {
            setShowReviewModal(false);
          } else {
            setShowReviewModal(false);
            setTask(data);
            modifyTask(i, data);
          }
        }}
        task={task}
      />
      <EditTaskView
        open={showModal}
        task={task}
        onClose={(e, submit, data) => {
          if (submit) {
            setShowModal(false);
            setTask(data);
            modifyTask(i, data);
          } else {
            setShowModal(false);
          }
        }}
        concept={bounty}
      />
      <div className={styles.index}>{i + 1}</div>
      <div>
        <div
          style={{
            fontWeight: 600,
            fontSize: "12px",
            lineHeight: "15px",
            marginBottom: "6px",
          }}
        >
          {loggedInUser && formatTask(task, loggedInUser)}
        </div>
        <div
          style={{
            textDecoration:
              task.status === "complete" ? "line-through" : "none",
          }}
          className={styles.taskDescription}
          dangerouslySetInnerHTML={{ __html: task.description }}
        />
        <div
          style={{ display: "flex", alignItems: "center", marginTop: "6px" }}
        >
          <img src={dashLogo} alt="logo" />
          <div className={styles.payout}>{task.payout} DASH</div>
          <div style={{ marginLeft: "10px" }}>
            {task.assignee ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div className={styles.assignment}>
                  {task.status === "complete" ? "Completed by" : "Assigned to"}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    flexWrap: "wrap",
                  }}
                  onClick={() =>
                    history.push(ProfileLocation(task.assignee.username))
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
                style={{ opacity: 0.5, fontSize: "12px", lineHeight: "15px" }}
              >
                Unassigned
              </div>
            )}
          </div>
          <div
            className={styles.editCTA}
            onClick={() => setShowDetailsModal(true)}
          >
            View Details
          </div>
        </div>
      </div>
    </div>
  );
}
