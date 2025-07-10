import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Pizza, MenuItem, SearchPizzaParams } from "./types";
import { pickBy, identity } from "lodash";
import { API_BASE_URL } from "../../config";

// Helper function to convert MenuItem to Pizza format for compatibility
export const convertMenuItemToPizza = (menuItem: MenuItem): Pizza => ({
  id: menuItem.id.toString(),
  title: menuItem.name,
  name: menuItem.name, // Add the name property
  price: menuItem.price,
  imageUrl:
    "https://via.placeholder.com/300x300.png?text=" +
    encodeURIComponent(menuItem.name),
  sizes: [26, 30, 40], // Default sizes
  types: [0, 1], // Default types
  rating: 4.5, // Default rating
  comboComponents: menuItem.comboComponents,
  categorie: menuItem.categorie, // Add the categorie property
  components: menuItem.components, // Add the components property
});

// New async action for loading menu items from backend API
export const fetchMenuItemsFromAPI = createAsyncThunk<
  MenuItem[],
  SearchPizzaParams
>("menu/fetchMenuItemsFromAPIStatus", async (params) => {
  const { sortBy, order, category, search } = params;

  try {
    // Fetch from backend API
    const { data } = await axios.get<{
      status: string;
      message: string;
      data: MenuItem[];
    }>(`${API_BASE_URL}/menu`);

    let filteredData = [...data.data];

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
  } catch (error) {
    console.error("Error fetching menu from API:", error);
    throw error;
  }
});

// New async action for loading from backend API (returns Pizza[] for compatibility)
export const fetchPizzasFromAPI = createAsyncThunk<Pizza[], SearchPizzaParams>(
  "pizza/fetchPizzasFromAPIStatus",
  async (params, { dispatch }) => {
    // Use the fetchMenuItemsFromAPI thunk and convert the result
    const menuItemsResult = await dispatch(fetchMenuItemsFromAPI(params));

    if (fetchMenuItemsFromAPI.fulfilled.match(menuItemsResult)) {
      return menuItemsResult.payload.map(convertMenuItemToPizza);
    }

    throw new Error("Failed to fetch menu items from API");
  }
);
