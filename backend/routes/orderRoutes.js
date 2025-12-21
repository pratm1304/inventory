import express from "express";
import { getOrders, createOrder, deleteOrder, deleteAllOrders, getTodayOrders  } from "../controllers/orderController.js";

const router = express.Router();

router.get("/", getOrders);
router.get("/today", getTodayOrders); // ✅ NEW ROUTE
router.post("/create", createOrder);
router.patch("/:id/highlight", async (req, res) => { // ✅ NEW ROUTE for highlighting
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    await Order.findByIdAndUpdate(id, { isHighlighted: !order.isHighlighted });
    res.json({ message: "Highlight toggled" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/all/delete", deleteAllOrders); // ✅ NEW DELETE ALL ROUTE
router.delete("/:id", deleteOrder); // ✅ NEW DELETE ROUTE

export default router;