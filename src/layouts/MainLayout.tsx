import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import { Header, Footer } from "../components";
import { selectIsDarkMode } from "../redux/theme/selectors";

const MainLayout: React.FC = () => {
  const isDarkMode = useSelector(selectIsDarkMode);

  return (
    <div className={`wrapper ${isDarkMode ? "dark-theme" : "light-theme"}`}>
      <Header />
      <div className="content">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
