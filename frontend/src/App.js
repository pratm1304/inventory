import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [stock, setStock] = useState(0);
  const [price, setPrice] = useState(200);
  const [userRole, setUserRole] = useState(null);
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [multiProducts, setMultiProducts] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editingPrice, setEditingPrice] = useState(0);
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedCategory, setDraggedCategory] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState("");

  // Sales states
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showRevenueInBtn, setShowRevenueInBtn] = useState(false);
  const [selectedOrderType, setSelectedOrderType] = useState('foushack');
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // ✅ FIXED: Working success sound
  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio error:', error);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
    if (userRole === 'sales' || userRole === 'admin') {
      loadOrders();
    }
    const interval = setInterval(() => {
      loadProducts();
      loadCategories();
      if (userRole === 'sales' || userRole === 'admin') {
        loadOrders();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [userRole]);

  const loadProducts = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/products`);
    setProducts(res.data);
  };

  const loadCategories = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/categories`);
    setCategories(res.data.map(c => c.name));
  };

  const loadOrders = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateTotalRevenue = () => {
    return products.reduce((total, p) => {
      return total + ((p.sales + p.zomato) * (p.price || 200));
    }, 0);
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

  const updateProductName = async (id, newName) => {
    if (!newName.trim()) return;
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/products/update-name`, { id, name: newName });
      setProducts(prev =>
        prev.map(p => p._id === id ? { ...p, name: newName } : p)
      );
      setEditingProductId(null);
      showToast("Product name updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update name");
    }
  };

  const updateProductPrice = async (id, newPrice) => {
    if (newPrice < 0) return;
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/products/update-price`, { id, price: newPrice });
      setProducts(prev =>
        prev.map(p => p._id === id ? { ...p, price: newPrice } : p)
      );
      setEditingPriceId(null);
      showToast("Price updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update price");
    }
  };

  const updateCategoryName = async (oldName, newName) => {
    if (!newName.trim()) return;
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/categories/update-name`, {
        oldName,
        newName: newName.trim()
      });
      await loadCategories();
      await loadProducts();
      setEditingCategoryName(null);
      showToast("Category name updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update category name");
    }
  };

  const deleteCategory = async (categoryName) => {
    if (!window.confirm(`Are you sure you want to delete the category "${categoryName}" and all its products?`)) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/categories/${categoryName}`);
      await loadCategories();
      await loadProducts();
      showToast("Category deleted successfully!", "error");
    } catch (err) {
      console.error(err);
      alert("Failed to delete category");
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}`);
      loadOrders();
      showToast("Order deleted successfully!", "error");
    } catch (err) {
      console.error(err);
      alert("Failed to delete order");
    }
  };

  const deleteAllOrders = async () => {
    if (!window.confirm("⚠️ Are you sure you want to delete ALL order records? This action cannot be undone!")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/orders/all/delete`);
      loadOrders();
      showToast("All orders deleted successfully!", "success");
    } catch (err) {
      console.error(err);
      alert("Failed to delete all orders");
    }
  };

  const handleDragStart = (e, product, category) => {
    setDraggedItem({ product, category });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, targetProduct, targetCategory) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.category !== targetCategory) {
      setDraggedItem(null);
      return;
    }

    if (draggedItem.product._id === targetProduct._id) {
      setDraggedItem(null);
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/products/reorder`, {
        draggedId: draggedItem.product._id,
        targetId: targetProduct._id,
        category: targetCategory
      });

      await loadProducts();
      showToast("Order updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to reorder");
    }

    setDraggedItem(null);
  };

  const handleCategoryDragStart = (e, categoryName) => {
    setDraggedCategory(categoryName);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleCategoryDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleCategoryDrop = async (e, targetCategoryName) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedCategory || draggedCategory === targetCategoryName) {
      setDraggedCategory(null);
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/categories/reorder`, {
        draggedName: draggedCategory,
        targetName: targetCategoryName
      });

      await loadCategories();
      showToast("Category order updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to reorder categories");
    }

    setDraggedCategory(null);
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
      price: Number(price)
    });
    setName("");
    setStock(0);
    setPrice(200);
    setCategory("");
    setNewCategory("");
    loadProducts();
    loadCategories();
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
      loadCategories();
      showToast("Product deleted successfully!", "error");
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleLogin = (role) => {
    const pins = {
      admin: "1BILLION",
      chef: "KERALA",
      sales: "1234"
    };
    const pin = prompt(`Enter ${role.toUpperCase()} PIN`);
    if (pin === pins[role]) {
      setUserRole(role);
      showToast(`${role.charAt(0).toUpperCase() + role.slice(1)} mode activated!`);
    } else {
      alert("Wrong PIN");
    }
  };

  const getFilteredProducts = () => {
    if (!searchTerm.trim()) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  };

  const addToCart = (product) => {
    if (!product._id || !product.name) {
      console.error("❌ Invalid product:", product);
      showToast("Invalid product data!", "error");
      return;
    }

    const remaining = product.stock + product.chef - product.sales - product.zomato;
    if (remaining <= 0) {
      showToast("Product out of stock!", "error");
      return;
    }

    console.log("➕ Adding to cart:", {
      id: product._id,
      name: product.name,
      price: product.price
    });

    const existingItem = cart.find(item => item.product._id === product._id);

    if (existingItem) {
      setCart(cart.map(item =>
        item.product._id === product._id
          ? { ...item, qty: item.qty + 1 }
          : item
      ));
    } else {
      const cartProduct = {
        _id: product._id,
        name: product.name,
        price: product.price || 200,
        stock: product.stock,
        chef: product.chef,
        sales: product.sales,
        zomato: product.zomato
      };

      setCart([...cart, { product: cartProduct, qty: 1 }]);
    }

    setSearchTerm("");
    setSelectedIndex(0);
    showToast("Added to cart!");

    setTimeout(() => {
      document.getElementById("salesSearchInput")?.focus();
    }, 100);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.qty), 0);
  };

  const handleSearchKeyDown = (e) => {
    const filtered = getFilteredProducts();

    if (cart.length > 0 && !searchTerm.trim()) {
      if (showPaymentOptions) {
        // Navigate between payment methods
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          setSelectedPaymentMethod(prev => prev === 'cash' ? 'upi' : 'cash');
        } else if (e.key === "Enter") {
          e.preventDefault();
          placeOrder(selectedOrderType, selectedPaymentMethod);
          setShowPaymentOptions(false);
          setSelectedPaymentMethod('cash');
        }
      } else {
        // Navigate between order types
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          setSelectedOrderType(prev => prev === 'foushack' ? 'zomato' : 'foushack');
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (selectedOrderType === 'foushack') {
            setShowPaymentOptions(true);
          } else {
            placeOrder(selectedOrderType);
          }
        }
      }
      return;
    }

    if (filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        addToCart(filtered[selectedIndex]);
      }
    }
  };

  const placeOrder = async (orderType, paymentMethod = null) => {
    if (cart.length === 0) {
      showToast("Cart is empty!", "error");
      return;
    }

    // ✅ NEW: Validate stock before placing order
    for (const item of cart) {
      const currentProduct = products.find(p => p._id === item.product._id);
      if (currentProduct) {
        const remaining = currentProduct.stock + currentProduct.chef - currentProduct.sales - currentProduct.zomato;
        if (item.qty > remaining) {
          showToast(`No stock available for ${item.product.name}!`, "error");
          return;
        }
      }
    }

    try {
      console.log("🛒 Full Cart:", JSON.stringify(cart, null, 2));

      const validatedItems = cart.map((item, index) => {
        console.log(`📦 Item ${index}:`, {
          hasProduct: !!item.product,
          productId: item.product?._id,
          productName: item.product?.name,
          productPrice: item.product?.price,
          qty: item.qty
        });

        if (!item.product || !item.product._id || !item.product.name) {
          throw new Error(`Invalid product in cart at index ${index}`);
        }

        return {
          productId: item.product._id,
          productName: item.product.name,
          qty: item.qty,
          price: item.product.price || 200,
          totalPrice: (item.product.price || 200) * item.qty
        };
      });

      const orderPayload = {
        items: validatedItems,
        orderType,
        ...(paymentMethod && { paymentMethod })
      };

      console.log("📤 Sending payload:", JSON.stringify(orderPayload, null, 2));

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/orders/create`,
        orderPayload
      );

      console.log("✅ Order created:", response.data);

      showToast("DONE", "success");
      playSuccessSound();

      setCart([]);
      setSelectedOrderType('foushack');
      setShowPaymentOptions(false);
      setSelectedPaymentMethod('cash');
      loadProducts();
      loadOrders();

      setTimeout(() => {
        document.getElementById("salesSearchInput")?.focus();
      }, 100);
    } catch (err) {
      console.error("❌ Order Error:", err);
      console.error("❌ Error Response:", err.response?.data);
      showToast(`Failed to place order: ${err.message}`, "error");
    }
  };

  const getTodayOrders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
      padding: "40px 20px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      {toast.show && (
        <div style={{
          position: "fixed",
          top: "30px",
          right: "30px",
          background: toast.type === "error"
            ? "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)"
            : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
          padding: "14px 28px",
          borderRadius: "10px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          zIndex: 1000,
          animation: "slideIn 0.3s ease-out",
          fontSize: "14px",
          fontWeight: "500",
          letterSpacing: "0.3px"
        }}>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        background: "rgba(20, 20, 30, 0.7)",
        backdropFilter: "blur(20px)",
        borderRadius: "20px",
        boxShadow: "0 25px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        padding: "40px",
        border: "1px solid rgba(255,255,255,0.08)"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "35px",
          paddingBottom: "25px",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}>
          <h2 style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "32px",
            fontWeight: "700",
            letterSpacing: "-0.5px"
          }}>
            Fou Shack
          </h2>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {!userRole && (
              <>
                <button
                  onClick={() => handleLogin('admin')}
                  style={{
                    padding: "10px 24px",
                    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    letterSpacing: "0.3px",
                    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                    transition: "all 0.2s"
                  }}
                >
                  Admin
                </button>
                <button
                  onClick={() => handleLogin('chef')}
                  style={{
                    padding: "10px 24px",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    letterSpacing: "0.3px",
                    boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                    transition: "all 0.2s"
                  }}
                >
                  Chef
                </button>
                <button
                  onClick={() => handleLogin('sales')}
                  style={{
                    padding: "10px 24px",
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    letterSpacing: "0.3px",
                    boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
                    transition: "all 0.2s"
                  }}
                >
                  Sales
                </button>
              </>
            )}
            {userRole && (
              <>
                <span style={{
                  background: userRole === 'admin'
                    ? "rgba(239, 68, 68, 0.15)"
                    : userRole === 'chef'
                      ? "rgba(16, 185, 129, 0.15)"
                      : "rgba(245, 158, 11, 0.15)",
                  color: userRole === 'admin'
                    ? "#ef4444"
                    : userRole === 'chef'
                      ? "#10b981"
                      : "#f59e0b",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  border: `1px solid ${userRole === 'admin' ? 'rgba(239, 68, 68, 0.3)' : userRole === 'chef' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                }}>
                  {userRole === 'admin' ? 'Admin' : userRole === 'chef' ? 'Chef' : 'Sales'} Mode
                </span>
                {(userRole === 'sales') && (
                  <button
                    onClick={() => setShowRevenueInBtn(!showRevenueInBtn)}
                    style={{
                      padding: "10px 24px",
                      background: showRevenueInBtn
                        ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                        : "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                      letterSpacing: "0.3px",
                      boxShadow: showRevenueInBtn
                        ? "0 4px 12px rgba(16,185,129,0.3)"
                        : "0 4px 12px rgba(139,92,246,0.3)",
                      transition: "all 0.2s",
                      minWidth: showRevenueInBtn ? "200px" : "auto"
                    }}
                  >
                    {showRevenueInBtn ? `₹${calculateTotalRevenue().toFixed(2)}` : "See Total Revenue"}
                  </button>
                )}
                {userRole === 'admin' && (
                  <button
                    onClick={() => setShowOrderHistory(!showOrderHistory)}
                    style={{
                      padding: "10px 24px",
                      background: showOrderHistory
                        ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                        : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                      letterSpacing: "0.3px",
                      boxShadow: showOrderHistory
                        ? "0 4px 12px rgba(16,185,129,0.3)"
                        : "0 4px 12px rgba(245,158,11,0.3)",
                      transition: "all 0.2s"
                    }}
                  >
                    {showOrderHistory ? "Hide Order History" : "Order History"}
                  </button>
                )}
                <button
                  onClick={() => {
                    setUserRole(null);
                    setCart([]);
                    showToast("Logged out", "error");
                  }}
                  style={{
                    padding: "10px 20px",
                    background: "rgba(107, 114, 128, 0.2)",
                    color: "#9ca3af",
                    border: "1px solid rgba(107, 114, 128, 0.3)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    letterSpacing: "0.3px",
                    transition: "all 0.2s"
                  }}
                >
                  Logout
                </button>
                {userRole === 'admin' && (
                  <>
                    <button
                      onClick={async () => {
                        await axios.post(`${process.env.REACT_APP_API_URL}/api/products/finish`);
                        loadProducts();
                        showToast("Day finished successfully!");
                      }}
                      style={{
                        padding: "10px 20px",
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600",
                        letterSpacing: "0.3px",
                        boxShadow: "0 4px 12px rgba(16,185,129,0.3)"
                      }}
                    >
                      Finish Day
                    </button>
                    <button
                      onClick={async () => {
                        if (!window.confirm("Are you sure? This will reset ALL products!")) return;
                        await axios.post(`${process.env.REACT_APP_API_URL}/api/products/reset`);
                        loadProducts();
                        showToast("All data reset!", "error");
                      }}
                      style={{
                        padding: "10px 20px",
                        background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600",
                        letterSpacing: "0.3px",
                        boxShadow: "0 4px 12px rgba(220,38,38,0.3)"
                      }}
                    >
                      Reset
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {userRole === 'admin' && showOrderHistory && (
          <div style={{
            background: "rgba(30, 30, 45, 0.6)",
            padding: "24px",
            borderRadius: "16px",
            marginBottom: "30px",
            border: "1px solid rgba(255,255,255,0.08)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, color: "#e5e7eb", fontSize: "16px", fontWeight: "600" }}>
                All Order History
              </h3>
              <button
                onClick={deleteAllOrders}
                style={{
                  padding: "8px 16px",
                  background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                  letterSpacing: "0.3px",
                  boxShadow: "0 4px 12px rgba(220,38,38,0.3)"
                }}
              >
                Delete All Records
              </button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#9ca3af", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Sr No.</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#9ca3af", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Date & Time</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#9ca3af", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Product</th>
                    <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "#9ca3af", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Qty</th>
                    <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "#9ca3af", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Type</th>
                    <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "#9ca3af", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Cash/UPI</th>  {/* ✅ NEW COLUMN */}
                    <th style={{ padding: "12px", textAlign: "right", fontWeight: "600", color: "#9ca3af", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Total</th>
                    <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "#9ca3af", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr key={order._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "12px", color: "#e5e7eb" }}>{orders.length - index}</td>
                      <td style={{ padding: "12px", color: "#e5e7eb" }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })} {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: "12px", color: "#e5e7eb" }}>
                        {order.items.map(item => `${item.productName} (${item.qty})`).join(', ')}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center", color: "#e5e7eb" }}>
                        {order.items.reduce((sum, item) => sum + item.qty, 0)}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <span style={{ fontSize: "20px" }}>
                          {order.orderType === 'zomato' ? '🛵' : '🏪'}
                        </span>
                      </td>
                      {/* ✅ NEW CELL - Cash/UPI Column */}
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        {order.orderType === 'foushack' && order.paymentMethod ? (
                          <span style={{ fontSize: "20px" }}>
                            {order.paymentMethod === 'cash' ? '💵' : '📱'}
                          </span>
                        ) : (
                          <span style={{ fontSize: "14px", color: "#6b7280" }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right", fontWeight: "600", color: "#10b981" }}>
                        ₹{order.totalPrice}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <button
                          onClick={() => deleteOrder(order._id)}
                          style={{
                            width: "32px",
                            height: "32px",
                            background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "600",
                            boxShadow: "0 2px 8px rgba(220,38,38,0.3)"
                          }}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {userRole === 'sales' && (
          <>
            <div style={{ display: "flex", gap: "16px", marginBottom: "30px", alignItems: "flex-start" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  id="salesSearchInput"
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "24px 28px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    fontSize: "24px",
                    background: "rgba(255,255,255,0.05)",
                    color: "#e5e7eb",
                    boxSizing: "border-box",
                    fontWeight: "500"
                  }}
                />
                {searchTerm && getFilteredProducts().length > 0 && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    marginTop: "8px",
                    background: "rgba(20, 20, 30, 0.98)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    maxHeight: "400px",
                    overflowY: "auto",
                    zIndex: 100,
                    padding: "8px"
                  }}>
                    {getFilteredProducts().map((product, index) => {
                      const remaining = product.stock + product.chef - product.sales - product.zomato;
                      return (
                        <div
                          key={product._id}
                          onClick={() => addToCart(product)}
                          style={{
                            padding: "16px 20px",
                            background: selectedIndex === index
                              ? "rgba(139, 92, 246, 0.2)"
                              : "rgba(255,255,255,0.03)",
                            borderRadius: "8px",
                            marginBottom: "6px",
                            cursor: "pointer",
                            border: selectedIndex === index
                              ? "2px solid rgba(139, 92, 246, 0.5)"
                              : "1px solid rgba(255,255,255,0.05)",
                            transition: "all 0.2s",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <div>
                            <div style={{ fontSize: "18px", fontWeight: "600", color: "#e5e7eb", marginBottom: "4px" }}>
                              {product.name}
                            </div>
                            <div style={{ fontSize: "14px", color: "#9ca3af" }}>
                              Price: ₹{product.price || 200} | Stock: {remaining}
                            </div>
                          </div>
                          {selectedIndex === index && (
                            <div style={{
                              fontSize: "12px",
                              color: "#8b5cf6",
                              fontWeight: "600",
                              background: "rgba(139, 92, 246, 0.15)",
                              padding: "6px 12px",
                              borderRadius: "6px"
                            }}>
                              Press Enter
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{
                background: "rgba(30, 30, 45, 0.8)",
                padding: "20px 28px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                minWidth: "220px"
              }}>
                <div style={{ fontSize: "40px" }}>🛒</div>
                <div>
                  <div style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "4px" }}>Cart</div>
                  <div style={{ fontSize: "20px", fontWeight: "700", color: "#10b981" }}>
                    {cart.length} items | ₹{getCartTotal()}
                  </div>
                </div>
              </div>
            </div>

            {cart.length > 0 && (
              <>
                <div style={{
                  background: "rgba(30, 30, 45, 0.6)",
                  padding: "24px",
                  borderRadius: "16px",
                  marginBottom: "20px",
                  border: "1px solid rgba(255,255,255,0.08)"
                }}>
                  <h3 style={{ margin: "0 0 16px 0", color: "#e5e7eb", fontSize: "16px", fontWeight: "600" }}>
                    Cart Items
                  </h3>
                  {cart.map((item, index) => (
                    <div key={index} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "8px",
                      marginBottom: "8px"
                    }}>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: "600", color: "#e5e7eb" }}>
                          {item.product.name} x {item.qty}
                        </div>
                        <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
                          ₹{item.product.price * item.qty}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <button
                          onClick={() => {
                            if (item.qty > 1) {
                              setCart(cart.map((cartItem, i) =>
                                i === index ? { ...cartItem, qty: cartItem.qty - 1 } : cartItem
                              ));
                            }
                          }}
                          style={{
                            width: "32px",
                            height: "32px",
                            border: "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "16px",
                            color: "#9ca3af",
                            fontWeight: "600"
                          }}
                        >
                          −
                        </button>
                        <button
                          onClick={() => {
                            // ✅ FIXED: Check stock before incrementing
                            const currentProduct = products.find(p => p._id === item.product._id);
                            if (currentProduct) {
                              const remaining = currentProduct.stock + currentProduct.chef - currentProduct.sales - currentProduct.zomato;
                              if (item.qty < remaining) {
                                setCart(cart.map((cartItem, i) =>
                                  i === index ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem
                                ));
                              } else {
                                showToast("No stock available!", "error");
                              }
                            }
                          }}
                          style={{
                            width: "32px",
                            height: "32px",
                            border: "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "16px",
                            color: "#9ca3af",
                            fontWeight: "600"
                          }}
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(index)}
                          style={{
                            background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600"
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {!showPaymentOptions ? (
                  <div style={{ display: "flex", gap: "16px", marginBottom: "30px" }}>
                    <div
                      onClick={() => placeOrder("zomato")}
                      style={{
                        flex: 1,
                        padding: "40px",
                        borderRadius: "16px",
                        border: selectedOrderType === 'zomato'
                          ? "3px solid rgba(239, 68, 68, 0.8)"
                          : "2px solid rgba(239, 68, 68, 0.3)",
                        background: selectedOrderType === 'zomato'
                          ? "linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(220, 38, 38, 0.25) 100%)"
                          : "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all 0.3s",
                        boxShadow: selectedOrderType === 'zomato'
                          ? "0 8px 32px rgba(239, 68, 68, 0.5)"
                          : "0 4px 20px rgba(239, 68, 68, 0.2)",
                        transform: selectedOrderType === 'zomato' ? "scale(1.02)" : "scale(1)"
                      }}
                      onMouseEnter={(e) => {
                        if (selectedOrderType !== 'zomato') {
                          e.currentTarget.style.transform = "scale(1.05)";
                          e.currentTarget.style.boxShadow = "0 8px 32px rgba(239, 68, 68, 0.4)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedOrderType !== 'zomato') {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow = "0 4px 20px rgba(239, 68, 68, 0.2)";
                        }
                      }}
                    >
                      <div style={{ fontSize: "60px", marginBottom: "16px" }}>🛵</div>
                      <div style={{ fontSize: "24px", fontWeight: "700", color: "#ef4444", marginBottom: "8px" }}>
                        Zomato Order
                      </div>
                      <div style={{ fontSize: "16px", color: "#9ca3af" }}>
                        ₹{getCartTotal()}
                      </div>
                    </div>

                    <div
                      onClick={() => setShowPaymentOptions(true)}
                      style={{
                        flex: 1,
                        padding: "40px",
                        borderRadius: "16px",
                        border: selectedOrderType === 'foushack'
                          ? "3px solid rgba(16, 185, 129, 0.8)"
                          : "2px solid rgba(16, 185, 129, 0.3)",
                        background: selectedOrderType === 'foushack'
                          ? "linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.25) 100%)"
                          : "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all 0.3s",
                        boxShadow: selectedOrderType === 'foushack'
                          ? "0 8px 32px rgba(16, 185, 129, 0.5)"
                          : "0 4px 20px rgba(16, 185, 129, 0.2)",
                        transform: selectedOrderType === 'foushack' ? "scale(1.02)" : "scale(1)"
                      }}
                      onMouseEnter={(e) => {
                        if (selectedOrderType !== 'foushack') {
                          e.currentTarget.style.transform = "scale(1.05)";
                          e.currentTarget.style.boxShadow = "0 8px 32px rgba(16, 185, 129, 0.4)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedOrderType !== 'foushack') {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow = "0 4px 20px rgba(16, 185, 129, 0.2)";
                        }
                      }}
                    >
                      <div style={{ fontSize: "60px", marginBottom: "16px" }}>🏪</div>
                      <div style={{ fontSize: "24px", fontWeight: "700", color: "#10b981", marginBottom: "8px" }}>
                        FouShack Order
                      </div>
                      <div style={{ fontSize: "16px", color: "#9ca3af" }}>
                        ₹{getCartTotal()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "16px", marginBottom: "30px" }}>
                    <div
                      onClick={() => placeOrder("foushack", "cash")}
                      style={{
                        flex: 1,
                        padding: "40px",
                        borderRadius: "16px",
                        border: selectedPaymentMethod === 'cash'
                          ? "3px solid rgba(59, 130, 246, 0.8)"
                          : "2px solid rgba(59, 130, 246, 0.3)",
                        background: selectedPaymentMethod === 'cash'
                          ? "linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.25) 100%)"
                          : "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all 0.3s",
                        boxShadow: selectedPaymentMethod === 'cash'
                          ? "0 8px 32px rgba(59, 130, 246, 0.5)"
                          : "0 4px 20px rgba(59, 130, 246, 0.2)",
                        transform: selectedPaymentMethod === 'cash' ? "scale(1.02)" : "scale(1)"
                      }}
                    >
                      <div style={{ fontSize: "60px", marginBottom: "16px" }}>💵</div>
                      <div style={{ fontSize: "24px", fontWeight: "700", color: "#3b82f6", marginBottom: "8px" }}>
                        Cash Payment
                      </div>
                      <div style={{ fontSize: "16px", color: "#9ca3af" }}>
                        ₹{getCartTotal()}
                      </div>
                    </div>

                    <div
                      onClick={() => placeOrder("foushack", "upi")}
                      style={{
                        flex: 1,
                        padding: "40px",
                        borderRadius: "16px",
                        border: selectedPaymentMethod === 'upi'
                          ? "3px solid rgba(139, 92, 246, 0.8)"
                          : "2px solid rgba(139, 92, 246, 0.3)",
                        background: selectedPaymentMethod === 'upi'
                          ? "linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(124, 58, 237, 0.25) 100%)"
                          : "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all 0.3s",
                        boxShadow: selectedPaymentMethod === 'upi'
                          ? "0 8px 32px rgba(139, 92, 246, 0.5)"
                          : "0 4px 20px rgba(139, 92, 246, 0.2)",
                        transform: selectedPaymentMethod === 'upi' ? "scale(1.02)" : "scale(1)"
                      }}
                    >
                      <div style={{ fontSize: "60px", marginBottom: "16px" }}>📱</div>
                      <div style={{ fontSize: "24px", fontWeight: "700", color: "#8b5cf6", marginBottom: "8px" }}>
                        UPI Payment
                      </div>
                      <div style={{ fontSize: "16px", color: "#9ca3af" }}>
                        ₹{getCartTotal()}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div style={{
              background: "rgba(30, 30, 45, 0.6)",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.08)"
            }}>
              <h3 style={{ margin: "0 0 16px 0", color: "#e5e7eb", fontSize: "16px", fontWeight: "600" }}>
                Today's Orders
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#9ca3af", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Sr No.</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#9ca3af", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Date & Time</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#9ca3af", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Product</th>
                      <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "#9ca3af", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Qty</th>
                      <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "#9ca3af", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Type</th>
                      <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "#9ca3af", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Cash/UPI</th>  {/* ✅ NEW COLUMN */}
                      <th style={{ padding: "12px", textAlign: "right", fontWeight: "600", color: "#9ca3af", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTodayOrders().map((order, index) => (
                      <tr key={order._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "12px", color: "#e5e7eb" }}>{getTodayOrders().length - index}</td>
                        <td style={{ padding: "12px", color: "#e5e7eb" }}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })} {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: "12px", color: "#e5e7eb" }}>
                          {order.items.map(item => `${item.productName} (${item.qty})`).join(', ')}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center", color: "#e5e7eb" }}>
                          {order.items.reduce((sum, item) => sum + item.qty, 0)}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <span style={{ fontSize: "20px" }}>
                            {order.orderType === 'zomato' ? '🛵' : '🏪'}
                          </span>
                        </td>
                        {/* ✅ NEW CELL - Cash/UPI Column */}
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          {order.orderType === 'foushack' && order.paymentMethod ? (
                            <span style={{ fontSize: "20px" }}>
                              {order.paymentMethod === 'cash' ? '💵' : '📱'}
                            </span>
                          ) : (
                            <span style={{ fontSize: "14px", color: "#6b7280" }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: "12px", textAlign: "right", fontWeight: "600", color: "#10b981" }}>
                          ₹{order.totalPrice}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {userRole === 'admin' ? (
          <div style={{
            display: "flex",
            gap: "20px",
            marginBottom: "40px"
          }}>
            {/* CAPITAL Box */}
            <div style={{
              flex: 1,
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)",
              padding: "30px",
              borderRadius: "16px",
              textAlign: "center",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              boxShadow: "0 8px 32px rgba(59, 130, 246, 0.1)"
            }}>
              <div style={{
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#93c5fd",
                letterSpacing: "1.5px",
                textTransform: "uppercase"
              }}>
                Capital
              </div>
              <div style={{
                fontSize: "48px",
                fontWeight: "800",
                color: "#3b82f6",
                letterSpacing: "-1px"
              }}>
                ₹{products.reduce((total, p) => total + ((p.price || 200) * p.stock), 0).toFixed(2)}
              </div>
              <div style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "#93c5fd",
                marginTop: "8px",
                letterSpacing: "0.5px"
              }}>
                Total Stock Value
              </div>
            </div>

            {/* TOTAL REVENUE Box */}
            <div style={{
              flex: 1,
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)",
              padding: "30px",
              borderRadius: "16px",
              textAlign: "center",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              boxShadow: "0 8px 32px rgba(16, 185, 129, 0.1)"
            }}>
              <div style={{
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#6ee7b7",
                letterSpacing: "1.5px",
                textTransform: "uppercase"
              }}>
                Total Revenue
              </div>
              <div style={{
                fontSize: "48px",
                fontWeight: "800",
                color: "#10b981",
                letterSpacing: "-1px"
              }}>
                ₹{calculateTotalRevenue().toFixed(2)}
              </div>
              <div style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "#6ee7b7",
                marginTop: "8px",
                letterSpacing: "0.5px"
              }}>
                Sales + Zomato Combined
              </div>
            </div>
          </div>
        ) : userRole !== 'chef' && userRole !== 'sales' && (
          <div style={{
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)",
            padding: "30px",
            borderRadius: "16px",
            marginBottom: "40px",
            textAlign: "center",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            boxShadow: "0 8px 32px rgba(16, 185, 129, 0.1)"
          }}>
            <div style={{
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "12px",
              color: "#6ee7b7",
              letterSpacing: "1.5px",
              textTransform: "uppercase"
            }}>
              Total Revenue
            </div>
            <div style={{
              fontSize: "48px",
              fontWeight: "800",
              color: "#10b981",
              letterSpacing: "-1px"
            }}>
              ₹{calculateTotalRevenue().toFixed(2)}
            </div>
            <div style={{
              fontSize: "12px",
              fontWeight: "500",
              color: "#6ee7b7",
              marginTop: "8px",
              letterSpacing: "0.5px"
            }}>
              Sales + Zomato Combined
            </div>
          </div>
        )}

        {userRole === 'admin' && (
          <>
            <div style={{
              background: "rgba(30, 30, 45, 0.6)",
              padding: "28px",
              borderRadius: "16px",
              marginBottom: "30px",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(10px)"
            }}>
              <h3 style={{
                margin: "0 0 20px 0",
                color: "#e5e7eb",
                fontSize: "16px",
                fontWeight: "600",
                letterSpacing: "0.5px"
              }}>
                Add New Product
              </h3>
              <form onSubmit={addProduct} style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Product Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    flex: "1",
                    minWidth: "150px",
                    background: "rgba(255,255,255,0.05)",
                    color: "#e5e7eb",
                    transition: "all 0.2s"
                  }}
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    width: "80px",
                    background: "rgba(255,255,255,0.05)",
                    color: "#e5e7eb"
                  }}
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    width: "100px",
                    background: "rgba(255,255,255,0.05)",
                    color: "#e5e7eb"
                  }}
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    minWidth: "150px",
                    background: "rgba(30, 30, 45, 0.8)",
                    color: "#e5e7eb"
                  }}
                >
                  <option value="" style={{ background: "rgba(30, 30, 45, 1)" }}>Select Category</option>
                  {categories.map((c) => (
                    <option key={c} value={c} style={{ background: "rgba(30, 30, 45, 1)" }}>{c}</option>
                  ))}
                  <option value="new" style={{ background: "rgba(30, 30, 45, 1)" }}>+ New Category</option>
                </select>
                {category === "new" && (
                  <input
                    type="text"
                    placeholder="New Category Name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{
                      padding: "10px 14px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      fontSize: "14px",
                      minWidth: "150px",
                      background: "rgba(255,255,255,0.05)",
                      color: "#ffffff"
                    }}
                  />
                )}
                <button
                  type="submit"
                  style={{
                    padding: "10px 24px",
                    background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    letterSpacing: "0.3px",
                    boxShadow: "0 4px 12px rgba(139,92,246,0.3)"
                  }}
                >
                  Add Product
                </button>
              </form>
            </div>

            <div style={{
              background: "rgba(30, 30, 45, 0.6)",
              padding: "28px",
              borderRadius: "16px",
              marginBottom: "40px",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(10px)"
            }}>
              <h3 style={{
                margin: "0 0 12px 0",
                color: "#e5e7eb",
                fontSize: "16px",
                fontWeight: "600",
                letterSpacing: "0.5px"
              }}>
                Bulk Add Products
              </h3>
              <p style={{
                fontSize: "12px",
                color: "#9ca3af",
                margin: "0 0 16px 0",
                fontWeight: "400"
              }}>
                Format: Name,Stock,Category,Price (one per line)
              </p>
              <textarea
                placeholder="Puff,20,Bakery,150&#10;Bun,50,Bakery,100&#10;Roll,10,Snacks,200"
                value={multiProducts}
                onChange={(e) => setMultiProducts(e.target.value)}
                rows="4"
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontFamily: "'Fira Code', 'Courier New', monospace",
                  marginBottom: "16px",
                  boxSizing: "border-box",
                  background: "rgba(255,255,255,0.05)",
                  color: "#e5e7eb",
                  resize: "vertical"
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
                  loadCategories();
                  showToast("All products added successfully!");
                }}
                style={{
                  padding: "10px 24px",
                  background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  letterSpacing: "0.3px",
                  boxShadow: "0 4px 12px rgba(139,92,246,0.3)"
                }}
              >
                Add All Products
              </button>
            </div>
          </>
        )}

        {userRole !== 'sales' && categories.map((cat, catIndex) => {
          const bgColor = `rgba(${30 + catIndex * 5}, ${30 + catIndex * 5}, ${45 + catIndex * 5}, 0.4)`;

          const categoryProducts = products.filter(p => (p.category || "Uncategorized") === cat);
          const totals = categoryProducts.reduce((acc, p) => ({
            stock: acc.stock + p.stock,
            admin: acc.admin + p.admin,
            chef: acc.chef + p.chef,
            sales: acc.sales + p.sales,
            zomato: acc.zomato + p.zomato
          }), { stock: 0, admin: 0, chef: 0, sales: 0, zomato: 0 });

          const totalRemaining = totals.stock + totals.chef - totals.sales - totals.zomato;
          const totalTask = totals.admin - totals.chef;

          return (
            <div
              key={cat}
              style={{ marginBottom: "35px" }}
              draggable={userRole === 'admin'}
              onDragStart={(e) => handleCategoryDragStart(e, cat)}
              onDragOver={handleCategoryDragOver}
              onDrop={(e) => handleCategoryDrop(e, cat)}
            >
              <h3 style={{
                color: "#ffffff",
                fontSize: "18px",
                fontWeight: "700",
                marginBottom: "16px",
                paddingBottom: "12px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                letterSpacing: "0.3px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: userRole === 'admin' ? 'move' : 'default'
              }}>
                {userRole === 'admin' && (
                  <span style={{
                    fontSize: "20px",
                    color: "#9ca3af",
                    userSelect: "none"
                  }}>
                    ⋮⋮
                  </span>
                )}
                {editingCategoryName === cat ? (
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <input
                      type="text"
                      value={editingCategoryValue}
                      onChange={(e) => setEditingCategoryValue(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          updateCategoryName(cat, editingCategoryValue);
                        }
                      }}
                      style={{
                        padding: "6px 10px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "6px",
                        fontSize: "16px",
                        background: "rgba(255,255,255,0.05)",
                        color: "#e5e7eb"
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => updateCategoryName(cat, editingCategoryValue)}
                      style={{
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: "600"
                      }}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setEditingCategoryName(null)}
                      style={{
                        background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: "600"
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{cat}</span>
                    {userRole === 'admin' && (
                      <>
                        <button
                          onClick={() => {
                            setEditingCategoryName(cat);
                            setEditingCategoryValue(cat);
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "15px",
                            padding: "4px",
                            color: "#9ca3af",
                            transition: "color 0.2s"
                          }}
                          title="Edit category name"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => deleteCategory(cat)}
                          style={{
                            background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            padding: "4px 10px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                            boxShadow: "0 2px 8px rgba(220,38,38,0.3)"
                          }}
                          title="Delete category"
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </>
                )}
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                  background: "transparent"
                }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                      <th style={{
                        padding: "14px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "#9ca3af",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        fontSize: "12px",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase"
                      }}>Product</th>
                      {userRole === 'admin' && <th style={{
                        padding: "14px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#9ca3af",
                        width: "110px",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        fontSize: "12px",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase"
                      }}>Price</th>}
                      <th style={{
                        padding: "14px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#9ca3af",
                        width: "80px",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        fontSize: "12px",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase"
                      }}>Stock</th>
                      <th style={{
                        padding: "14px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#9ca3af",
                        width: "110px",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        fontSize: "12px",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase"
                      }}>Admin</th>
                      <th style={{
                        padding: "14px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#9ca3af",
                        width: "110px",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        fontSize: "12px",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase"
                      }}>Chef</th>
                      {userRole === 'chef' && <th style={{
                        padding: "14px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#9ca3af",
                        width: "110px",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        fontSize: "12px",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase"
                      }}>Task</th>}
                      {userRole !== 'chef' && <th style={{
                        padding: "14px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#9ca3af",
                        width: "110px",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        fontSize: "12px",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase"
                      }}>Sales</th>}
                      {userRole !== 'chef' && <th style={{
                        padding: "14px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#9ca3af",
                        width: "110px",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        fontSize: "12px",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase"
                      }}>Zomato</th>}
                      {userRole !== 'chef' && <th style={{
                        padding: "14px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#9ca3af",
                        width: "90px",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        fontSize: "12px",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase"
                      }}>Remaining</th>}
                      {userRole === 'admin' && <th style={{
                        padding: "14px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#9ca3af",
                        width: "70px",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        fontSize: "12px",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase"
                      }}>Delete</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {categoryProducts.map((p, index) => {
                      const remaining = p.stock + p.chef - p.sales - p.zomato;
                      const task = p.admin - p.chef;
                      return (
                        <tr
                          key={p._id}
                          draggable={userRole === 'admin'}
                          onDragStart={(e) => handleDragStart(e, p, cat)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, p, cat)}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                            background: bgColor,
                            transition: "all 0.2s",
                            cursor: userRole === 'admin' ? 'move' : 'default'
                          }}
                        >
                          <td style={{ padding: "14px", fontWeight: "500", color: "#e5e7eb" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {userRole === 'admin' && (
                                <span style={{
                                  fontSize: "18px",
                                  color: "#9ca3af",
                                  cursor: "move",
                                  userSelect: "none"
                                }}>
                                  ⋮⋮
                                </span>
                              )}
                              {userRole === 'admin' && (
                                <button
                                  onClick={() => {
                                    setEditingProductId(p._id);
                                    setEditingName(p.name);
                                  }}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "15px",
                                    padding: "4px",
                                    color: "#9ca3af",
                                    transition: "color 0.2s"
                                  }}
                                  title="Edit name"
                                >
                                  ✎
                                </button>
                              )}
                              {editingProductId === p._id ? (
                                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                  <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        updateProductName(p._id, editingName);
                                      }
                                    }}
                                    style={{
                                      padding: "6px 10px",
                                      border: "1px solid rgba(255,255,255,0.1)",
                                      borderRadius: "6px",
                                      fontSize: "14px",
                                      width: "150px",
                                      background: "rgba(255,255,255,0.05)",
                                      color: "#e5e7eb"
                                    }}
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => updateProductName(p._id, editingName)}
                                    style={{
                                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "6px",
                                      padding: "6px 10px",
                                      cursor: "pointer",
                                      fontSize: "11px",
                                      fontWeight: "600"
                                    }}
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={() => setEditingProductId(null)}
                                    style={{
                                      background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "6px",
                                      padding: "6px 10px",
                                      cursor: "pointer",
                                      fontSize: "11px",
                                      fontWeight: "600"
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: "14px" }}>
                                  {p.name}
                                </span>
                              )}
                            </div>
                          </td>
                          {userRole === 'admin' && (
                            <td style={{ padding: "14px", textAlign: "center" }}>
                              {editingPriceId === p._id ? (
                                <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }}>
                                  <input
                                    type="number"
                                    value={editingPrice}
                                    onChange={(e) => setEditingPrice(e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        updateProductPrice(p._id, editingPrice);
                                      }
                                    }}
                                    style={{
                                      padding: "6px 10px",
                                      border: "1px solid rgba(255,255,255,0.1)",
                                      borderRadius: "6px",
                                      fontSize: "13px",
                                      width: "70px",
                                      background: "rgba(255,255,255,0.05)",
                                      color: "#e5e7eb"
                                    }}
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => updateProductPrice(p._id, editingPrice)}
                                    style={{
                                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "6px",
                                      padding: "6px 8px",
                                      cursor: "pointer",
                                      fontSize: "11px",
                                      fontWeight: "600"
                                    }}
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={() => setEditingPriceId(null)}
                                    style={{
                                      background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "6px",
                                      padding: "6px 8px",
                                      cursor: "pointer",
                                      fontSize: "11px",
                                      fontWeight: "600"
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
                                  <span style={{ fontWeight: "600", color: "#10b981" }}>₹{p.price || 200}</span>
                                  <button
                                    onClick={() => {
                                      setEditingPriceId(p._id);
                                      setEditingPrice(p.price || 200);
                                    }}
                                    style={{
                                      background: "transparent",
                                      border: "none",
                                      cursor: "pointer",
                                      fontSize: "13px",
                                      padding: "4px",
                                      color: "#9ca3af"
                                    }}
                                    title="Edit price"
                                  >
                                    ✎
                                  </button>
                                </div>
                              )}
                            </td>
                          )}
                          <td style={{ padding: "14px", textAlign: "center" }}>
                            {userRole === 'admin' ? (
                              <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "center" }}>
                                <button
                                  onClick={() => updateValue(p._id, "stock", -1)}
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    background: "rgba(255,255,255,0.05)",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    color: "#9ca3af",
                                    fontWeight: "600",
                                    transition: "all 0.2s"
                                  }}
                                >
                                  −
                                </button>
                                <span style={{ fontWeight: "600", minWidth: "30px", textAlign: "center", color: "#9ca3af" }}>{p.stock}</span>
                                <button
                                  onClick={() => updateValue(p._id, "stock", 1)}
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    background: "rgba(255,255,255,0.05)",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    color: "#9ca3af",
                                    fontWeight: "600",
                                    transition: "all 0.2s"
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontWeight: "600", color: "#9ca3af" }}>{p.stock}</span>
                            )}
                          </td>
                          <td style={{ padding: "14px", textAlign: "center" }}>
                            {userRole === 'admin' ? (
                              <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "center" }}>
                                <button
                                  onClick={() => updateValue(p._id, "admin", -1)}
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    background: "rgba(255,255,255,0.05)",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    color: "#9ca3af",
                                    fontWeight: "600"
                                  }}
                                >
                                  −
                                </button>
                                <span style={{ fontWeight: "600", minWidth: "30px", textAlign: "center", color: "#e5e7eb" }}>{p.admin}</span>
                                <button
                                  onClick={() => updateValue(p._id, "admin", 1)}
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    background: "rgba(255,255,255,0.05)",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    color: "#9ca3af",
                                    fontWeight: "600"
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontWeight: "600", color: "#e5e7eb" }}>{p.admin}</span>
                            )}
                          </td>
                          <td style={{
                            padding: "14px",
                            textAlign: "center",
                            background: p.admin === 0
                              ? "transparent"
                              : p.chef < p.admin
                                ? "rgba(220, 38, 38, 0.15)"
                                : "rgba(16, 185, 129, 0.15)",
                            borderLeft: p.admin > 0 && p.chef < p.admin
                              ? "2px solid rgba(220, 38, 38, 0.3)"
                              : p.admin > 0 && p.chef >= p.admin
                                ? "2px solid rgba(16, 185, 129, 0.3)"
                                : "none"
                          }}>
                            {userRole === 'admin' || userRole === 'chef' ? (
                              <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "center" }}>
                                <button
                                  onClick={() => updateValue(p._id, "chef", -1)}
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    background: "rgba(255,255,255,0.05)",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    color: "#9ca3af",
                                    fontWeight: "600"
                                  }}
                                >
                                  −
                                </button>
                                <span style={{ fontWeight: "600", minWidth: "30px", textAlign: "center", color: "#e5e7eb" }}>{p.chef}</span>
                                <button
                                  onClick={() => updateValue(p._id, "chef", 1)}
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    background: "rgba(255,255,255,0.05)",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    color: "#9ca3af",
                                    fontWeight: "600"
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontWeight: "600", color: "#e5e7eb" }}>{p.chef}</span>
                            )}
                          </td>
                          {userRole === 'chef' && (
                            <td style={{
                              padding: "14px",
                              textAlign: "center",
                              fontWeight: "700",
                              fontSize: "17px",
                              color: task > 0 ? "#ef4444" : "#10b981",
                              letterSpacing: "-0.5px"
                            }}>
                              {task}
                            </td>
                          )}
                          {userRole !== 'chef' && (
                            <td style={{ padding: "14px", textAlign: "center" }}>
                              {userRole === 'admin' ? (
                                <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "center" }}>
                                  <button
                                    onClick={() => updateValue(p._id, "sales", -1)}
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      border: "1px solid rgba(255,255,255,0.1)",
                                      background: "rgba(255,255,255,0.05)",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                      fontSize: "16px",
                                      color: "#9ca3af",
                                      fontWeight: "600"
                                    }}
                                  >
                                    −
                                  </button>
                                  <span style={{ fontWeight: "600", minWidth: "30px", textAlign: "center", color: "#e5e7eb" }}>{p.sales}</span>
                                  <button
                                    onClick={() => updateValue(p._id, "sales", 1)}
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      border: "1px solid rgba(255,255,255,0.1)",
                                      background: "rgba(255,255,255,0.05)",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                      fontSize: "16px",
                                      color: "#9ca3af",
                                      fontWeight: "600"
                                    }}
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontWeight: "600", color: "#e5e7eb" }}>{p.sales}</span>
                              )}
                            </td>
                          )}
                          {userRole !== 'chef' && (
                            <td style={{ padding: "14px", textAlign: "center" }}>
                              {userRole === 'admin' ? (
                                <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "center" }}>
                                  <button
                                    onClick={() => updateValue(p._id, "zomato", -1)}
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      border: "1px solid rgba(255,255,255,0.1)",
                                      background: "rgba(255,255,255,0.05)",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                      fontSize: "16px",
                                      color: "#9ca3af",
                                      fontWeight: "600"
                                    }}
                                  >
                                    −
                                  </button>
                                  <span style={{ fontWeight: "600", minWidth: "30px", textAlign: "center", color: "#e5e7eb" }}>{p.zomato}</span>
                                  <button
                                    onClick={() => updateValue(p._id, "zomato", 1)}
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      border: "1px solid rgba(255,255,255,0.1)",
                                      background: "rgba(255,255,255,0.05)",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                      fontSize: "16px",
                                      color: "#9ca3af",
                                      fontWeight: "600"
                                    }}
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontWeight: "600", color: "#e5e7eb" }}>{p.zomato}</span>
                              )}
                            </td>
                          )}
                          {userRole !== 'chef' && (
                            <td style={{
                              padding: "14px",
                              textAlign: "center",
                              fontWeight: "700",
                              fontSize: "17px",
                              color: remaining < 0 ? "#ef4444" : "#10b981",
                              letterSpacing: "-0.5px"
                            }}>
                              {remaining}
                            </td>
                          )}
                          {userRole === 'admin' && (
                            <td style={{ padding: "14px", textAlign: "center" }}>
                              <button
                                onClick={() => deleteProduct(p._id)}
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontSize: "15px",
                                  fontWeight: "600",
                                  boxShadow: "0 2px 8px rgba(220,38,38,0.3)",
                                  transition: "all 0.2s"
                                }}
                              >
                                ✕
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    <tr style={{
                      borderTop: "2px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.05)",
                      fontWeight: "700"
                    }}>
                      <td style={{ padding: "14px", fontWeight: "700", color: "#e5e7eb", fontSize: "14px" }}>
                        TOTAL
                      </td>
                      {userRole === 'admin' && <td></td>}
                      <td style={{ padding: "14px", textAlign: "center", fontWeight: "700", color: "#e5e7eb" }}>
                        {totals.stock}
                      </td>
                      <td style={{ padding: "14px", textAlign: "center", fontWeight: "700", color: "#e5e7eb" }}>
                        {totals.admin}
                      </td>
                      <td style={{
                        padding: "14px",
                        textAlign: "center",
                        fontWeight: "700",
                        color: "#e5e7eb",
                        background: totals.admin === 0
                          ? "transparent"
                          : totals.chef < totals.admin
                            ? "rgba(220, 38, 38, 0.3)"
                            : "rgba(16, 185, 129, 0.3)"
                      }}>
                        {totals.chef}
                      </td>
                      {userRole === 'chef' && (
                        <td style={{
                          padding: "14px",
                          textAlign: "center",
                          fontWeight: "700",
                          fontSize: "17px",
                          color: totalTask > 0 ? "#ef4444" : "#10b981",
                          letterSpacing: "-0.5px"
                        }}>
                          {totalTask}
                        </td>
                      )}
                      {userRole !== 'chef' && (
                        <td style={{ padding: "14px", textAlign: "center", fontWeight: "700", color: "#e5e7eb" }}>
                          {totals.sales}
                        </td>
                      )}
                      {userRole !== 'chef' && (
                        <td style={{ padding: "14px", textAlign: "center", fontWeight: "700", color: "#e5e7eb" }}>
                          {totals.zomato}
                        </td>
                      )}
                      {userRole !== 'chef' && (
                        <td style={{
                          padding: "14px",
                          textAlign: "center",
                          fontWeight: "700",
                          fontSize: "17px",
                          color: totalRemaining < 0 ? "#ef4444" : "#10b981",
                          letterSpacing: "-0.5px"
                        }}>
                          {totalRemaining}
                        </td>
                      )}
                      {userRole === 'admin' && <td></td>}
                    </tr>
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