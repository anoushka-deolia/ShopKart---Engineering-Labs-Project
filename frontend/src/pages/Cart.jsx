import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartContext";

function Cart() {
    const {
        cartItems,
        loading,
        error,
        busyId,
        itemCount,
        subtotal,
        refreshCart,
        updateQuantity,
        removeFromCart
    } = useCart();
    const [actionError, setActionError] = useState("");
    const navigate = useNavigate();

    const run = async (action) => {
        setActionError("");
        try {
            await action();
        } catch (err) {
            setActionError(err.response?.data?.message || "Something went wrong. Please try again.");
        }
    };

    return (
        <div>
            <Navbar />
            <div className="products-page">
                <h1>My Cart</h1>

                {loading && <p className="state-message">Loading your cart...</p>}

                {!loading && error && (
                    <div className="state-message error">
                        <p>{error}</p>
                        <button type="button" className="retry-btn" onClick={refreshCart}>
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && cartItems.length === 0 && (
                    <div className="empty-wishlist">
                        <p className="empty-heart">🛒</p>
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added anything yet.</p>
                        <Link to="/products" className="product-card-link browse-link">
                            Browse Products
                        </Link>
                    </div>
                )}

                {!loading && !error && cartItems.length > 0 && (
                    <div className="cart-layout">
                        <div className="cart-list">
                            {actionError && <div className="form-error">{actionError}</div>}

                            {cartItems.map((item) => (
                                <CartItem
                                    key={item.product._id}
                                    item={item}
                                    busy={busyId === item.product._id}
                                    onIncrease={() =>
                                        run(() => updateQuantity(item.product._id, item.quantity + 1))
                                    }
                                    onDecrease={() =>
                                        run(() => updateQuantity(item.product._id, item.quantity - 1))
                                    }
                                    onRemove={() => run(() => removeFromCart(item.product._id))}
                                />
                            ))}
                        </div>

                        <aside className="order-summary">
                            <h2>Order Summary</h2>
                            <div className="summary-row">
                                <span>Items</span>
                                <span>{itemCount}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString("en-IN")}</span>
                            </div>
                            <button type="button" onClick={() => navigate("/checkout")}>
                                Proceed to Checkout
                            </button>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Cart;