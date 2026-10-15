import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
    getCart,
    addToCart as addToCartApi,
    updateCartQuantity,
    removeFromCart as removeFromCartApi
} from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState(null); // product id currently being mutated

    const refreshCart = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await getCart();
            setCartItems(res.data.cart);
        } catch (err) {
            if (err.response?.status === 401) {
                setCartItems([]); // not logged in → empty cart, not an error
            } else {
                setError("Unable to load your cart.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    // Runs a mutation, then replaces state with the cart the backend returns.
    // Errors are re-thrown so the calling component can show a message.
    const runMutation = async (productId, request) => {
        setBusyId(productId);
        try {
            const res = await request();
            setCartItems(res.data.cart);
        } finally {
            setBusyId(null);
        }
    };

    const addToCart = (productId) =>
        runMutation(productId, () => addToCartApi(productId));

    const updateQuantity = (productId, quantity) =>
        runMutation(productId, () => updateCartQuantity(productId, quantity));

    const removeFromCart = (productId) =>
        runMutation(productId, () => removeFromCartApi(productId));

    // Used on logout: clears local state only (the cart stays saved in MongoDB).
    const clearCart = () => setCartItems([]);

    // Derived values: never stored, always calculated from cartItems.
    const itemCount = useMemo(
        () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
        [cartItems]
    );

    const subtotal = useMemo(
        () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
        [cartItems]
    );

    const value = {
        cartItems,
        loading,
        error,
        busyId,
        itemCount,
        subtotal,
        refreshCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);