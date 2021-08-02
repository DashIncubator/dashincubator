import React, { useState, useEffect } from "react";
import { createUseStyles } from "react-jss";
import { updateBounty } from "../../api/bountiesApi";
import { CircularProgress } from "@material-ui/core";
import DashModal from "../../components/DashModal";
import doneIcon from "../Concept/images/done.svg";
import {
  bountyStatus,
  //bountyTags,
  isValidURL,
  toolbarConfig,
} from "../../utils/utils";
import { Breakpoints } from "../../utils/breakpoint";

import projectIcon from "../ApproveConcept/images/project.svg";
import jobIcon from "../ApproveConcept/images/job.svg";
import serviceIcon from "../ApproveConcept/images/service.svg";
import { getAdminsSimple } from "../../api/usersApi";
//import removeIcon from "../ApproveConcept/images/remove.svg";
import deleteIcon from "../RequestNewConcept/images/close.svg";
import RichTextEditor from "react-rte";
import FadeIn from "react-fade-in";
import plusIcon from "../Tasks/images/add.svg";
import programmeIcon from "../ApproveConcept/images/programme.svg";

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
  bountyTypeItem: {
    padding: "3px 4px",
    display: "flex",
    alignItems: "center",
    borderRadius: "3px",
    marginRight: "8px",
  },
  bountyItemText: { fontWeight: 600, fontSize: "12px", lineHeight: "15px" },
  bountyTypeContainer: {
    marginTop: "12px",
    display: "flex",
    alignItems: "center",
    color: "white",
    fontSize: "14px",
  },
  container: { minWidth: "auto", maxWidth: "100vw" },
  linksContainer: { marginTop: "16px", width: "100%" },
  CTA: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#008DE4",
    padding: "8px",
    marginRight: "32px",
    cursor: "pointer",
    borderRadius: "4px",
  },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    CTA: {
      display: "flex",
      alignItems: "center",
      backgroundColor: "#008DE4",
      padding: "8px",
      marginRight: 0,
      cursor: "pointer",
      borderRadius: "4px",
    },
    container: { minWidth: "550px", maxWidth: "646px" },
    linksContainer: { marginTop: "16px", width: "646px" },
  },
});

export default function EditBountyView({ open, onClose, concept }) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(concept.bountyType);
  const [primaryAdmin, setPrimaryAdmin] = useState(concept.primaryAdmin);
  const [secondaryAdmin, setSecondaryAdmin] = useState(concept.secondaryAdmin);
  const [sourceURL, setSourceURL] = useState(concept.sourceURL);
  const [deployedURL, setDeployedURL] = useState(concept.deployedURL);
  const [status, setStatus] = useState(concept.status);
  const [admins, setAdmins] = useState([]);
  //const [tags, setTags] = useState(concept.bountyTags);
  const [title, setTitle] = useState(concept.title);
  const [error, setError] = useState(null);
  const [valueProposition, setValueProposition] = useState(
    RichTextEditor.createValueFromString(concept.valueProposition, "html")
  );
  const [generalRequirements, setGeneralRequirements] = useState(
    RichTextEditor.createValueFromString(concept.generalRequirements, "html")
  );
  const [link, setLink] = useState("");
  const [links, setLinks] = useState(concept.links);
  const styles = useStyles();

  const removeLink = (i) => {
    const newLinks = links.slice();
    newLinks.splice(i, 1);
    setLinks(newLinks);
  };

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
    if (title.length < 1) {
      setError("Title is required");
    } else if (title.length > 100) {
      setError(`Max title length: 100 characters (current: ${title.length})`);
    } else if (valueProposition.toString("html").length < 12) {
      setError(
        "Value proposition is required and must be more than 4 characters"
      );
    } else if (valueProposition.toString("html").length > 10000) {
      setError("Value proposition must not exceed 10,000 characters");
    } else if (generalRequirements.toString("html").length < 12) {
      setError(
        "General requirements are required and must be more than 4 characters"
      );
    } else if (deployedURL?.length > 0 && !isValidURL(deployedURL)) {
      setError("Deploy URL invalid");
    } else if (sourceURL?.length > 0 && !isValidURL(sourceURL)) {
      setError("Source URL invalid");
    } else if (generalRequirements.toString("html").length > 10000) {
      setError("General requirements must not exceed 10,000 characters");
    } else {
      let newLinks = links.slice();
      if (link && isValidURL(link)) {
        newLinks = [...newLinks, link];
      }
      setLoading(true);
      const data = {
        _id: concept._id,
        bountyType: type,
        primaryAdmin: primaryAdmin,
        secondaryAdmin: secondaryAdmin,
        sourceURL: sourceURL,
        deployedURL: deployedURL,
        //bountyTags: tags,
        status: status,
        title: title,
        links: newLinks,
        valueProposition: valueProposition.toString("html"),
        generalRequirements: generalRequirements.toString("html"),
      };
      updateBounty(data).then(() => onClose(null, true));
    }
  };

  const pendingClose = () => {
    if (
      primaryAdmin ||
      secondaryAdmin ||
      sourceURL ||
      deployedURL ||
      //tags ||
      title ||
      links.length > 0 ||
      valueProposition.toString("html").length > 11 ||
      generalRequirements.toString("html").length > 11
    ) {
      if (window.confirm("Are you sure you would like to exit?")) {
        onClose();
      } else {
        return;
      }
    } else {
      onClose();
    }
  };

  return (
    <DashModal open={open} onClose={pendingClose}>
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
            Edit Bounty
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
                  Save
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
          <div className={styles.inputTitle}>BOUNTY STATUS</div>
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
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {bountyStatus.map((status) => (
              <option value={status}>
                {status === "active"
                  ? "Active"
                  : status === "paused"
                  ? "Paused"
                  : "Completed"}
              </option>
            ))}
          </select>
          <div className={styles.inputTitle} style={{ marginTop: "32px" }}>
            TYPE
          </div>
          {!concept ? (
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
          ) : (
            <div className={styles.bountyTypeContainer}>
              <div
                style={{
                  backgroundColor:
                    concept.bountyType === "project"
                      ? "#EF8144"
                      : concept.bountyType === "service"
                      ? "#4452EF"
                      : concept.bountyType === "job"
                      ? "#00B6F0"
                      : "#AD1D73",
                }}
                className={styles.bountyTypeItem}
              >
                <img
                  src={
                    concept.bountyType === "project"
                      ? projectIcon
                      : concept.bountyType === "service"
                      ? serviceIcon
                      : concept.bountyType === "job"
                      ? jobIcon
                      : programmeIcon
                  }
                  style={{ width: "12px", marginRight: "6px" }}
                  alt="icon"
                />
                <div className={styles.bountyItemText}>
                  {concept.bountyType === "project"
                    ? "Project"
                    : concept.bountyType === "service"
                    ? "Service"
                    : concept.bountyType === "job"
                    ? "Job"
                    : concept.bountyType === "programme"
                    ? "Programme"
                    : null}
                </div>
              </div>
            </div>
          )}
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
                onChange={(e) => setPrimaryAdmin(JSON.parse(e.target.value))}
              >
                <option value={""}>Select primary admin</option>
                {admins &&
                  admins.map((user) => (
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
                onChange={(e) => setSecondaryAdmin(JSON.parse(e.target.value))}
              >
                <option value={""}>Select secondary admin</option>
                {admins &&
                  admins.map((user) => (
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
              {tags?.map((tag, i) => (
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
          <div className={styles.inputTitle} style={{ marginTop: "32px" }}>
            TITLE
          </div>
          <input
            value={title}
            style={{ border: "none" }}
            placeholder={"Enter title"}
            className={styles.input}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className={styles.inputTitle} style={{ marginTop: "32px" }}>
            VALUE PROPOSITION
          </div>
          <RichTextEditor
            className={styles.rte}
            value={valueProposition}
            onChange={(val) => {
              setValueProposition(val);
            }}
            placeholder={"Enter value proposition"}
            toolbarClassName={styles.toolbar}
            editorClassName={styles.toolbar}
            toolbarConfig={toolbarConfig}
          />
          <div className={styles.inputTitle} style={{ marginTop: "32px" }}>
            GENERAL REQUIREMENTS
          </div>
          <RichTextEditor
            className={styles.rte}
            value={generalRequirements}
            onChange={(val) => {
              setGeneralRequirements(val);
            }}
            placeholder={"Enter general requirements"}
            toolbarClassName={styles.toolbar}
            editorClassName={styles.toolbar}
            toolbarConfig={toolbarConfig}
          />
          <div className={styles.inputTitle} style={{ marginTop: "32px" }}>
            SOURCE URL
          </div>
          <input
            value={sourceURL}
            style={{ border: "none" }}
            placeholder={"Enter source"}
            className={styles.input}
            onChange={(e) => setSourceURL(e.target.value)}
          />
          <div className={styles.inputTitle} style={{ marginTop: "32px" }}>
            DEPLOYED URL
          </div>
          <input
            value={deployedURL}
            style={{ border: "none" }}
            placeholder={"Enter deployment"}
            className={styles.input}
            onChange={(e) => setDeployedURL(e.target.value)}
          />
          <div className={styles.inputTitle} style={{ marginTop: "32px" }}>
            SUPPORTING LINKS
          </div>
          {links.length > 0 && (
            <div className={styles.linksContainer}>
              {links.map((link, i) => (
                <FadeIn>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "6px",
                    }}
                  >
                    <img
                      src={deleteIcon}
                      alt="remove"
                      style={{
                        cursor: "pointer",
                        width: "16px",
                        marginRight: "12px",
                      }}
                      onClick={() => removeLink(i)}
                    />
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: "12px",
                        textDecoration: "underline",
                        color: "white",
                      }}
                    >
                      {link}
                    </a>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
          {error === "Invalid URL" && (
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
              display: "flex",
              alignItems: "center",
            }}
            className={styles.linksContainer}
          >
            <input
              className={styles.input}
              style={{ width: "100%", marginTop: 0, border: "none" }}
              placeholder={"Enter link"}
              value={link}
              onKeyDown={(e) => {
                if (e.key === "Enter" && link.length > 0) {
                  if (!isValidURL(link)) {
                    setError("Invalid URL");
                  } else {
                    setLink("");
                    setLinks([...links, link]);
                  }
                }
              }}
              onChange={(e) => setLink(e.target.value)}
            />
            <div
              style={{ marginLeft: "16px", flexShrink: 0, cursor: "pointer" }}
              onClick={() => {
                if (link.length > 0) {
                  if (!isValidURL(link)) {
                    setError("Invalid URL");
                  } else {
                    setLink("");
                    setLinks([...links, link]);
                  }
                }
              }}
            >
              <div style={{ display: "flex", justifyContent: "center" }}>
                <img src={plusIcon} alt="add" style={{ width: "15px" }} />
              </div>
              <div style={{ fontSize: "11px", color: "white" }}>Add link</div>
            </div>
          </div>
        </div>
      </div>
    </DashModal>
  );
}
