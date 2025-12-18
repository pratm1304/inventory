import Product from "../models/productModel.js";

export const getProducts = async (req, res) => {
  const products = await Product.find({}).sort({ category: 1, order: 1 });  // SORT BY ORDER
  res.json(products);
};

export const updateField = async (req, res) => {
  const { id, field, change } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $inc: { [field]: change } },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addProduct = async (req, res) => {
  try {
    const { name, stock, category, price } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Product name is required" });
    }
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    // GET MAX ORDER IN CATEGORY
    const maxOrderProduct = await Product.findOne({ category }).sort({ order: -1 });
    const newOrder = maxOrderProduct ? maxOrderProduct.order + 1 : 0;

    const newProduct = await Product.create({
      name,
      stock: stock || 0,
      admin: 0,
      chef: 0,
      sales: 0,
      zomato: 0,
      category,
      price: price || 200,
      order: newOrder
    });

    res.json(newProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const finishDay = async (req, res) => {
  try {
    const products = await Product.find({});

    for (let p of products) {
      const remaining = p.stock + p.chef - p.sales - p.zomato;

      p.stock = remaining;
      p.admin = 0;
      p.chef = 0;
      p.sales = 0;
      p.zomato = 0;

      await p.save();
    }

    res.json({ message: "Day Finished & Stock Updated!" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetData = async (req, res) => {
  try {
    await Product.updateMany(
      {},
      {
        $set: {
          stock: 0,
          admin: 0,
          chef: 0,
          sales: 0,
          zomato: 0
        }
      }
    );

    res.json({ message: "All products reset successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMultipleProducts = async (req, res) => {
  try {
    const { lines } = req.body;
    if (!lines) return res.status(400).json({ message: "No data received" });

    const rows = lines
      .split("\n")
      .map(r => r.trim())
      .filter(r => r.length > 0);

    const productsToAdd = [];

    for (const r of rows) {
      const [name, stock, category, price] = r.split(",");
      const cat = category?.trim() || "Uncategorized";

      // GET MAX ORDER FOR THIS CATEGORY
      const maxOrderProduct = await Product.findOne({ category: cat }).sort({ order: -1 });
      const newOrder = maxOrderProduct ? maxOrderProduct.order + 1 : 0;

      productsToAdd.push({
        name: name?.trim(),
        stock: Number(stock) || 0,
        category: cat,
        price: Number(price) || 200,
        admin: 0,
        chef: 0,
        sales: 0,
        zomato: 0,
        order: newOrder
      });
    }

    await Product.insertMany(productsToAdd);

    res.json({ message: "Multiple Products Added!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const category = product.category;

    await Product.findByIdAndDelete(id);

    const count = await Product.countDocuments({ category });

    res.json({
      message: "Product deleted",
      deleteCategory: count === 0 ? category : null,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProductName = async (req, res) => {
  try {
    const { id, name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Product name is required" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProductPrice = async (req, res) => {
  try {
    const { id, price } = req.body;
    
    if (price === undefined || price < 0) {
      return res.status(400).json({ message: "Valid price is required" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { price: Number(price) },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NEW REORDER FUNCTION
export const reorderProducts = async (req, res) => {
  try {
    const { draggedId, targetId, category } = req.body;

    const draggedProduct = await Product.findById(draggedId);
    const targetProduct = await Product.findById(targetId);

    if (!draggedProduct || !targetProduct) {
      return res.status(404).json({ message: "Products not found" });
    }

    // GET ALL PRODUCTS IN CATEGORY SORTED BY ORDER
    const categoryProducts = await Product.find({ category }).sort({ order: 1 });

    const draggedIndex = categoryProducts.findIndex(p => p._id.toString() === draggedId);
    const targetIndex = categoryProducts.findIndex(p => p._id.toString() === targetId);

    // REMOVE DRAGGED ITEM
    const [removed] = categoryProducts.splice(draggedIndex, 1);
    
    // INSERT AT TARGET POSITION
    categoryProducts.splice(targetIndex, 0, removed);

    // UPDATE ORDER FOR ALL PRODUCTS IN CATEGORY
    for (let i = 0; i < categoryProducts.length; i++) {
      await Product.findByIdAndUpdate(categoryProducts[i]._id, { order: i });
    }

    res.json({ message: "Products reordered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};