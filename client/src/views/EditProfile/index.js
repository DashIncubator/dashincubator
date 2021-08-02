import React, { useState, useRef } from "react";
import { createUseStyles } from "react-jss";
import DashModal from "../../components/DashModal";
import doneIcon from "../Concept/images/done.svg";
import { CircularProgress } from "@material-ui/core";
import UserAvatar from "../../components/UserAvatar";
import { updateUser } from "../../api/usersApi";
import { setAuthToken } from "../../api/serverRequest";
import useGlobalState from "../../state";
import { Breakpoints } from "../../utils/breakpoint";

const useStyles = createUseStyles({
  container: { minWidth: "auto", maxWidth: "100vw" },
  input: {
    borderRadius: "4px",
    padding: "8px",
    fontSize: "12px",
    lineHeight: "18px",
    marginTop: "16px",
    width: "100%",
  },
  CTA: {
    cursor: "pointer",
    userSelect: "none",
    borderRadius: "4px",
    marginRight: "32px",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    color: "white",
    fontSize: "12px",
    lineHeight: "15px",
    fontWeight: 600,
    backgroundColor: "#008DE4",
  },
  sectionHeader: {
    color: "#008DE4",
    fontSize: "12px",
    lineHeight: "15px",
    fontWeight: 600,
    letterSpacing: "0.1em",
  },
  [`@media (min-width: ${Breakpoints.sm}px)`]: {
    container: { minWidth: "550px", maxWidth: "646px" },
    CTA: {
      cursor: "pointer",
      userSelect: "none",
      borderRadius: "4px",
      padding: "8px",
      marginRight: "0px",
      display: "flex",
      alignItems: "center",
      color: "white",
      fontSize: "12px",
      lineHeight: "15px",
      fontWeight: 600,
      backgroundColor: "#008DE4",
    },
  },
});

export default function EditProfileView({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const { setLoggedInUser, loggedInUser } = useGlobalState();
  const user = loggedInUser;
  const [bio, setBio] = useState(loggedInUser?.bio || "");
  const [selectedImage, setSelectedImage] = useState(
    loggedInUser?.profileImage
  );
  const styles = useStyles();
  const inputFile = useRef(null);

  const onComplete = async () => {
    setLoading(true);
    const response = await updateUser(user._id, {
      profileImage: selectedImage,
      bio: bio,
    });
    const data = await response.json();
    if (data.token) {
      setAuthToken(data.token);
    }
    if (data.user) {
      setLoggedInUser(data.user);
    }
    setLoading(false);
    onClose(null);
  };

  const selectImage = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const maxAllowedSize = 50 * 1024 * 1024;
      if (e.target.files[0].size <= maxAllowedSize) {
        setLoading(true);
        const files = Array.from(e.target.files);
        const formData = new FormData();
        files.forEach((file, i) => {
          formData.append(i, file);
        });
        const imageData = await fetch(
          `${process.env.REACT_APP_API_URL}/image-upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const result = await imageData.json();
        setSelectedImage(result && result[0].url);
        setLoading(false);
      }
    }
  };

  return (
    <DashModal
      open={open}
      onClose={() => {
        onClose();
      }}
    >
      <div className={styles.container}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{ fontSize: "18px", lineHeight: "22px", fontWeight: 600 }}
          >
            {user.username}
          </div>
          <div className={styles.CTA} onClick={() => !loading && onComplete()}>
            {loading ? (
              <CircularProgress style={{ color: "white" }} size={12} />
            ) : (
              <>
                <img src={doneIcon} alt="done" style={{ marginRight: "4px" }} />
                Save
              </>
            )}
          </div>
        </div>
        <div
          style={{ display: "flex", alignItems: "center", marginTop: "28px" }}
        >
          {loading ? (
            <CircularProgress style={{ color: "white" }} size={65} />
          ) : selectedImage ? (
            <img
              src={selectedImage}
              alt="profile"
              style={{ width: "65px", height: "65px", borderRadius: "65px" }}
            />
          ) : (
            <UserAvatar
              disabled
              size={65}
              fontSize={"24px"}
              lineHeight={"29px"}
              user={user}
            />
          )}
          <div
            style={{
              marginLeft: "18px",
              cursor: "pointer",
              color: "#008DE4",
              fontWeight: 600,
              fontSize: "12px",
              lineHeight: "15px",
            }}
            onClick={() => inputFile.current.click()}
          >
            Select profile image
          </div>
          <input
            type="file"
            id="file"
            ref={inputFile}
            style={{ display: "none" }}
            accept="image/*"
            onChange={selectImage}
          />
        </div>
        <div style={{ marginTop: "28px" }}>
          <div className={styles.sectionHeader}>BIO</div>
          <input
            className={styles.input}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={"Enter your bio"}
          />
        </div>
      </div>
    </DashModal>
  );
}
