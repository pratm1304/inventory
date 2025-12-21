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

// Add this new function for getting today's orders only
export const getTodayOrders = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const orders = await Order.find({
      createdAt: { $gte: today, $lte: endOfDay }
    }).sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    console.log("📥 Received:", JSON.stringify(req.body, null, 2));

    const { items, orderType, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid order items" });
    }

    const totalOrderPrice = items.reduce((sum, item) => {
      return sum + (item.totalPrice || 0);
    }, 0);

    const newOrder = await Order.create({
      items: items,
      orderType: orderType,
      paymentMethod: paymentMethod,
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

// Update deleteOrder to undo sales/zomato counts
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Undo the sales/zomato increment
    for (const item of order.items) {
      if (order.orderType === 'foushack') {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { sales: -item.qty }
        });
      } else if (order.orderType === 'zomato') {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { zomato: -item.qty }
        });
      }
    }

    await Order.findByIdAndDelete(id);
    res.json({ message: "Order deleted and counts restored" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update deleteAllOrders to undo all sales/zomato counts
export const deleteAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({});
    
    // ✅ Undo all sales/zomato increments
    for (const order of orders) {
      for (const item of order.items) {
        if (order.orderType === 'foushack') {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { sales: -item.qty }
          });
        } else if (order.orderType === 'zomato') {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { zomato: -item.qty }
          });
        }
      }
    }

    await Order.deleteMany({});
    res.json({ message: "All orders deleted and counts restored" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ NEW: Delete all orders WITHOUT reverting product counts
export const deleteAllOrdersNoRevert = async (req, res) => {
  try {
    // Simply delete orders without touching product counts
    await Order.deleteMany({});
    res.json({ message: "All orders deleted (no revert)" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleHighlight = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Use direct property assignment
    order.isHighlighted = !order.isHighlighted;
    await order.save({ validateBeforeSave: false });
    
    res.json(order);
  } catch (error) {
    console.error("Toggle highlight error:", error);
    res.status(500).json({ message: error.message });
  }
};