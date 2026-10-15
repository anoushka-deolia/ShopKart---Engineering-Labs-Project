import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import {
    createPaymentOrder,
    verifyPayment,
    reportPaymentFailed
} from "../services/api";

const initialForm = {
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: ""
};

// Loads Razorpay's checkout.js once and tells us whether it worked
const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

function Checkout() {
    const { cartItems, loading, itemCount, subtotal, clearCart } = useCart();
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const next = {};
        const trimmed = {};
        Object.keys(form).forEach((key) => {
            trimmed[key] = form[key].trim();
        });

        if (!trimmed.fullName) next.fullName = "Full name is required";
        if (!trimmed.phone) next.phone = "Phone number is required";
        else if (!/^\d{10}$/.test(trimmed.phone))
            next.phone = "Phone number must contain 10 digits";
        if (!trimmed.addressLine1) next.addressLine1 = "Address is required";
        if (!trimmed.city) next.city = "City is required";
        if (!trimmed.state) next.state = "State is required";
        if (!trimmed.pincode) next.pincode = "Pincode is required";
        else if (!/^\d{6}$/.test(trimmed.pincode))
            next.pincode = "Pincode must contain 6 digits";

        setErrors(next);
        return { valid: Object.keys(next).length === 0, trimmed };
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setServerError("");

        const { valid, trimmed } = validate();
        if (!valid) return; // no backend call if client validation fails

        setSubmitting(true);

        try {
            // 1) Backend validates cart + stock + price, creates the pending order
            //    and the Razorpay order. We only send the shipping address.
            const res = await createPaymentOrder(trimmed);
            const data = res.data;

            // 2) Load Razorpay's checkout script
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                setServerError("Could not load the payment window. Check your internet and try again.");
                setSubmitting(false);
                return;
            }

            // 3) Open Razorpay Checkout
            const options = {
                key: data.key,
                amount: data.amount,
                currency: data.currency,
                name: "ShopKart",
                description: "ShopKart Order",
                order_id: data.razorpayOrderId,

                // Payment went through on Razorpay's side. We do NOT trust this yet:
                // send the details to our backend, which verifies the signature.
                handler: async (response) => {
                    try {
                        const verifyRes = await verifyPayment({
                            shopKartOrderId: data.shopKartOrderId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        // Backend cart is cleared; clear the global cart state too
                        clearCart();
                        navigate(`/order-success/${verifyRes.data.order._id}`, { replace: true });
                    } catch (err) {
                        setServerError(
                            err.response?.data?.message ||
                                "We could not verify your payment. Your cart has not been cleared."
                        );
                        setSubmitting(false);
                    }
                },

                prefill: {
                    name: trimmed.fullName,
                    contact: trimmed.phone
                },

                modal: {
                    // User closed the window without paying
                    ondismiss: () => setSubmitting(false)
                }
            };

            const paymentObject = new window.Razorpay(options);

            paymentObject.on("payment.failed", async () => {
                setServerError("Payment failed. Your cart has not been cleared. Please try again.");
                setSubmitting(false);
                try {
                    await reportPaymentFailed(data.shopKartOrderId);
                } catch (err) {
                    // Not critical: the cart is untouched either way
                }
            });

            paymentObject.open();
        } catch (err) {
            if (err.response?.status === 401) {
                navigate("/login", { replace: true });
                return;
            }
            setServerError(
                err.response?.data?.message || "Something went wrong. Please try again."
            );
            setSubmitting(false);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="products-page">
                <h1>Checkout</h1>

                {loading && <p className="state-message">Loading your cart...</p>}

                {!loading && cartItems.length === 0 && (
                    <div className="empty-wishlist">
                        <p className="empty-heart">🛒</p>
                        <h2>Your cart is empty</h2>
                        <p>Add something to your cart before checking out.</p>
                        <Link to="/products" className="product-card-link browse-link">
                            Browse Products
                        </Link>
                    </div>
                )}

                {!loading && cartItems.length > 0 && (
                    <form className="checkout-layout" onSubmit={handlePlaceOrder} noValidate>
                        <section className="checkout-card">
                            <h2>Shipping Details</h2>

                            {serverError && <div className="form-error">{serverError}</div>}

                            <label className="field">
                                <span>Full name</span>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    placeholder="Aarav Sharma"
                                />
                                {errors.fullName && <small>{errors.fullName}</small>}
                            </label>

                            <label className="field">
                                <span>Phone number</span>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="9876543210"
                                />
                                {errors.phone && <small>{errors.phone}</small>}
                            </label>

                            <label className="field">
                                <span>Address</span>
                                <input
                                    type="text"
                                    name="addressLine1"
                                    value={form.addressLine1}
                                    onChange={handleChange}
                                    placeholder="22 MG Road"
                                />
                                {errors.addressLine1 && <small>{errors.addressLine1}</small>}
                            </label>

                            <label className="field">
                                <span>City</span>
                                <input
                                    type="text"
                                    name="city"
                                    value={form.city}
                                    onChange={handleChange}
                                    placeholder="Bengaluru"
                                />
                                {errors.city && <small>{errors.city}</small>}
                            </label>

                            <label className="field">
                                <span>State</span>
                                <input
                                    type="text"
                                    name="state"
                                    value={form.state}
                                    onChange={handleChange}
                                    placeholder="Karnataka"
                                />
                                {errors.state && <small>{errors.state}</small>}
                            </label>

                            <label className="field">
                                <span>Pincode</span>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={form.pincode}
                                    onChange={handleChange}
                                    placeholder="560001"
                                    maxLength={6}
                                />
                                {errors.pincode && <small>{errors.pincode}</small>}
                            </label>
                        </section>

                        <aside className="order-summary">
                            <h2>Order Summary</h2>

                            {cartItems.map((item) => (
                                <div className="summary-row" key={item.product._id}>
                                    <span>
                                        {item.product.name} × {item.quantity}
                                    </span>
                                    <span>
                                        ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            ))}

                            <div className="summary-row">
                                <span>Items</span>
                                <span>{itemCount}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>₹{subtotal.toLocaleString("en-IN")}</span>
                            </div>

                            <button type="submit" disabled={submitting}>
                                {submitting ? "Processing..." : "Place Order"}
                            </button>
                            <p className="checkout-note">
                                You'll pay securely through Razorpay (Test Mode).
                            </p>
                        </aside>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Checkout;