import express from "express";
import { getCategories, reorderCategories } from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/reorder", reorderCategories);

export default router;