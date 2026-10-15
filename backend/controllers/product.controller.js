const mongoose = require("mongoose");
const Product = require("../models/product.model");

const createProduct = async (req, res) => {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || !category || !image) {
        return res.status(400).json({
            success: false,
            message: "name, description, category and image are required"
        });
    }

    if (price === undefined || price === null || Number(price) <= 0) {
        return res.status(400).json({
            success: false,
            message: "Price must be greater than 0"
        });
    }

    if (stock === undefined || stock === null || Number(stock) < 0) {
        return res.status(400).json({
            success: false,
            message: "Stock cannot be negative"
        });
    }

    try {
        const product = await Product.create({
            name,
            description,
            price,
            category,
            image,
            stock
        });

        return res.status(201).json({
            success: true,
            product
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getProducts = async (req, res) => {
    const { search, category, sort } = req.query;

    const query = {};

    if (search) {
        query.name = { $regex: search, $options: "i" };
    }

    if (category) {
        query.category = category;
    }

    try {
        let productsQuery = Product.find(query);

        if (sort === "price_asc") productsQuery = productsQuery.sort({ price: 1 });
        if (sort === "price_desc") productsQuery = productsQuery.sort({ price: -1 });

        const products = await productsQuery;

        return res.json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

const getProductById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }

    try {
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.json({
            success: true,
            product
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById
};