import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: "*"
}));
app.use(express.json());

// ROUTES
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);

// 🌟 1) CRON ROUTE ADD KRDO
app.get("/cron", (req, res) => {
  console.log("Cron job pinged!");
  res.send("Cron OK");
});

// Simple root route
app.get("/", (req, res) => {
  res.send("Backend running...");
});

// MongoDB connection - FIXED
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.listen(process.env.PORT || 10000, () =>
  console.log(`Server running on ${process.env.PORT}`)
);