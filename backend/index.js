// dotenv MUST load first, because config/razorpay.js reads process.env when it is required
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.log("MongoDB connection failed:", error);
    });

app.get("/", (req, res) => {
    res.send("ShopKart Backend is working!");
});

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});