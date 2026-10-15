const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// POST /wishlist/:productId
const addToWishlist = async (req, res) => {
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

        const alreadySaved = customer.wishlist.some(
            (id) => id.toString() === productId
        );

        if (alreadySaved) {
            return res.status(409).json({
                success: false,
                message: "Product already in wishlist"
            });
        }

        customer.wishlist.push(productId);
        await customer.save();

        return res.status(201).json({
            success: true,
            message: "Product added to wishlist"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

// GET /wishlist
const getWishlist = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user.id).populate({
            path: "wishlist",
            select: "name price category image stock"
        });

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        return res.json({
            success: true,
            count: customer.wishlist.length,
            wishlist: customer.wishlist
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

// DELETE /wishlist/:productId
const removeFromWishlist = async (req, res) => {
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

        const exists = customer.wishlist.some(
            (id) => id.toString() === productId
        );

        if (!exists) {
            return res.status(404).json({
                success: false,
                message: "Product not in wishlist"
            });
        }

        customer.wishlist = customer.wishlist.filter(
            (id) => id.toString() !== productId
        );
        await customer.save();

        return res.json({
            success: true,
            message: "Product removed from wishlist"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist
};