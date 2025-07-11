import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Pizza, MenuItem, SearchPizzaParams } from "./types";
import { pickBy, identity } from "lodash";
import menuData from "../../data/menu.json";

// Async action for fetching from API (keep for backward compatibility)
export const fetchPizzas = createAsyncThunk<Pizza[], SearchPizzaParams>(
  "pizza/fetchPizzasStatus",
  async (params) => {
    const { sortBy, order, category, search, currentPage } = params;
    console.log(params, 4444);
    const { data } = await axios.get<Pizza[]>(
      `https://68659f9b89803950dbafe521.mockapi.io/api/v1/items`,
      {
        params: pickBy(
          {
            page: currentPage,
            limit: 100,
            category,
            sortBy,
            order,
            search,
          },
          identity
        ),
      }
    );

    return data;
  }
);

// Helper function to convert MenuItem to Pizza format for compatibility
export const convertMenuItemToPizza = (menuItem: MenuItem): Pizza => ({
  id: menuItem.id.toString(),
  title: menuItem.name,
  price: menuItem.price,
  imageUrl:
    "https://via.placeholder.com/300x300.png?text=" +
    encodeURIComponent(menuItem.name),
  sizes: [26, 30, 40], // Default sizes
  types: [0, 1], // Default types
  rating: 4.5, // Default rating
  comboComponents: menuItem.comboComponents,
});

// New async action for loading menu items from local JSON (returns MenuItem[])
export const fetchMenuItems = createAsyncThunk<MenuItem[], SearchPizzaParams>(
  "menu/fetchMenuItemsStatus",
  async (params) => {
    const { sortBy, order, category, search } = params;

    // Simulate async behavior
    await new Promise((resolve) => setTimeout(resolve, 100));

    let filteredData = [...menuData] as MenuItem[];

    // Apply category filter
    if (category) {
      filteredData = filteredData.filter((item) => item.categorie === category);
    }

    // Apply search filter
    if (search) {
      filteredData = filteredData.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply sorting (default to sorting by ID)
    const sortField = sortBy === "title" ? "name" : sortBy || "id";

    filteredData.sort((a: any, b: any) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle different data types
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (order === "desc") {
        if (aValue < bValue) return 1;
        if (aValue > bValue) return -1;
        return 0;
      } else {
        if (aValue > bValue) return 1;
        if (aValue < bValue) return -1;
        return 0;
      }
    });

    return filteredData;
  }
);

// New async action for loading from local JSON (returns Pizza[] for compatibility)
export const fetchPizzasFromJSON = createAsyncThunk<Pizza[], SearchPizzaParams>(
  "pizza/fetchPizzasFromJSONStatus",
  async (params, { dispatch }) => {
    // Use the fetchMenuItems thunk and convert the result
    const menuItemsResult = await dispatch(fetchMenuItems(params));

    if (fetchMenuItems.fulfilled.match(menuItemsResult)) {
      return menuItemsResult.payload.map(convertMenuItemToPizza);
    }

    throw new Error("Failed to fetch menu items");
  }
);
