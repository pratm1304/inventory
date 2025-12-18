import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  qty: { type: Number, required: true },
  orderType: { type: String, enum: ['foushack', 'zomato'], required: true },
  price: { type: Number, required: true },
  totalPrice: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);