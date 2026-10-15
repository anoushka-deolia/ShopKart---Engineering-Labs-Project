const mongoose = require("mongoose");
const crypto = require("crypto");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const razorpay = require("../config/razorpay");

const PHONE_REGEX = /^\d{10}$/;
const PINCODE_REGEX = /^\d{6}$/;

const FIELD_LABELS = {
    fullName: "Full name",
    phone: "Phone number",
    addressLine1: "Address",
    city: "City",
    state: "State",
    pincode: "Pincode"
};

// Returns { error } or { cleaned } with trimmed values
const validateShippingAddress = (address) => {
    if (!address || typeof address !== "object") {
        return { error: "Shipping address is required" };
    }

    const cleaned = {};

    for (const field of Object.keys(FIELD_LABELS)) {
        const value = address[field];

        if (typeof value !== "string" || !value.trim()) {
            return { error: `${FIELD_LABELS[field]} is required` };
        }

        cleaned[field] = value.trim();
    }

    if (!PHONE_REGEX.test(cleaned.phone)) {
        return { error: "Phone number must contain 10 digits" };
    }

    if (!PINCODE_REGEX.test(cleaned.pincode)) {
        return { error: "Pincode must contain 6 digits" };
    }

    return { cleaned };
};

// POST /orders/create-payment-order
const createPaymentOrder = async (req, res) => {
    // NOTE: only shippingAddress is read. Any total/price sent by the client is ignored.
    const { shippingAddress } = req.body;

    const { error, cleaned } = validateShippingAddress(shippingAddress);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error
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

        if (customer.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }

        // Reload the LATEST product data (price + stock) from MongoDB
        const productIds = customer.cart.map((item) => item.product);
        const products = await Product.find({ _id: { $in: productIds } });

        const productMap = new Map(products.map((p) => [p._id.toString(), p]));

        const items = [];
        let totalAmount = 0;

        for (const cartItem of customer.cart) {
            const product = productMap.get(cartItem.product.toString());

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "A product in your cart is no longer available"
                });
            }

            if (product.stock < cartItem.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}.`
                });
            }

            items.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image
            });

            totalAmount += product.price * cartItem.quantity;
        }

        // 1) Pending ShopKart order (cart is NOT touched here)
        const order = await Order.create({
            user: customer._id,
            items,
            shippingAddress: cleaned,
            totalAmount
        });

        // 2) Razorpay order (amount in paise)
        let razorpayOrder;

        try {
            razorpayOrder = await razorpay.orders.create({
                amount: Math.round(totalAmount * 100),
                currency: "INR",
                receipt: order._id.toString()
            });
        } catch (razorpayError) {
            await Order.findByIdAndDelete(order._id);

            return res.status(502).json({
                success: false,
                message: "Could not start the payment. Please try again."
            });
        }

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        // Only safe data goes to the frontend. The Key SECRET never leaves the server.
        return res.status(201).json({
            success: true,
            shopKartOrderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

// POST /orders/verify-payment
const verifyPayment = async (req, res) => {
    const {
        shopKartOrderId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = req.body;

    if (
        !mongoose.Types.ObjectId.isValid(shopKartOrderId) ||
        typeof razorpay_order_id !== "string" ||
        typeof razorpay_payment_id !== "string" ||
        typeof razorpay_signature !== "string"
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid payment details"
        });
    }

    try {
        const order = await Order.findById(shopKartOrderId);

        // Same response for "missing" and "someone else's" so IDs can't be probed
        if (!order || order.user.toString() !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Already confirmed (e.g. double submit) → just return it
        if (order.paymentStatus === "PAID") {
            return res.json({
                success: true,
                message: "Payment already verified",
                order
            });
        }

        // The Razorpay order id must be the one WE stored, not just one the browser sent
        if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
            .digest("hex");

        const isValid =
            expectedSignature.length === razorpay_signature.length &&
            crypto.timingSafeEqual(
                Buffer.from(expectedSignature),
                Buffer.from(razorpay_signature)
            );

        if (!isValid) {
            // Order stays unpaid and the cart is untouched
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        // Signature is valid → payment is real
        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        // Reduce stock for the purchased items (only if enough stock is left)
        for (const item of order.items) {
            await Product.updateOne(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } }
            );
        }

        // Clear the cart ONLY now
        const customer = await Customer.findById(req.user.id);

        if (customer) {
            customer.cart = [];
            await customer.save();
        }

        return res.json({
            success: true,
            message: "Payment verified. Order placed!",
            order
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

// POST /orders/payment-failed  (optional: marks the pending order as FAILED)
const markPaymentFailed = async (req, res) => {
    const { shopKartOrderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid order ID"
        });
    }

    try {
        const order = await Order.findById(shopKartOrderId);

        if (!order || order.user.toString() !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Never downgrade an order that was already paid
        if (order.paymentStatus === "PENDING") {
            order.paymentStatus = "FAILED";
            await order.save();
        }

        return res.json({
            success: true,
            message: "Payment marked as failed. Your cart has not been changed."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

// GET /orders
const getMyOrders = async (req, res) => {
    try {
        // Only completed (paid) orders are shown in order history
        const orders = await Order.find({
            user: req.user.id,
            paymentStatus: "PAID"
        }).sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

// GET /orders/:id
const getOrderById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid order ID"
        });
    }

    try {
        const order = await Order.findById(id);

        // 404 for both "doesn't exist" and "belongs to someone else"
        if (!order || order.user.toString() !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.json({
            success: true,
            order
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment,
    markPaymentFailed,
    getMyOrders,
    getOrderById
};