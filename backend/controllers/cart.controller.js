const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const PRODUCT_FIELDS = "name price category image stock";

// Loads the user's cart with Product data populated.
// Items whose product was deleted from the catalog are dropped from the response.
const loadCart = async (customerId) => {
    const customer = await Customer.findById(customerId).populate({
        path: "cart.product",
        select: PRODUCT_FIELDS
    });

    if (!customer) return null;

    return customer.cart.filter((item) => item.product);
};

// POST /cart/:productId
const addToCart = async (req, res) => {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const customer = await Customer.findById(req.user.id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const existing = customer.cart.find(
            (item) => item.product.toString() === productId
        );

        const newQuantity = existing ? existing.quantity + 1 : 1;

        if (newQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message:
                    product.stock === 0
                        ? "Product is out of stock"
                        : `Only ${product.stock} unit(s) available`
            });
        }

        if (existing) {
            existing.quantity = newQuantity;
        } else {
            customer.cart.push({ product: productId, quantity: 1 });
        }

        await customer.save();

        const cart = await loadCart(req.user.id);

        return res.json({
            success: true,
            message: "Cart updated",
            cart
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

// GET /cart
const getCart = async (req, res) => {
    try {
        const cart = await loadCart(req.user.id);

        if (!cart) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        return res.json({
            success: true,
            cart
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

// PATCH /cart/:productId
const updateQuantity = async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }

    if (typeof quantity !== "number" || !Number.isInteger(quantity)) {
        return res.status(400).json({
            success: false,
            message: "Quantity must be a whole number"
        });
    }

    if (quantity < 1) {
        return res.status(400).json({
            success: false,
            message: "Quantity must be at least 1"
        });
    }

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const customer = await Customer.findById(req.user.id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const item = customer.cart.find(
            (entry) => entry.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product not in cart"
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} unit(s) available`
            });
        }

        item.quantity = quantity;
        await customer.save();

        const cart = await loadCart(req.user.id);

        return res.json({
            success: true,
            message: "Quantity updated",
            cart
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

// DELETE /cart/:productId
const removeFromCart = async (req, res) => {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }

    try {
        const customer = await Customer.findById(req.user.id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const exists = customer.cart.some(
            (item) => item.product.toString() === productId
        );

        if (!exists) {
            return res.status(404).json({
                success: false,
                message: "Product not in cart"
            });
        }

        customer.cart = customer.cart.filter(
            (item) => item.product.toString() !== productId
        );
        await customer.save();

        const cart = await loadCart(req.user.id);

        return res.json({
            success: true,
            message: "Product removed from cart",
            cart
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

module.exports = {
    addToCart,
    getCart,
    updateQuantity,
    removeFromCart
};