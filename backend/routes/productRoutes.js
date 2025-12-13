import express from "express";
import { getProducts, updateField } from "../controllers/productController.js";
import { addProduct } from "../controllers/productController.js";
import { finishDay } from "../controllers/productController.js";
import { resetData } from "../controllers/productController.js";
import { addMultipleProducts } from "../controllers/productController.js";
import { deleteProduct } from "../controllers/productController.js";
import { updateProductName } from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/update", updateField);
router.post("/add", addProduct);
router.post("/finish", finishDay);
router.post("/reset", resetData);
router.post("/add-multiple", addMultipleProducts);
router.delete("/:id", deleteProduct);
router.post("/update-name", updateProductName);


export default router;