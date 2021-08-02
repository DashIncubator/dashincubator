import React, { useState } from "react";
import { Breakpoints } from "../../utils/breakpoint";
import { createUseStyles } from "react-jss";
import { CircularProgress } from "@material-ui/core";
import warnIcon from "../Login/images/warn.svg";
import { updatePassword } from "../../api/usersApi";
import { useHistory } from "react-router-dom";
import { RootLocation } from "../../Locations";

const useStyles = createUseStyles({
  container: {
    width: "100vw",
    minHeight: "100vh",
    overflow: "hidden",
    backgroundColor: "#008DE4",
  },
  content: { maxWidth: "100vw", margin: "auto", padding: "0 32px" },
  contentContainer: {
    display: "inline-block",
    marginTop: "48px",
    borderRadius: "16px",
  },
  inputHeader: {
    fontWeight: 400,
    fontSize: "14px",
    lineHeight: "18px",
    color: "rgba(255, 255, 255, 0.5)",
  },
  input: {
    border: "none",
    fontSize: "14px",
    width: "250px",
    padding: "8px 16px",
    borderRadius: "4px",
    marginTop: "8px",
  },
  CTAContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "32px",
  },
  loginCTA: {
    backgroundColor: "#0B0F3B",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    borderRadius: "4px",
    textAlign: "center",
    padding: "8px 8px",
    fontSize: "12px",
    userSelect: "none",
    marginLeft: "6px",
    minWidth: "70px",
  },
  inputContainer: {
    display: "block",
    alignItems: "center",
  },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    content: { maxWidth: "1050px", margin: "auto", padding: "0 88px" },
    contentContainer: {
      display: "inline-block",
      marginTop: "140px",
      padding: "24px",
      borderRadius: "16px",
    },
    loginCTA: {
      backgroundColor: "#0B0F3B",
      color: "white",
      fontWeight: 600,
      cursor: "pointer",
      borderRadius: "4px",
      textAlign: "center",
      padding: "8px 16px",
      fontSize: "14px",
      userSelect: "none",
      marginLeft: "0px",
    },
    input: {
      border: "none",
      fontSize: "14px",
      width: "250px",
      padding: "8px 16px",
      borderRadius: "4px",
      marginTop: "8px",
    },
    inputContainer: {
      display: "flex",
      alignItems: "center",
    },
  },
});

export default function UpdatePasswordView({ match }) {
  const styles = useStyles();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const history = useHistory();

  const { uid, hashCode } = match.params;

  const onReset = async () => {
    if (!newPassword) {
      setError("Enter new password");
    } else if (!newPassword2) {
      setError("Enter new password again");
    } else if (newPassword !== newPassword2) {
      setError("Passwords do not match");
    } else {
      setLoading(true);
      setError(null);
      const response = await updatePassword(uid, {
        password: newPassword2,
        hashCode,
      });
      const data = await response.json();
      setLoading(false);
      if (data.message === "success") {
        history.push(RootLocation);
      } else if (data.error) {
        setError(data.error);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.contentContainer}>
          <div
            style={{
              letterSpacing: "0.1em",
              fontSize: "32px",
              color: "white",
              fontWeight: "bold",
            }}
          >
            ENTER NEW PASSWORD
          </div>
          <div style={{ marginTop: "48px" }}>
            <div className={styles.inputHeader}>New Password</div>
            <input
              className={styles.input}
              placeholder={"Enter new password"}
              value={newPassword}
              type="password"
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className={styles.inputHeader} style={{ marginTop: "24px" }}>
              Enter new password again
            </div>
            <input
              className={styles.input}
              placeholder={"Enter new password again"}
              value={newPassword2}
              type="password"
              onChange={(e) => setNewPassword2(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  onReset();
                }
              }}
            />
            <div
              className={styles.CTAContainer}
              onClick={() => !loading && onReset()}
            >
              <div className={styles.loginCTA}>
                {loading ? (
                  <CircularProgress style={{ color: "white" }} size={12} />
                ) : (
                  "Update password"
                )}
              </div>
            </div>
          </div>
          {error && (
            <div
              style={{
                marginTop: "24px",
                color: "white",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                src={warnIcon}
                alt="error"
                style={{
                  marginRight: "12px",
                  width: "20px",
                  height: "20px",
                }}
              />
              <div>{error}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
