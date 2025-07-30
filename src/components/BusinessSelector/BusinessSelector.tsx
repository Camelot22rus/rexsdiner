import React from 'react';
import { useBusiness } from '../../contexts/BusinessContext';
import styles from './BusinessSelector.module.scss';

const BusinessSelector: React.FC = () => {
  const { currentBusiness, setCurrentBusiness, businessOptions, isLoading, error } = useBusiness();

  const handleBusinessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentBusiness(e.target.value);
  };

  if (isLoading) {
    return (
      <div className={styles.businessSelector}>
        <span>Загрузка...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.businessSelector}>
        <span className={styles.error}>Ошибка загрузки</span>
      </div>
    );
  }

  return (
    <div className={styles.businessSelector}>
      <label htmlFor="business-select">Бизнес:</label>
      <select 
        id="business-select"
        value={currentBusiness} 
        onChange={handleBusinessChange}
        className={styles.select}
      >
        {businessOptions.map(business => (
          <option key={business.id} value={business.id}>
            {business.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BusinessSelector; 