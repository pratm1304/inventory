import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

export const getOrders = async (req, res) => {
  try {
    const { date } = req.query;
    let query = {};
    
    // ✅ Filter by date if provided (for sales view)
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }
    
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    console.log("📥 Received:", JSON.stringify(req.body, null, 2));

    const { items, orderType } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid order items" });
    }

    const totalOrderPrice = items.reduce((sum, item) => {
      return sum + (item.totalPrice || 0);
    }, 0);

    const newOrder = await Order.create({
      items: items,
      orderType: orderType,
      totalPrice: totalOrderPrice
    });

    console.log("✅ Order created:", newOrder._id);

    // ✅ Update product sales/zomato counts based on order type
    for (const item of items) {
      if (orderType === 'foushack') {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { sales: item.qty }
        });
      } else if (orderType === 'zomato') {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { zomato: item.qty }
        });
      }
    }

    return res.json(newOrder);
  } catch (error) {
    console.error("❌ Order creation error:", error);
    
    return res.status(500).json({ 
      message: error.message,
      details: error.toString()
    });
  }
};

// ✅ NEW: Delete order endpoint
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndDelete(id);
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};