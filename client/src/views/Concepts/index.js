import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { createUseStyles } from "react-jss";
import MainLayout from "../../layouts/MainLayout";
import searchIcon from "../Tasks/images/search.svg";
import caretDown from "../Tasks/images/caretDown.svg";
import { CircularProgress } from "@material-ui/core";
import useOutsideAlerter, { conceptStatus } from "../../utils/utils";
import { Breakpoints } from "../../utils/breakpoint";

import { getAdminsSimple } from "../../api/usersApi";
import check from "../Tasks/images/check.svg";
import checked from "../Tasks/images/checked.svg";
import { isMobile } from "react-device-detect";
import { fetchAllConcepts } from "../../api/bountiesApi";
import ConceptListItem from "../../components/ConceptListItem";
import addIcon from "../Tasks/images/add.svg";
import RequestNewConceptView from "../RequestNewConcept";
import useGlobalState from "../../state";

const useStyles = createUseStyles({
  container: {
    maxWidth: "100vw",
    margin: "auto",
    padding: "0 24px",
    marginTop: 32,
    color: "#0B0F3B",
    paddingBottom: "24px",
  },
  header: {
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: 600,
    letterSpacing: "0.1em",
    fontSize: 12,
    lineHeight: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputContainer: {
    marginTop: "16px",
    display: "flex",
    alignItems: "center",
    borderRadius: "4px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  searchInput: {
    height: "100%",
    width: "100%",
    backgroundColor: "transparent",
    border: "none",
    outline: "none",
    boxShadow: "none !important",
    color: "white",
    "&::placeholder": {
      color: "rgba(255, 255, 255, 0.5)",
    },
  },
  dropdownContainer: {
    display: "flex",
    alignItems: "center",
    color: "white",
    fontWeight: 600,
    fontSize: "12px",
    flexShrink: 0,
    cursor: "pointer",
    userSelect: "none",
    position: "relative",
  },
  loaderContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "48px",
  },
  taskPayout: {
    fontSize: "10px",
    lineHeight: "12px",
    width: "50px",
    marginRight: "8px",
  },
  taskDate: {
    width: "64px",
    fontSize: "10px",
    lineHeight: "12px",
    color: "rgba(11, 15, 59, 0.5)",
    marginRight: "8px",
  },
  dropdownContent: {
    padding: "7px",
    borderRadius: "4px",
    backgroundColor: "#00B6F0",
    position: "absolute",
    left: 0,
    top: "28px",
    fontSize: "12px",
    color: "white",
    width: "100px",
    zIndex: 11,
  },
  requestCTA: {
    marginTop: "16px",
    padding: "8px",
    backgroundColor: "#0B0F3B",
    borderRadius: "4px",
    fontWeight: 600,
    fontSize: "12px",
    display: "inline-block",
    color: "white",
    cursor: "pointer",
    userSelect: "none",
    marginBottom: "8px",
  },
  [`@media (min-width: ${Breakpoints.lg}px)`]: {
    container: {
      maxWidth: 1600,
      margin: "auto",
      padding: "0 88px",
      marginTop: 32,
      color: "#0B0F3B",
      paddingBottom: "64px",
    },
  },
});

export default function ConceptsView({ match }) {
  const styles = useStyles();
  const [concepts, setConcepts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchStatus, setSearchStatus] = useState([conceptStatus[0]]);
  const [searchingStatus, setSearchingStatus] = useState(false);
  const [searchCreators, setSearchCreators] = useState([]);
  const [searchingCreators, setSearchingCreators] = useState(false);
  const [requestModal, setRequestModal] = useState(false);
  const [admins, setAdmins] = useState(null);
  const { loggedInUser } = useGlobalState();
  const statusRef = useRef();
  const creatorRef = useRef();

  useOutsideAlerter(statusRef, () => setSearchingStatus(false));
  useOutsideAlerter(creatorRef, () => setSearchingCreators(false));

  useEffect(() => {
    setLoading(true);
    fetchAllConcepts().then((results) => {
      setLoading(false);
      setConcepts(results);
    });
  }, []);

  useEffect(() => {
    getAdminsSimple()
      .then((res) => res.json())
      .then((data) => setAdmins(data));
  }, []);

  const modifyStatus = useCallback(
    (category) => {
      const newCategories = searchStatus.slice();
      const catIndex = newCategories.indexOf(category);
      if (catIndex >= 0) {
        newCategories.splice(catIndex, 1);
        setSearchStatus(newCategories);
      } else {
        newCategories.push(category);
        setSearchStatus(newCategories);
      }
    },
    [searchStatus]
  );

  const modifyCreators = useCallback(
    (category) => {
      const newCategories = searchCreators.slice();
      const catIndex = newCategories.indexOf(category);
      if (catIndex >= 0) {
        newCategories.splice(catIndex, 1);
        setSearchCreators(newCategories);
      } else {
        newCategories.push(category);
        setSearchCreators(newCategories);
      }
    },
    [searchCreators]
  );

  const handleRequestModal = useCallback(
    (open) => () => {
      setRequestModal(open);
    },
    []
  );

  const filteredConcepts = useMemo(() => {
    return concepts.filter(
      (concept) =>
        (concept.title.toUpperCase().includes(search.toUpperCase()) ||
          concept.displayURL.toUpperCase().includes(search.toUpperCase())) &&
        searchStatus.includes(
          concept.status === "review" ? "open" : "accepted"
        ) &&
        (searchCreators.length > 0
          ? searchCreators
              .map((user) => user?.username)
              .includes(concept.user.username)
          : true)
    );
  }, [concepts, search, searchCreators, searchStatus]);

  return (
    <MainLayout match={match}>
      <div className={styles.container}>
        <div className={styles.header}>
          CONCEPTS
          {loggedInUser && (
            <div
              className={styles.requestCTA}
              onClick={handleRequestModal(true)}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <img
                  src={addIcon}
                  alt="add"
                  style={{ width: "16px", marginRight: "4px" }}
                />
                <div>Request New Concept</div>
              </div>
            </div>
          )}
        </div>
        <div className={styles.inputContainer}>
          <img src={searchIcon} alt="search" style={{ padding: "9px" }} />
          <input
            className={styles.searchInput}
            placeholder={"Find a concept"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div
            className={styles.dropdownContainer}
            onClick={() => setSearchingStatus(true)}
          >
            {searchingStatus && (
              <div className={styles.dropdownContent} ref={statusRef}>
                {conceptStatus.map((tag, i) => (
                  <div
                    style={{
                      marginTop: i > 0 && "8px",
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      userSelect: "none",
                      textTransform: "capitalize",
                    }}
                    onClick={() => modifyStatus(tag)}
                  >
                    <img
                      src={
                        searchStatus.find((cat) => cat === tag)
                          ? checked
                          : check
                      }
                      alt="check"
                      style={{
                        marginRight: "6px",
                        width: "16px",
                        height: "16px",
                      }}
                    />
                    {tag}
                  </div>
                ))}
              </div>
            )}
            <img src={caretDown} alt="dropdown" />
            <div style={{ marginLeft: "8px" }}>
              {isMobile ? "Status" : "Filter status"}
            </div>
          </div>
          <div
            className={styles.dropdownContainer}
            style={{
              marginLeft: isMobile ? "8px" : "20px",
              paddingRight: "9px",
            }}
            onClick={() => setSearchingCreators(true)}
          >
            {searchingCreators && (
              <div className={styles.dropdownContent} ref={creatorRef}>
                {admins.map((tag, i) => (
                  <div
                    style={{
                      marginTop: i > 0 && "8px",
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    onClick={() => modifyCreators(tag)}
                    key={`concept-creator-${i}`}
                  >
                    <img
                      src={
                        searchCreators.find((cat) => cat === tag)
                          ? checked
                          : check
                      }
                      alt="check"
                      style={{
                        marginRight: "6px",
                        width: "16px",
                        height: "16px",
                      }}
                    />
                    {tag.username}
                  </div>
                ))}
              </div>
            )}
            <img src={caretDown} alt="dropdown" />
            <div style={{ marginLeft: "8px" }}>
              {isMobile ? "Creators" : "Filter creators"}
            </div>
          </div>
        </div>
        <div style={{ marginTop: "12px" }}>
          {loading ? (
            <div className={styles.loaderContainer}>
              <CircularProgress style={{ color: "white" }} />
            </div>
          ) : (
            filteredConcepts.map((concept, index) => (
              <ConceptListItem
                concept={concept}
                search={search}
                key={`concept-list-item-${index}`}
              />
            ))
          )}
        </div>
        <RequestNewConceptView
          open={requestModal}
          onClose={handleRequestModal(false)}
        />
      </div>
    </MainLayout>
  );
}
