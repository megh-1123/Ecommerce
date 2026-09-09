import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { clearCartBackend } from "../features/cart/cartSlice";
import "./Cart.css";
import "../styles/layout.css";
import "../styles/buttons.css";
import "./Checkout.css";

function Checkout() {
  const { items: cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    const { fullName, addressLine, city, state, postalCode, phone } = formData;
    if (!fullName || !addressLine || !city || !state || !postalCode || !phone) {
      setError("Please fill in all shipping details.");
      return;
    }

    setPlacing(true);
    try {
      const order = await api.post("/orders", { shippingAddress: formData });
      dispatch(clearCartBackend.fulfilled([], "", undefined));
      navigate("/orders", { state: { justPlacedOrderId: order._id } });
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container cart-empty">
        <h2>Your cart is empty</h2>
        <p>Add something to your cart before checking out.</p>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h2 className="section-title" style={{ padding: 0 }}>Checkout</h2>

      <div className="checkout-layout">
        <form onSubmit={handlePlaceOrder} className="checkout-form">
          <h3>Shipping Address</h3>
          <input name="fullName" placeholder="Full name" value={formData.fullName} onChange={handleChange} />
          <input name="addressLine" placeholder="Address" value={formData.addressLine} onChange={handleChange} />
          <input name="city" placeholder="City" value={formData.city} onChange={handleChange} />
          <input name="state" placeholder="State" value={formData.state} onChange={handleChange} />
          <input name="postalCode" placeholder="Postal code" value={formData.postalCode} onChange={handleChange} />
          <input name="phone" placeholder="Phone number" value={formData.phone} onChange={handleChange} />
          {error && <p className="checkout-form-error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={placing}>
            {placing ? "Placing order..." : `Place Order — ₹${totalPrice}`}
          </button>
        </form>

        <div className="checkout-summary">
          <h3>Order Summary</h3>
          <div className="cart-list">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="checkout-summary-image" />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">₹{item.price} × {item.quantity}</div>
                </div>
                <div className="cart-item-line-total">₹{item.price * item.quantity}</div>
              </div>
            ))}
          </div>
          <div className="cart-total checkout-summary-total">Total: ₹{totalPrice}</div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;