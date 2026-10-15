import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrderById } from "../services/api";

function OrderDetails() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error" | "not-found"

    useEffect(() => {
        setStatus("loading");
        getOrderById(id)
            .then((res) => {
                setOrder(res.data.order);
                setStatus("ready");
            })
            .catch((err) => {
                if (err.response?.status === 404 || err.response?.status === 400) {
                    setStatus("not-found");
                } else {
                    setStatus("error");
                }
            });
    }, [id]);

    const address = order?.shippingAddress;

    return (
        <div>
            <Navbar />
            <div className="details-page">
                {status === "loading" && <p className="state-message">Loading order...</p>}

                {status === "error" && (
                    <p className="state-message error">Something went wrong while loading this order.</p>
                )}

                {status === "not-found" && (
                    <p className="state-message">
                        Order not found. <Link to="/orders">Back to My Orders</Link>
                    </p>
                )}

                {status === "ready" && order && (
                    <div className="checkout-card">
                        <div className="order-card-header">
                            <div>
                                <h1>Order #{order._id.slice(-8)}</h1>
                                <p className="order-date">
                                    {new Date(order.createdAt).toLocaleString("en-IN")}
                                </p>
                            </div>
                            <span className="status-badge">{order.status}</span>
                        </div>

                        <h2>Items</h2>
                        {order.items.map((item) => (
                            <div className="order-item-row" key={item.product}>
                                {item.image && (
                                    <img src={item.image} alt={item.name} className="order-item-image" />
                                )}
                                <div className="order-item-info">
                                    <p className="order-item-name">{item.name}</p>
                                    <p className="order-date">
                                        ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
                                    </p>
                                </div>
                                <p className="order-item-total">
                                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                </p>
                            </div>
                        ))}

                        <div className="summary-row total">
                            <span>Total</span>
                            <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
                        </div>

                        <h2>Shipping Address</h2>
                        <p className="order-address">
                            {address.fullName}
                            <br />
                            {address.addressLine1}
                            <br />
                            {address.city}, {address.state} - {address.pincode}
                            <br />
                            Phone: {address.phone}
                        </p>

                        <h2>Payment</h2>
                        <div className="detail-row">
                            <span className="detail-label">Payment status</span>
                            <span>{order.paymentStatus}</span>
                        </div>
                        {order.razorpayPaymentId && (
                            <div className="detail-row">
                                <span className="detail-label">Payment ID</span>
                                <span>{order.razorpayPaymentId}</span>
                            </div>
                        )}

                        <div className="success-actions">
                            <Link to="/orders" className="product-card-link secondary">
                                Back to My Orders
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrderDetails;