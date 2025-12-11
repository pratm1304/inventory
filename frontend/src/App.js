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

  useEffect(() => {
  loadProducts(); // page open होते ही 1 बार

  const interval = setInterval(() => {
    loadProducts(); // हर 1 sec में backend से नया data
  }, 1000);

  return () => clearInterval(interval); // cleanup
}, []);


  const loadProducts = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/products`);
    setProducts(res.data);

    // extract unique categories from fetched products
    const uniqueCategories = [...new Set(res.data.map(p => p.category || "Uncategorized"))];
    setCategories(uniqueCategories);
  };

  // Optimistic UI update
  const updateValue = async (id, field, change) => {
    // frontend me turant update
    setProducts(prev =>
      prev.map(p =>
        p._id === id ? { ...p, [field]: p[field] + change } : p
      )
    );

    // backend update async
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/products/update`, { id, field, change });
    } catch (err) {
      console.error(err);
      // optional: error aaya toh revert karne ka logic yaha dal sakte ho
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
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Inventory Dashboard</h2>

      {/* Admin PIN Button — only show if not admin */}
      {!isAdmin && (
        <button
          onClick={() => {
            const pin = prompt("Enter Admin PIN");
            if (pin === "1234") setIsAdmin(true);
            else alert("Wrong PIN");
          }}
        >
          Admin
        </button>
      )}

      {/* Admin Badge + Logout */}
      {isAdmin && (
        <>
          <span style={{ color: "red", marginLeft: 10 }}>ADMIN MODE ACTIVE</span>
          <button
            onClick={() => setIsAdmin(false)}
            style={{
              marginLeft: 10,
              padding: "8px 15px",
              background: "#555",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </>
      )}

      {/* Finish Button — Only Admin */}
      {isAdmin && (
        <button
          onClick={async () => {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/products/finish`);
            loadProducts();
          }}
          style={{
            padding: "10px 20px",
            marginBottom: 20,
            marginLeft: 10,
            background: "green",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Finish Day
        </button>
      )}

      {/* Add Product Form — Only Admin */}
      {isAdmin && (
        <form onSubmit={addProduct} style={{ marginBottom: 20, marginTop: 20 }}>
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: 8, marginRight: 10 }}
          />
          <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            style={{ padding: 8, marginRight: 10 }}
          />

          {/* Category select / new */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: 8, marginRight: 10 }}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="new">Add New Category</option>
          </select>

          {category === "new" && (
            <input
              type="text"
              placeholder="New Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{ padding: 8, marginRight: 10 }}
            />
          )}

          <button type="submit" style={{ padding: "8px 15px" }}>Add Product</button>
        </form>
      )}

      {/* Products Category Wise */}
      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: 20 }}>
          <h3>{cat}</h3>
          <table border="1" cellPadding="10" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Stock</th>
                <th>Admin</th>
                <th>Chef</th>
                <th>Sales</th>
                <th>Zomato</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {products
                .filter(p => (p.category || "Uncategorized") === cat)
                .map(p => {
                  const remaining = p.stock + p.chef - p.sales - p.zomato;
                  return (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>{p.stock}</td>
                      <td>
                        {isAdmin ? (
                          <>
                            <button onClick={() => updateValue(p._id, "admin", -1)}>-</button>
                            <span style={{ margin: "0 8px" }}>{p.admin}</span>
                            <button onClick={() => updateValue(p._id, "admin", 1)}>+</button>
                          </>
                        ) : <b>{p.admin}</b>}
                      </td>
                      <td
                        style={{
                          background: p.admin === 0 ? "white" : p.chef < p.admin ? "#ffcccc" : "#ccffcc",
                          textAlign: "center"
                        }}
                      >
                        <button onClick={() => updateValue(p._id, "chef", -1)}>-</button>
                        <span style={{ margin: "0 8px" }}>{p.chef}</span>
                        <button onClick={() => updateValue(p._id, "chef", 1)}>+</button>
                      </td>
                      <td>
                        <button onClick={() => updateValue(p._id, "sales", -1)}>-</button>
                        <span style={{ margin: "0 8px" }}>{p.sales}</span>
                        <button onClick={() => updateValue(p._id, "sales", 1)}>+</button>
                      </td>
                      <td>
                        <button onClick={() => updateValue(p._id, "zomato", -1)}>-</button>
                        <span style={{ margin: "0 8px" }}>{p.zomato}</span>
                        <button onClick={() => updateValue(p._id, "zomato", 1)}>+</button>
                      </td>
                      <td><b>{remaining}</b></td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default App;
