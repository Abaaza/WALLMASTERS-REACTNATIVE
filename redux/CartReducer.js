import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Utilities for managing carts in AsyncStorage
const saveCartToStorage = async (key, cart) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(cart));
  } catch (error) {
    console.error(`Error saving cart (${key}):`, error);
  }
};

const loadCartFromStorage = async (key) => {
  try {
    const cart = await AsyncStorage.getItem(key);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error(`Error loading cart (${key}):`, error);
    return [];
  }
};

const clearCartFromStorage = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing cart (${key}):`, error);
  }
};

// Utility to get the correct cart key based on user ID
const getCartKey = (userId) => (userId ? `cart_${userId}` : "guestCart");

// Redux slice definition
export const CartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: [],
    userId: null, // Track the user ID
  },
  reducers: {
    setUser: (state, action) => {
      state.userId = action.payload; // Set the user ID
    },
    addToCart: (state, action) => {
      const existingItem = state.cart.find(
        (item) =>
          item.id === action.payload.id && item.size === action.payload.size
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cart.push({ ...action.payload, quantity: 1 });
      }

      const key = getCartKey(state.userId);
      saveCartToStorage(key, state.cart);
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter(
        (item) =>
          item.id !== action.payload.id || item.size !== action.payload.size
      );

      const key = getCartKey(state.userId);
      saveCartToStorage(key, state.cart);
    },
    incrementQuantity: (state, action) => {
      const item = state.cart.find(
        (item) =>
          item.id === action.payload.id && item.size === action.payload.size
      );

      if (item) item.quantity += 1;

      const key = getCartKey(state.userId);
      saveCartToStorage(key, state.cart);
    },
    decrementQuantity: (state, action) => {
      const item = state.cart.find(
        (item) =>
          item.id === action.payload.id && item.size === action.payload.size
      );

      if (item && item.quantity > 1) {
        item.quantity -= 1;
      } else {
        state.cart = state.cart.filter(
          (cartItem) =>
            cartItem.id !== action.payload.id ||
            cartItem.size !== action.payload.size
        );
      }

      const key = getCartKey(state.userId);
      saveCartToStorage(key, state.cart);
    },
    cleanCart: (state) => {
      state.cart = [];

      const key = getCartKey(state.userId);
      saveCartToStorage(key, state.cart);
    },
    loadCart: (state, action) => {
      state.cart = action.payload; // Load the cart into the state
    },
    transferGuestCartToUser: (state) => {
      if (!state.userId) return; // Ensure a user is logged in
      const key = getCartKey(state.userId);
      saveCartToStorage(key, state.cart);
      clearCartFromStorage("guestCart"); // Clear guest cart after transfer
    },
  },
});

// Async action to load the correct cart (guest or user) into state
export const loadCartToState = (userId) => async (dispatch) => {
  const key = getCartKey(userId);
  const cart = await loadCartFromStorage(key);
  dispatch(CartSlice.actions.loadCart(cart));
};

// Async action to load user ID from AsyncStorage on app start
export const loadUserId = () => async (dispatch) => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    if (userId) {
      dispatch(setUser(userId));
    }
  } catch (error) {
    console.error("Error loading user ID:", error);
  }
};

// Export actions and reducer
export const {
  setUser,
  addToCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  cleanCart,
  loadCart,
  transferGuestCartToUser,
} = CartSlice.actions;

export default CartSlice.reducer;
