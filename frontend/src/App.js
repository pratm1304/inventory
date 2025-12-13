import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [stock, setStock] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [multiProducts, setMultiProducts] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  useEffect(() => {
    loadProducts();
    const interval = setInterval(() => {
      loadProducts();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadProducts = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/products`);
    setProducts(res.data);
    const uniqueCategories = [...new Set(res.data.map(p => p.category || "Uncategorized"))];
    setCategories(uniqueCategories);
  };

  const updateValue = async (id, field, change) => {
    setProducts(prev =>
      prev.map(p =>
        p._id === id ? { ...p, [field]: p[field] + change } : p
      )
    );
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/products/update`, { id, field, change });
    } catch (err) {
      console.error(err);
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    if (!name) return alert("Product name required");
    let finalCategory = category === "new" ? newCategory : category;
    if (!finalCategory) return alert("Category required");
    await axios.post(`${process.env.REACT_APP_API_URL}/api/products/add`, {
      name,
      stock: Number(stock),
      category: finalCategory,
    });
    setName("");
    setStock(0);
    setCategory("");
    setNewCategory("");
    loadProducts();
    showToast("Product added successfully!");
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await axios.delete(`${process.env.REACT_APP_API_URL}/api/products/${id}`);
      if (res.data.deleteCategory) {
        setCategories(prev => prev.filter(c => c !== res.data.deleteCategory));
      }
      loadProducts();
      showToast("Product deleted successfully!", "error");
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const categoryColors = [
    "#fef3c7", // amber
    "#dbeafe", // blue
    "#fce7f3", // pink
    "#d1fae5", // green
    "#e0e7ff", // indigo
    "#fef9c3", // yellow
    "#fbcfe8", // fuchsia
    "#ccfbf1", // teal
    "#fed7aa", // orange
    "#e9d5ff"  // purple
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "20px" }}>
      {toast.show && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          background: toast.type === "error" ? "#ef4444" : "#10b981",
          color: "white",
          padding: "12px 24px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 1000,
          animation: "slideIn 0.3s ease-out"
        }}>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        padding: "30px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "2px solid #e5e7eb", paddingBottom: "20px" }}>
          <h2 style={{ margin: 0, color: "#1f2937", fontSize: "28px", fontWeight: "700" }}>📦 Inventory Dashboard</h2>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {!isAdmin && (
              <button
                onClick={() => {
                  const pin = prompt("Enter Admin PIN");
                  if (pin === "1234") {
                    setIsAdmin(true);
                    showToast("Admin mode activated!");
                  } else {
                    alert("Wrong PIN");
                  }
                }}
                style={{
                  padding: "8px 20px",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => e.target.style.background = "#5568d3"}
                onMouseOut={(e) => e.target.style.background = "#667eea"}
              >
                🔐 Admin
              </button>
            )}
            {isAdmin && (
              <>
                <span style={{
                  background: "#fee2e2",
                  color: "#dc2626",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "700"
                }}>
                  🔴 ADMIN MODE
                </span>
                <button
                  onClick={() => {
                    setIsAdmin(false);
                    showToast("Logged out", "error");
                  }}
                  style={{
                    padding: "8px 16px",
                    background: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600"
                  }}
                >
                  Logout
                </button>
                <button
                  onClick={async () => {
                    await axios.post(`${process.env.REACT_APP_API_URL}/api/products/finish`);
                    loadProducts();
                    showToast("Day finished successfully!");
                  }}
                  style={{
                    padding: "8px 16px",
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600"
                  }}
                >
                  ✓ Finish Day
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm("Are you sure? This will reset ALL products!")) return;
                    await axios.post(`${process.env.REACT_APP_API_URL}/api/products/reset`);
                    loadProducts();
                    showToast("All data reset!", "error");
                  }}
                  style={{
                    padding: "8px 16px",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600"
                  }}
                >
                  🗑️ Reset
                </button>
              </>
            )}
          </div>
        </div>

        {isAdmin && (
          <div style={{
            background: "#f9fafb",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "30px",
            border: "1px solid #e5e7eb"
          }}>
            <h3 style={{ margin: "0 0 15px 0", color: "#374151", fontSize: "16px", fontWeight: "600" }}>Add New Product</h3>
            <form onSubmit={addProduct} style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  flex: "1",
                  minWidth: "150px"
                }}
              />
              <input
                type="number"
                placeholder="Stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  width: "100px"
                }}
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  minWidth: "150px"
                }}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="new">+ New Category</option>
              </select>
              {category === "new" && (
                <input
                  type="text"
                  placeholder="New Category Name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    minWidth: "150px"
                  }}
                />
              )}
              <button
                type="submit"
                style={{
                  padding: "8px 20px",
                  background: "#8b5cf6",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600"
                }}
              >
                + Add
              </button>
            </form>
          </div>
        )}

        {isAdmin && (
          <div style={{
            background: "#faf5ff",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "30px",
            border: "1px solid #e9d5ff"
          }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#374151", fontSize: "16px", fontWeight: "600" }}>Bulk Add Products</h3>
            <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 10px 0" }}>Format: Name,Stock,Category (one per line)</p>
            <textarea
              placeholder="Puff,20,Bakery&#10;Bun,50,Bakery&#10;Roll,10,Snacks"
              value={multiProducts}
              onChange={(e) => setMultiProducts(e.target.value)}
              rows="4"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                fontFamily: "monospace",
                marginBottom: "10px",
                boxSizing: "border-box"
              }}
            />
            <button
              onClick={async () => {
                if (!multiProducts.trim()) return alert("Paste product list first");
                await axios.post(`${process.env.REACT_APP_API_URL}/api/products/add-multiple`, {
                  lines: multiProducts,
                });
                setMultiProducts("");
                loadProducts();
                showToast("All products added successfully!");
              }}
              style={{
                padding: "8px 20px",
                background: "#8b5cf6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600"
              }}
            >
              📋 Add All
            </button>
          </div>
        )}

        {categories.map((cat, catIndex) => {
          const bgColor = categoryColors[catIndex % categoryColors.length];
          
          return (
            <div key={cat} style={{ marginBottom: "30px" }}>
              <h3 style={{
                color: "#374151",
                fontSize: "18px",
                fontWeight: "700",
                marginBottom: "12px",
                paddingBottom: "8px",
                borderBottom: "2px solid #e5e7eb"
              }}>
                {cat}
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                  background: "white"
                }}>
                  <thead>
                    <tr style={{ background: "#f3f4f6" }}>
                      <th style={{ padding: "10px", textAlign: "left", fontWeight: "600", color: "#374151", borderBottom: "2px solid #e5e7eb" }}>Product</th>
                      <th style={{ padding: "10px", textAlign: "center", fontWeight: "600", color: "#374151", width: "80px", borderBottom: "2px solid #e5e7eb" }}>Stock</th>
                      <th style={{ padding: "10px", textAlign: "center", fontWeight: "600", color: "#374151", width: "110px", borderBottom: "2px solid #e5e7eb" }}>Admin</th>
                      <th style={{ padding: "10px", textAlign: "center", fontWeight: "600", color: "#374151", width: "110px", borderBottom: "2px solid #e5e7eb" }}>Chef</th>
                      <th style={{ padding: "10px", textAlign: "center", fontWeight: "600", color: "#374151", width: "110px", borderBottom: "2px solid #e5e7eb" }}>Sales</th>
                      <th style={{ padding: "10px", textAlign: "center", fontWeight: "600", color: "#374151", width: "110px", borderBottom: "2px solid #e5e7eb" }}>Zomato</th>
                      <th style={{ padding: "10px", textAlign: "center", fontWeight: "600", color: "#374151", width: "90px", borderBottom: "2px solid #e5e7eb" }}>Left</th>
                      {isAdmin && <th style={{ padding: "10px", textAlign: "center", fontWeight: "600", color: "#374151", width: "70px", borderBottom: "2px solid #e5e7eb" }}>Del</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter(p => (p.category || "Uncategorized") === cat)
                      .map(p => {
                        const remaining = p.stock + p.chef - p.sales - p.zomato;
                        return (
                          <tr key={p._id} style={{ borderBottom: "1px solid #f3f4f6", background: bgColor }}>
                            <td style={{ padding: "10px", fontWeight: "500", color: "#1f2937" }}>{p.name}</td>
                            <td style={{ padding: "10px", textAlign: "center" }}>
                              {isAdmin ? (
                                <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }}>
                                  <button
                                    onClick={() => updateValue(p._id, "stock", -1)}
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      border: "1px solid #d1d5db",
                                      background: "white",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      fontSize: "14px",
                                      color: "#6b7280"
                                    }}
                                  >
                                    -
                                  </button>
                                  <span style={{ fontWeight: "600", minWidth: "24px", textAlign: "center", color: "#6b7280" }}>{p.stock}</span>
                                  <button
                                    onClick={() => updateValue(p._id, "stock", 1)}
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      border: "1px solid #d1d5db",
                                      background: "white",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      fontSize: "14px",
                                      color: "#6b7280"
                                    }}
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontWeight: "600", color: "#6b7280" }}>{p.stock}</span>
                              )}
                            </td>
                            <td style={{ padding: "10px", textAlign: "center" }}>
                              {isAdmin ? (
                                <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }}>
                                  <button
                                    onClick={() => updateValue(p._id, "admin", -1)}
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      border: "1px solid #d1d5db",
                                      background: "white",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      fontSize: "14px",
                                      color: "#6b7280"
                                    }}
                                  >
                                    -
                                  </button>
                                  <span style={{ fontWeight: "600", minWidth: "24px", textAlign: "center" }}>{p.admin}</span>
                                  <button
                                    onClick={() => updateValue(p._id, "admin", 1)}
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      border: "1px solid #d1d5db",
                                      background: "white",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      fontSize: "14px",
                                      color: "#6b7280"
                                    }}
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontWeight: "600" }}>{p.admin}</span>
                              )}
                            </td>
                            <td style={{
                              padding: "10px",
                              textAlign: "center",
                              background: p.admin === 0 ? "white" : p.chef < p.admin ? "#fee2e2" : "#d1fae5"
                            }}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }}>
                                <button
                                  onClick={() => updateValue(p._id, "chef", -1)}
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    border: "1px solid #d1d5db",
                                    background: "white",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    color: "#6b7280"
                                  }}
                                >
                                  -
                                </button>
                                <span style={{ fontWeight: "600", minWidth: "24px", textAlign: "center" }}>{p.chef}</span>
                                <button
                                  onClick={() => updateValue(p._id, "chef", 1)}
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    border: "1px solid #d1d5db",
                                    background: "white",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    color: "#6b7280"
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td style={{ padding: "10px", textAlign: "center" }}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }}>
                                <button
                                  onClick={() => updateValue(p._id, "sales", -1)}
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    border: "1px solid #d1d5db",
                                    background: "white",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    color: "#6b7280"
                                  }}
                                >
                                  -
                                </button>
                                <span style={{ fontWeight: "600", minWidth: "24px", textAlign: "center" }}>{p.sales}</span>
                                <button
                                  onClick={() => updateValue(p._id, "sales", 1)}
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    border: "1px solid #d1d5db",
                                    background: "white",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    color: "#6b7280"
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td style={{ padding: "10px", textAlign: "center" }}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }}>
                                <button
                                  onClick={() => updateValue(p._id, "zomato", -1)}
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    border: "1px solid #d1d5db",
                                    background: "white",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    color: "#6b7280"
                                  }}
                                >
                                  -
                                </button>
                                <span style={{ fontWeight: "600", minWidth: "24px", textAlign: "center" }}>{p.zomato}</span>
                                <button
                                  onClick={() => updateValue(p._id, "zomato", 1)}
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    border: "1px solid #d1d5db",
                                    background: "white",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    color: "#6b7280"
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td style={{
                              padding: "10px",
                              textAlign: "center",
                              fontWeight: "700",
                              fontSize: "16px",
                              color: remaining < 0 ? "#dc2626" : "#059669"
                            }}>
                              {remaining}
                            </td>
                            {isAdmin && (
                              <td style={{ padding: "10px", textAlign: "center" }}>
                                <button
                                  onClick={() => deleteProduct(p._id)}
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    background: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                  }}
                                >
                                  ✖
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;