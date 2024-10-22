import { createSlice } from "@reduxjs/toolkit";

export const CartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: [],
  },
  reducers: {
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
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter(
        (item) =>
          item.id !== action.payload.id || item.size !== action.payload.size
      );
    },
    incrementQuantity: (state, action) => {
      const item = state.cart.find(
        (item) =>
          item.id === action.payload.id && item.size === action.payload.size
      );
      if (item) {
        item.quantity += 1;
      }
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
    },
    cleanCart: (state) => {
      state.cart = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  cleanCart,
} = CartSlice.actions;

export default CartSlice.reducer;
