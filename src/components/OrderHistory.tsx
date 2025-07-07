import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectOrders } from "../redux/orders/selectors";
import { setOrderHistoryOpen, clearOrders } from "../redux/orders/slice";

const OrderHistory: React.FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);

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
    if (
      window.confirm(
        "Вы уверены, что хотите удалить всю историю заказов? Это действие нельзя отменить."
      )
    ) {
      dispatch(clearOrders());
    }
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
    const grouped: { [key: string]: typeof orders } = {};

    orders.forEach((order) => {
      const dateKey = formatDateOnly(order.timestamp);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(order);
    });

    return grouped;
  };

  const calculateDayTotal = (dayOrders: typeof orders) => {
    const total = dayOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    return Math.round(total * 100) / 100;
  };

  const calculateDayThirtyPercent = (dayOrders: typeof orders) => {
    const total = calculateDayTotal(dayOrders);
    return Math.round(total * 0.3 * 100) / 100;
  };

  const calculateDaySeventyPercent = (dayOrders: typeof orders) => {
    const total = calculateDayTotal(dayOrders);
    return Math.round(total * 0.7 * 100) / 100;
  };

  const calculateDayCount = (dayOrders: typeof orders) => {
    return dayOrders.reduce((sum, order) => sum + order.totalCount, 0);
  };

  const generateDiscordMessage = (date: string, dayOrders: typeof orders) => {
    const dayTotal = calculateDayTotal(dayOrders);
    const dayCount = calculateDayCount(dayOrders);
    const dayThirtyPercent = calculateDayThirtyPercent(dayOrders);
    const daySeventyPercent = calculateDaySeventyPercent(dayOrders);

    let message = `**📊 Отчет за ${date}**\n\n`;

    dayOrders.forEach((order) => {
      message += `**Заказ #${order.id}** (${formatDate(order.timestamp)})\n`;

      order.items.forEach((item) => {
        message += `• ${item.title} - ${item.count}x по ${item.price}$ = ${
          item.price * item.count
        }$\n`;
      });

      message += `**Итого заказа:** ${order.totalPrice}$ (${order.totalCount} позиций)\n`;
      message += `30%: ${order.thirtyPercent}$ | 70%: ${order.seventyPercent}$\n\n`;
    });

    message += `**🔥 ИТОГО ЗА ДЕНЬ:**\n`;
    message += `💰 Общая сумма: **${dayTotal}$**\n`;
    message += `📦 Всего позиций: **${dayCount}**\n`;
    message += `💵 30%: **${dayThirtyPercent}$**\n`;
    message += `💰 70%: **${daySeventyPercent}$**`;

    return message;
  };

  const copyToClipboard = async (date: string, dayOrders: typeof orders) => {
    try {
      const message = generateDiscordMessage(date, dayOrders);
      await navigator.clipboard.writeText(message);

      // Show success feedback on both buttons
      const dateKey = date.replace(/\./g, "-");
      const desktopButton = document.getElementById(
        `copy-btn-desktop-${dateKey}`
      );
      const mobileButton = document.getElementById(
        `copy-btn-mobile-${dateKey}`
      );

      const showSuccess = (button: HTMLElement | null) => {
        if (button) {
          const originalHTML = button.innerHTML;
          button.classList.add("copied");
          button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            ${
              button.classList.contains("desktop-copy")
                ? ""
                : '<span class="copy-btn-text">Скопировано!</span>'
            }
          `;
          setTimeout(() => {
            button.classList.remove("copied");
            button.innerHTML = originalHTML;
          }, 2000);
        }
      };

      showSuccess(desktopButton);
      showSuccess(mobileButton);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = generateDiscordMessage(date, dayOrders);
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  const groupedOrders = groupOrdersByDate();
  const sortedDates = Object.keys(groupedOrders).sort((a, b) => {
    return (
      new Date(b.split(".").reverse().join("-")).getTime() -
      new Date(a.split(".").reverse().join("-")).getTime()
    );
  });

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="order-history-overlay" onClick={handleClose}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className="order-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="order-history-header">
          <h2 className="order-history-title">История заказов</h2>
          <div className="order-history-header-actions">
            {orders.length > 0 && (
              <button
                className="order-history-clear"
                onClick={handleClearOrders}
                title="Очистить всю историю"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 6H5H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19ZM10 11V17M14 11V17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            <button className="order-history-close" onClick={handleClose}>
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
          {orders.length === 0 ? (
            <div className="order-history-empty">
              <p>Заказы еще не были добавлены</p>
            </div>
          ) : (
            <div className="order-history-list">
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
                            <button
                              id={`copy-btn-desktop-${date.replace(
                                /\./g,
                                "-"
                              )}`}
                              className="date-copy-btn desktop-copy"
                              onClick={() => copyToClipboard(date, dayOrders)}
                              title="Скопировать отчет за день для отправки в Discord"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M16 4H18C19.1046 4 20 4.89543 20 6V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V6C4 4.89543 4.89543 4 6 4H8M16 4C16 2.89543 15.1046 2 14 2H10C8.89543 2 8 2.89543 8 4M16 4C16 5.10457 15.1046 6 14 6H10C8.89543 6 8 5.10457 8 4"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="date-separator-mobile-copy">
                          <button
                            id={`copy-btn-mobile-${date.replace(/\./g, "-")}`}
                            className="date-copy-btn"
                            onClick={() => copyToClipboard(date, dayOrders)}
                            title="Скопировать отчет за день для отправки в Discord"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M16 4H18C19.1046 4 20 4.89543 20 6V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V6C4 4.89543 4.89543 4 6 4H8M16 4C16 2.89543 15.1046 2 14 2H10C8.89543 2 8 2.89543 8 4M16 4C16 5.10457 15.1046 6 14 6H10C8.89543 6 8 5.10457 8 4"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span className="copy-btn-text">
                              Скопировать отчет
                            </span>
                          </button>
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
                      <div key={order.id} className="order-history-item">
                        <div className="order-item-header">
                          <div className="order-item-info">
                            <span className="order-item-id">
                              Заказ #{order.id}
                            </span>
                            <span className="order-item-date">
                              {formatDate(order.timestamp)}
                            </span>
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

                        <div className="order-item-breakdown">
                          <span className="breakdown-item">
                            30%: {order.thirtyPercent} $
                          </span>
                          <span className="breakdown-item">
                            70%: {order.seventyPercent} $
                          </span>
                        </div>

                        <div className="order-item-products">
                          {order.items.map((item, index) => (
                            <div
                              key={`${item.id}-${index}`}
                              className="order-product"
                            >
                              <span className="order-product-name">
                                {item.title}
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
      </div>
    </div>
  );
};

export default OrderHistory;
