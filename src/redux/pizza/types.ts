export type Pizza = {
  id: string;
  title: string;
  name: string;
  price: number;
  imageUrl: string;
  sizes: number[];
  types: number[];
  rating: number;
  comboComponents?: string[];
  categorie?: string;
  components?: Array<{ name: string; amount: number }>;
};

export type MenuItem = {
  id: number;
  name: string;
  categorie: string;
  price: number;
  comboComponents: string[];
  components: Array<{ name: string; amount: number }>;
};

export enum Status {
  LOADING = "loading",
  SUCCESS = "completed",
  ERROR = "error",
}

export type SearchPizzaParams = {
  sortBy: string;
  order: string;
  category: string;
  search: string;
  currentPage: string;
};

export interface PizzaSliceState {
  items: Pizza[];
  status: Status;
}

export interface MenuSliceState {
  items: MenuItem[];
  status: Status;
}
