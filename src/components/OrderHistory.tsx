import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectOrders, selectOrdersLoading } from "../redux/orders/selectors";
import { selectPizzaData } from "../redux/pizza/selectors";
import { setOrderHistoryOpen, clearOrders } from "../redux/orders/slice";
import { fetchOrders, markOrdersPaid } from "../redux/orders/asyncActions";
import CustomConfirm from "./CustomConfirm";
import { selectUser } from "../redux/user/selectors";

const OrderHistory: React.FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrdersLoading);
  const { items: menuItems } = useSelector(selectPizzaData);
  const user = useSelector(selectUser);

  // Fetch orders for the current user when component mounts or user changes
  React.useEffect(() => {
    if (user && user.id) {
      dispatch(fetchOrders({ userId: user.id }) as any);
    }
  }, [dispatch, user]);
  // Filter orders to only those belonging to the current user/employee
  const filteredOrders = React.useMemo(() => {
    if (!user) return [];
    return orders.filter(order => order.userId === user.id);
  }, [orders, user]);
  const [expandedComponents, setExpandedComponents] = React.useState<
    string | null
  >(null);
  const [isConfirmVisible, setIsConfirmVisible] = React.useState(false);
  const [selectMode, setSelectMode] = React.useState(false);
  const [selectedOrders, setSelectedOrders] = React.useState<string[]>([]);
  const [markingPaid, setMarkingPaid] = React.useState(false);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dispatch(setOrderHistoryOpen(false));
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [dispatch]);

  const handleClose = () => {
    dispatch(setOrderHistoryOpen(false));
  };

  const handleClearOrders = () => {
    setIsConfirmVisible(true);
  };

  const confirmClearOrders = () => {
    dispatch(clearOrders());
    setIsConfirmVisible(false);
  };

  const cancelClearOrders = () => {
    setIsConfirmVisible(false);
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const clearSelection = () => setSelectedOrders([]);

  const selectedOrderObjs = React.useMemo(
    () => filteredOrders.filter((order) => selectedOrders.includes(order.id)),
    [filteredOrders, selectedOrders]
  );
  const selectedTotal = selectedOrderObjs.reduce((sum, o) => sum + o.totalPrice, 0);
  const selectedThirty = Math.round(selectedTotal * 0.3 * 100) / 100;
  const selectedSeventy = Math.round(selectedTotal * 0.7 * 100) / 100;

  const handleConfirmPaid = async () => {
    if (!user) return;
    setMarkingPaid(true);
    await dispatch(markOrdersPaid({ orderIds: selectedOrders, userId: user.id }) as any);
    setMarkingPaid(false);
    clearSelection();
    setSelectMode(false);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const groupOrdersByDate = () => {
    const grouped: { [key: string]: typeof filteredOrders } = {};

    filteredOrders.forEach((order) => {
      const dateKey = formatDateOnly(order.timestamp);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(order);
    });

    return grouped;
  };

  const calculateDayTotal = (dayOrders: typeof filteredOrders) => {
    const total = dayOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    return Math.round(total * 100) / 100;
  };

  const calculateDayThirtyPercent = (dayOrders: typeof filteredOrders) => {
    const total = calculateDayTotal(dayOrders);
    return Math.round(total * 0.3 * 100) / 100;
  };

  const calculateDaySeventyPercent = (dayOrders: typeof filteredOrders) => {
    const total = calculateDayTotal(dayOrders);
    return Math.round(total * 0.7 * 100) / 100;
  };

  const calculateDayCount = (dayOrders: typeof filteredOrders) => {
    return dayOrders.reduce((sum, order) => sum + order.totalCount, 0);
  };

  const groupedOrders = groupOrdersByDate();
  const sortedDates = Object.keys(groupedOrders).sort((a, b) => {
    return (
      new Date(b.split(".").reverse().join("-")).getTime() -
      new Date(a.split(".").reverse().join("-")).getTime()
    );
  });

  // In render, show loading if loading is true
  if (loading) {
    return (
      <div className="order-history-loading">
        <h2>Загрузка заказов...</h2>
      </div>
    );
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="order-history-overlay" onClick={handleClose}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className="order-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="order-history-header">
          <h2 className="order-history-title">История заказов</h2>
          <div className="order-history-header-actions">
            {filteredOrders.length > 0 && (
              <button
                className={`order-history-select-mode${selectMode ? ' active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}
                onClick={() => setSelectMode((prev) => !prev)}
                title="Режим выбора"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="9 12 12 15 16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </button>
            )}
            <button className="order-history-close" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }} onClick={handleClose}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="order-history-content">
          {filteredOrders.length === 0 ? (
            <div className="order-history-empty">
              <p>Заказы еще не были добавлены</p>
            </div>
          ) : (
            <div className={`order-history-list${selectMode ? ' select-mode' : ''}`}>
              {sortedDates.map((date) => {
                const dayOrders = groupedOrders[date];
                const dayTotal = calculateDayTotal(dayOrders);
                const dayCount = calculateDayCount(dayOrders);
                const dayThirtyPercent = calculateDayThirtyPercent(dayOrders);
                const daySeventyPercent = calculateDaySeventyPercent(dayOrders);

                return (
                  <div key={date} className="order-day-group">
                    <div className="order-date-separator">
                      <div className="date-separator-info">
                        <div className="date-separator-top">
                          <h3 className="date-separator-title">{date}</h3>
                          <div className="date-separator-stats">
                            <span className="date-total-count">
                              {dayCount} позиций
                            </span>
                            <span className="date-total-price">
                              {dayTotal} $
                            </span>
                          </div>
                        </div>
                        <div className="date-separator-mobile-copy">
                        </div>
                      </div>
                      <div className="date-separator-breakdown">
                        <span className="date-breakdown-item">
                          30%: {dayThirtyPercent} $
                        </span>
                        <span className="date-breakdown-item">
                          70%: {daySeventyPercent} $
                        </span>
                      </div>
                    </div>

                    {dayOrders.map((order) => (
                      <div
                        key={order.id}
                        className={`order-history-item${selectMode && selectedOrders.includes(order.id) ? ' selected' : ''}${selectMode && order.paid ? ' not-selectable' : ''}`}
                        style={selectMode
                          ? order.paid
                            ? { cursor: 'not-allowed', opacity: 0.6 }
                            : { cursor: 'pointer', borderColor: selectedOrders.includes(order.id) ? 'var(--accent-color)' : undefined }
                          : {}}
                        onClick={selectMode && !order.paid ? () => handleSelectOrder(order.id) : undefined}
                      >
                        <div className="order-item-header">
                          <div className="order-item-info">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                              <span className="order-item-id">Заказ #{order.id}</span>
                              <span className={`order-paid-status ${order.paid ? 'paid' : 'unpaid'}`}>{order.paid ? 'В кассе' : 'Не в кассе'}</span>
                            </div>
                            <span className="order-item-date">{formatDate(order.timestamp)}</span>
                          </div>
                          <div className="order-item-total">
                            <span className="order-item-count">
                              {order.totalCount} позиций
                            </span>
                            <span className="order-item-price">
                              {order.totalPrice} $
                            </span>
                          </div>
                        </div>

                        <div className="order-item-products">
                          {order.items.map((item, index) => (
                            <div
                              key={`${item.id}-${index}`}
                              className="order-product"
                            >
                              <span className="order-product-name">
                                {menuItems.find(m => String(m.id) === item.id)?.name || item.title}
                              </span>
                              <div className="order-product-details">
                                <span className="order-product-count">
                                  {item.count}x
                                </span>
                                <span className="order-product-price">
                                  {item.price * item.count} $
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {selectMode && selectedOrders.length > 0 && (
          <div className="order-select-footer">
            <div className="order-select-summary">
              <span>Сумма: <b>{selectedTotal} $</b></span>
              <div className="order-select-breakdown">
                <span>30%: <b>{selectedThirty} $</b></span>
                <span>70%: <b>{selectedSeventy} $</b></span>
              </div>
            </div>
            <button className="order-select-confirm" onClick={handleConfirmPaid} disabled={markingPaid}>
              {markingPaid ? "Сохраняем..." : "Положить в кассу"}
            </button>
          </div>
        )}
      </div>

      <CustomConfirm
        message="Вы уверены, что хотите удалить всю историю заказов? Это действие нельзя отменить."
        isVisible={isConfirmVisible}
        onConfirm={confirmClearOrders}
        onCancel={cancelClearOrders}
      />
    </div>
  );
};

export default OrderHistory;
