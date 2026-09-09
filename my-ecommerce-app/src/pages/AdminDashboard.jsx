import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../services/api";
import AdminNavbar from "../components/AdminNavbar";
import "./Cart.css";
import "../styles/layout.css";
import "../styles/buttons.css";
import "./AdminDashboard.css";

const LOW_STOCK_THRESHOLD = 10;
const HIGH_STOCK_THRESHOLD = 90;

function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");

  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [carts, setCarts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    image: "",
    description: "",
    stock: "",
  });
  const [formError, setFormError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [storedAdmin, setStoredAdmin] = useState(
    JSON.parse(localStorage.getItem("admin") || "{}")
  );
  const isSuperAdmin = storedAdmin.role === "superadmin";
  const myPermissions = storedAdmin.permissions || [];

  const canAccess = (tabName) => {
    if (tabName === "overview") return true;
    if (isSuperAdmin) return true;
    return myPermissions.includes(tabName);
  };

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      navigate("/admin/login");
    }
  }, [navigate]);

  // Refresh role/permissions from the database on mount, so changes made by a
  // super admin (permission edits, deactivation) take effect immediately —
  // without requiring this admin to log out and back in.
  useEffect(() => {
    adminApi
      .get("/admin/me")
      .then((freshData) => {
        setStoredAdmin((prev) => {
          const merged = { ...prev, ...freshData };
          localStorage.setItem("admin", JSON.stringify(merged));
          return merged;
        });
      })
      .catch(() => {
        // If this fails (e.g. deactivated mid-session), the next API call
        // will surface the real error via the existing error handling below.
      });
  }, []);

  const loadTab = async (which) => {
    if (!canAccess(which)) {
      setError("You don't have permission to view this section.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (which === "overview") {
        const results = await Promise.allSettled([
          canAccess("products") ? adminApi.get("/products") : Promise.resolve([]),
          canAccess("users") ? adminApi.get("/admin/users") : Promise.resolve([]),
          canAccess("carts") ? adminApi.get("/admin/carts") : Promise.resolve([]),
          canAccess("orders") ? adminApi.get("/admin/orders") : Promise.resolve([]),
        ]);
        setProducts(results[0].status === "fulfilled" ? results[0].value : []);
        setUsers(results[1].status === "fulfilled" ? results[1].value : []);
        setCarts(results[2].status === "fulfilled" ? results[2].value : []);
        setOrders(results[3].status === "fulfilled" ? results[3].value : []);
      }
      if (which === "products") setProducts(await adminApi.get("/products"));
      if (which === "users") setUsers(await adminApi.get("/admin/users"));
      if (which === "carts") setCarts(await adminApi.get("/admin/carts"));
      if (which === "orders") setOrders(await adminApi.get("/admin/orders"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTab(tab);
  }, [tab]);

  const handleDeleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await adminApi.delete(`/products/${id}`);
      loadTab("products");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This also deletes their cart and wishlist.`)) return;
    try {
      await adminApi.delete(`/admin/users/${id}`);
      loadTab("users");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const uploadFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }
    setUploadingImage(true);
    setUploadError("");
    try {
      const { url } = await adminApi.uploadImage(file);
      setFormData((prev) => ({ ...prev, image: url }));
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  const handlePasteImage = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) uploadFile(file);
        break;
      }
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      description: product.description || "",
      stock: product.stock,
    });
    setShowForm(true);
    setFormError("");
  };

  const resetForm = () => {
    setFormData({ name: "", price: "", category: "", image: "", description: "", stock: "" });
    setEditingId(null);
    setShowForm(false);
    setFormError("");
    setUploadError("");
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name || !formData.price || !formData.category || !formData.image) {
      setFormError("Name, price, category, and image are required.");
      return;
    }

    const stockValue =
      formData.stock === "" || formData.stock === null || formData.stock === undefined
        ? undefined
        : Number(formData.stock);

    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: stockValue,
    };

    try {
      if (editingId) {
        await adminApi.put(`/products/${editingId}`, payload);
      } else {
        await adminApi.post("/products", payload);
      }
      resetForm();
      loadTab("products");
    } catch (err) {
      setFormError(err.message);
    }
  };

  const stats = useMemo(() => {
    const lowStock = [...products]
      .filter((p) => (p.stock ?? 0) <= LOW_STOCK_THRESHOLD)
      .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));

    const midStock = [...products]
      .filter((p) => (p.stock ?? 0) > LOW_STOCK_THRESHOLD && (p.stock ?? 0) < HIGH_STOCK_THRESHOLD)
      .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));

    const highStock = [...products]
      .filter((p) => (p.stock ?? 0) >= HIGH_STOCK_THRESHOLD)
      .sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0));

    const inventoryValue = products.reduce((sum, p) => sum + (p.price || 0) * (p.stock || 0), 0);
    const outOfStockCount = products.filter((p) => (p.stock ?? 0) === 0).length;

    const nonCancelledOrders = orders.filter((o) => o.status !== "Cancelled");
    const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const avgOrderValue = nonCancelledOrders.length > 0 ? totalRevenue / nonCancelledOrders.length : 0;

    const ordersByStatus = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    const cartItemCount = carts.reduce((sum, c) => sum + c.items.reduce((s, i) => s + (i.quantity || 0), 0), 0);
    const nonEmptyCarts = carts.filter((c) => c.items.length > 0).length;

    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return {
      lowStock,
      midStock,
      highStock,
      inventoryValue,
      outOfStockCount,
      totalRevenue,
      avgOrderValue,
      ordersByStatus,
      cartItemCount,
      nonEmptyCarts,
      recentOrders,
    };
  }, [products, orders, carts]);

  return (
    <>
      <AdminNavbar />
      <div className="container admin-dashboard-container">
        <h2>Admin Dashboard</h2>

        <div className="admin-tab-bar">
          {["overview", "products", "users", "carts", "orders"].filter(canAccess).map((t) => (
            <button
              key={t}
              className={`admin-tab-btn ${t === tab ? "btn-primary" : "btn-text"}`}
              onClick={() => setTab(t)}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="admin-error-text">{error}</p>}

        {tab === "overview" && !loading && (
          <>
            <div className="admin-refresh-row">
              <button className="admin-refresh-btn btn-text" onClick={() => loadTab("overview")}>
                ↻ Refresh
              </button>
            </div>
            <div className="stat-grid">
              <div className="stat-card accent">
                <div className="stat-label">Total Revenue</div>
                <div className="stat-value">₹{stats.totalRevenue.toLocaleString()}</div>
                <div className="stat-sub">from {orders.filter((o) => o.status !== "Cancelled").length} orders</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Avg. Order Value</div>
                <div className="stat-value">₹{stats.avgOrderValue.toFixed(0)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Orders</div>
                <div className="stat-value">{orders.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Users</div>
                <div className="stat-value">{users.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Products</div>
                <div className="stat-value">{products.length}</div>
                <div className="stat-sub">{stats.outOfStockCount} out of stock</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Inventory Value</div>
                <div className="stat-value">₹{stats.inventoryValue.toLocaleString()}</div>
                <div className="stat-sub">price × stock, all products</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active Carts</div>
                <div className="stat-value">{stats.nonEmptyCarts}</div>
                <div className="stat-sub">{stats.cartItemCount} items total</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Low Stock Items</div>
                <div className="stat-value">{stats.lowStock.length}</div>
                <div className="stat-sub">stock ≤ {LOW_STOCK_THRESHOLD}</div>
              </div>
            </div>

            <div className="stock-columns">
              <div className="dash-section">
                <h3>Low Stock (≤ {LOW_STOCK_THRESHOLD})</h3>
                {stats.lowStock.length === 0 && <p className="empty-note">Nothing running low right now.</p>}
                {stats.lowStock.map((p) => (
                  <div className="stock-row" key={p._id}>
                    <div className="stock-name">
                      <img src={p.image} alt={p.name} />
                      <span>{p.name}</span>
                    </div>
                    <span className={`stock-badge ${(p.stock ?? 0) === 0 ? "out" : "low"}`}>
                      {(p.stock ?? 0) === 0 ? "Out of Stock" : p.stock}
                    </span>
                  </div>
                ))}
              </div>

              <div className="dash-section">
                <h3>Mid Stock</h3>
                {stats.midStock.length === 0 && <p className="empty-note">Nothing in this range.</p>}
                {stats.midStock.map((p) => (
                  <div className="stock-row" key={p._id}>
                    <div className="stock-name">
                      <img src={p.image} alt={p.name} />
                      <span>{p.name}</span>
                    </div>
                    <span className="stock-badge mid">{p.stock ?? 0}</span>
                  </div>
                ))}
              </div>

              <div className="dash-section">
                <h3>High Stock (≥ {HIGH_STOCK_THRESHOLD})</h3>
                {stats.highStock.length === 0 && <p className="empty-note">Nothing at this level yet.</p>}
                {stats.highStock.map((p) => (
                  <div className="stock-row" key={p._id}>
                    <div className="stock-name">
                      <img src={p.image} alt={p.name} />
                      <span>{p.name}</span>
                    </div>
                    <span className="stock-badge high">{p.stock ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dash-columns">
              <div className="dash-section">
                <h3>Orders by Status</h3>
                {Object.keys(stats.ordersByStatus).length === 0 && <p className="empty-note">No orders yet.</p>}
                <div className="status-chip-row">
                  {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                    <div className="status-chip" key={status}>
                      <strong>{count}</strong> <span>{status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dash-section">
                <h3>Recent Orders</h3>
                {stats.recentOrders.length === 0 && <p className="empty-note">No orders yet.</p>}
                {stats.recentOrders.map((order) => (
                  <div className="recent-order-row" key={order._id}>
                    <div>
                      <strong>{order.user?.name || "Unknown user"}</strong>
                      <div className="recent-order-meta">
                        #{order._id.slice(-6).toUpperCase()} — {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="status-chip">{order.status}</span>
                    <strong>₹{order.totalAmount}</strong>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "products" && !loading && (
          <>
            <button
              className="admin-add-product-btn btn-primary"
              onClick={() => (showForm ? resetForm() : setShowForm(true))}
            >
              {showForm ? "Cancel" : "+ Add Product"}
            </button>

            {showForm && (
              <form
                onSubmit={handleSubmitProduct}
                onPaste={handlePasteImage}
                className="admin-product-form"
              >
                <input name="name" placeholder="Product name" value={formData.name} onChange={handleFormChange} />
                <input name="price" type="number" placeholder="Price" value={formData.price} onChange={handleFormChange} />
                <input name="category" placeholder="Category" value={formData.category} onChange={handleFormChange} />

                <div className="admin-image-upload-box">
                  <label className="admin-form-label">Product Image</label>

                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="admin-image-preview" />
                  )}

                  <div className="admin-file-row">
                    <input type="file" accept="image/*" onChange={handleFileSelected} disabled={uploadingImage} />
                    {uploadingImage && <span className="admin-uploading-text">Uploading...</span>}
                  </div>

                  <p className="admin-paste-hint">
                    Or copy an image and paste it (Ctrl+V) anywhere in this form.
                  </p>

                  <input
                    name="image"
                    placeholder="...or paste an image URL directly"
                    value={formData.image}
                    onChange={handleFormChange}
                  />

                  {uploadError && <p className="admin-form-error small">{uploadError}</p>}
                </div>

                <input name="description" placeholder="Description (optional)" value={formData.description} onChange={handleFormChange} />
                <input name="stock" type="number" placeholder="Stock (optional, default 100)" value={formData.stock} onChange={handleFormChange} />
                {formError && <p className="admin-form-error">{formError}</p>}
                <button type="submit" className="btn-primary" disabled={uploadingImage}>
                  {editingId ? "Update Product" : "Save Product"}
                </button>
              </form>
            )}

            <table className="admin-table">
              <thead>
                <tr className="admin-table-head-row">
                  <th>Image</th><th>Name</th><th>Price</th><th>Category</th><th>Stock</th><th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="admin-table-row">
                    <td>
                      <img src={p.image} alt={p.name} className="admin-thumb" />
                    </td>
                    <td>{p.name}</td>
                    <td>₹{p.price}</td>
                    <td>{p.category}</td>
                    <td>
                      {p.stock === 0 ? (
                        <span className="stock-badge out">Out of Stock</span>
                      ) : p.stock <= 10 ? (
                        <span className="stock-badge low">{p.stock} (Low)</span>
                      ) : (
                        p.stock
                      )}
                    </td>
                    <td>
                      <button className="btn-text" onClick={() => handleEditClick(p)}>
                        Edit
                      </button>
                      <button
                        className="btn-text admin-btn-spacer"
                        onClick={() => handleDeleteProduct(p._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {tab === "users" && !loading && (
          <table className="admin-table">
            <thead>
              <tr className="admin-table-head-row">
                <th>Name</th><th>Email</th><th>Joined</th><th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="admin-table-row">
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-text" onClick={() => handleDeleteUser(u._id, u.name)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "carts" && !loading && (
          <div>
            {carts.length === 0 && <p>No carts yet.</p>}
            {carts.map((cart) => (
              <div key={cart._id} className="admin-cart-block">
                <strong>{cart.user?.name || "Unknown user"}</strong> ({cart.user?.email})
                <ul>
                  {cart.items.map((item, i) => (
                    <li key={i}>
                      {item.product?.name || "Deleted product"} × {item.quantity}
                    </li>
                  ))}
                  {cart.items.length === 0 && <li>Empty cart</li>}
                </ul>
              </div>
            ))}
          </div>
        )}

        {tab === "orders" && !loading && (
          <div>
            {orders.length === 0 && <p>No orders yet.</p>}
            {orders.map((order) => (
              <div key={order._id} className="admin-order-card">
                <div className="admin-order-header">
                  <div>
                    <strong>{order.user?.name || "Unknown user"}</strong> ({order.user?.email})
                    <div className="admin-order-meta">
                      Order #{order._id.slice(-6).toUpperCase()} — {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span className="admin-status-chip">{order.status}</span>
                </div>
                <ul className="admin-order-items">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      {item.name} × {item.quantity} — ₹{item.price * item.quantity}
                    </li>
                  ))}
                </ul>
                <div className="cart-total">Total: ₹{order.totalAmount}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default AdminDashboard;