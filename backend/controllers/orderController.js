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
    const { items, orderType } = req.body;
    
    console.log("📥 Received order:");
    console.log("  Order Type:", orderType);
    console.log("  Items count:", items?.length);
    console.log("  Full body:", JSON.stringify(req.body, null, 2));
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("❌ Invalid items array");
      return res.status(400).json({ message: "Invalid order items" });
    }
    
    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`  Item ${i}:`, item);
      
      if (!item.productId) {
        console.error(`❌ Missing productId at index ${i}`);
        return res.status(400).json({ message: `Missing productId at index ${i}` });
      }
      if (!item.productName) {
        console.error(`❌ Missing productName at index ${i}`);
        return res.status(400).json({ message: `Missing productName at index ${i}` });
      }
      if (!item.qty) {
        console.error(`❌ Missing qty at index ${i}`);
        return res.status(400).json({ message: `Missing qty at index ${i}` });
      }
      if (!item.price) {
        console.error(`❌ Missing price at index ${i}`);
        return res.status(400).json({ message: `Missing price at index ${i}` });
      }
      if (!item.totalPrice) {
        console.error(`❌ Missing totalPrice at index ${i}`);
        return res.status(400).json({ message: `Missing totalPrice at index ${i}` });
      }
    }
    
    const newOrder = await Order.create({
      items,
      orderType
    });

    console.log("✅ Order created successfully:", newOrder._id);
    res.json(newOrder);
  } catch (error) {
    console.error("❌ Order creation error:", error);
    res.status(500).json({ 
      message: error.message,
      details: error.toString()
    });
  }
};