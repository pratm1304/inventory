import express from "express";
import { getOrders, createOrder, deleteOrder, deleteAllOrders } from "../controllers/orderController.js";

const router = express.Router();

router.get("/", getOrders);
router.post("/create", createOrder);
router.delete("/all/delete", deleteAllOrders); // ✅ NEW DELETE ALL ROUTE
router.delete("/:id", deleteOrder); // ✅ NEW DELETE ROUTE

export default router;