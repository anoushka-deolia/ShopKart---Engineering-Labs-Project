import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { logoutCustomer, getWishlist } from "../services/api";
import { useCart } from "../context/CartContext";

function Navbar() {
    const navigate = useNavigate();
    const { itemCount, clearCart } = useCart();
    const [wishlistCount, setWishlistCount] = useState(null);

    useEffect(() => {
        getWishlist()
            .then((res) => setWishlistCount(res.data.count))
            .catch(() => setWishlistCount(null));
    }, []);

    const handleLogout = async () => {
        try {
            await logoutCustomer();
        } catch (err) {
            // Even if the request fails, send the user back to login —
            // there's nothing useful they can do on a broken session.
        } finally {
            clearCart();
            navigate("/login", { replace: true });
        }
    };

    return (
        <nav className="navbar">
            <span className="navbar-brand">ShopKart</span>
            <div className="navbar-links">
                <Link to="/home">Home</Link>
                <Link to="/products">Products</Link>
                <Link to="/wishlist">
                    Wishlist{wishlistCount !== null ? ` (${wishlistCount})` : ""}
                </Link>
                <Link to="/cart">Cart ({itemCount})</Link>
                <Link to="/orders">Orders</Link>
                <button className="navbar-logout" onClick={handleLogout}>
                    Log out
                </button>
            </div>
        </nav>
    );
}

export default Navbar;