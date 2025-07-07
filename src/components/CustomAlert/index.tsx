import React from "react";
import styles from "./CustomAlert.module.scss";

interface CustomAlertProps {
  message: string;
  onClose: () => void;
  isVisible: boolean;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  message,
  onClose,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className={styles.customAlertOverlay}>
      <div className={styles.customAlert}>
        <div className={styles.customAlert__content}>
          <div className={styles.customAlert__icon}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                fill="currentColor"
              />
            </svg>
          </div>
          <p className={styles.customAlert__message}>{message}</p>
        </div>
        <button className={styles.customAlert__closeBtn} onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default CustomAlert;
