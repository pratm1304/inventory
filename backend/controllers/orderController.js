import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
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

    // Calculate total order price
    const totalOrderPrice = items.reduce((sum, item) => {
      return sum + (item.totalPrice || 0);
    }, 0);

    // Create order with totalPrice
    const newOrder = await Order.create({
      items: items,
      orderType: orderType,
      totalPrice: totalOrderPrice  // ✅ THIS IS THE KEY LINE
    });

    console.log("✅ Order created:", newOrder._id);

    // Update product sales/zomato counts
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
    
    // Send more detailed error info
    return res.status(500).json({ 
      message: error.message,
      details: error.toString()
    });
  }
};