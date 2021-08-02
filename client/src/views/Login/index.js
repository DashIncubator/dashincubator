import React, { useState } from "react";
import { setAuthToken } from "../../api/serverRequest";
import { createUser, loginUser } from "../../api/usersApi";
import useGlobalState from "../../state";
import dashLogo from "./images/dashLogo.svg";
import FadeIn from "react-fade-in";
import { ResetPasswordLocation, RootLocation } from "../../Locations";
import { useHistory } from "react-router";
import arrowRight from "./images/arrowRight.svg";
import { CircularProgress } from "@material-ui/core";
import eyeIcon from "./images/eye.svg";
import eyeOffIcon from "./images/eyeOff.svg";
import { createUseStyles } from "react-jss";
import { randomColor, usernameIsValid } from "../../utils/utils";
import warnIcon from "./images/warn.svg";
import MainLayout from "../../layouts/MainLayout";
import { Breakpoints } from "../../utils/breakpoint";

export function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const useStyles = createUseStyles({
  container: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#008DE4",
  },
  content: { maxWidth: "100vw", margin: "auto", padding: "0 32px" },
  contentContainer: {
    display: "inline-block",
    marginTop: "48px",
    borderRadius: "16px",
  },
  title: {
    color: "white",
    fontWeight: 600,
    fontSize: "18px",
    lineHeight: "22px",
    letterSpacing: "0.1em",
    marginLeft: "16px",
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
  showPassword: {
    width: "14px",
    position: "absolute",
    top: "calc(50% - 3.5px)",
    left: "220px",
    zIndex: 2,
    cursor: "pointer",
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
  optionCTA: {
    color: "white",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    userSelect: "none",
    display: "flex",
    alignItems: "center",
  },
  inputContainer: {
    display: "block",
    alignItems: "center",
  },
  usernameInput: {
    marginTop: "16px",
  },
  existingAccount: {
    fontSize: "11px",
  },
  forgotPassword: {
    marginTop: "12px",
    letterSpacing: "0.1em",
    color: "white",
    fontSize: "12px",
    cursor: "pointer",
    textDecoration: "underline",
    userSelect: "none",
  },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    content: { maxWidth: "1050px", margin: "auto", padding: "0 88px" },
    contentContainer: {
      display: "inline-block",
      marginTop: "140px",
      padding: "24px",
      borderRadius: "16px",
    },
    usernameInput: {
      marginTop: "0px",
    },
    existingAccount: {
      fontSize: "14px",
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

export default function LoginView({ match }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loginState, setLoginState] = useState(true);
  const { setLoggedInUser } = useGlobalState();
  const history = useHistory();
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const styles = useStyles();

  const onLogin = async () => {
    setLoading(true);
    const response = await loginUser({ password, username });
    if (
      response.status === 403 ||
      response.status === 402 ||
      response.status === 401 ||
      response.status === 400 ||
      response.status === 404
    ) {
      setLoading(false);
      setError("Error");
    } else {
      const data = await response.json();
      if (data.error) {
        setLoading(false);
        setError(data.error);
      } else {
        setLoading(false);
        setAuthToken(data.token);
        setLoggedInUser(data.user);
        history.push(RootLocation);
      }
    }
  };

  const onRegister = async () => {
    if (username?.length < 3) {
      setError("Username must be 3 characters or more");
    } else if (password.length < 4) {
      setError("Password is too short");
    } else if (!usernameIsValid(username)) {
      setError(
        "Invalid username, spaces and special characters are not allowed"
      );
    } else {
      setLoading(true);
      const response = await createUser({
        password,
        username,
        email: email.toLowerCase(),
        color: randomColor(),
      });
      if (
        response.status === 403 ||
        response.status === 402 ||
        response.status === 401 ||
        response.status === 400 ||
        response.status === 404
      ) {
        setLoading(false);
        setError("Error");
      } else {
        const data = await response.json();
        if (data.error) {
          setLoading(false);
          setError(data.error);
        } else {
          setLoading(false);
          setAuthToken(data.token);
          setLoggedInUser(data.user);
          history.push(RootLocation);
        }
      }
    }
  };

  const resetData = () => {
    setUsername("");
    setPassword("");
    setEmail("");
    setPassword2("");
    setError("");
  };

  return (
    <MainLayout match={match}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div>
            <FadeIn>
              <div className={styles.contentContainer}>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <img
                    src={dashLogo}
                    alt="logo"
                    style={{
                      width: "112px",
                    }}
                  />
                  <div className={styles.title}>INCUBATOR</div>
                </div>
                <div style={{ marginTop: "32px" }}>
                  <div className={styles.inputContainer}>
                    {!loginState && (
                      <div style={{ marginRight: "20px" }}>
                        <div className={styles.inputHeader}>Email</div>
                        <input
                          className={styles.input}
                          placeholder={"Enter email"}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    )}
                    <div className={styles.usernameInput}>
                      <div className={styles.inputHeader}>
                        {loginState ? "Username/Email" : "Username"}
                      </div>
                      <input
                        className={styles.input}
                        placeholder={
                          loginState
                            ? "Enter username or email"
                            : "Enter username"
                        }
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className={styles.inputContainer}>
                    <div style={{ marginRight: loginState ? 0 : "20px" }}>
                      <div
                        className={styles.inputHeader}
                        style={{ marginTop: "20px" }}
                      >
                        Password
                      </div>
                      <div style={{ position: "relative" }}>
                        <img
                          src={showPassword ? eyeOffIcon : eyeIcon}
                          alt="show"
                          className={styles.showPassword}
                          onClick={() => setShowPassword(!showPassword)}
                        />
                        <input
                          style={{
                            padding: "8px 16px",
                            paddingRight: "32px",
                          }}
                          className={styles.input}
                          placeholder={"Enter password"}
                          value={password}
                          type={showPassword ? "text" : "password"}
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" &&
                              loginState &&
                              password &&
                              username
                            ) {
                              onLogin();
                            }
                          }}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    {!loginState && (
                      <div className={styles.usernameInput}>
                        <div
                          className={styles.inputHeader}
                          style={{ marginTop: "20px" }}
                        >
                          Verify Password
                        </div>
                        <div style={{ position: "relative" }}>
                          <img
                            src={showPassword2 ? eyeOffIcon : eyeIcon}
                            alt="show"
                            className={styles.showPassword}
                            onClick={() => setShowPassword2(!showPassword2)}
                          />
                          <input
                            style={{
                              padding: "8px 16px",
                              paddingRight: "32px",
                            }}
                            className={styles.input}
                            placeholder={"Enter password again"}
                            value={password2}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !loginState) {
                                if (!email) {
                                  setError("Enter an email address");
                                } else if (!username) {
                                  setError("Enter a username");
                                } else if (password.length === 0) {
                                  setError("Enter a password");
                                } else if (password2.length === 0) {
                                  setError("Enter password verification");
                                } else if (password !== password2) {
                                  setError("Passwords don't match");
                                } else if (!validateEmail(email)) {
                                  setError("Invalid email");
                                } else {
                                  onRegister();
                                }
                              }
                            }}
                            type={showPassword2 ? "text" : "password"}
                            onChange={(e) => setPassword2(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {loginState && (
                    <div
                      className={styles.forgotPassword}
                      onClick={() => history.push(ResetPasswordLocation)}
                    >
                      FORGOT PASSWORD?
                    </div>
                  )}
                  <div className={styles.CTAContainer}>
                    {!loginState && (
                      <div
                        onClick={() => {
                          resetData();
                          setShowPassword(false);
                          setShowPassword2(false);
                          setLoginState(true);
                        }}
                        className={styles.optionCTA}
                      >
                        <img
                          src={arrowRight}
                          alt="arrow"
                          style={{
                            width: "14px",
                            marginRight: "6px",
                            transform: "rotate(180deg)",
                          }}
                        />
                        <div className={styles.existingAccount}>
                          I already have an account
                        </div>
                      </div>
                    )}
                    {loginState ? (
                      <div
                        className={styles.loginCTA}
                        onClick={() => {
                          if (!loading) {
                            if (loginState && password && username) {
                              onLogin();
                            }
                          }
                        }}
                      >
                        {loading ? (
                          <CircularProgress
                            style={{ color: "white" }}
                            size={14}
                          />
                        ) : (
                          <div>Login</div>
                        )}
                      </div>
                    ) : (
                      <div
                        className={styles.loginCTA}
                        onClick={() => {
                          if (!loading) {
                            if (!email) {
                              setError("Enter an email address");
                            } else if (!username) {
                              setError("Enter a username");
                            } else if (password.length === 0) {
                              setError("Enter a password");
                            } else if (password2.length === 0) {
                              setError("Enter password verification");
                            } else if (password !== password2) {
                              setError("Passwords don't match");
                            } else if (!validateEmail(email)) {
                              setError("Invalid email");
                            } else {
                              onRegister();
                            }
                          }
                        }}
                      >
                        {loading ? (
                          <CircularProgress
                            style={{ color: "white" }}
                            size={14}
                          />
                        ) : (
                          <div>Create Account</div>
                        )}
                      </div>
                    )}
                    {loginState && (
                      <div
                        onClick={() => {
                          resetData();
                          setShowPassword(false);
                          setShowPassword2(false);
                          setLoginState(false);
                        }}
                        className={styles.optionCTA}
                      >
                        <div>Create an account</div>
                        <img
                          src={arrowRight}
                          alt="arrow"
                          style={{ width: "14px", marginLeft: "6px" }}
                        />
                      </div>
                    )}
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
            </FadeIn>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
