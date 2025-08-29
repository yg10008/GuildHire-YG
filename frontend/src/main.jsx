import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from 'react-toastify'
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { JobProvider } from "./context/JobContext.jsx";
import { ChatProvider } from "./context/ChatContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <JobProvider>
            <ChatProvider>
              <App />
              <ToastContainer position="top-right" autoClose={3000} />
            </ChatProvider>
          </JobProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
