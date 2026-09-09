import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { fetchWishlist, toggleWishlistItem } from "../features/wishlist/wishlistSlice";
import { addItemToCart, increaseItemQuantity, decreaseItemQuantity } from "../features/cart/cartSlice";
import "./Cart.css";
import "../styles/layout.css";
import "../styles/buttons.css";
import "./Wishlist.css";

function CartButton({ item }) {
  const dispatch = useDispatch();
  const cartItem = useSelector((state) =>
    state.cart.items.find((c) => c.id === item.id)
  );

  if (!cartItem) {
    return (
      <button className="wishlist-cart-btn btn-primary" onClick={() => dispatch(addItemToCart(item.id))}>
        Add to Cart
      </button>
    );
  }

  return (
    <div className="qty-pill wishlist-qty-pill">
      <button className="qty-btn" onClick={() => dispatch(decreaseItemQuantity(item.id))}>
        −
      </button>
      <span>{cartItem.quantity}</span>
      <button className="qty-btn" onClick={() => dispatch(increaseItemQuantity(item.id))}>
        +
      </button>
    </div>
  );
}

function Wishlist() {
  const { items: wishlistItems, loading } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  if (loading && wishlistItems.length === 0) {
    return (
      <div className="container cart-empty">
        <p>Loading your wishlist...</p>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container cart-empty">
        <h2>Your wishlist is empty</h2>
        <p>Tap the heart on any product to save it here.</p>
      </div>
    );
  }

  return (
    <div className="container cart-page wishlist-container">
      <h2 className="section-title" style={{ padding: 0 }}>Your Wishlist</h2>

      <div className="cart-list">
        {wishlistItems.map((item) => (
          <div key={item.id} className="cart-item">
            <img src={item.image} alt={item.name} />
            <div className="cart-item-info">
              <div className="cart-item-name">{item.name}</div>
              <div className="cart-item-price">₹{item.price}</div>
              <div className="cart-item-controls">
                <CartButton item={item} />
                <button className="btn-text" onClick={() => dispatch(toggleWishlistItem(item.id))}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link to="/" className="btn-text wishlist-continue-link">
        ← Continue browsing
      </Link>
    </div>
  );
}

export default Wishlist;