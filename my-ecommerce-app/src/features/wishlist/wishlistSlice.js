import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";

// Backend wishlist shape: { products: [{...fullProductObject}] }
// Flatten into { id, name, price, image } to match what ProductCard/Wishlist.jsx expect.
const flattenWishlist = (wishlist) =>
  (wishlist?.products || []).map((product) => ({
    id: product._id,
    name: product.name,
    price: product.price,
    image: product.image,
  }));

export const fetchWishlist = createAsyncThunk("wishlist/fetchWishlist", async () => {
  const wishlist = await api.get("/wishlist");
  return flattenWishlist(wishlist);
});

export const toggleWishlistItem = createAsyncThunk(
  "wishlist/toggleWishlistItem",
  async (productId) => {
    const wishlist = await api.post(`/wishlist/${productId}`, {});
    return flattenWishlist(wishlist);
  }
);

export const clearWishlistBackend = createAsyncThunk("wishlist/clearWishlistBackend", async () => {
  const wishlist = await api.delete("/wishlist");
  return flattenWishlist(wishlist);
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { items: [], loading: false, error: null },
  reducers: {
    // Instant local reset — used on logout, does NOT call the backend
    clearWishlist: (state) => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => action.type.startsWith("wishlist/") && action.type.endsWith("/pending"),
        (state) => { state.loading = true; state.error = null; }
      )
      .addMatcher(
        (action) => action.type.startsWith("wishlist/") && action.type.endsWith("/fulfilled"),
        (state, action) => { state.loading = false; state.items = action.payload; }
      )
      .addMatcher(
        (action) => action.type.startsWith("wishlist/") && action.type.endsWith("/rejected"),
        (state, action) => { state.loading = false; state.error = action.error.message; }
      );
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;