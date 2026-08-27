import { useEffect, useState } from "react";
import { api } from "../services/api";
import "./Cart.css";
import "../styles/layout.css";
import "../styles/buttons.css";
import "./Orders.css";

const statusClass = (status) => status.toLowerCase();

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/orders/my")
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container"><p>Loading your orders...</p></div>;
  if (error) return <div className="container"><p className="admin-form-error">{error}</p></div>;

  if (orders.length === 0) {
    return (
      <div className="container cart-empty">
        <h2>No orders yet</h2>
        <p>Your placed orders will show up here.</p>
      </div>
    );
  }

  return (
    <div className="container cart-page orders-container">
      <h2 className="section-title" style={{ padding: 0 }}>Your Orders</h2>

      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <div className="order-header">
            <div>
              <strong className="order-id">Order #{order._id.slice(-6).toUpperCase()}</strong>
              <div className="order-meta">
                {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>
            <span className={`order-status-chip ${statusClass(order.status)}`}>
              {order.status}
            </span>
          </div>

          <ul className="order-items">
            {order.items.map((item, i) => (
              <li key={i} className="order-item-row">
                <span className="order-item-name">{item.name} × {item.quantity}</span>
                <span className="order-item-price">₹{item.price * item.quantity}</span>
              </li>
            ))}
          </ul>

          <div className="order-shipping">
            Shipping to: <strong>{order.shippingAddress.fullName}</strong>, {order.shippingAddress.addressLine},{" "}
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
          </div>

          <div className="order-total">
            <strong>Total: ₹{order.totalAmount}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Orders;