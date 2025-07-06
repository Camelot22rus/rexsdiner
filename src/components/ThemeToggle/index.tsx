import React from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../redux/store";
import { selectIsDarkMode } from "../../redux/theme/selectors";
import { toggleTheme } from "../../redux/theme/slice";

const ThemeToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useSelector(selectIsDarkMode);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <button
      className="theme-toggle"
      onClick={handleToggle}
      aria-label="Toggle theme"
    >
      <span className="theme-toggle__icon">{isDarkMode ? "☀️" : "🌙"}</span>
      <span className="theme-toggle__text">
        {isDarkMode ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
};

export default ThemeToggle;
