import "./Footer.css";
function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <div className="logo footer-logo">
            MyShop<span className="logo-dot">.</span>
          </div>
          <p className="footer-tagline">Fresh picks, fair prices, fast cart.</p>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <a href="/">Home</a>
          <a href="/cart">Cart</a>
          <a href="/wishlist">Wishlist</a>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <a href="#">About</a>
          <a href="#">Contact</a>
          <a href="#">Terms</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} MyShop. Built while learning Redux.</p>
      </div>
    </footer>
  );
}

export default Footer;