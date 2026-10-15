import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginCustomer } from "../services/api";
import { useCart } from "../context/CartContext";

function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const { refreshCart } = useCart();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.email || !form.password) {
            setError("Email and password are both required");
            return;
        }

        setSubmitting(true);
        try {
            // withCredentials is already set on the shared axios instance,
            // so the HttpOnly cookie the backend sends back gets stored.
            await loginCustomer(form);
            refreshCart(); // load this user's saved cart into global state
            navigate("/home");
        } catch (err) {
            if (err.response?.status === 401) {
                setError("Invalid Credentials");
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={handleSubmit} noValidate>
                <h1>Welcome back</h1>
                <p className="auth-subtitle">Log in to continue to ShopKart.</p>

                {error && <div className="form-error">{error}</div>}

                <label className="field">
                    <span>Email</span>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@gmail.com"
                    />
                </label>

                <label className="field">
                    <span>Password</span>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Your password"
                    />
                </label>

                <button type="submit" disabled={submitting}>
                    {submitting ? "Logging in..." : "Log in"}
                </button>

                <p className="auth-switch">
                    New to ShopKart? <Link to="/register">Create an account</Link>
                </p>
            </form>
        </div>
    );
}

export default Login;