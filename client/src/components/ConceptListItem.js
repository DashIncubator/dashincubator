import React, {useMemo} from "react";
import { createUseStyles } from "react-jss";
import { ConceptLocation } from "../Locations";
import FadeIn from "react-fade-in";
import { useHistory } from "react-router";
import UserAvatar from "./UserAvatar";
import projectIcon from "../views/ApproveConcept/images/project.svg";
import commentEmpty from "./images/commentEmpty.svg";
import commentNew from "./images/commentNew.svg";
import {getHighlightedText, truncate} from "../utils/utils";
import ReactDOMServer from "react-dom/server";
import moment from "moment";

const useStyles = createUseStyles({
  conceptCardWrapper: {
    cursor: "pointer",
    userSelect: "none",
    backgroundColor: "#eee",
    padding: 16,
    borderRadius: 6,
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  conceptCardIconWrapper: {
    display: "flex",
    alignItems: "center",
    marginRight: 10,
    fontSize: 11,
  },
  conceptCardIcon: {
    backgroundColor: "#FCAFC6",
    padding: 2,
    borderRadius: 4,
    width: 20,
    height: 20,
    display: "inline-block",
    marginRight: 5,
  },
  conceptTitle: {
    fontWeight: 600,
    fontSize: 18,
    lineHeight: "17px",
    marginBottom: 8,
  },
  conceptDescription: {
    flex: 1,
    fontSize: 12,
    lineHeight: "18px",
    marginBottom: 8,
  },
  conceptComments: {
    marginTop: 10,
    display: "flex",
    justifyContent: "flex-end"
  },
  conceptUserInfo: {
    display: "flex",
    alignItems: "center",
    fontSize: 11,
    lineHeight: "12px",
  },
  conceptCreatedAt: {
    marginRight: 8,
  }
});

export default function ConceptListItem({ concept, search }) {
  const classes = useStyles();
  const history = useHistory();

  const highlightedValueProposition = ReactDOMServer.renderToStaticMarkup(
    getHighlightedText(
      search &&
      concept.valueProposition.toUpperCase().includes(search.toUpperCase())
        ? concept.valueProposition.replace(/<[^>]*>?/gm, "")
        : truncate(concept.valueProposition, 170).replace(/<[^>]*>?/gm, ""),
      search
    )
  );

  const unreadComments = useMemo(() => {
    return concept.comments.filter(comment => !comment.lastViewedAt);
  }, [concept]);

  return (
    <FadeIn>
      <div
        onClick={() => history.push(ConceptLocation(concept.displayURL))}
        className={classes.conceptCardWrapper}
      >
        <div className={classes.header}>
          <div className={classes.conceptCardIconWrapper}>
            <img className={classes.conceptCardIcon} src={projectIcon} alt={"check"} /> Concept
          </div>
          <div className={classes.conceptUserInfo}>
            <div className={classes.conceptCreatedAt}>Created {moment(concept.dateCreated).fromNow()}</div>
            <UserAvatar
              user={concept.user}
              size={18}
              fontSize={"8px"}
              lineHeight={"10px"}
            />
          </div>
        </div>
        <div className={classes.conceptTitle}>
          {getHighlightedText(concept.title, search)}
        </div>
        <div className={classes.conceptDescription} dangerouslySetInnerHTML={{ __html: highlightedValueProposition }} />
        <div className={classes.conceptComments}>
          <img src={unreadComments.length > 0 ? commentNew : commentEmpty } style={{width: 16}} alt="comments-new" />
        </div>
      </div>
    </FadeIn>
  );
}
