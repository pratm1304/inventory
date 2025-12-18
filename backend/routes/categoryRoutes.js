import express from "express";
import { getCategories, reorderCategories, updateCategoryName, deleteCategory } from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/reorder", reorderCategories);
router.post("/update-name", updateCategoryName);
router.delete("/:name", deleteCategory);

export default router;