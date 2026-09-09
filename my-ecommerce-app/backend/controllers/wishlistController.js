import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) wishlist = await Wishlist.create({ user: userId, products: [] });
  return wishlist;
};

// GET /api/wishlist
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await getOrCreateWishlist(req.user.id);
    await wishlist.populate("products");
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/wishlist/:productId  — toggles on/off
export const toggleWishlistItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const wishlist = await getOrCreateWishlist(req.user.id);
    const exists = wishlist.products.some((id) => id.toString() === productId);

    if (exists) {
      wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    } else {
      wishlist.products.push(productId);
    }

    await wishlist.save();
    await wishlist.populate("products");
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/wishlist
export const clearWishlist = async (req, res) => {
  try {
    const wishlist = await getOrCreateWishlist(req.user.id);
    wishlist.products = [];
    await wishlist.save();
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};