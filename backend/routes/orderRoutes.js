import express from "express";
import { getOrders, createOrder } from "../controllers/orderController.js";

const router = express.Router();

router.get("/", getOrders); // Important: Add this to fetch history
router.post("/create", createOrder);

export default router;