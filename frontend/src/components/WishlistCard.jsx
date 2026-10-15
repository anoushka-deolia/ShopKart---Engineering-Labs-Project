import { Link } from "react-router-dom";

function WishlistCard({ product, onRemove, removing }) {
    const inStock = product.stock > 0;

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
                        className="wishlist-btn saved"
                        onClick={() => onRemove(product._id)}
                        disabled={removing}
                    >
                        {removing ? "Removing..." : "Remove ♥"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default WishlistCard;