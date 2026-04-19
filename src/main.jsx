import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./component/App";
import NewGroupPage from "@/pages/newGroup";
import ProfilePage from "@/pages/Profile";
import GroupList from "./component/GroupList";
import { ThemeProvider } from "./ThemeContext";
import { LanguageProvider } from "./LanguageContext";
import useUserStore from "./store/useUserStore";
import SettingsPage from "./pages/Settings";

useUserStore.getState().loadUser();

function NotFound() {
  return <h1>404 not found</h1>;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider>
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/new-group" element={<NewGroupPage />} />
          <Route path="/my-groups" element={<GroupList />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  </ThemeProvider>,
);
