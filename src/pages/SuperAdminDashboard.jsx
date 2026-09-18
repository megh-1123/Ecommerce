import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../services/api";
import AdminNavbar from "../components/AdminNavbar";
import "../styles/layout.css";
import "../styles/buttons.css";
import "./SuperAdminDashboard.css";

const PERMISSIONS = ["products", "users", "carts", "orders"];

function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [formError, setFormError] = useState("");

  const [editingAdminId, setEditingAdminId] = useState(null);
  const [editPermissions, setEditPermissions] = useState([]);

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      navigate("/admin/login");
      return;
    }
    const parsed = JSON.parse(admin);
    if (parsed.role !== "superadmin") {
      navigate("/admin");
    }
  }, [navigate]);

  const loadAdmins = async () => {
    setLoading(true);
    setError("");
    try {
      setAdmins(await adminApi.get("/admin/manage"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: fetch admin list on mount
    loadAdmins();
  }, []);

  const togglePermission = (perm) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name || !formData.email || !formData.password) {
      setFormError("Name, email, and password are required.");
      return;
    }

    try {
      await adminApi.post("/admin/manage", { ...formData, permissions: selectedPermissions });
      setFormData({ name: "", email: "", password: "" });
      setSelectedPermissions([]);
      setShowForm(false);
      loadAdmins();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDeleteAdmin = async (id, name) => {
    if (!confirm(`Delete admin "${name}"?`)) return;
    try {
      await adminApi.delete(`/admin/manage/${id}`);
      loadAdmins();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const result = await adminApi.put(`/admin/manage/${id}/toggle-active`, {});
      alert(result.message);
      loadAdmins();
    } catch (err) {
      alert(err.message);
    }
  };

  const startEditingPermissions = (admin) => {
    setEditingAdminId(admin._id);
    setEditPermissions(admin.permissions || []);
  };

  const toggleEditPermission = (perm) => {
    setEditPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const saveEditedPermissions = async (id) => {
    try {
      await adminApi.put(`/admin/manage/${id}`, { permissions: editPermissions });
      setEditingAdminId(null);
      loadAdmins();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="container superadmin-container">
        <h2>Manage Admins</h2>

        <button
          className="superadmin-add-btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Admin"}
        </button>

        {showForm && (
          <form onSubmit={handleCreateAdmin} className="superadmin-form">
            <input
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <div>
              <p className="superadmin-permissions-label">Permissions:</p>
              {PERMISSIONS.map((perm) => (
                <label key={perm} className="superadmin-permission-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm)}
                    onChange={() => togglePermission(perm)}
                  />
                  {perm}
                </label>
              ))}
            </div>

            {formError && <p className="superadmin-form-error">{formError}</p>}
            <button type="submit" className="btn-primary">Create Admin</button>
          </form>
        )}

        {loading && <p>Loading...</p>}
        {error && <p className="superadmin-form-error">{error}</p>}

        {!loading && (
          <table className="superadmin-table">
            <thead>
              <tr className="superadmin-table-head-row">
                <th>Name</th><th>Email</th><th>Role</th><th>Permissions</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a._id} className="superadmin-table-row">
                  <td>{a.name}</td>
                  <td>{a.email}</td>
                  <td>{a.role}</td>
                  <td>
                    {a.role === "superadmin" ? (
                      "— all —"
                    ) : editingAdminId === a._id ? (
                      <div className="superadmin-edit-permissions-row">
                        {PERMISSIONS.map((perm) => (
                          <label key={perm} className="superadmin-permission-checkbox">
                            <input
                              type="checkbox"
                              checked={editPermissions.includes(perm)}
                              onChange={() => toggleEditPermission(perm)}
                            />
                            {perm}
                          </label>
                        ))}
                        <button className="btn-text" onClick={() => saveEditedPermissions(a._id)}>
                          Save
                        </button>
                        <button className="btn-text" onClick={() => setEditingAdminId(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      a.permissions.join(", ") || "none"
                    )}
                  </td>
                  <td>
                    {a.role === "superadmin" ? (
                      "—"
                    ) : a.isActive === false ? (
                      <span className="superadmin-status-deactivated">Deactivated</span>
                    ) : (
                      <span className="superadmin-status-active">Active</span>
                    )}
                  </td>
                  <td>
                    {a.role !== "superadmin" && (
                      <>
                        <button className="btn-text" onClick={() => startEditingPermissions(a)}>
                          Edit Permissions
                        </button>
                        <button
                          className="btn-text superadmin-btn-spacer"
                          onClick={() => handleToggleActive(a._id)}
                        >
                          {a.isActive === false ? "Activate" : "Deactivate"}
                        </button>
                        <button
                          className="btn-text superadmin-btn-spacer"
                          onClick={() => handleDeleteAdmin(a._id, a.name)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default SuperAdminDashboard;