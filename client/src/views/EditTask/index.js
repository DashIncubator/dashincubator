import React, { useState, useEffect } from "react";
import { createUseStyles } from "react-jss";
import { CircularProgress } from "@material-ui/core";
import DashModal from "../../components/DashModal";
import saveIcon from "../Concept/images/done.svg";
import { fetchUsersSimple } from "../../api/usersApi";
import addIcon from "../Tasks/images/add.svg";
import specIcon from "./images/spec.svg";
import productionIcon from "./images/production.svg";
import qaIcon from "./images/qa.svg";
import useGlobalState from "../../state";

import { createTask, updateTask } from "../../api/tasksApi";
import { getBounty } from "../../api/bountiesApi";

import UserAvatar from "../../components/UserAvatar";
import Textarea from "../../components/Textarea";
import DateFnsUtils from "@date-io/date-fns";
import { Event } from "@material-ui/icons";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import { makeStyles } from "@material-ui/core/styles";
import { Breakpoints } from "../../utils/breakpoint";

const useStyles = createUseStyles({
  inputTitle: {
    color: "#008DE4",
    letterSpacing: "0.1em",
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "15px",
  },
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
    border: "none",
    fontSize: "12px",
    lineHeight: "18px",
    marginTop: "16px",
    fontFamily: "inherit",
    resize: "none",
    width: "100%",
  },
  selector: {
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "34%",
    height: "28px",
    borderRadius: "4px",
    cursor: "pointer",
    userSelect: "none",
  },
  selectorLabel: {
    color: "white",
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "15px",
    marginLeft: "10px",
  },
  selectorContainer: {
    marginTop: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: "4px",
    borderRadius: "4px",
  },
  CTA: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#008DE4",
    padding: "8px",
    cursor: "pointer",
    borderRadius: "4px",
    marginRight: "32px",
  },
  assigneeInput: {
    border: "none",
    padding: "8px 16px 8px 8px",
    width: "100%",
    borderRadius: "4px",
    fontSize: "12px",
    lineHeight: "18px",
    marginTop: "16px",
  },
  CTAText: {
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "15px",
    color: "white",
  },
  dashRate: {
    minWidth: "68px",
    color: "white",
    marginLeft: "16px",
    fontWeight: 600,
  },
  timepicker: {
    color: "white",
  },
  container: { minWidth: "auto", maxWidth: "100vw" },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    container: { minWidth: "550px", maxWidth: "646px" },
    CTA: {
      display: "flex",
      alignItems: "center",
      backgroundColor: "#008DE4",
      padding: "8px",
      cursor: "pointer",
      marginRight: "0px",
      borderRadius: "4px",
    },
  },
});

const useMUIStyles = makeStyles({
  input: {
    borderBottom: "1px solid #fff",
    color: "white",
  },
});

export default function EditTaskView({ open, onClose, concept, task }) {
  const [loading, setLoading] = useState(false);
  const [conceptData, setConceptData] = useState(concept);
  const [description, setDescription] = useState(task ? task.description : "");
  const [type, setType] = useState(task ? task.taskType : "spec");
  const [date, setDate] = useState(task && task.date ? task.date : new Date());
  const [users, setUsers] = useState([]);
  const [dashRate, setDashRate] = useState(null);
  const [payout, setPayout] = useState(task ? task.payout : 0);
  const [assignee, setAssignee] = useState(task ? task.assignee : null);
  const [error, setError] = useState(null);
  const { loggedInUser } = useGlobalState();

  const styles = useStyles();
  const classes = useMUIStyles();

  const priceError =
    (type === "spec" && payout > 5) ||
    (type === "qa" && payout > 5) ||
    (type === "production" && payout > 20);

  useEffect(() => {
    setType(task ? task.taskType : "spec");
    setDescription(task ? task.description : "");
    setPayout(task ? task.payout : 0);
    setAssignee(task ? task.assignee : null);
    setDate(task && task.date ? task.date : new Date());
  }, [task, open]);

  useEffect(() => {
    fetch(
      "https://rates2.dashretail.org/rates?source=dashretail&symbol=dashusd"
    )
      .then((result) => result.json())
      .then((data) => {
        setDashRate(data[0]?.price);

        fetchUsersSimple().then((users) => {
          setUsers(
            users.filter((user) => user.username !== loggedInUser?.username)
          );

          if (!conceptData) {
            getBounty(task.bountyDisplayURL)
              .then((data) => data.json())
              .then((results) => {
                setConceptData(results);
              });
          }
        });
      });
    // eslint-disable-next-line
  }, []);

  const resetData = () => {
    setDescription("");
    setPayout(0);
    setAssignee(null);
  };

  const onSubmit = () => {
    if (description.length < 1) {
      setError("Description is required");
    } else if (!payout || payout <= 0) {
      setError("Payout is required");
    } else if (!priceError) {
      setLoading(true);
      if (task) {
        const { bountyID, ...taskData } = { ...task };
        const data = {
          ...taskData,
          _id: task._id,
          taskType: type,
          description: description,
          createdBy: loggedInUser,
          assignee: assignee,
          payout: payout,
          dueDate: date,
        };
        updateTask(data).then(() => {
          resetData();
          setLoading(false);
          onClose(null, true, data);
        });
      } else {
        const data = {
          taskType: type,
          description: description,
          createdBy: loggedInUser,
          status: "open",
          dateCreated: new Date(),
          assignee: assignee,
          dueDate: date,
          payout: payout,
          bountyTitle: conceptData?.title,
          bountyType: conceptData?.bountyType,
          bountyDisplayURL: conceptData?.displayURL,
        };
        createTask(data, conceptData?._id).then(() => {
          resetData();
          setLoading(false);
          onClose(null, true);
        });
      }
    }
  };

  return (
    <DashModal
      open={open}
      onClose={() => {
        resetData();
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
            {task ? "Edit task" : "Create new task"}
          </div>
          <div className={styles.CTA} onClick={() => !loading && onSubmit()}>
            {loading ? (
              <CircularProgress size={12} color={"white"} />
            ) : (
              <>
                <img
                  src={task ? saveIcon : addIcon}
                  style={{ width: "14px", marginRight: "6px" }}
                  alt="submit"
                />
                <div className={styles.CTAText}>{task ? "Save" : "Create"}</div>
              </>
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
        <div style={{ marginTop: "36px", color: "#0B0F3B" }}>
          <div className={styles.inputTitle}>TYPE</div>
          <div className={styles.selectorContainer}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  backgroundColor: type === "spec" ? "#EF8144" : "transparent",
                }}
                className={styles.selector}
                onClick={() => setType("spec")}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img src={specIcon} alt="spec" style={{ width: "14px" }} />
                  <div className={styles.selectorLabel}>Spec</div>
                </div>
              </div>
              <div
                style={{
                  backgroundColor:
                    type === "production" ? "#00B6F0" : "transparent",
                }}
                className={styles.selector}
                onClick={() => setType("production")}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={productionIcon}
                    alt="production"
                    style={{ width: "14px" }}
                  />
                  <div className={styles.selectorLabel}>Production</div>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: type === "qa" ? "#4452EF" : "transparent",
                }}
                className={styles.selector}
                onClick={() => setType("qa")}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img src={qaIcon} alt="qa" style={{ width: "14px" }} />
                  <div className={styles.selectorLabel}>QA</div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.inputTitle} style={{ marginTop: "32px" }}>
            DESCRIPTION
          </div>
          <div style={{ marginTop: "16px" }}>
            <Textarea
              value={description}
              placeholder={"Enter task description"}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className={styles.inputTitle} style={{ marginTop: "32px" }}>
            DUE DATE
          </div>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              format="MM/dd/yyyy"
              margin="normal"
              id="date-picker-inline"
              className={styles.timepicker}
              InputLabelProps={{
                className: classes.input,
              }}
              InputProps={{
                classes,
                style: {
                  fontWeight: 600,
                  fontSize: "12px",
                },
              }}
              keyboardIcon={
                <Event style={{ color: "white", fontSize: "18px" }} />
              }
              InputAdornmentProps={{
                style: { padding: 0, margin: 0 },
              }}
              value={date}
              onChange={(newDate) => setDate(newDate)}
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
            />
          </MuiPickersUtilsProvider>
          <div
            style={{ display: "flex", alignItems: "center", marginTop: "32px" }}
          >
            {conceptData?.bountyType !== "job" && (
              <div style={{ width: "100%", marginRight: "24px" }}>
                <div className={styles.inputTitle}>ASSIGNEE</div>
                <div>
                  <select
                    className={styles.assigneeInput}
                    value={assignee ? JSON.stringify(assignee) : null}
                    onChange={(e) =>
                      e.target.value !== "Select assignee"
                        ? setAssignee(JSON.parse(e.target.value))
                        : setAssignee(null)
                    }
                  >
                    <option value={null}>Select assignee</option>
                    {users &&
                      users.map((user) => (
                        <option value={JSON.stringify(user)}>
                          {user.username}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}
            <div>
              <div className={styles.inputTitle}>DASH</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "16px",
                }}
              >
                <input
                  className={styles.input}
                  style={{ width: "88px", marginTop: 0 }}
                  type={"number"}
                  value={payout}
                  onChange={(e) => setPayout(e.target.value)}
                />
                {dashRate && (
                  <div className={styles.dashRate}>
                    ~${Math.round(dashRate * payout).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "8px",
            }}
          >
            {task?.requests?.length > 0 ? (
              <div
                style={{
                  color: "white",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    color: "white",
                    fontSize: "12px",
                    marginRight: "8px",
                  }}
                >
                  Requested to reserve:{" "}
                </div>
                {task.requests.map((user) => (
                  <div
                    style={{
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      marginRight: "8px",
                    }}
                  >
                    <UserAvatar
                      size={18}
                      fontSize={"8px"}
                      lineHeight={"10px"}
                      user={user}
                    />{" "}
                    <div style={{ marginLeft: "6px" }}>{user.username}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div />
            )}
            {priceError && (
              <div
                style={{ marginLeft: "8px", color: "red", fontSize: "12px" }}
              >
                Error: Surpassed{" "}
                <a
                  href="https://github.com/andyfreer/dash-incubator-rules/blob/master/rules.md#271-price-list"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "red", textDecoration: "underline" }}
                >
                  maximum payout for {type} tasks
                </a>
              </div>
            )}
          </div>
          {/*<div className={styles.inputTitle} style={{ marginTop: "32px" }}>
            TAGS
          </div>
          <div style={{ position: "relative" }}>
            <select
              style={{
                border: "none",
                padding: "8px 16px 8px 8px",
                width: "100%",
                borderRadius: "4px",
                fontSize: "12px",
                lineHeight: "18px",
                marginTop: "12px",
              }}
              value={""}
              onChange={(e) =>
                tags.find((tag) => tag === e.target.value) === undefined &&
                setTags([...tags, e.target.value])
              }
            >
              <option value={""}></option>
              {bountyTags.map((bountyTag) => (
                <option value={bountyTag}>{bountyTag}</option>
              ))}
            </select>
            <div
              style={{
                position: "absolute",
                top: "17px",
                left: "8px",
                color: "#0B0F3B",
                zIndex: 11,
                display: "flex",
                alignItems: "center",
                fontSize: "12px",
                lineHeight: "18px",
              }}
            >
              {tags.map((tag, i) => (
                <div
                  style={{
                    marginRight: "6px",
                    userSelect: "none",
                    display: "flex",
                    backgroundColor: "#D6E4EC",
                    padding: "2px 8px 2px 5px",
                    alignItems: "center",
                    borderRadius: "2px",
                    justifyContent: "space-between",
                    cursor: "pointer",
                  }}
                  onClick={() => removeTag(i)}
                >
                  <div>{tag}</div>
                  <img
                    src={removeIcon}
                    alt="remove"
                    style={{
                      width: "6.5px",
                      height: "6.5px",
                      marginLeft: "6px",
                    }}
                  />
                </div>
              ))}
            </div>
                  </div>*/}
        </div>
      </div>
    </DashModal>
  );
}
