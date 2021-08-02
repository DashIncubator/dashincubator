import React, { useState, useEffect } from "react";
import { createUseStyles } from "react-jss";
import { updateBounty } from "../../api/bountiesApi";
import { BountyLocation } from "../../Locations";
import { useHistory } from "react-router";
import { CircularProgress } from "@material-ui/core";
import DashModal from "../../components/DashModal";
import doneIcon from "../Concept/images/done.svg";
import { Breakpoints } from "../../utils/breakpoint";
import projectIcon from "./images/project.svg";
import jobIcon from "./images/job.svg";
import serviceIcon from "./images/service.svg";
import { getAdminsSimple } from "../../api/usersApi";
//import removeIcon from "./images/remove.svg";
import useGlobalState from "../../state";
import programmeIcon from "./images/programme.svg";

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
    fontSize: "12px",
    lineHeight: "18px",
    marginTop: "16px",
    width: "100%",
  },
  container: { minWidth: "auto", maxWidth: "100%" },
  CTA: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#008DE4",
    padding: "8px",
    cursor: "pointer",
    borderRadius: "4px",
    marginRight: "32px",
  },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    CTA: {
      display: "flex",
      alignItems: "center",
      backgroundColor: "#008DE4",
      padding: "8px",
      cursor: "pointer",
      borderRadius: "4px",
      marginRight: "0px",
    },
    container: { minWidth: "550px", maxWidth: "646px" },
  },
});

export default function ApproveConceptView({ open, onClose, concept }) {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("project");
  const [primaryAdmin, setPrimaryAdmin] = useState(null);
  const [secondaryAdmin, setSecondaryAdmin] = useState(null);
  const [error, setError] = useState(null);
  const [admins, setAdmins] = useState([]);
  const { loggedInUser } = useGlobalState();
  //const [tags, setTags] = useState([]);
  const styles = useStyles();

  useEffect(() => {
    getAdminsSimple()
      .then((result) => result.json())
      .then((users) => setAdmins(users));
    //eslint-disable-next-line
  }, []);

  /*const removeTag = (i) => {
    const newTags = tags.slice();
    newTags.splice(i, 1);
    setTags(newTags);
  };*/

  const onSubmit = () => {
    if (!primaryAdmin) {
      setError("Primary admin required");
    } else {
      setLoading(true);
      if (concept) {
        const data = {
          _id: concept._id,
          bountyType: type,
          approvedBy: loggedInUser,
          primaryAdmin: primaryAdmin,
          secondaryAdmin: secondaryAdmin,
          approvedDate: new Date(),
          //bountyTags: tags,
          type: "bounty",
          status: "active",
        };
        updateBounty(data).then(() =>
          history.push(BountyLocation(concept.displayURL))
        );
      }
    }
  };

  return (
    <DashModal open={open} onClose={onClose}>
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
            Approve Concept
          </div>
          <div className={styles.CTA} onClick={() => !loading && onSubmit()}>
            {loading ? (
              <CircularProgress size={12} color={"white"} />
            ) : (
              <>
                <img
                  src={doneIcon}
                  style={{ width: "14px", marginRight: "6px" }}
                  alt="submit"
                />
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "12px",
                    lineHeight: "15px",
                    color: "white",
                  }}
                >
                  Approve
                </div>
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
          <div
            style={{
              marginTop: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              padding: "4px",
              borderRadius: "4px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  backgroundColor:
                    type === "project" ? "#EF8144" : "transparent",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "25%",
                  height: "28px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => setType("project")}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img src={projectIcon} alt="project" />
                  <div
                    style={{
                      color: "white",
                      fontWeight: 600,
                      fontSize: "12px",
                      lineHeight: "15px",
                      marginLeft: "10px",
                    }}
                  >
                    Project
                  </div>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: type === "job" ? "#00B6F0" : "transparent",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "25%",
                  height: "28px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => setType("job")}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img src={jobIcon} alt="job" />
                  <div
                    style={{
                      color: "white",
                      fontWeight: 600,
                      fontSize: "12px",
                      lineHeight: "15px",
                      marginLeft: "10px",
                    }}
                  >
                    Job
                  </div>
                </div>
              </div>
              <div
                style={{
                  backgroundColor:
                    type === "service" ? "#4452EF" : "transparent",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "25%",
                  height: "28px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => setType("service")}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img src={serviceIcon} alt="service" />
                  <div
                    style={{
                      color: "white",
                      fontWeight: 600,
                      fontSize: "12px",
                      lineHeight: "15px",
                      marginLeft: "10px",
                    }}
                  >
                    Service
                  </div>
                </div>
              </div>
              <div
                style={{
                  backgroundColor:
                    type === "programme" ? "#AD1D73" : "transparent",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "25%",
                  height: "28px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => setType("programme")}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img src={programmeIcon} alt="programme" />
                  <div
                    style={{
                      color: "white",
                      fontWeight: 600,
                      fontSize: "12px",
                      lineHeight: "15px",
                      marginLeft: "10px",
                    }}
                  >
                    Programme
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.inputTitle} style={{ marginTop: "32px" }}>
            ADMINS
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "12px",
            }}
          >
            <div style={{ width: "48%" }}>
              <div
                style={{ color: "white", fontSize: "12px", lineHeight: "18px" }}
              >
                Primary
              </div>
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
                value={JSON.stringify(primaryAdmin)}
                onChange={(e) =>
                  e.target.value === ""
                    ? setPrimaryAdmin(null)
                    : setPrimaryAdmin(JSON.parse(e.target.value))
                }
              >
                <option value={""}>Select primary admin</option>
                {admins &&
                  admins
                    .filter(
                      (admin) => admin.username !== secondaryAdmin?.username
                    )
                    .map((user) => (
                      <option value={JSON.stringify(user)}>
                        {user.username}
                      </option>
                    ))}
              </select>
            </div>
            <div style={{ width: "48%" }}>
              <div
                style={{ color: "white", fontSize: "12px", lineHeight: "18px" }}
              >
                Secondary (optional)
              </div>
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
                value={JSON.stringify(secondaryAdmin)}
                onChange={(e) =>
                  e.target.value === ""
                    ? setSecondaryAdmin(null)
                    : setSecondaryAdmin(JSON.parse(e.target.value))
                }
              >
                <option value={""}>Select secondary admin</option>
                {admins &&
                  admins
                    .filter(
                      (admin) => admin.username !== primaryAdmin?.username
                    )
                    .map((user) => (
                      <option value={JSON.stringify(user)}>
                        {user.username}
                      </option>
                    ))}
              </select>
            </div>
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
              {bountyTags?.map((bountyTag) => (
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
