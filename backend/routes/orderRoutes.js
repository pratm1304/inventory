import express from "express";
import { getOrders, createOrder, deleteOrder, deleteAllOrders, deleteAllOrdersNoRevert, getTodayOrders, toggleHighlight  } from "../controllers/orderController.js";

const router = express.Router();

router.get("/", getOrders);
router.get("/today", getTodayOrders); // ✅ NEW ROUTE
router.post("/create", createOrder);
router.patch("/:id/highlight", toggleHighlight); // ✅ Use controller function
router.delete("/all/delete-no-revert", deleteAllOrdersNoRevert); // ✅ NEW ROUTE
router.delete("/all/delete", deleteAllOrders); // ✅ NEW DELETE ALL ROUTE
router.delete("/:id", deleteOrder); // ✅ NEW DELETE ROUTE

export default router;