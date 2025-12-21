import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  totalPrice: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema(
  {
    items: [orderItemSchema],
    orderType: { type: String, enum: ["foushack", "zomato"], required: true },
    paymentMethod: { type: String, enum: ["cash", "upi"], required: false },
    totalPrice: { type: Number, required: true },
    isHighlighted: { type: Boolean, default: false } // ✅ NEW: For yellow highlighting
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);