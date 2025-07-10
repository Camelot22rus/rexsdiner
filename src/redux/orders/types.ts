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
  userId?: number;
  usedIngredients?: Array<{ name: string; amount: number }>;
  notes?: string;
  paid: boolean;
}

export interface OrdersSliceState {
  orders: Order[];
  isOrderHistoryOpen: boolean;
  loading?: boolean;
  error?: string | null;
}
