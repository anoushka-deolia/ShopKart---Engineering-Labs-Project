import { Link } from "react-router-dom";

function OrderCard({ order }) {
    const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    return (
        <div className="order-card">
            <div className="order-card-header">
                <div>
                    <h3>Order #{order._id.slice(-8)}</h3>
                    <p className="order-date">{date}</p>
                </div>
                <span className="status-badge">{order.status}</span>
            </div>

            <div className="order-card-items">
                {order.items.map((item) => (
                    <p key={item.product}>
                        {item.name} × {item.quantity}
                    </p>
                ))}
            </div>

            <div className="order-card-footer">
                <p className="order-total">Total: ₹{order.totalAmount.toLocaleString("en-IN")}</p>
                <Link to={`/orders/${order._id}`} className="product-card-link order-details-link">
                    View Details
                </Link>
            </div>
        </div>
    );
}

export default OrderCard;