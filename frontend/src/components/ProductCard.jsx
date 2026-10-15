import { useState } from "react";
import { Link } from "react-router-dom";
import { addToWishlist, removeFromWishlist } from "../services/api";
import { useCart } from "../context/CartContext";

function ProductCard({ product, initiallySaved = false }) {
    const inStock = product.stock > 0;
    const [saved, setSaved] = useState(initiallySaved);
    const [status, setStatus] = useState("idle"); // "idle" | "saving" | "error"
    const [cartError, setCartError] = useState("");
    const { addToCart, busyId } = useCart();

    const adding = busyId === product._id;

    const handleWishlistClick = async () => {
        if (status === "saving") return; // prevent duplicate clicks

        setStatus("saving");
        try {
            if (saved) {
                await removeFromWishlist(product._id);
                setSaved(false);
            } else {
                await addToWishlist(product._id);
                setSaved(true);
            }
            setStatus("idle");
        } catch (err) {
            // Already saved server-side (409) — treat as saved, not an error.
            if (err.response?.status === 409) {
                setSaved(true);
                setStatus("idle");
            } else {
                setStatus("error");
            }
        }
    };

    const handleAddToCart = async () => {
        if (adding) return;
        setCartError("");
        try {
            await addToCart(product._id);
        } catch (err) {
            setCartError(err.response?.data?.message || "Unable to add to cart.");
        }
    };

    return (
        <div className="product-card">
            <div className="product-card-image">
                <img src={product.image} alt={product.name} />
            </div>
            <div className="product-card-body">
                <h3>{product.name}</h3>
                <p className="product-card-category">{product.category}</p>
                <p className="product-card-price">₹{product.price.toLocaleString("en-IN")}</p>
                <p className={inStock ? "product-card-stock" : "product-card-stock out"}>
                    {inStock ? `${product.stock} units left` : "Out of stock"}
                </p>

                <div className="product-card-actions">
                    <Link to={`/products/${product._id}`} className="product-card-link">
                        View Details
                    </Link>
                    <button
                        type="button"
                        className="cart-btn"
                        onClick={handleAddToCart}
                        disabled={adding || !inStock}
                    >
                        {adding ? "Adding..." : "🛒 Add to Cart"}
                    </button>
                    <button
                        type="button"
                        className={saved ? "wishlist-btn saved" : "wishlist-btn"}
                        onClick={handleWishlistClick}
                        disabled={status === "saving"}
                    >
                        {status === "saving"
                            ? "Saving..."
                            : saved
                            ? "♥ Added to Wishlist"
                            : "♡ Add to Wishlist"}
                    </button>
                </div>

                {cartError && <p className="wishlist-error">{cartError}</p>}
                {status === "error" && (
                    <p className="wishlist-error">Unable to save product. Please try again.</p>
                )}
            </div>
        </div>
    );
}

export default ProductCard;