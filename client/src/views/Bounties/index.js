import React, {useCallback, useEffect, useRef, useState, useMemo} from "react";
import {isMobile} from "react-device-detect";
import { withStyles } from '@material-ui/core/styles';
import {createUseStyles} from "react-jss";
import CircularProgress from "@material-ui/core/CircularProgress";
import SwipeableViews from 'react-swipeable-views';
import Tabs from '@material-ui/core/Tabs';
import Tab from "@material-ui/core/Tab";

import useOutsideAlerter, {bountyStatus, bountyTypes, Breakpoints} from "../../utils/utils";
import BountyCard from "../../components/BountyCard";
import {fetchBounties} from "../../api/bountiesApi";

import searchIcon from "../Home/images/search.svg";
import checked from "../Home/images/checked.svg";
import check from "../Home/images/check.svg";
import caretDownIcon from "../Home/images/caretDown.svg";
import MainLayout from "../../layouts/MainLayout";
import caretDown from "../Home/images/caretDown.svg";
import {getAdminsSimple} from "../../api/usersApi";

const useStyles = createUseStyles({
  container: {
    maxWidth: "100vw",
    margin: "auto",
    padding: "0 24px",
    marginTop: "32px",
    color: "#0B0F3B",
  },
  columnHeader: {
    fontWeight: 600,
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "12px",
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
    fontSize: "12px",
    "&::placeholder": {
      color: "rgba(255, 255, 255, 0.5)",
    },
  },
  searchContainer: {
    marginTop: "16px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchIcon: {
    margin: "8px",
    width: "12px",
    height: "12px",
    marginRight: "8px",
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
  filterItemsContainer: {
    padding: "7px",
    borderRadius: "4px",
    backgroundColor: "#00B6F0",
    position: "absolute",
    left: 0,
    top: "28px",
    fontSize: "12px",
    color: "white",
    zIndex: 11,
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
    fontSize: "12px",
    flexShrink: 0,
    cursor: "pointer",
    userSelect: "none",
    position: "relative",
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
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    container: {
      maxWidth: 1050,
      margin: "auto",
      padding: "0 88px",
      marginTop: 32,
      color: "#0B0F3B",
    },
  },
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
}))((props) => <Tab disableRipple {...props} />);

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
  const catRef = useRef();
  const typeRef = useRef();
  const adminRef = useRef();

  useOutsideAlerter(catRef, () => setSearchingStatus(false));
  useOutsideAlerter(typeRef, () => setSearchingTypes(false));
  useOutsideAlerter(adminRef, () => setSearchingAdmins(false));

  useEffect(() => {
    setLoading(true);
    fetchBounties().then((results) => {
      setLoading(false);
      setBounties(results);
    });
  }, []);

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
            ((bounty.user && bounty.user.username === admin.username) || (bounty.primaryAdmin && (bounty.primaryAdmin.username === admin.username)) || (bounty.secondaryAdmin && (bounty.secondaryAdmin.username === admin.username))) &&
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
              (bounty.secondaryAdmin && searchAdmins.find(admin => admin.username === bounty.secondaryAdmin.username)) ||
              (bounty.user && searchAdmins.find(admin => admin.username === bounty.user.username))
            )
            : true);
    });
  }, [bounties, searchTypes, searchStatus, searchAdmins]);

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
  }, []);

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

  const renderFilterArea = () => (
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
            <div
              style={{
                width: "106px",
              }}
              className={styles.filterItemsContainer}
              ref={typeRef}
            >
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
            <div
              style={{
                width: "100px",
              }}
              className={styles.filterItemsContainer}
              ref={catRef}
            >
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
              {filteredAdmins.map((tag, i) => (
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
  );

  return (
    <MainLayout match={match}>
      <div className={styles.container}>
        <div style={{ width: "100%" }}>
          <StyledTabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="bounty-tabs"
          >
            <StyledTab label="My Bounties" />
            <StyledTab label="All" />
          </StyledTabs>
          {
            activeTab == 0 &&
              <div className={styles.tabContainer}>
                {renderFilterArea()}
                <div
                  style={{
                    marginTop: "16px",
                  }}
                >
                  {loading ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "32px",
                      }}
                    >
                      <CircularProgress style={{ color: "white" }} />
                    </div>
                  ) : search && filteredBounties.length === 0 ? (
                    <div
                      style={{
                        color: "white",
                        fontSize: "12px",
                        textAlign: "center",
                        marginTop: "32px",
                      }}
                    >
                      No bounties found
                    </div>
                  ) : (
                    filteredBounties.map((bounty, index) => (
                      <BountyCard bounty={bounty} search={search} key={`bounty-card-${index}`} />
                    ))
                  )}
                </div>
              </div>
          }
          {
            activeTab == 1 &&
            <div>
              {renderFilterArea()}
            </div>
          }
        </div>
      </div>
    </MainLayout>
  )
}
