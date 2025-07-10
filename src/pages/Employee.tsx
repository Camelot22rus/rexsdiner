import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectPizzaData } from "../redux/pizza/selectors";
import { selectCart } from "../redux/cart/selectors";
import { selectIsOrderHistoryOpen } from "../redux/orders/selectors";
import { selectIsAuthenticated, selectUser } from "../redux/user/selectors";
import { loadUserFromStorage, logoutUser } from "../redux/user/asyncActions";
import {
  addItem,
  minusItem,
  removeItem,
  clearItems,
} from "../redux/cart/slice";
import { toggleOrderHistory } from "../redux/orders/slice";
import { createOrder } from "../redux/orders/asyncActions";
import { fetchPizzasFromAPI } from "../redux/pizza/asyncActions";
import { useAppDispatch } from "../redux/store";
import { OrderHistory, CustomAlert, LoginModal } from "../components";

const Employee: React.FC = () => {
  const dispatch = useDispatch();
  const appDispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, status } = useSelector(selectPizzaData);
  const { totalPrice, items: cartItems } = useSelector(selectCart);
  const isOrderHistoryOpen = useSelector(selectIsOrderHistoryOpen);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  const [searchValue, setSearchValue] = React.useState("");
  const [isBottomBarCollapsed, setIsBottomBarCollapsed] = React.useState(true);
  const [alertMessage, setAlertMessage] = React.useState("");
  const [isAlertVisible, setIsAlertVisible] = React.useState(false);
  const [hasTriedAuth, setHasTriedAuth] = React.useState(false);
  const [orderNotes, setOrderNotes] = React.useState("");

  const totalCount = cartItems.reduce(
    (sum: number, item: any) => sum + item.count,
    0
  );

  // Load user from localStorage on component mount
  React.useEffect(() => {
    const loadAuth = async () => {
      await appDispatch(loadUserFromStorage());
      setHasTriedAuth(true);
    };
    loadAuth();
  }, [appDispatch]);

  // No need for isLoginModalOpen state or handleLoginModalClose

  // Calculate 30% and 70% breakdown
  const thirtyPercent = Math.round(totalPrice * 0.3 * 100) / 100;
  const seventyPercent = Math.round(totalPrice * 0.7 * 100) / 100;

  React.useEffect(() => {
    const getPizzas = async () => {
      const sortBy = "id"; // Sort by ID instead of title
      const order = "asc";
      const category = "";
      const search = "";
      const currentPage = "1";

      appDispatch(
        fetchPizzasFromAPI({ sortBy, order, category, search, currentPage })
      );
    };

    getPizzas();
  }, [appDispatch]);

  const filteredItems = items.filter((item) =>
    item.name && item.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Group items by category while preserving original order
  const groupedItems = filteredItems.reduce((groups, item) => {
    const category = item.categorie ?? "Без категории";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, typeof filteredItems>);

  // Get category names in the order they first appear in the JSON
  const categoryNames = [];
  const seenCategories = new Set();
  for (const item of filteredItems) {
    const category = item.categorie ?? "Без категории";
    if (!seenCategories.has(category)) {
      seenCategories.add(category);
      categoryNames.push(category);
    }
  }

  const onAddClick = (item: any) => {
    const cartItem = {
      id: item.id,
      title: item.name, // Use name from JSON as title in cart
      price: item.price,
      imageUrl: item.imageUrl,
      count: 0,
    };
    dispatch(addItem(cartItem));
  };

  const onMinusClick = (id: string) => {
    const cartItem = cartItems.find((item) => item.id === id);
    if (cartItem && cartItem.count === 1) {
      // If count will become 0, remove the item completely
      dispatch(removeItem(id));
    } else {
      // Otherwise just decrease the count
      dispatch(minusItem(id));
    }
  };

  const getItemCount = (id: string) => {
    const cartItem = cartItems.find((item) => item.id === id);
    return cartItem ? cartItem.count : 0;
  };

  const onCompleteOrder = async () => {
    if (totalCount > 0) {
      const orderData = {
        items: cartItems.filter((item) => item.count > 0),
        totalPrice,
        totalCount,
        thirtyPercent,
        seventyPercent,
        userId: user?.id,
        notes: orderNotes,
      };
      try {
        const resultAction = await appDispatch(createOrder(orderData));
        if (createOrder.fulfilled.match(resultAction)) {
          const order = resultAction.payload;
          setAlertMessage(
            `Заказ #${order.id} на сумму ${order.totalPrice} $ (${order.totalCount} позиций) добавлен в систему!`
          );
          setIsAlertVisible(true);
          dispatch(clearItems());
          setOrderNotes("");
        } else {
          setAlertMessage("Ошибка при создании заказа. Попробуйте еще раз.");
          setIsAlertVisible(true);
        }
      } catch (error) {
        setAlertMessage("Ошибка при создании заказа. Попробуйте еще раз.");
        setIsAlertVisible(true);
      }
    }
  };

  const toggleBottomBar = () => {
    setIsBottomBarCollapsed(!isBottomBarCollapsed);
  };

  const closeAlert = () => {
    setIsAlertVisible(false);
    setAlertMessage("");
  };

  // Show loading or authentication prompt if not authenticated
  if (hasTriedAuth && !isAuthenticated) {
    return (
      <div className="employee-page">
        <div className="employee-auth-prompt">
          <h2>Employee Access Required</h2>
          <p>Please log in to access the employee panel.</p>
          <LoginModal
            isOpen={hasTriedAuth && !isAuthenticated}
            onClose={() => {}}
          />
        </div>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (!hasTriedAuth) {
    return (
      <div className="employee-page employee-loading">
        <div className="employee-auth-prompt">
          <h2>Loading</h2>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Authenticated user - show employee panel
  return (
    <div className="employee-page">
      <div className="">
        <div className="employee-header">
          <div className="employee-header__top">
            <h2 className="employee-title">Панель сотрудника</h2>
            {user && (
              <div className="employee-user-info">
                <span className="employee-username">
                  Добро пожаловать, {user.name} ({user.role})
                </span>
                <button
                  className="employee-logout-btn"
                  onClick={() => {
                    appDispatch(logoutUser());
                  }}
                >
                  Выйти
                </button>
              </div>
            )}
          </div>
          <div className="employee-header__controls">
            <div className="employee-search">
              <input
                type="text"
                placeholder="Поиск продуктов..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="employee-search__input"
              />
            </div>
            <button
              className="employee-orders-btn"
              onClick={() => dispatch(toggleOrderHistory())}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17ZM17 21V11H13V7H7V19H17Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Заказы</span>
            </button>
          </div>
        </div>

        <div className="employee-content">
          <div className="product-list">
            {status === "loading" ? (
              <div className="loading">Загружаем продукты...</div>
            ) : (
              categoryNames.map((categoryName) => (
                <div key={categoryName} className="category-section">
                  <h3 className="category-title">{categoryName}</h3>
                  <div className="category-items">
                    {groupedItems[categoryName].map((item) => {
                      const itemCount = getItemCount(item.id);
                      return (
                        <div key={item.id} className="product-item">
                          <div className="product-item__info">
                            <h4 className="product-item__title">{item.name}</h4>
                            <span className="product-item__price">
                              {item.price} $
                            </span>
                          </div>
                          <div className="product-item__controls">
                            {itemCount > 0 && (
                              <button
                                className="product-item__minus"
                                onClick={() => onMinusClick(item.id)}
                              >
                                −
                              </button>
                            )}
                            {itemCount > 0 && (
                              <span className="product-item__count">
                                {itemCount}
                              </span>
                            )}
                            <button
                              className="product-item__add"
                              onClick={() => onAddClick(item)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div
        className={`employee-bottom-bar ${
          isBottomBarCollapsed ? "collapsed" : ""
        }`}
        style={
          {
            // height: isBottomBarCollapsed ? "90px" : "350px",
            // transition: "height 0.3s ease",
          }
        }
      >
        <button
          className="employee-toggle-btn"
          onClick={toggleBottomBar}
          aria-label={
            isBottomBarCollapsed ? "Expand bottom bar" : "Collapse bottom bar"
          }
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`toggle-icon ${isBottomBarCollapsed ? "collapsed" : ""}`}
          >
            <path
              d="M18 15l-6-6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="employee-bottom-content">
          <div className="employee-total">
            <div className="employee-total__main">
              <span className="employee-total__count">
                {totalCount} позиций
              </span>
              <span className="employee-total__price">{totalPrice} $</span>
            </div>
          </div>

          {cartItems.filter((item) => item.count > 0).length > 0 && (
            <div className="employee-cart-list">
              <h4 className="cart-list__title">Добавленные товары:</h4>
              <div className="cart-list__items">
                {cartItems
                  .filter((item) => item.count > 0)
                  .map((cartItem) => {
                    // Find the original item to get combo components
                    const originalItem = items.find(
                      (item) => item.id === cartItem.id
                    );
                    const isCombo =
                      originalItem?.comboComponents &&
                      originalItem.comboComponents.length > 0;

                    return (
                      <div key={cartItem.id} className="cart-list__item">
                        <div className="cart-item__header">
                          <span className="cart-item__name">
                            {cartItem.title}
                          </span>
                          <div className="cart-item__details">
                            <span className="cart-item__count">
                              {cartItem.count}x
                            </span>
                            <span className="cart-item__price">
                              {cartItem.price * cartItem.count} $
                            </span>
                          </div>
                        </div>
                        {isCombo && (
                          <div className="cart-item__combo-components">
                            <span className="combo-components__label">
                              Включает:
                            </span>
                            <div className="combo-components__list">
                              {originalItem.comboComponents?.map(
                                (component: string) => (
                                  <span
                                    key={component}
                                    className="combo-component"
                                  >
                                    {component}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          <div className="employee-notes">
            <input
              type="text"
              placeholder="Заметки к заказу..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="employee-notes__input"
            />
          </div>
          <button
            className={`employee-complete-btn ${
              totalCount === 0 ? "disabled" : ""
            }`}
            onClick={onCompleteOrder}
            disabled={totalCount === 0}
          >
            Добавить в заказ
          </button>
        </div>
      </div>

      {/* Order History Modal */}
      {isOrderHistoryOpen && <OrderHistory />}

      {/* Custom Alert */}
      <CustomAlert
        message={alertMessage}
        isVisible={isAlertVisible}
        onClose={closeAlert}
      />

    </div>
  );
};

export default Employee;
