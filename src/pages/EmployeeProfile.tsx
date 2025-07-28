import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/user/selectors";
import { selectIsDarkMode } from "../redux/theme/selectors";
import { API_BASE_URL } from '../config';
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../redux/store";
import { loadUserFromStorage } from "../redux/user/asyncActions";

function formatDate(dateStr: string | Date) {
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}
function isToday(dateStr: string | Date) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

// Simple Bar Chart Component
const BarChart = ({ data, title }: { data: Array<{label: string, value: number}>, title: string }) => {
  if (!data || data.length === 0) {
    return (
      <div className="dashboard-card">
        <h3 className="dashboard-card__title">{title}</h3>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '200px',
          color: 'var(--text-secondary)',
          fontStyle: 'italic'
        }}>
          Нет данных для отображения
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  return (
    <div className="dashboard-card">
      <h3 className="dashboard-card__title">{title}</h3>
      <svg width="100%" height="200" viewBox="0 0 400 200">
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * 150 : 0;
          const x = (index * 350 / data.length) + 25;
          // Truncate long labels
          const truncatedLabel = item.label.length > 10 ? item.label.substring(0, 10) + '...' : item.label;
          return (
            <g key={index}>
              <rect
                x={x}
                y={170 - barHeight}
                width={Math.max(1, 350 / data.length - 10)}
                height={barHeight}
                fill="var(--accent-color)"
              />
              <text
                x={x + (350 / data.length - 10) / 2}
                y={185}
                textAnchor="middle"
                fontSize="10"
                fill="var(--text-secondary)"
              >
                {truncatedLabel}
              </text>
              <text
                x={x + (350 / data.length - 10) / 2}
                y={165 - barHeight}
                textAnchor="middle"
                fontSize="10"
                fill="var(--text-color)"
              >
                {item.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Simple Line Chart Component
const LineChart = ({ data, title }: { data: Array<{label: string, value: number}>, title: string }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const points = data.map((item, index) => {
    const x = (index * 350 / (data.length - 1)) + 25;
    const y = maxValue > 0 ? 170 - (item.value / maxValue) * 150 : 170;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="dashboard-card">
      <h3 className="dashboard-card__title">{title}</h3>
      <svg width="100%" height="200" viewBox="0 0 400 200">
        <polyline
          fill="none"
          stroke="var(--accent-color)"
          strokeWidth="2"
          points={points}
        />
        {data.map((item, index) => {
          const x = (index * 350 / (data.length - 1)) + 25;
          const y = maxValue > 0 ? 170 - (item.value / maxValue) * 150 : 170;
          return (
            <g key={index}>
              <circle cx={x} cy={y} r="4" fill="var(--accent-color)" />
              <text
                x={x}
                y={185}
                textAnchor="middle"
                fontSize="10"
                fill="var(--text-secondary)"
              >
                {item.label}
              </text>
              <text
                x={x}
                y={y - 8}
                textAnchor="middle"
                fontSize="10"
                fill="var(--text-color)"
              >
                {item.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const EmployeeProfile: React.FC = () => {
  const user = useSelector(selectUser);
  const isDarkMode = useSelector(selectIsDarkMode);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // State for stats
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [menu, setMenu] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [hasTriedAuth, setHasTriedAuth] = useState(false);

  useEffect(() => {
    // Load user authentication on mount
    dispatch(loadUserFromStorage()).finally(() => {
      setHasTriedAuth(true);
    });
  }, [dispatch]);

  useEffect(() => {
    if (!hasTriedAuth || !user) return;

    // Fetch data from APIs
    Promise.all([
      fetch(`${API_BASE_URL}/orders`).then(r => r.json()),
      fetch(`${API_BASE_URL}/inventory`).then(r => r.json()),
      fetch(`${API_BASE_URL}/menu`).then(r => r.json()),
      fetch(`${API_BASE_URL}/users`).then(r => r.json()),
    ]).then(([ordersRes, inventoryRes, menuRes, usersRes]) => {
      if (ordersRes.status === "success") setOrders(ordersRes.data || []);
      if (inventoryRes.status === "success") setInventory(inventoryRes.data || []);
      if (menuRes.status === "success") setMenu(menuRes.data || []);
      if (usersRes.status === "success") setUsers(usersRes.data || []);
      setLoading(false);
    }).catch((err) => {
      console.error("Error fetching data:", err);
      setError("Ошибка загрузки данных");
      setLoading(false);
    });
  }, [hasTriedAuth, user]);

  if (!hasTriedAuth) {
    return <div className="loading-state">Проверка авторизации...</div>;
  }
  // Redirect if not authenticated
  if (hasTriedAuth && !user) {
    navigate("/employee");
    return null;
  }
  if (!user) return null;
  if (loading) return <div className="loading-state">Загрузка данных...</div>;
  if (error) return <div className="error-state">{error}</div>;

  const isAdmin = user.role === "Admin";

  // Filter orders for this user (unless admin)
  const myOrders = isAdmin ? orders : orders.filter((o: any) => o.userId === user.id);
  const todayOrders = myOrders.filter((o: any) => isToday(o.timestamp));
  const todayRevenue = todayOrders.reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0);
  const avgOrderValue = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;
  // Fix: Use 'paid' field instead of 'status'
  const unpaidOrders = isAdmin ? orders.filter((o: any) => !o.paid) : myOrders.filter((o: any) => !o.paid);

  // Recent orders (last 5)
  const recentOrders = myOrders.slice(-5).reverse();

  // Low inventory: 50 for specific items, 15 for others
  const specialLowStockItems = [
    'Бутылка воды',
    'Сахарный сироп',
    'Соль',
    'Сыр',
    'Молоко',
    'Картофель',
    'Кука-кула',
    'Химикаты',
    'Говядина',
    'Пряные травы (Приправа)'
  ];
  const lowInventory = inventory.filter((item: any) => {
    if (specialLowStockItems.includes(item.name)) {
      return item.quantity < 50;
    }
    return item.quantity <= 15;
  });

  // Generate chart data
  const last7Days = Array.from({length: 7}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date;
  }).reverse();

  const salesTrendData = last7Days.map(date => {
    const dayOrders = myOrders.filter((o: any) => {
      const orderDate = new Date(o.timestamp);
      return orderDate.getFullYear() === date.getFullYear() &&
             orderDate.getMonth() === date.getMonth() &&
             orderDate.getDate() === date.getDate();
    });
    return {
      label: `${date.getDate()}/${date.getMonth() + 1}`,
      value: dayOrders.length
    };
  });

  // Popular items (top 5) - Map IDs to actual names using menu data
  const itemCounts: {[key: string]: number} = {};
  
  // Create a map of menu item IDs to names for lookup
  const menuIdToName: {[key: string]: string} = {};
  menu.forEach((menuItem: any) => {
    menuIdToName[menuItem.id.toString()] = menuItem.name;
  });
  
  myOrders.forEach((order: any) => {
    if (order.items) {
      order.items.forEach((item: any) => {
        // Try to get the actual name from menu data, fallback to title or ID
        let itemName = item.title;
        if (!itemName && item.id) {
          itemName = menuIdToName[item.id] || item.id;
        }
        if (!itemName) {
          itemName = 'Unknown Item';
        }
        
        itemCounts[itemName] = (itemCounts[itemName] || 0) + (item.count || 1);
      });
    }
  });
  
  // Debug: Log the mapping and results
  if (myOrders.length > 0) {
    console.log('Menu ID to Name mapping:', menuIdToName);
    console.log('Sample order structure:', myOrders[0]);
    console.log('Item counts with names:', itemCounts);
  }
  
  const popularItemsData = Object.entries(itemCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ label: name, value: count }));

  // Orders by hour (last 24 hours)
  const hourlyData = Array.from({length: 24}, (_, hour) => {
    const todayHourOrders = todayOrders.filter((o: any) => {
      const orderHour = new Date(o.timestamp).getHours();
      return orderHour === hour;
    });
    return {
      label: `${hour}:00`,
      value: todayHourOrders.length
    };
  }).filter(d => d.value > 0); // Only show hours with orders

  return (
    <div className={`employee-profile ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <div className="container">
        <div className="employee-profile__header">
          <h1 className="employee-profile__title">
            Профиль сотрудника - {user.name} ({user.role})
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="dashboard-stat-card">
            <h3 className="dashboard-stat-card__label">Заказы сегодня</h3>
            <p className="dashboard-stat-card__value">{todayOrders.length}</p>
          </div>
          <div className="dashboard-stat-card">
            <h3 className="dashboard-stat-card__label">Выручка сегодня</h3>
            <p className="dashboard-stat-card__value">${todayRevenue.toFixed(2)}</p>
          </div>
          <div className="dashboard-stat-card">
            <h3 className="dashboard-stat-card__label">Средний чек</h3>
            <p className="dashboard-stat-card__value">${avgOrderValue.toFixed(2)}</p>
          </div>
          <div className="dashboard-stat-card">
            <h3 className="dashboard-stat-card__label">Неоплаченные заказы</h3>
            <p className="dashboard-stat-card__value">{unpaidOrders.length}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="dashboard-charts">
          <LineChart data={salesTrendData} title="Продажи за 7 дней" />
          <BarChart data={popularItemsData} title="Популярные товары" />
          {hourlyData.length > 0 && <BarChart data={hourlyData} title="Заказы по часам (сегодня)" />}
        </div>

        {/* Tables */}
        <div className="dashboard-tables">
          {/* Low Inventory */}
          <div className="dashboard-card">
            <h3 className="dashboard-card__title">Низкий остаток</h3>
            <span className="dashboard-card__subtitle">Сообщите администратору о необходимости пополнения</span>
            {lowInventory.length > 0 ? (
              <div className="dashboard-table">
                <table>
                  <thead>
                    <tr>
                      <th>Товар</th>
                      <th>Остаток</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowInventory.map((item: any, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td className={item.quantity === 0 ? 'text-danger' : 'text-warning'}>
                          {item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-state">Все товары в норме</p>
            )}
          </div>
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div className="dashboard-admin">
            <div className="dashboard-card">
              <h3 className="dashboard-card__title">Глобальная статистика (Админ)</h3>
              <div className="dashboard-admin-stats">
                <div className="admin-stat">
                  <p className="admin-stat__label">Всего заказов</p>
                  <p className="admin-stat__value">{orders.length}</p>
                </div>
                <div className="admin-stat">
                  <p className="admin-stat__label">Всего сотрудников</p>
                  <p className="admin-stat__value">{users.length}</p>
                </div>
                <div className="admin-stat">
                  <p className="admin-stat__label">Неоплаченные</p>
                  <p className="admin-stat__value">{orders.filter((o: any) => !o.paid).length}</p>
                </div>
              </div>

              {/* All Unpaid Orders Table */}
              {orders.filter((o: any) => !o.paid).length > 0 && (
                <div className="dashboard-admin-table">
                  <h4 className="dashboard-admin-table__title">Все неоплаченные заказы</h4>
                  <div className="dashboard-table">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Сотрудник</th>
                          <th>Дата</th>
                          <th>Сумма</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.filter((o: any) => !o.paid).map((order: any, index) => {
                          const orderUser = users.find((u: any) => u.id === order.userId);
                          return (
                            <tr key={index}>
                              <td>#{order.id}</td>
                              <td>{orderUser?.name || 'Unknown'}</td>
                              <td>{formatDate(order.timestamp)}</td>
                              <td>${order.totalPrice}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfile; 