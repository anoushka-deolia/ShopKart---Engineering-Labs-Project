import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrderById } from "../services/api";

function OrderSuccess() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"

    useEffect(() => {
        setStatus("loading");
        getOrderById(id)
            .then((res) => {
                setOrder(res.data.order);
                setStatus("ready");
            })
            .catch(() => setStatus("error"));
    }, [id]);

    return (
        <div>
            <Navbar />
            <div className="products-page">
                {status === "loading" && <p className="state-message">Loading your order...</p>}

                {status === "error" && (
                    <p className="state-message error">
                        We couldn't load this order. <Link to="/orders">View My Orders</Link>
                    </p>
                )}

                {status === "ready" && order && (
                    <div className="success-card">
                        <p className="success-icon">✅</p>
                        <h1>Order Placed Successfully</h1>

                        <div className="success-details">
                            <div className="detail-row">
                                <span className="detail-label">Order ID</span>
                                <span>{order._id}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Total</span>
                                <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Status</span>
                                <span className="status-badge">{order.status}</span>
                            </div>
                        </div>

                        <p className="success-note">Your order has been saved successfully.</p>

                        <div className="success-actions">
                            <Link to="/orders" className="product-card-link">
                                View My Orders
                            </Link>
                            <Link to="/products" className="product-card-link secondary">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrderSuccess;