const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stock: { type: Number, default: 0 },
  admin: { type: Number, default: 0 },
  chef: { type: Number, default: 0 },
  sales: { type: Number, default: 0 },
  zomato: { type: Number, default: 0 },
  category: { type: String, required: true }, // new field
});

module.exports = mongoose.model("Product", productSchema);
