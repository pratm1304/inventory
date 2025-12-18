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
    console.log("REQ BODY:", JSON.stringify(req.body, null, 2));
    
    const { items, orderType } = req.body;
    
    console.log("📦 Received order:", JSON.stringify({ items, orderType }, null, 2));
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid order items" });
    }
    
    // Calculate total price from items
    const totalPrice = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    
    // Create order - items are already formatted correctly from frontend
    const newOrder = await Order.create({
      items: items,
      orderType,
      totalPrice
    });

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

    console.log("✅ Order created:", newOrder._id);
    res.json(newOrder);
  } catch (error) {
    console.error("❌ Order creation error:", error);
    res.status(500).json({ message: error.message });
  }
};