import React, {useCallback, useEffect, useRef, useState, useMemo, useReducer} from "react";
import {isMobile} from "react-device-detect";
import clsx from "clsx";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import produce from "immer";
import { withStyles } from '@material-ui/core/styles';
import {createUseStyles} from "react-jss";
import CircularProgress from "@material-ui/core/CircularProgress";
import Tabs from '@material-ui/core/Tabs';
import Tab from "@material-ui/core/Tab";
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import useOutsideAlerter, {bountyStatus, bountyTypes, Breakpoints} from "../../utils/utils";
import BountyCard from "../../components/BountyCard";
import {fetchBounties, updateBounty} from "../../api/bountiesApi";

import searchIcon from "../Tasks/images/search.svg";
import checked from "../Tasks/images/checked.svg";
import check from "../Tasks/images/check.svg";
import caretDownIcon from "../Tasks/images/caretDown.svg";
import MainLayout from "../../layouts/MainLayout";
import caretDown from "../Tasks/images/caretDown.svg";
import {getAdminsSimple} from "../../api/usersApi";
import useGlobalState from "../../state";
import projectIcon from "../ApproveConcept/images/project.svg";
import serviceIcon from "../ApproveConcept/images/service.svg";
import jobIcon from "../ApproveConcept/images/job.svg";
import programmeIcon from "../ApproveConcept/images/programme.svg";
import ActivityView from "../Activity";
import {Typography} from "@material-ui/core";

const useStyles = createUseStyles({
  container: {
    maxWidth: "100vw",
    margin: "auto",
    padding: "0 24px",
    marginTop: 32,
    color: "#0B0F3B",
    display: "flex",
  },
  columnHeader: {
    fontWeight: 600,
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    lineHeight: "15px",
    letterSpacing: "0.1em",
    userSelect: "none",
  },
  searchInput: {
    border: "none",
    backgroundColor: "transparent",
    boxShadow: "none !important",
    width: "100%",
    color: "white",
    lineHeight: "15px",
    fontSize: 12,
    "&::placeholder": {
      color: "rgba(255, 255, 255, 0.5)",
    },
  },
  searchContainer: {
    marginTop: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 32,
  },
  searchIcon: {
    margin: 8,
    width: 12,
    height: 12,
    marginRight: 8,
  },
  searchIconContainer: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    flex: 1,
  },
  filtersWrapper: {
    display: "flex",
    alignItems: "center",
    padding: 8,
  },
  filterContainer: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    userSelect: "none",
    position: "relative",
  },
  accordionContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxHeight: "100%",
  },
  scrollable: {
    overflow: "auto",
    height: "calc(100vh - 240px)",
  },
  verticalScrollable: {
    overflowY: "auto",
    height: "calc(100vh - 240px)",
  },
  filterItemsContainer: {
    padding: 7,
    borderRadius: 4,
    backgroundColor: "#00B6F0",
    position: "absolute",
    left: 0,
    top: 28,
    fontSize: 12,
    color: "white",
    zIndex: 11,
    width: 106,
  },
  filterItemWrapper: {
    marginTop: 8,
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    userSelect: "none",
    "&:first-child": {
      marginTop: 0,
    }
  },
  filterOuterWrapper: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    userSelect: "none",
  },
  tabStyle: {
    textTransform: "capitalize"
  },
  filterCaret: {
    width: 9,
    marginRight: 8,
    transition: "all 0.2s"
  },
  tabContainer: {
    display: "flex",
    flexDirection: "column",
  },
  checkBox: {
    marginRight: 6,
    width: 16,
    height: 16,
  },
  dropdownContainer: {
    display: "flex",
    alignItems: "center",
    color: "white",
    fontWeight: 600,
    fontSize: 12,
    flexShrink: 0,
    cursor: "pointer",
    userSelect: "none",
    position: "relative",
  },
  dropdownContent: {
    padding: 7,
    borderRadius: 4,
    backgroundColor: "#00B6F0",
    position: "absolute",
    left: 0,
    top: 28,
    fontSize: 12,
    color: "white",
    width: 100,
    zIndex: 11,
  },
  dropper: {
    margin: "0 4px",
    padding: "0 8px",
    maxWidth: "33.3333%",
    minWidth: 300,
    flex: 1,
    backgroundColor: "#EBECF0",
    borderRadius: 4,
    "&:first-child": {
      marginLeft: 0,
    },
    "&:last-child": {
      marginRight: 0,
    },
  },
  dropOver: {
    backgroundColor: "#F4F5F7",
  },
  dragger: {
    margin: "8px 0",
    backgroundColor: "#fff",
    borderRadius: 4,
    boxShadow: "rgb(0 0 0 / 10%) 0px 1px 3px 0px, rgb(0 0 0 / 6%) 0px 1px 2px 0px",
    "&:hover": {
      backgroundColor: "#F4F5F7",
    },
  },
  dragging: {
    backgroundColor: "#D2D6DC",
  },
  draggerContent: {
    display: "flex",
    flexDirection: "column",
  },
  cardWrapper: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: 16,
  },
  cardTitle: {
    display: "flex",
    textTransform: "capitalize",
    margin: "8px 0",
  },
  cardIcon: {
    width: 20,
    height: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 3,
    marginRight: 8,
  },
  [`@media (min-width: ${Breakpoints.lg}px)`]: {
    container: {
      maxWidth: 1600,
      margin: "auto",
      padding: "0 88px",
      marginTop: 32,
      color: "#0B0F3B",
    },
  },
  [`@media (max-width: ${Breakpoints.sm}px)`]: {
    container: {
      padding: "0 12px"
    },
    searchContainer: {
      backgroundColor: "rgb(0, 0, 0, 0.3)",
      maxWidth: "calc(100vw - 50px)"
    }
  }
});

const StyledTabs = withStyles({
  indicator: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    '& > span': {
      width: '100%',
      backgroundColor: '#eee',
    },
  },
})((props) => <Tabs {...props} TabIndicatorProps={{ children: <span /> }} />);

const StyledTab = withStyles((theme) => ({
  root: {
    textTransform: 'none',
    color: '#fff',
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.pxToRem(15),
    marginRight: theme.spacing(1),
    '&:focus': {
      opacity: 1,
    },
  },
  [`@media (max-width: ${Breakpoints.sm}px)`]: {
    root: {
      color: '#000',
      height: 50,
    },
  }
}))((props) => <Tab disableRipple {...props} />);

const dragReducer = produce((draft, action) => {
  switch (action.type) {
    case "MOVE": {
      draft[action.from] = draft[action.from] || [];
      draft[action.to] = draft[action.to] || [];
      const [removed] = draft[action.from].splice(action.fromIndex, 1);
      draft[action.to].splice(action.toIndex, 0, removed);
      updateBounty({
        _id: removed._id,
        bountyType: action.to,
      })
        .then(res => console.log(res))
        .catch(err => console.log(err));
      break;
    }
    case "SET_ITEMS": {
      draft.project = action.payload.filter(el => el.bountyType === "project");
      draft.job = action.payload.filter(el => el.bountyType === "job");
      draft.service = action.payload.filter(el => el.bountyType === "service");
      break;
    }
    default:
      break;
  }
});

const bountyColumns = ["project", "job", "service"];

export default function BountiesView({ match }) {
  const styles = useStyles();
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [searchStatus, setSearchStatus] = useState(bountyStatus);
  const [searchingStatus, setSearchingStatus] = useState(false);
  const [searchTypes, setSearchTypes] = useState(bountyTypes);
  const [searchingTypes, setSearchingTypes] = useState(false);
  const [searchingAdmins, setSearchingAdmins] = useState(false);
  const [searchAdmins, setSearchAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bounties, setBounties] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [activeAccordionPanel, setActiveAccordionPanel] = useState('first')
  const { loggedInUser } = useGlobalState();
  const catRef = useRef();
  const typeRef = useRef();
  const adminRef = useRef();
  const [cardState, dispatch] = useReducer(dragReducer, {
    project: [],
    job: [],
    service: [],
  });

  useOutsideAlerter(catRef, () => setSearchingStatus(false));
  useOutsideAlerter(typeRef, () => setSearchingTypes(false));
  useOutsideAlerter(adminRef, () => setSearchingAdmins(false));

  useEffect(() => {
    setLoading(true);
    (async () => {
      const allBounties = await fetchBounties();
      setBounties(allBounties);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    setActiveTab(loggedInUser ? 1 : 0);
  }, [loggedInUser]);

  useEffect(() => {
    getAdminsSimple()
      .then((res) => res.json())
      .then((data) => data.sort((a, b) => {
        if (a.username.toLowerCase() < b.username.toLowerCase()) {
          return -1;
        }
        if (a.username.toLowerCase() === b.username.toLowerCase()) {
          return 0;
        }
        return 1;
      }))
      .then((data) => setAdmins(data));
  }, []);

  const filteredAdmins = useMemo(() => {
    return admins.filter(
      (admin) =>
        bounties.findIndex(
          (bounty) =>
            ((bounty.primaryAdmin && (bounty.primaryAdmin.username === admin.username)) || (bounty.secondaryAdmin && (bounty.secondaryAdmin.username === admin.username))) &&
            searchStatus.includes(bounty.status) && searchTypes.includes(bounty.bountyType)
        ) >= 0
    );
  }, [admins, bounties, searchStatus, searchTypes]);

  const filteredBounties = useMemo(() => {
    return bounties.filter((bounty) => {
        return bounty.title.toUpperCase().includes(search.toUpperCase()) &&
          searchTypes.includes(bounty.bountyType) &&
          searchStatus.includes(bounty.status) &&
          (searchAdmins.length > 0
            ? (
              (bounty.primaryAdmin && searchAdmins.find(admin => admin.username === bounty.primaryAdmin.username)) ||
              (bounty.secondaryAdmin && searchAdmins.find(admin => admin.username === bounty.secondaryAdmin.username))
            )
            : true);
    });
  }, [bounties, search, searchTypes, searchStatus, searchAdmins]);

  useEffect(() => {
    dispatch({
      type: "SET_ITEMS",
      payload: filteredBounties,
    });
  }, [filteredBounties]);

  const myBounties = useMemo(() => {
    if (!loggedInUser) {
      return [];
    }
    return filteredBounties.filter((bounty) => {
      return (bounty.primaryAdmin && bounty.primaryAdmin.username === loggedInUser.username) ||
        (bounty.secondaryAdmin && bounty.secondaryAdmin.username === loggedInUser.username) ||
        (bounty.user && bounty.user.username === loggedInUser.username) ||
        (bounty.tasks.findIndex((task) => task.assignee && task.assignee.username === loggedInUser.username) >= 0);
    });
  }, [filteredBounties, loggedInUser]);

  const myFilteredAdmins = useMemo(() => {
    return filteredAdmins.filter(
      (admin) =>
        myBounties.findIndex(
          (bounty) =>
            ((bounty.user && (bounty.user.username === admin.username)) ||
              (bounty.primaryAdmin && (bounty.primaryAdmin.username === admin.username)) ||
              (bounty.secondaryAdmin && (bounty.secondaryAdmin.username === admin.username))
            )
        ) >= 0
    );
  }, [filteredAdmins, myBounties]);

  const modifyStatus = useCallback((status) => {
    const newStatus = searchStatus.slice();
    const catIndex = newStatus.indexOf(status);
    if (catIndex >= 0) {
      newStatus.splice(catIndex, 1);
      setSearchStatus(newStatus);
    } else {
      newStatus.push(status);
      setSearchStatus(newStatus);
    }
  }, [searchStatus]);

  const modifyType = useCallback((category) => () => {
    const newCategories = searchTypes.slice();
    const catIndex = newCategories.indexOf(category);
    if (catIndex >= 0) {
      newCategories.splice(catIndex, 1);
      setSearchTypes(newCategories);
    } else {
      newCategories.push(category);
      setSearchTypes(newCategories);
    }
  }, [searchTypes]);

  const modifyAdmins = useCallback((category) => () => {
    const newCategories = searchAdmins.slice();
    const catIndex = newCategories.indexOf(category);
    if (catIndex >= 0) {
      newCategories.splice(catIndex, 1);
      setSearchAdmins(newCategories);
    } else {
      newCategories.push(category);
      setSearchAdmins(newCategories);
    }
  }, [searchAdmins]);

  const handleTabChange = useCallback((event, newTab) => {
    setActiveTab(newTab);
    if (loggedInUser && newTab === 0) {
      dispatch({
        type: "SET_ITEMS",
        payload: myBounties,
      });
    } else {
      dispatch({
        type: "SET_ITEMS",
        payload: filteredBounties,
      });
    }
  }, [loggedInUser, myBounties, filteredBounties]);

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  const getTag = useCallback((tag) => {
    return tag === "project"
      ? "Projects"
      : tag === "job"
      ? "Jobs"
      : tag === "service"
        ? "Services"
        : tag === "programme"
          ? "Programmes"
          : null
  }, []);

  const onDragEnd = useCallback((result) => {
    if (result.reason === "DROP") {
      if (!result.destination) {
        return;
      }
      dispatch({
        type: "MOVE",
        from: result.source.droppableId,
        to: result.destination.droppableId,
        fromIndex: result.source.index,
        toIndex: result.destination.index,
      });
    }
  }, [dispatch]);

  const getCardIcon = useCallback((type) => type === "project"
    ? projectIcon
    : type === "service"
      ? serviceIcon
      : type === "job"
        ? jobIcon
        : programmeIcon, []);

  const bountyBoards =
    <div style={{ display: "flex", flexDirection: "column" }}>
      <StyledTabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="bounty-tabs"
      >
        {loggedInUser && <StyledTab label="My Bounties" />}
        <StyledTab label="All" />
      </StyledTabs>
      <div className={styles.tabContainer}>
        <div className={styles.searchContainer}>
          <div className={styles.searchIconContainer}>
            <img
              src={searchIcon}
              alt="search"
              className={styles.searchIcon}
            />
            <input
              value={search}
              onChange={handleSearchChange}
              placeholder={"Find a bounty"}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filtersWrapper}>
            <div
              className={styles.filterContainer}
              onClick={() => setSearchingTypes(true)}
            >
              {searchingTypes && (
                <div className={styles.filterItemsContainer} ref={typeRef}>
                  {bountyTypes.map((tag, i) => (
                    <div
                      className={styles.filterItemWrapper}
                      key={`bounty-type-${i}`}
                      onClick={modifyType(tag)}
                    >
                      <img
                        src={
                          searchTypes.find((cat) => cat === tag)
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
                      {getTag(tag)}
                    </div>
                  ))}
                </div>
              )}
              <img
                src={caretDownIcon}
                alt="dropdown"
                className={styles.filterCaret}
                style={{
                  width: "9px",
                  marginRight: "8px",
                  transform: searchingTypes
                    ? "rotate(-180deg)"
                    : "rotate(0deg)",
                }}
              />
              <div
                style={{
                  fontWeight: 600,
                  color: "white",
                  fontSize: "12px",
                  lineHeight: "15px",
                }}
              >
                {isMobile ? "Types" : "Filter types"}
              </div>
            </div>
            <div style={{ position: "relative", marginLeft: "20px" }}>
              {searchingStatus && (
                <div className={styles.filterItemsContainer} ref={catRef}>
                  {bountyStatus.map((tag, i) => (
                    <div
                      className={styles.filterItemWrapper}
                      key={`bounty-status-${i}`}
                      onClick={() => modifyStatus(tag)}
                    >
                      <img
                        src={
                          searchStatus.find((cat) => cat === tag)
                            ? checked
                            : check
                        }
                        alt="check"
                        className={styles.checkBox}
                      />
                      {tag === "active"
                        ? "Active"
                        : tag === "paused"
                          ? "Paused"
                          : "Completed"}
                    </div>
                  ))}
                </div>
              )}
              <div
                className={styles.filterOuterWrapper}
                onClick={() => setSearchingStatus(true)}
              >
                <img
                  src={caretDownIcon}
                  alt="dropdown"
                  style={{
                    transform: searchingStatus
                      ? "rotate(-180deg)"
                      : "rotate(0deg)",
                  }}
                  className={styles.filterCaret}
                />
                <div
                  style={{
                    fontWeight: 600,
                    color: "white",
                    fontSize: "12px",
                    lineHeight: "15px",
                  }}
                >
                  {isMobile ? "Status" : "Filter status"}
                </div>
              </div>
            </div>

            <div
              className={styles.dropdownContainer}
              style={{
                marginLeft: isMobile ? "8px" : "20px",
                paddingRight: "9px",
              }}
              onClick={() => setSearchingAdmins(true)}
            >
              {searchingAdmins && (
                <div className={styles.dropdownContent} ref={adminRef}>
                  {(activeTab === 0 && loggedInUser ? myFilteredAdmins : filteredAdmins).map((tag, i) => (
                    <div
                      style={{
                        marginTop: i > 0 && "8px",
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                      onClick={modifyAdmins(tag)}
                      key={`concept-creator-${i}`}
                    >
                      <img
                        src={
                          searchAdmins.find((cat) => cat === tag) ? checked : check
                        }
                        alt="check"
                        style={{
                          marginRight: 6,
                          width: 16,
                          height: 16,
                        }}
                      />
                      {tag.username}
                    </div>
                  ))}
                </div>
              )}
              <img src={caretDown} alt="dropdown" />
              <div style={{ marginLeft: "8px" }}>
                {isMobile ? "Admins" : "Filter admins"}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.cardWrapper}>
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 32,
              }}
            >
              <CircularProgress style={{ color: "white" }} />
            </div>
          ) : search && filteredBounties.length === 0 ? (
            <div
              style={{
                color: "white",
                fontSize: 12,
                textAlign: "center",
                marginTop: 32,
              }}
            >
              No bounties found
            </div>
          ) : (
            bountyColumns.map((type) => (
              <Droppable type="PERSON" droppableId={type} key={`droppable-${type}`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={clsx(styles.dropper, {
                      [styles.dropOver]: snapshot.isDraggingOver,
                    })}
                  >
                    <div className={styles.cardTitle}>
                      <div
                        className={styles.cardIcon}
                        style={{
                          backgroundColor:
                            type === "project"
                              ? "#EF8144"
                              : type === "service"
                                ? "#4452EF"
                                : type === "job"
                                  ? "#00B6F0"
                                  : "#AD1D73",
                        }}
                      >
                        <img
                          src={getCardIcon(type)}
                          style={{ width: 12 }}
                          alt="icon"
                        />
                      </div>
                      <span>{type}</span>
                    </div>
                    {cardState[type]?.map((bounty, index) => (
                      <Draggable
                        key={`draggable-${type}-${index}`}
                        draggableId={bounty._id}
                        index={index}
                        isDragDisabled={!loggedInUser}
                      >
                        {(provided, snapshot) => (
                          <div
                            className={clsx(styles.dragger, {
                              [styles.dragging]: snapshot.isDragging,
                            })}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <BountyCard bounty={bounty} search={search} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                )}
              </Droppable>
            ))
          )}
        </div>
      </div>
    </div>

  const handleActivePanelChange = useCallback((activePanel) => () => {
    setActiveAccordionPanel(activePanel)
  }, [])

  return (
    <MainLayout match={match}>
      <div className={styles.container}>
        <DragDropContext onDragEnd={onDragEnd}>
          {
            isMobile
              ? <div className={styles.accordionContainer}>
                  <Accordion expanded={activeAccordionPanel === 'first'} onChange={handleActivePanelChange('first')}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Bounties</Typography>
                    </AccordionSummary>
                    <AccordionDetails classes={{
                      root: styles.scrollable
                    }}>
                        {bountyBoards}
                    </AccordionDetails>
                  </Accordion>
                  <Accordion expanded={activeAccordionPanel === 'second'} onChange={handleActivePanelChange('second')}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Activities</Typography>
                    </AccordionSummary>
                    <AccordionDetails classes={{
                      root: styles.verticalScrollable
                    }}>
                      <ActivityView />
                    </AccordionDetails>
                  </Accordion>
                </div>
              : <>
                  <div style={{ width: "30%", marginRight: 16, }}>
                    <ActivityView />
                  </div>
                  <div style={{ width: "70%" }}>
                    {bountyBoards}
                  </div>
                </>
          }

        </DragDropContext>
      </div>
    </MainLayout>
  )
}
