import express from "express";
import { getOrders, createOrder, deleteOrder } from "../controllers/orderController.js";

const router = express.Router();

router.get("/", getOrders);
router.post("/create", createOrder);
router.delete("/:id", deleteOrder); // ✅ NEW DELETE ROUTE

export default router;