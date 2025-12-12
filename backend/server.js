import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: "*"
}));
app.use(express.json());

// Normal API routes
app.use("/api/products", productRoutes);

// 🌟 1) CRON ROUTE ADD KRDO
app.get("/cron", (req, res) => {
  console.log("Cron job pinged!");
  res.send("Cron OK");
});

// Simple root route
app.get("/", (req, res) => {
  res.send("Backend running...");
});

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.listen(process.env.PORT || 10000, () =>
  console.log(`Server running on ${process.env.PORT}`)
);
