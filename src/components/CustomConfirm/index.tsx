import React from "react";
import styles from "./CustomConfirm.module.scss";

interface CustomConfirmProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isVisible: boolean;
}

const CustomConfirm: React.FC<CustomConfirmProps> = ({
  message,
  onConfirm,
  onCancel,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className={styles.customConfirmOverlay}>
      <div className={styles.customConfirm}>
        <div className={styles.customConfirm__content}>
          <div className={styles.customConfirm__icon}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-2h-2v2zm0-4h2V7h-2v6z"
                fill="currentColor"
              />
            </svg>
          </div>
          <p className={styles.customConfirm__message}>{message}</p>
        </div>
        <div className={styles.customConfirm__buttons}>
          <button
            className={styles.customConfirm__cancelBtn}
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            className={styles.customConfirm__confirmBtn}
            onClick={onConfirm}
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomConfirm;
