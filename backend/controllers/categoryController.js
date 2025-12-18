import Category from "../models/categoryModel.js";

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

    // REMOVE DRAGGED ITEM
    const [removed] = allCategories.splice(draggedIndex, 1);
    
    // INSERT AT TARGET POSITION
    allCategories.splice(targetIndex, 0, removed);

    // UPDATE ORDER FOR ALL CATEGORIES
    for (let i = 0; i < allCategories.length; i++) {
      await Category.findByIdAndUpdate(allCategories[i]._id, { order: i });
    }

    res.json({ message: "Categories reordered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};