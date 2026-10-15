const Customer = require("../models/customer.model");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

const registerCustomer = async (req, res) => {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters"
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const customer = await Customer.create({
            fullName,
            email,
            password: hashedPassword,
            phone
        });

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: {
                _id: customer._id,
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone
            }
        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};


const loginCustomer = async (req, res) => {
    const { email, password } = req.body;

    try {
        const customer = await Customer.findOne({ email });

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            customer.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(customer._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false
        });

        return res.json({
            success: true,
            message: "Login successful"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

const getMyProfile = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user.id).select("-password");

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        return res.json(customer);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

const logoutCustomer = (req, res) => {
    res.clearCookie("token");

    return res.json({
        success: true,
        message: "Logged out successfully"
    });
};

// Bonus: PATCH /customers/change-password
const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Old and new password are both required"
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: "New password must be at least 6 characters"
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

        const isOldPasswordCorrect = await bcrypt.compare(
            oldPassword,
            customer.password
        );

        if (!isOldPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Old password is incorrect"
            });
        }

        customer.password = await bcrypt.hash(newPassword, 10);
        await customer.save();

        return res.json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

module.exports = {
    registerCustomer,
    loginCustomer,
    getMyProfile,
    logoutCustomer,
    changePassword
};