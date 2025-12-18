import express from "express";
import { 
  getProducts, 
  updateField, 
  addProduct, 
  finishDay, 
  resetData, 
  addMultipleProducts, 
  deleteProduct,
  updateProductName,
  updateProductPrice,
  reorderProducts  // NEW IMPORT
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/update", updateField);
router.post("/update-name", updateProductName);
router.post("/update-price", updateProductPrice);
router.post("/add", addProduct);
router.post("/finish", finishDay);
router.post("/reset", resetData);
router.post("/add-multiple", addMultipleProducts);
router.post("/reorder", reorderProducts);  // NEW ROUTE
router.delete("/:id", deleteProduct);

export default router;