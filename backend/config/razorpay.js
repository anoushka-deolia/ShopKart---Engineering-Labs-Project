const Razorpay = require("razorpay");

// Needs RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env
// (dotenv must be loaded BEFORE this file is required — see index.js)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

module.exports = razorpay;