import React, { useState } from "react";
import FadeIn from "react-fade-in";
import RichTextEditor from "react-rte";
import { createUseStyles } from "react-jss";
import useGlobalState from "../../state";
import { createBounty, updateBounty } from "../../api/bountiesApi";
import { ConceptLocation } from "../../Locations";
import { useHistory } from "react-router";
import { CircularProgress } from "@material-ui/core";
import DashModal from "../../components/DashModal";
import doneIcon from "../Concept/images/done.svg";
import { isValidURL, toolbarConfig } from "../../utils/utils";

import removeIcon from "./images/close.svg";
import plusIcon from "../Tasks/images/add.svg";
import { Breakpoints } from "../../utils/breakpoint";

const useStyles = createUseStyles({
  inputTitle: {
    color: "#008DE4",
    letterSpacing: "0.1em",
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "15px",
  },
  CTA: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#008DE4",
    padding: "8px",
    cursor: "pointer",
    marginRight: "32px",
    borderRadius: "4px",
  },
  container: { minWidth: "auto", maxWidth: "100vw", paddingBottom: "64px" },
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
  supportingLinksContainer: {
    marginTop: "16px",
    width: "100%",
  },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    container: { minWidth: "550px", maxWidth: "646px" },
    CTA: {
      display: "flex",
      alignItems: "center",
      backgroundColor: "#008DE4",
      marginRight: "0px",
      padding: "8px",
      cursor: "pointer",
      borderRadius: "4px",
    },
    supportingLinksContainer: {
      marginTop: "16px",
      width: "646px",
    },
  },
});

export default function RequestNewConceptView({ open, onClose, concept }) {
  const { loggedInUser } = useGlobalState();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState(concept ? concept.title : "");
  const [valueProposition, setValueProposition] = useState(
    concept
      ? RichTextEditor.createValueFromString(concept.valueProposition, "html")
      : RichTextEditor.createEmptyValue()
  );
  const [generalRequirements, setGeneralRequirements] = useState(
    concept
      ? RichTextEditor.createValueFromString(
          concept.generalRequirements,
          "html"
        )
      : RichTextEditor.createEmptyValue()
  );
  const [link, setLink] = useState("");
  const [links, setLinks] = useState(concept ? concept.links : []);
  const styles = useStyles();

  const removeLink = (i) => {
    const newLinks = links.slice();
    newLinks.splice(i, 1);
    setLinks(newLinks);
  };

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
    } else if (generalRequirements.toString("html").length > 10000) {
      setError("General requirements must not exceed 10,0000 characters");
    } else {
      let newLinks = links.slice();
      if (link && isValidURL(link)) {
        newLinks = [...newLinks, link];
      }
      setLoading(true);
      if (concept) {
        const data = {
          _id: concept._id,
          title: title,
          valueProposition: valueProposition.toString("html"),
          generalRequirements: generalRequirements.toString("html"),
          links: newLinks,
        };
        updateBounty(data).then(() => {
          onClose(null, true);
        });
      } else {
        const displayURL = `${title
          .replace(/[\W_]+/g, "-")
          .replace("/", "")}-${Math.floor(Math.random() * 100000)}`;
        const data = {
          title: title,
          valueProposition: valueProposition.toString("html"),
          generalRequirements: generalRequirements.toString("html"),
          links: newLinks,
          type: "concept",
          status: "review",
          displayURL: displayURL,
          dateCreated: new Date(),
          user: loggedInUser,
        };
        createBounty(data).then(() => {
          setLoading(false);
          history.push(ConceptLocation(displayURL));
        });
      }
    }
  };

  const pendingClose = () => {
    if (
      title ||
      generalRequirements.toString("html").length > 11 ||
      valueProposition.toString("html").length > 11 ||
      links.length > 0
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
            {concept ? "Edit concept" : "Request new concept"}
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
                  {concept ? "Save" : "Submit"}
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
          <div className={styles.inputTitle}>TITLE</div>
          <input
            value={title}
            style={{ border: "none" }}
            placeholder={"Enter title"}
            className={styles.input}
            onChange={(e) => title.length <= 100 && setTitle(e.target.value)}
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
            SUPPORTING LINKS
          </div>
          {links.length > 0 && (
            <div className={styles.supportingLinksContainer}>
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
                      src={removeIcon}
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
              marginTop: "16px",
            }}
            className={styles.supportLinksContainer}
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
                    setError("");
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
                    setError("");
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
