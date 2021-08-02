import React from "react";
import Modal from "react-modal";
import { isMobile } from "react-device-detect";
import closeIcon from "./images/close.svg";
import { createUseStyles } from "react-jss";
import { Breakpoints } from "../utils/breakpoint";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#0B0F3B",
    border: "none",
    zIndex: 1000,
    color: "white",
    padding: "32px",
    paddingTop: isMobile ? "64px" : "32px",
    borderRadius: "8px",
    maxHeight: isMobile ? "100vh" : "90vh",
    maxWidth: "100vw",
    width: isMobile ? "100vw" : "auto",
    height: isMobile ? "100vh" : "auto",
  },
  overlay: {
    backgroundColor: "transparent",
    zIndex: 1000,
  },
};

const useStyles = createUseStyles({
  closeIcon: {
    position: "absolute",
    top: "64px",
    right: "24px",
    cursor: "pointer",
    display: "block",
  },
  [`@media (min-width: ${Breakpoints.lg}px)`]: {
    closeIcon: {
      position: "absolute",
      display: "none",
      top: "24px",
      right: "24px",
      cursor: "pointer",
    },
  },
});

Modal.setAppElement("#root");

export default function DashModal({ open, onClose, children, style }) {
  const styles = useStyles();
  return (
    <Modal
      closeTimeoutMS={200}
      isOpen={open}
      onRequestClose={onClose}
      style={{ ...customStyles, style }}
    >
      <img
        src={closeIcon}
        alt="close"
        onClick={onClose}
        className={styles.closeIcon}
      />
      {children}
    </Modal>
  );
}
