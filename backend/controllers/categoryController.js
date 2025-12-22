import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js"; // ✅ ADDED THIS IMPORT

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reorderCategories = async (req, res) => {
  try {
    const { draggedName, targetName } = req.body;

    const allCategories = await Category.find({}).sort({ order: 1 });

    const draggedIndex = allCategories.findIndex(c => c.name === draggedName);
    const targetIndex = allCategories.findIndex(c => c.name === targetName);

    if (draggedIndex === -1 || targetIndex === -1) {
      return res.status(404).json({ message: "Categories not found" });
    }

    const [removed] = allCategories.splice(draggedIndex, 1);
    allCategories.splice(targetIndex, 0, removed);

    for (let i = 0; i < allCategories.length; i++) {
      await Category.findByIdAndUpdate(allCategories[i]._id, { order: i });
    }

    req.app.get("io").emit("categoriesReordered");
res.json({ message: "Categories reordered successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategoryName = async (req, res) => {
  try {
    const { oldName, newName } = req.body;
    
    if (!newName || !newName.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Update category in Category collection
    await Category.updateOne({ name: oldName }, { name: newName.trim() });

    // Update all products in this category
    await Product.updateMany({ category: oldName }, { category: newName.trim() });

    req.app.get("io").emit("categoryUpdated", { oldName, newName });
res.json({ message: "Category name updated successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { name } = req.params;

    await Product.deleteMany({ category: name });
    await Category.deleteOne({ name });

req.app.get("io").emit("categoryDeleted", name);
res.json({ message: "Category and all its products deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};