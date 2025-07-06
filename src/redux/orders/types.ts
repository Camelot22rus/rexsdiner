export interface OrderItem {
  id: string;
  title: string;
  price: number;
  count: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  totalPrice: number;
  totalCount: number;
  timestamp: string;
  thirtyPercent: number;
  seventyPercent: number;
}

export interface OrdersSliceState {
  orders: Order[];
  isOrderHistoryOpen: boolean;
}
