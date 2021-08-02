import React, { useState } from "react";
import { Breakpoints } from "../../utils/breakpoint";
import { createUseStyles } from "react-jss";
import { CircularProgress } from "@material-ui/core";
import { validateEmail } from "../Login";
import warnIcon from "../Login/images/warn.svg";
import { resetPassword } from "../../api/usersApi";

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

export default function ResetPasswordView() {
  const styles = useStyles();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const onReset = async () => {
    if (!email) {
      setError("Enter an email address");
    } else if (!validateEmail(email)) {
      setError("Invalid email");
    } else {
      setLoading(true);
      setError(null);
      const response = await resetPassword(email);
      const result = await response.json();
      if (result.message === "success") {
        setSuccess(true);
        setLoading(false);
      } else if (result.error) {
        setLoading(false);
        setError(result.error);
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
            RESET PASSWORD
          </div>
          <div style={{ marginTop: "48px" }}>
            <div className={styles.inputHeader}>Email</div>
            <input
              className={styles.input}
              placeholder={"Enter your email"}
              disabled={success}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading && !success) {
                  onReset();
                }
              }}
            />
            <div
              className={styles.CTAContainer}
              onClick={() => !loading && !success && onReset()}
            >
              <div
                className={styles.loginCTA}
                style={{
                  backgroundColor: success ? "green" : "#0B0F3B",
                  cursor: success ? "auto" : "pointer",
                }}
              >
                {loading ? (
                  <CircularProgress style={{ color: "white" }} size={12} />
                ) : success ? (
                  `Reset link will be sent to ${email} shortly`
                ) : (
                  "Send reset password email"
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
