// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
   <GoogleOAuthProvider clientId="1098959665337-0ack1075rgjq99vr1p335f2n5vi9cl5m.apps.googleusercontent.com">

      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
