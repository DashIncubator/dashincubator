import React, { useEffect, useState } from "react";
import useGlobalState from "../state";

import dashLogo from "./images/dashLogo.svg";
import commentEmpty from "./images/commentEmpty.svg";
import commentNew from "./images/commentNew.svg";
import checklistIcon from "./images/checklistIcon.svg";
import productIcon from "./images/productIcon.svg";
import qualityIcon from "./images/qualityIcon.svg";

import { getTask } from "../api/tasksApi";

import TaskDetailsView from "../views/TaskDetails";
import ReviewTaskView from "../views/ReviewTask";
import CompleteTaskView from "../views/CompleteTask";
import CompleteJobView from "../views/CompleteJob";
import EditTaskView from "../views/EditTask";
import ReviewJobView from "../views/ReviewJob";

import moment from "moment";
import { longhandRelative } from "../utils/utils";
import { Breakpoints } from "../utils/breakpoint";
import { useHistory } from "react-router";
import { BountyLocation } from "../Locations";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  container: {
    padding: "12px",
    backgroundColor: "white",
    borderRadius: "6px",
    color: "#0B0F3B",
    marginBottom: "16px",
    cursor: "pointer",
  },
  taskTypeText: { marginLeft: "5px", fontSize: "11px", lineHeight: "12px" },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    taskTypeText: { marginLeft: "8px", fontSize: "11px", lineHeight: "12px" },
    container: {
      padding: "16px",
      backgroundColor: "white",
      borderRadius: "6px",
      marginBottom: "16px",
      cursor: "pointer",
    },
  },
  upperSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBox: {
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "3px",
  },
  age: {
    display: "flex",
    alignItems: "center",
    fontSize: "11px",
    lineHeight: "12px",
  },
  description: {
    marginTop: "12px",
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "22px",
    wordWrap: "break-word",
  },
  lowerSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "24px",
  },
  dashPayout: {
    marginLeft: "6px",
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "15px",
  },
  bountyLink: {
    fontSize: "11px",
    textDecoration: "underline",
    fontWeight: 500,
    cursor: "pointer",
    marginLeft: "24px",
    "&:hover": {
      color: "#363a63",
    },
  },
});

export default function TaskListCard({ taskData, onChange }) {
  const { loggedInUser } = useGlobalState();
  const styles = useStyles();
  const history = useHistory();

  const [task, setTask] = useState(taskData);
  const [unseenComments, setUnseenComments] = useState(0);
  const [completionID, setCompletionID] = useState(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCompleteJobModal, setShowCompleteJobModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showJobReviewModal, setShowJobReviewModal] = useState(false);

  moment.updateLocale("en", {
    relativeTime: longhandRelative,
  });

  useEffect(() => {
    let unseen = 0;

    if (task?.comments.length) {
      task.comments.forEach((comment) => {
        if (!comment.lastView?.[loggedInUser?.username]) {
          unseen++;
        }
      });
    }
    setUnseenComments(unseen);
    // eslint-disable-next-line
  }, [task]);

  async function refetchTask() {
    let taskData = await getTask(task._id);
    taskData = await taskData.json();
    setTask(taskData);
  }

  return (
    <>
      {showDetailsModal && (
        <TaskDetailsView
          task={task}
          open={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            refetchTask();
          }}
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
            setShowEditModal(true);
          }}
          onJobReview={(e, item) => {
            setCompletionID(item);
            setShowDetailsModal(false);
            setShowJobReviewModal(true);
          }}
        />
      )}
      {showReviewModal && (
        <ReviewTaskView
          task={task}
          open={showReviewModal}
          onClose={(e, data) => {
            setShowReviewModal(false);
            if (data) {
              onChange();
              setTask(data);
            }
          }}
        />
      )}
      {showCompleteModal && (
        <CompleteTaskView
          task={task}
          open={showCompleteModal}
          onClose={(e, data) => {
            setShowCompleteModal(false);
            if (data) {
              onChange();
              setTask(data);
            }
          }}
        />
      )}
      {showCompleteJobModal && (
        <CompleteJobView
          task={task}
          open={showCompleteJobModal}
          onClose={(e, data) => {
            setShowCompleteJobModal(false);
            if (data) {
              onChange();
              setTask(data);
            }
          }}
        />
      )}
      {showEditModal && (
        <EditTaskView
          task={task}
          open={showEditModal}
          onClose={(e, submit, data) => {
            setShowEditModal(false);
            if (submit) {
              onChange();
              setTask(data);
            }
          }}
        />
      )}
      {showJobReviewModal && (
        <ReviewJobView
          task={task}
          completionID={completionID}
          open={showJobReviewModal}
          onClose={(e, data) => {
            setShowJobReviewModal(false);
            if (data) {
              onChange();
              setTask(data);
            }
          }}
        />
      )}
      <div
        className={styles.container}
        onClick={() => setShowDetailsModal(true)}
      >
        <div className={styles.upperSection}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              className={styles.iconBox}
              style={{
                backgroundColor:
                  task.taskType === "spec"
                    ? "#EF8144"
                    : task.taskType === "production"
                    ? "#4452EF"
                    : task.taskType === "qa"
                    ? "#00B6F0"
                    : "#AD1D73",
              }}
            >
              <img
                src={
                  task.taskType === "spec"
                    ? checklistIcon
                    : task.taskType === "production"
                    ? productIcon
                    : task.taskType === "qa"
                    ? qualityIcon
                    : null
                }
                style={{ width: "12px" }}
                alt="icon"
              />
            </div>
            <div className={styles.taskTypeText}>
              {task.taskType === "spec"
                ? "Spec"
                : task.taskType === "production"
                ? "Production"
                : task.taskType === "qa"
                ? "QA"
                : null}
            </div>
          </div>
          <div className={styles.age}>
            <div>Created {moment(task.dateCreated).fromNow()}</div>
          </div>
        </div>

        <div className={styles.description}>{task.description}</div>

        <div className={styles.lowerSection}>
          <div style={{ display: "flex" }}>
            <img src={dashLogo} alt="dash" />
            <div className={styles.dashPayout}>{task.payout} DASH</div>
            <div
              className={styles.bountyLink}
              onClick={() =>
                history.push(BountyLocation(task.bountyDisplayURL))
              }
            >
              {task.bountyTitle}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  marginRight: "12px",
                  cursor: "pointer",
                  display: "flex",
                }}
                onClick={() => setShowDetailsModal(true)}
              >
                <div style={{ marginRight: "6px", fontSize: "11px" }}>
                  {unseenComments > 0 && unseenComments}
                </div>
                <img
                  alt={"comment"}
                  src={unseenComments === 0 ? commentEmpty : commentNew}
                  style={{ width: 16 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
