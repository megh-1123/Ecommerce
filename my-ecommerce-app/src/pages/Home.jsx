
import ProductList from "../components/ProductList";
import "./Home.css";
import "../styles/layout.css"; // for .section-title / .section-subtitle
import "../styles/buttons.css"; // for .hero-btn (uses .btn-primary)

function Home() {
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-inner">
          <h1 className="hero-title">Everyday gear,<br />delivered fresh.</h1>
          <p className="hero-subtitle">
            Electronics and accessories picked for people who don't like waiting.
          </p>
          <a href="#products" className="btn-primary hero-btn">Shop the drop</a>
        </div>
      </section>

      <div className="container" id="products">
        <h2 className="section-title">Our Products</h2>
        <p className="section-subtitle">Fresh picks, added straight to your cart.</p>
      </div>
      <ProductList />
    </div>
  );
}

export default Home;