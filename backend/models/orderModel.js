import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  totalPrice: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  items: [orderItemSchema],
  orderType: { type: String, enum: ['foushack', 'zomato'], required: true },
  totalPrice: { type: Number, required: true }  // ✅ ADD THIS LINE
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);