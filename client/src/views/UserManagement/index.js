import { CircularProgress } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { createUseStyles } from "react-jss";
import { useHistory } from "react-router";
import { demoteUser, fetchUsers, promoteUser } from "../../api/usersApi";
import UserAvatar from "../../components/UserAvatar";
import MainLayout from "../../layouts/MainLayout";
import { RootLocation } from "../../Locations";
import useGlobalState from "../../state";
import { Breakpoints } from "../../utils/breakpoint";
import searchIcon from "../Tasks/images/search.svg";

const useStyles = createUseStyles({
  container: {
    maxWidth: "100vw",
    margin: "auto",
    padding: "0 24px 88px 24px",
    marginTop: "32px",
    color: "#0B0F3B",
    backgroundColor: "#008DE4",
  },
  loader: {
    display: "flex",
    justifyContent: "center",
    marginTop: "88px",
  },
  username: {
    fontSize: "14px",
    color: "white",
    marginLeft: "8px",
    fontWeight: "bold",
  },
  badge: {
    fontSize: "14px",
    color: "white",
    marginLeft: "16px",
    fontWeight: "bold",
    letterSpacing: "0.1em",
    backgroundColor: "#AD1D73",
    padding: "4px",
    borderRadius: "4px",
  },
  CTA: {
    marginLeft: "16px",
    color: "white",
    fontSize: "12px",
    textDecoration: "underline",
    cursor: "pointer",
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
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    container: {
      maxWidth: "1050px",
      margin: "auto",
      padding: "0 88px 88px 88px",
      marginTop: "32px",
      color: "#0B0F3B",
      backgroundColor: "#008DE4",
    },
  },
});

export default function UserManagementView() {
  const styles = useStyles();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const { loggedInUser } = useGlobalState();
  const history = useHistory();

  useEffect(() => {
    setLoading(true);
    fetchUsers().then((data) => {
      setLoading(false);
      setUsers(data);
    });
  }, []);

  if (loggedInUser && !loggedInUser.isSuperUser) {
    history.push(RootLocation);
  }

  const onPromote = async (id) => {
    setLoading(true);
    await promoteUser(id);
    fetchUsers().then((data) => {
      setLoading(false);
      setUsers(data);
    });
  };

  const onDemote = async (id) => {
    setLoading(true);
    await demoteUser(id);
    fetchUsers().then((data) => {
      setLoading(false);
      setUsers(data);
    });
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        {loading ? (
          <div className={styles.loader}>
            <CircularProgress style={{ color: "white" }} />
          </div>
        ) : (
          <div style={{ marginTop: "48px" }}>
            <div className={styles.inputContainer}>
              <img src={searchIcon} alt="search" style={{ padding: "9px" }} />
              <input
                className={styles.searchInput}
                placeholder={"Search for a user"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ marginTop: "32px" }}>
              {users
                .sort((a, b) => (a.isAdmin ? -1 : 1))
                .filter((user) =>
                  search.length > 0 ? user.username.includes(search) : user
                )
                .map((user) => (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "24px",
                    }}
                  >
                    <UserAvatar user={user} />
                    <div className={styles.username}>{user.username}</div>
                    {user.isAdmin ? (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div className={styles.badge}>ADMIN</div>
                        <div
                          className={styles.CTA}
                          onClick={() => onDemote(user._id)}
                        >
                          REMOVE ADMIN STATUS
                        </div>
                      </div>
                    ) : (
                      <div
                        className={styles.CTA}
                        onClick={() => onPromote(user._id)}
                      >
                        PROMOTE TO ADMIN
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
