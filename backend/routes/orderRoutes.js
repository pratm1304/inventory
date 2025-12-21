import express from "express";
import { getOrders, createOrder, deleteOrder, deleteAllOrders, deleteAllOrdersNoRevert, getTodayOrders  } from "../controllers/orderController.js";

const router = express.Router();

router.get("/", getOrders);
router.get("/today", getTodayOrders); // ✅ NEW ROUTE
router.post("/create", createOrder);
// ✅ FIXED: Proper highlight toggle route
router.patch("/:id/highlight", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the order first
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Toggle the highlight status
    const updatedOrder = await Order.findByIdAndUpdate(
      id, 
      { isHighlighted: !order.isHighlighted },
      { new: true } // Return the updated document
    );
    
    res.json(updatedOrder);
  } catch (error) {
    console.error("❌ Highlight toggle error:", error);
    res.status(500).json({ message: error.message });
  }
});
router.delete("/all/delete-no-revert", deleteAllOrdersNoRevert); // ✅ NEW ROUTE
router.delete("/all/delete", deleteAllOrders); // ✅ NEW DELETE ALL ROUTE
router.delete("/:id", deleteOrder); // ✅ NEW DELETE ROUTE

export default router;