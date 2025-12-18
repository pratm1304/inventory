import Order from "../models/orderModel.js";

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(50);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { productId, productName, qty, orderType, price, totalPrice } = req.body;
    const newOrder = await Order.create({
      productId, productName, qty, orderType, price, totalPrice
    });
    res.json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};