import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";

// Backend cart shape: { items: [{ product: {...}, quantity }] }
// Flatten into { id, name, price, image, quantity } so ProductCard/Cart.jsx
// don't need big rewrites.
const flattenCart = (cart) =>
  (cart?.items || []).map((item) => ({
    id: item.product._id,
    name: item.product.name,
    price: item.product.price,
    image: item.product.image,
    quantity: item.quantity,
  }));

export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  const cart = await api.get("/cart");
  return flattenCart(cart);
});

export const addItemToCart = createAsyncThunk("cart/addItemToCart", async (productId) => {
  const cart = await api.post("/cart", { productId, quantity: 1 });
  return flattenCart(cart);
});

export const increaseItemQuantity = createAsyncThunk(
  "cart/increaseItemQuantity",
  async (productId, { getState }) => {
    const current = getState().cart.items.find((i) => i.id === productId);
    const cart = await api.put(`/cart/${productId}`, { quantity: (current?.quantity || 0) + 1 });
    return flattenCart(cart);
  }
);

export const decreaseItemQuantity = createAsyncThunk(
  "cart/decreaseItemQuantity",
  async (productId, { getState }) => {
    const current = getState().cart.items.find((i) => i.id === productId);
    if (current && current.quantity > 1) {
      const cart = await api.put(`/cart/${productId}`, { quantity: current.quantity - 1 });
      return flattenCart(cart);
    }
    const cart = await api.delete(`/cart/${productId}`);
    return flattenCart(cart);
  }
);

export const removeItemFromCart = createAsyncThunk("cart/removeItemFromCart", async (productId) => {
  const cart = await api.delete(`/cart/${productId}`);
  return flattenCart(cart);
});

export const clearCartBackend = createAsyncThunk("cart/clearCartBackend", async () => {
  const cart = await api.delete("/cart");
  return flattenCart(cart);
});

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], loading: false, error: null },
  reducers: {
    // Instant local reset — used on logout, does NOT call the backend
    clearCart: (state) => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => action.type.startsWith("cart/") && action.type.endsWith("/pending"),
        (state) => { state.loading = true; state.error = null; }
      )
      .addMatcher(
        (action) => action.type.startsWith("cart/") && action.type.endsWith("/fulfilled"),
        (state, action) => { state.loading = false; state.items = action.payload; }
      )
      .addMatcher(
        (action) => action.type.startsWith("cart/") && action.type.endsWith("/rejected"),
        (state, action) => { state.loading = false; state.error = action.error.message; }
      );
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;