import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stock: { type: Number, default: 0 },
  admin: { type: Number, default: 0 },
  chef: { type: Number, default: 0 },
  sales: { type: Number, default: 0 },
  zomato: { type: Number, default: 0 },
  category: { type: String, default: "Uncategorized" },
  price: { type: Number, default: 200 },
  order: { type: Number, default: 0 }  // NEW FIELD FOR ORDERING
});

export default mongoose.model("Product", productSchema);