import axios from "axios";

// withCredentials: true is what lets the browser send/receive the
// HttpOnly "token" cookie set by the Lab 01 backend on login.
const api = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true,
});

export const registerCustomer = (data) => api.post("/customers/register", data);
export const loginCustomer = (data) => api.post("/customers/login", data);
export const getMyProfile = () => api.get("/customers/me");
export const logoutCustomer = () => api.post("/customers/logout");

// params can include { search, category, sort }, any of which may be omitted
export const getProducts = (params = {}) => api.get("/products", { params });
export const getProductById = (id) => api.get(`/products/${id}`);

export const addToWishlist = (productId) => api.post(`/wishlist/${productId}`);
export const getWishlist = () => api.get("/wishlist");
export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`);

export const getCart = () => api.get("/cart");
export const addToCart = (productId) => api.post(`/cart/${productId}`);
export const updateCartQuantity = (productId, quantity) =>
    api.patch(`/cart/${productId}`, { quantity });
export const removeFromCart = (productId) => api.delete(`/cart/${productId}`);

// Orders + payments (only the shipping address is sent; the server owns prices)
export const createPaymentOrder = (shippingAddress) =>
    api.post("/orders/create-payment-order", { shippingAddress });
export const verifyPayment = (data) => api.post("/orders/verify-payment", data);
export const reportPaymentFailed = (shopKartOrderId) =>
    api.post("/orders/payment-failed", { shopKartOrderId });
export const getMyOrders = () => api.get("/orders");
export const getOrderById = (id) => api.get(`/orders/${id}`);

export default api;