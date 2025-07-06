import React from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "../ThemeToggle";

const Footer: React.FC = () => {
  const location = useLocation();
  const isEmployeePage = location.pathname === "/employee";

  return (
    <footer className={`footer ${isEmployeePage ? "footer--employee" : ""}`}>
      <div className="container">
        <div className="footer__content">
          <div className="footer__logo">
            <h3>Rex Diner</h3>
            <p>Лучшая пицца в городе</p>
          </div>
          <div className="footer__nav">
            <Link to="/employee" className="footer__link">
              Для сотрудников
            </Link>
          </div>
          <div className="footer__theme">
            <ThemeToggle />
          </div>
        </div>
        <div className="footer__bottom">
          <p>&copy; 2025 Rex Diner. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
