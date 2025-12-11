import Product from "../models/productModel.js";

export const getProducts = async (req, res) => {
  const products = await Product.find({});
  res.json(products);
};

export const updateField = async (req, res) => {
  const { id, field, change } = req.body; 
  const product = await Product.findById(id);

  product[field] += change;     
  await product.save();

  res.json(product);
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

