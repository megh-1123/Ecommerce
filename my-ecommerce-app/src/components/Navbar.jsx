import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { clearCart } from "../features/cart/cartSlice";
import { clearWishlist } from "../features/wishlist/wishlistSlice";
import "./Navbar.css";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const { user } = useSelector((state) => state.auth);
  const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    dispatch(clearWishlist());
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          MyShop<span className="logo-dot">.</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/wishlist" className="cart-link">
            Wishlist
            <span className="cart-badge" key={wishlistItems.length}>{wishlistItems.length}</span>
          </Link>
          <Link to="/cart" className="cart-link">
            Cart
            <span className="cart-badge" key={totalQty}>{totalQty}</span>
          </Link>
          <Link to="/orders" className="nav-link">Orders</Link>

          <ThemeToggle color="#fff" />

          {user ? (
            <>
              <span className="nav-link">Hi, {user.name.split(" ")[0]}</span>
              <button className="nav-link nav-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className="nav-link">Register</Link>
              <Link to="/login" className="nav-link nav-login-btn">Login</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;