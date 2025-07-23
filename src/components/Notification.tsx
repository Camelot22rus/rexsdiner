import React, { useEffect } from 'react';

interface NotificationProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose, duration = 100000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <>
      <style>{`
        @media (max-width: 600px) {
          .rd-toast {
            left: 0 !important;
            right: 0 !important;
            width: 100vw !important;
            max-width: 100vw !important;
            border-radius: 0 !important;
            padding: 10px 16px !important;
            top: 0 !important;
            transform: none !important;
          }
        }
      `}</style>
      <div
        className="rd-toast"
        style={{
          position: 'fixed',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#222',
          color: '#fff',
          padding: '16px',
          borderRadius: 10,
          fontSize: 16,
          zIndex: 9999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          minWidth: 180,
          maxWidth: 420,
          width: 'fit-content',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span>{message}</span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: 22,
            cursor: 'pointer',
            marginLeft: 8,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    </>
  );
};

export default Notification; 