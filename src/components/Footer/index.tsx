import React from "react";
import ThemeToggle from "../ThemeToggle";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          <div className="footer__logo">
            <h3>Rex Diner</h3>
            <p>Лучшая пицца в городе</p>
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
