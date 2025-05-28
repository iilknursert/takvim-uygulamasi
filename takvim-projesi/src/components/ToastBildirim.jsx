// src/components/ToastBildirim.jsx
import React from "react";
import "../Toast.css";

const ToastBildirim = ({ mesaj, visible }) => {
  return (
    <div className={`toast ${visible ? "visible" : ""}`}>
      {mesaj}
    </div>
  );
};

export default ToastBildirim;
