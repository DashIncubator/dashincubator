import { useEffect, useState, useCallback } from "react";
import clsx from "clsx";
import { useHistory } from "react-router-dom";
import {
  BountiesLocation,
  ConceptsLocation,
  PaymentsLocation,
  ProfileLocation,
  RootLocation,
  TasksLocation,
} from "../../Locations";
import logoutIcon from "./images/logout.svg";
import { removeAuthToken } from "../../api/serverRequest";
import useGlobalState from "../../state";
import Tooltip from "@material-ui/core/Tooltip";
import dashLogo from "../../views/Login/images/dashLogo.svg";
import checkboxIcon from "./images/checkbox.svg";
import { createUseStyles } from "react-jss";
import { Breakpoints } from "../../utils/breakpoint";
import UserAvatar from "../../components/UserAvatar";
import { countNotifications } from "../../api/notificationsApi";
import { fetchDashboardCount } from "../../api/global";
import hamburgerIcon from "./images/hamburger.svg";
import DashModal from "../../components/DashModal";
import homeIcon from "./images/home.svg";

const useStyles = createUseStyles({
  navItem: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    userSelect: "none",
    height: "38px",
  },
  logoText: {
    display: "none",
    marginLeft: "8px",
    letterSpacing: "0.1em",
    fontSize: "12px",
    lineHeight: "15px",
    userSelect: "none",
  },
  contentContainer: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: "32px",
    color: "white",
    fontWeight: "bold",
  },
  logo: {
    width: "78px",
    filter: "brightness(0) invert(1)",
    userSelect: "none",
  },
  navItemsContainer: {
    display: "none",
    alignItems: "center",
    marginLeft: "16px",
  },
  navItemsContainerMobile: {
    display: "flex",
    flexDirection: "column",
  },
  container: { maxWidth: "100vw", margin: "auto", padding: "0 24px" },
  navTitle: { marginLeft: "6px", fontWeight: 600, lineHeight: "17px" },
  hamburger: { cursor: "pointer", display: "block" },
  notifCount: {
    backgroundColor: "#AD1D73",
    borderRadius: "4px",
    color: "white",
    marginLeft: "6px",
    minWidth: "15px",
    minHeight: "17px",
    userSelect: "none",
    fontSize: "11px",
    fontWeight: 600,
    lineHeight: "13px",
    padding: "4px",
  },
  login: {
    marginBottom: 4,
    marginLeft: 16,
  },
  avatarWrapper: {
    position: "relative",
  },
  notifications: {
    position: "absolute",
    right: -2,
    top: -2,
    backgroundColor: "#AD1D73",
    fontSize: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  [`@media (min-width: ${Breakpoints.md}px)`]: {
    container: { maxWidth: 1600, margin: "auto", padding: "0 88px" },
    logoText: {
      display: "block",
      marginLeft: "8px",
      letterSpacing: "0.1em",
      fontSize: "12px",
      lineHeight: "15px",
      userSelect: "none",
    },
    hamburger: { cursor: "pointer", display: "none" },
    navItemsContainer: {
      display: "flex",
      alignItems: "center",
      marginLeft: "16px",
    },
    logo: {
      width: "78px",
      filter: "brightness(0) invert(1)",
      userSelect: "none",
    },
    contentContainer: {
      display: "flex",
      justifyContent: "space-between",
      paddingTop: "64px",
      color: "white",
      fontWeight: "bold",
    },
  },
});

export default function MainLayout({ children, style, match }) {
  const { setLoggedInUser, loggedInUser } = useGlobalState();
  const styles = useStyles();
  const history = useHistory();
  const [notifCount, setNotifCount] = useState(null);
  const [showNav, setShowNav] = useState(false);

  const onLogout = () => {
    removeAuthToken();
    setLoggedInUser(null);
    history.push(RootLocation);
  };

  useEffect(() => {
    let count = 0;
    countNotifications()
      .then((data) => data.json())
      .then((result) => {
        count += result.count;
        fetchDashboardCount()
          .then((d) => d.json())
          .then((items) => {
            Object.keys(items).map((key) => (count += items[key]));
            setNotifCount(count);
          });
      });
  }, []);

  const handleConcept = useCallback(() => {
    history.push(ConceptsLocation);
  }, [history]);

  const handleBounties = useCallback(() => {
    history.push(BountiesLocation);
  }, [history]);

  const handleTasks = useCallback(() => {
    history.push(TasksLocation);
  }, [history]);

  const handleLogin = useCallback(() => {
    history.push(RootLocation);
  }, [history]);

  return (
    <div style={{ backgroundColor: "#008de4", minHeight: "100vh" }}>
      <DashModal open={showNav} onClose={() => setShowNav(false)}>
        <div className={styles.navItemsContainerMobile}>
          <div
            className={styles.navItem}
            onClick={() => {
              setShowNav(false);
              history.push(RootLocation);
            }}
          >
            <img src={homeIcon} alt={"home"} style={{ width: "16px" }} />
            <div className={styles.navTitle}>Home</div>
          </div>
          <div
            className={styles.navItem}
            style={{ marginTop: "24px" }}
            onClick={handleTasks}
          >
            <img src={checkboxIcon} alt={"check"} style={{ width: "16px" }} />
            <div className={styles.navTitle}>Tasks</div>
          </div>
          <div
            className={styles.navItem}
            style={{ marginTop: "24px" }}
            onClick={handleBounties}
          >
            <img src={checkboxIcon} alt={"check"} style={{ width: "16px" }} />
            <div className={styles.navTitle}>Bounties</div>
          </div>
          <div
            className={styles.navItem}
            style={{ marginTop: "24px" }}
            onClick={handleConcept}
          >
            <img src={checkboxIcon} alt={"check"} style={{ width: "16px" }} />
            <div className={styles.navTitle}>Concepts</div>
          </div>
          <div
            className={styles.navItem}
            style={{ marginTop: "24px" }}
            onClick={() => {
              setShowNav(false);
              history.push(PaymentsLocation);
            }}
          >
            <img src={checkboxIcon} alt={"check"} style={{ width: "16px" }} />
            <div className={styles.navTitle}>Rewards</div>
          </div>
          <div
            className={styles.navItem}
            style={{ marginTop: "24px" }}
            onClick={() => {
              setShowNav(false);
              onLogout();
            }}
          >
            {loggedInUser &&
              <img
                onClick={() => onLogout()}
                src={logoutIcon}
                alt={"time"}
                style={{
                  width: "16px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              />
            }
            <div className={styles.navTitle}>{loggedInUser ? 'Logout' : 'Login | Signup'}</div>
          </div>
          <div
            className={styles.navItem}
            style={{ marginTop: "24px" }}
            onClick={() => {
              setShowNav(false);
              history.push(ProfileLocation(loggedInUser.username));
            }}
          >
            <UserAvatar
              isProfile
              user={loggedInUser}
              size={"18px"}
              fontSize={"8px"}
              lineHeight={"10px"}
            />
            <div className={styles.navTitle}>Profile</div>
          </div>
        </div>
      </DashModal>
      <div className={styles.container}>
        <div className={styles.contentContainer}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                cursor: "pointer",
              }}
              onClick={() => history.push(RootLocation)}
            >
              <img src={dashLogo} alt="logo" className={styles.logo} />
              <div className={styles.logoText}>INCUBATOR</div>
            </div>
          </div>
          <img
            src={hamburgerIcon}
            alt="navigate"
            className={styles.hamburger}
            onClick={() => setShowNav(!showNav)}
          />
          <div className={styles.navItemsContainer}>
            <div
              className={styles.navItem}
              style={{
                marginLeft: "16px",
                borderBottom:
                  match?.path === TasksLocation
                    ? "4px solid #fff"
                    : "4px solid transparent",
              }}
              onClick={handleTasks}
            >
              <img src={checkboxIcon} alt={"check"} style={{ width: "16px" }} />
              <div className={styles.navTitle}>Tasks</div>
            </div>
            <div
              className={styles.navItem}
              style={{
                marginLeft: "16px",
                borderBottom:
                  match?.path === BountiesLocation
                    ? "4px solid #fff"
                    : "4px solid transparent",
              }}
              onClick={handleBounties}
            >
              <img src={checkboxIcon} alt={"check"} style={{ width: "16px" }} />
              <div className={styles.navTitle}>Bounties</div>
            </div>
            <div
              className={styles.navItem}
              style={{
                marginLeft: "16px",
                borderBottom:
                  match?.path === ConceptsLocation
                    ? "4px solid #fff"
                    : "4px solid transparent",
              }}
              onClick={handleConcept}
            >
              <img src={checkboxIcon} alt={"check"} style={{ width: "16px" }} />
              <div className={styles.navTitle}>Concepts</div>
            </div>
            <div
              className={styles.navItem}
              style={{
                marginLeft: "16px",
                borderBottom:
                  match?.path === PaymentsLocation
                    ? "4px solid #fff"
                    : "4px solid transparent",
              }}
              onClick={() => history.push(PaymentsLocation)}
            >
              <img src={checkboxIcon} alt={"check"} style={{ width: "16px" }} />
              <div className={styles.navTitle}>Rewards</div>
            </div>
            {loggedInUser && (
              <Tooltip title="Logout">
                <img
                  onClick={() => onLogout()}
                  src={logoutIcon}
                  alt={"time"}
                  style={{
                    width: "16px",
                    margin: "0px 16px",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                />
              </Tooltip>
            )}
            <div className={styles.avatarWrapper}>
              <UserAvatar user={loggedInUser} isProfile />
              {notifCount ? (
                <div className={styles.notifications}>{notifCount}</div>
              ) : null}
            </div>
            {!loggedInUser && (
              <div
                className={clsx(styles.navItem, styles.login)}
                onClick={handleLogin}
              >
                Login | Signup
              </div>
            )}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
