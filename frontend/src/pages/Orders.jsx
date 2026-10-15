import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import OrderCard from "../components/OrderCard";
import { getMyOrders } from "../services/api";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"

    const loadOrders = () => {
        setStatus("loading");
        getMyOrders()
            .then((res) => {
                setOrders(res.data.orders);
                setStatus("ready");
            })
            .catch(() => setStatus("error"));
    };

    useEffect(() => {
        loadOrders();
    }, []);

    return (
        <div>
            <Navbar />
            <div className="products-page">
                <h1>My Orders</h1>

                {status === "loading" && <p className="state-message">Loading your orders...</p>}

                {status === "error" && (
                    <div className="state-message error">
                        <p>Something went wrong. We couldn't load your orders.</p>
                        <button type="button" className="retry-btn" onClick={loadOrders}>
                            Try Again
                        </button>
                    </div>
                )}

                {status === "ready" && orders.length === 0 && (
                    <div className="empty-wishlist">
                        <p className="empty-heart">📦</p>
                        <h2>You have not placed any orders yet.</h2>
                        <p>When you do, they'll show up here.</p>
                        <Link to="/products" className="product-card-link browse-link">
                            Start Shopping
                        </Link>
                    </div>
                )}

                {status === "ready" && orders.length > 0 && (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <OrderCard key={order._id} order={order} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Orders;