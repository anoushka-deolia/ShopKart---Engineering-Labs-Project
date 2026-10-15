import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
    getProductById,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
} from "../services/api";
import { useCart } from "../context/CartContext";

function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error" | "not-found"
    const [cartMessage, setCartMessage] = useState("");
    const { addToCart, busyId } = useCart();

    const [isSaved, setIsSaved] = useState(false);
    const [wishBusy, setWishBusy] = useState(false);
    const [wishMessage, setWishMessage] = useState("");

    useEffect(() => {
        setStatus("loading");
        setCartMessage("");
        getProductById(id)
            .then((res) => {
                setProduct(res.data.product);
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

    // Check if this product is already in the wishlist
    useEffect(() => {
        setIsSaved(false);
        setWishMessage("");
        getWishlist()
            .then((res) => {
                const ids = (res.data.wishlist || []).map((p) => p._id);
                setIsSaved(ids.includes(id));
            })
            .catch(() => {});
    }, [id]);

    const handleAddToCart = async () => {
        setCartMessage("");
        try {
            await addToCart(product._id);
            setCartMessage("Added to cart!");
        } catch (err) {
            setCartMessage(err.response?.data?.message || "Unable to add to cart.");
        }
    };

    const handleToggleWishlist = async () => {
        if (wishBusy) return;
        setWishMessage("");
        setWishBusy(true);
        try {
            if (isSaved) {
                await removeFromWishlist(product._id);
                setIsSaved(false);
            } else {
                await addToWishlist(product._id);
                setIsSaved(true);
            }
        } catch (err) {
            const code = err.response?.status;
            if (!isSaved && code === 409) {
                setIsSaved(true);
            } else if (isSaved && code === 404) {
                setIsSaved(false);
            } else {
                setWishMessage(
                    err.response?.data?.message || "Unable to update wishlist. Please try again."
                );
            }
        } finally {
            setWishBusy(false);
        }
    };

    const wishBtnStyle = {
        background: isSaved ? "#d6587f" : "transparent",
        color: isSaved ? "#fff" : "#d6587f",
        border: "2px solid #d6587f",
        opacity: wishBusy ? 0.7 : 1,
    };

    return (
        <div>
            <Navbar />
            <div className="details-page">
                {status === "loading" && (
                    <p className="state-message">Loading product...</p>
                )}

                {status === "error" && (
                    <p className="state-message error">
                        Something went wrong while loading this product.
                    </p>
                )}

                {status === "not-found" && (
                    <p className="state-message">
                        Product not found. <Link to="/products">Back to products</Link>
                    </p>
                )}

                {status === "ready" && product && (
                    <div className="details-card">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="details-image"
                        />
                        <div className="details-body">
                            <p className="details-category">{product.category}</p>
                            <h1>{product.name}</h1>
                            <p className="details-price">
                                ₹{product.price.toLocaleString("en-IN")}
                            </p>
                            <p className="details-description">{product.description}</p>
                            <p className={product.stock > 0 ? "details-stock" : "details-stock out"}>
                                {product.stock > 0
                                    ? `${product.stock} units in stock`
                                    : "Out of stock"}
                            </p>

                            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                <button
                                    type="button"
                                    disabled={product.stock === 0 || busyId === product._id}
                                    onClick={handleAddToCart}
                                >
                                    {busyId === product._id ? "Adding..." : "Add to Cart"}
                                </button>

                                <button
                                    type="button"
                                    style={wishBtnStyle}
                                    disabled={wishBusy}
                                    onClick={handleToggleWishlist}
                                >
                                    {wishBusy
                                        ? "⏳ Saving..."
                                        : isSaved
                                        ? "♥ Remove from Wishlist"
                                        : "♡ Add to Wishlist"}
                                </button>
                            </div>

                            {cartMessage && <p className="details-cart-message">{cartMessage}</p>}
                            {wishMessage && (
                                <p className="details-cart-message" style={{ color: "#c0392b" }}>
                                    {wishMessage}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductDetails;