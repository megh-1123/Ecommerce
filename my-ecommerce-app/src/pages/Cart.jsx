import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchCart,
  removeItemFromCart,
  increaseItemQuantity,
  decreaseItemQuantity,
  clearCartBackend,
} from "../features/cart/cartSlice";
import "./Cart.css";
import "../styles/layout.css";
import "../styles/buttons.css";

function Cart() {
  const { items: cartItems, loading } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading && cartItems.length === 0) {
    return (
      <div className="container cart-empty">
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container cart-empty">
        <h2>Your cart is empty</h2>
        <p>Go add something you like.</p>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h2 className="section-title" style={{ padding: 0 }}>Your Cart</h2>

      <div className="cart-list">
        {cartItems.map((item) => (
          <div key={item.id} className="cart-item">
            <img src={item.image} alt={item.name} />
            <div className="cart-item-info">
              <div className="cart-item-name">{item.name}</div>
              <div className="cart-item-price">₹{item.price} each</div>
              <div className="cart-item-controls">
                <div className="qty-pill" style={{ width: "auto", gap: "0.75rem" }}>
                  <button className="qty-btn" onClick={() => dispatch(decreaseItemQuantity(item.id))}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button className="qty-btn" onClick={() => dispatch(increaseItemQuantity(item.id))}>
                    +
                  </button>
                </div>
                <button className="btn-text" onClick={() => dispatch(removeItemFromCart(item.id))}>
                  Remove
                </button>
              </div>
            </div>
            <div className="cart-item-line-total">₹{item.price * item.quantity}</div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
  <button className="btn-text" onClick={() => dispatch(clearCartBackend())}>
    Clear Cart
  </button>
  <div className="cart-total">Total: ₹{totalPrice}</div>
  <Link to="/checkout" className="btn-primary" style={{ display: "inline-block", textAlign: "center", textDecoration: "none" }}>
    Proceed to Checkout
  </Link>
</div>
    </div>
  );
}

export default Cart;