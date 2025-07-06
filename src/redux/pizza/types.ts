export type Pizza = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  sizes: number[];
  types: number[];
  rating: number;
  comboComponents?: string[];
};

export type MenuItem = {
  id: number;
  name: string;
  categorie: string;
  price: number;
  comboComponents: string[];
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
