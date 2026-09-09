import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addItemToCart, increaseItemQuantity, decreaseItemQuantity } from "../features/cart/cartSlice";
import { toggleWishlistItem } from "../features/wishlist/wishlistSlice";
import "./ProductCard.css";
import "../styles/buttons.css";

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const cartItem = useSelector((state) =>
    state.cart.items.find((item) => item.id === product._id)
  );

  const isWishlisted = useSelector((state) =>
    state.wishlist.items.some((item) => item.id === product._id)
  );

  const handleAddToCart = () => {
    if (!user) {
      navigate("/register");
      return;
    }
    dispatch(addItemToCart(product._id));
  };

  const handleToggleWishlist = () => {
    if (!user) {
      navigate("/register");
      return;
    }
    dispatch(toggleWishlistItem(product._id));
  };

  return (
    <div className="product-card">
      <div className="product-image-wrap">
        <button
          className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
          onClick={handleToggleWishlist}
          aria-label="Toggle wishlist"
        >
          {isWishlisted ? "♥" : "♡"}
        </button>
        <img src={product.image} alt={product.name} />
      </div>
      <h4 className="product-name">{product.name}</h4>
      <p className="product-price">₹{product.price}</p>

      {product.stock > 0 && product.stock <= 10 && (
  <span className="stock-badge low">Only {product.stock} left</span>
)}

      {product.stock === 0 ? (
  <button className="btn-primary btn-disabled" disabled>
    Out of Stock
  </button>
) : !cartItem ? (
        <button className="btn-primary" onClick={handleAddToCart}>
          Add to Cart
        </button>
      ) : (
        <div className="qty-pill">
          <button
            className="qty-btn"
            onClick={() => dispatch(decreaseItemQuantity(product._id))}
          >
            −
          </button>
          <span>{cartItem.quantity} in cart</span>
          <button
  className={`qty-btn ${cartItem.quantity >= product.stock ? "btn-disabled" : ""}`}
  onClick={() => dispatch(increaseItemQuantity(product._id))}
  disabled={cartItem.quantity >= product.stock}
>
  +
</button>
        </div>
      )}
    </div>
  );
}

export default ProductCard;