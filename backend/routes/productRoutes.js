import express from "express";
import { getProducts, updateField } from "../controllers/productController.js";
import { addProduct } from "../controllers/productController.js";
import { finishDay } from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/update", updateField);
router.post("/add", addProduct);
router.post("/finish", finishDay);


export default router;
