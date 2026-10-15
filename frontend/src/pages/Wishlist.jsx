import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";
import { getWishlist, removeFromWishlist } from "../services/api";

function Wishlist() {
    const [products, setProducts] = useState([]);
    const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"
    const [removingId, setRemovingId] = useState(null);

    const loadWishlist = () => {
        setStatus("loading");
        getWishlist()
            .then((res) => {
                setProducts(res.data.wishlist);
                setStatus("ready");
            })
            .catch(() => setStatus("error"));
    };

    useEffect(() => {
        loadWishlist();
    }, []);

    const handleRemove = async (productId) => {
        setRemovingId(productId);
        try {
            await removeFromWishlist(productId);
            setProducts((prev) => prev.filter((p) => p._id !== productId));
        } catch (err) {
            // leave the card as-is on failure; user can retry the click
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="products-page">
                <h1>My Wishlist</h1>

                {status === "ready" && products.length > 0 && (
                    <p className="wishlist-subtitle">
                        {products.length} product{products.length !== 1 ? "s" : ""} saved
                    </p>
                )}

                {status === "loading" && (
                    <p className="state-message">Loading your wishlist...</p>
                )}

                {status === "error" && (
                    <div className="state-message error">
                        <p>Something went wrong. We couldn't load your wishlist.</p>
                        <button type="button" className="retry-btn" onClick={loadWishlist}>
                            Try Again
                        </button>
                    </div>
                )}

                {status === "ready" && products.length === 0 && (
                    <div className="empty-wishlist">
                        <p className="empty-heart">❤️</p>
                        <h2>Your wishlist is empty</h2>
                        <p>Save products you love and find them here later.</p>
                        <Link to="/products" className="product-card-link browse-link">
                            Browse Products
                        </Link>
                    </div>
                )}

                {status === "ready" && products.length > 0 && (
                    <div className="product-grid">
                        {products.map((product) => (
                            <WishlistCard
                                key={product._id}
                                product={product}
                                onRemove={handleRemove}
                                removing={removingId === product._id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Wishlist;