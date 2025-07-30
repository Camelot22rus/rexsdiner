import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectUserLoading,
  selectUserError,
  selectIsAuthenticated,
} from "../../redux/user/selectors";
import { loginUser } from "../../redux/user/asyncActions";
import { clearError } from "../../redux/user/slice";
import { useAppDispatch } from "../../redux/store";
import { useBusiness } from "../../contexts/BusinessContext";
import { DEFAULT_BUSINESS_ID } from "../../config";
import styles from "./LoginModal.module.scss";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const appDispatch = useAppDispatch();
  const loading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);
  const { businessOptions, isLoading: businessLoading } = useBusiness();
  
  // Map backend error to Russian
  const displayError = error === 'Invalid credentials' ? 'Не правильный пароль' : error;
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [formData, setFormData] = useState({
    id: "",
    pass: "",
    businessId: DEFAULT_BUSINESS_ID, // Default business from config
  });

  React.useEffect(() => {
    if (isAuthenticated) {
      onClose();
    }
  }, [isAuthenticated, onClose]);

  React.useEffect(() => {
    if (error) {
      // Clear error after 3 seconds
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Update form data when business options change
  React.useEffect(() => {
    if (businessOptions.length > 0 && !businessOptions.find(b => b.id === formData.businessId)) {
      setFormData(prev => ({ ...prev, businessId: businessOptions[0].id }));
    }
  }, [businessOptions]);

  // Format as xxx-xxxx
  const formatEmployeeId = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 7);
    if (digits.length <= 3) return digits;
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  };

  // Validate xxx-xxxx
  const isValidEmployeeId = (value: string) => /^\d{3}-\d{4}$/.test(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "id") {
      const formatted = formatEmployeeId(value);
      setFormData((prev) => ({ ...prev, id: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.pass) {
      return;
    }
    if (!isValidEmployeeId(formData.id)) {
      return;
    }
    // Remove dash before sending
    const idTransformed = formData.id.replace(/-/g, "");
    appDispatch(
      loginUser({
        id: parseInt(idTransformed),
        pass: formData.pass,
        businessId: formData.businessId, // Include business ID
      })
    );
  };

  const handleClose = () => {
    setFormData({ id: "", pass: "", businessId: DEFAULT_BUSINESS_ID });
    dispatch(clearError());
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Вход</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="business">Бизнес</label>
            <select
              id="business"
              name="businessId"
              value={formData.businessId}
              onChange={handleInputChange}
              disabled={loading || businessLoading}
              required
            >
              {businessOptions.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="id">Номер телефона</label>
            <input
              type="text"
              id="id"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              placeholder="xxx-xxxx"
              required
              disabled={loading}
              maxLength={8}
              autoComplete="off"
              inputMode="numeric"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="pass">Пароль</label>
            <input
              type="password"
              id="pass"
              name="pass"
              value={formData.pass}
              onChange={handleInputChange}
              placeholder="Введите пароль"
              required
              disabled={loading}
            />
          </div>

          {displayError && <div className={styles.error}>{displayError}</div>}

          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleClose}
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className={styles.loginButton}
              disabled={
                loading ||
                !formData.id ||
                !formData.pass ||
                !isValidEmployeeId(formData.id)
              }
            >
              {loading ? "Вход..." : "Войти"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
