import { Link } from "react-router-dom";

function CartItem({ item, busy, onIncrease, onDecrease, onRemove }) {
    const { product, quantity } = item;
    const overStock = quantity > product.stock;

    return (
        <div className="cart-item">
            <img src={product.image} alt={product.name} className="cart-item-image" />

            <div className="cart-item-info">
                <Link to={`/products/${product._id}`} className="cart-item-name">
                    {product.name}
                </Link>
                <p className="cart-item-price">₹{product.price.toLocaleString("en-IN")}</p>

                <div className="qty-controls">
                    <button
                        type="button"
                        className="qty-btn"
                        onClick={onDecrease}
                        disabled={busy || quantity <= 1}
                    >
                        −
                    </button>
                    <span className="qty-value">{quantity}</span>
                    <button
                        type="button"
                        className="qty-btn"
                        onClick={onIncrease}
                        disabled={busy || quantity >= product.stock}
                    >
                        +
                    </button>
                </div>

                {overStock && (
                    <p className="wishlist-error">
                        Only {product.stock} in stock now. Please lower the quantity.
                    </p>
                )}
            </div>

            <div className="cart-item-side">
                <p className="cart-item-total">
                    ₹{(product.price * quantity).toLocaleString("en-IN")}
                </p>
                <button
                    type="button"
                    className="cart-remove-btn"
                    onClick={onRemove}
                    disabled={busy}
                >
                    {busy ? "Updating..." : "Remove"}
                </button>
            </div>
        </div>
    );
}

export default CartItem;