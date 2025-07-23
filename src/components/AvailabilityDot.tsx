import React from 'react';

interface AvailabilityDotProps {
  level: number | null | undefined;
  missingIngredients?: string[];
  onNotify?: (msg: string) => void;
}

const getColor = (level: number | null | undefined) => {
  if (level == null) return '#ccc'; // gray for unknown
  if (level > 5) return '#27ae60'; // green
  if (level > 2) return '#f1c40f'; // yellow
  return '#e74c3c'; // red
};

const getTooltipText = (level: number | null | undefined, missingIngredients?: string[]) => {
  if (level == null) return 'Нет данных об остатках';
  if (level === 0) {
    if (missingIngredients && missingIngredients.length > 0) {
      return `Нет ингредиентов: ${missingIngredients.join(', ')}`;
    }
    return 'Нет ингредиентов для приготовления';
  }
  return `Можно приготовить: ${level}`;
};

const AvailabilityDot: React.FC<AvailabilityDotProps> = ({ level, missingIngredients, onNotify }) => {
  const handleDotClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (onNotify) {
      onNotify(getTooltipText(level, missingIngredients));
    }
  };

  return (
    <span
      tabIndex={0}
      role="button"
      aria-label={getTooltipText(level, missingIngredients)}
      onClick={handleDotClick}
      onTouchEnd={handleDotClick}
      style={{
        display: 'inline-block',
        width: 14,
        height: 14,
        borderRadius: '50%',
        background: getColor(level),
        border: '1.5px solid #888',
        verticalAlign: 'middle',
        cursor: 'pointer',
      }}
    />
  );
};

export default AvailabilityDot; 