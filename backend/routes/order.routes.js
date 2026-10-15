const express = require("express");

const {
    createPaymentOrder,
    verifyPayment,
    markPaymentFailed,
    getMyOrders,
    getOrderById
} = require("../controllers/order.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/create-payment-order", authMiddleware, createPaymentOrder);
router.post("/verify-payment", authMiddleware, verifyPayment);
router.post("/payment-failed", authMiddleware, markPaymentFailed);
router.get("/", authMiddleware, getMyOrders);
router.get("/:id", authMiddleware, getOrderById);

module.exports = router;