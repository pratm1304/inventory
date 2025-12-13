import Product from "../models/productModel.js";

export const getProducts = async (req, res) => {
  const products = await Product.find({});
  res.json(products);
};

export const updateField = async (req, res) => {
  const { id, field, change } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $inc: { [field]: change } },  // ATOMIC UPDATE
      { new: true }
    );

    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const addProduct = async (req, res) => {
  try {
    const { name, stock, category } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Product name is required" });
    }
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const newProduct = await Product.create({
      name,
      stock: stock || 0,
      admin: 0,
      chef: 0,
      sales: 0,
      zomato: 0,
      category,
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

      p.stock = remaining;   // final remaining becomes new stock
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

    const products = rows.map(r => {
      const [name, stock, category] = r.split(",");

      return {
        name: name?.trim(),
        stock: Number(stock) || 0,
        category: category?.trim() || "Uncategorized",
        admin: 0,
        chef: 0,
        sales: 0,
        zomato: 0,
      };
    });

    await Product.insertMany(products);

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

    // product delete
    await Product.findByIdAndDelete(id);

    // agar is category me koi product nahi bacha, return info
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
