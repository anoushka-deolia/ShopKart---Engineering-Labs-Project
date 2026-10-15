import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerCustomer } from "../services/api";

const initialForm = { fullName: "", email: "", password: "", phone: "" };

function Register() {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const next = {};
        if (!form.fullName.trim()) next.fullName = "Full name is required";
        if (!form.email.trim()) next.email = "Email is required";
        if (!form.password) next.password = "Password is required";
        else if (form.password.length < 6)
            next.password = "Password must be at least 6 characters";
        if (!form.phone.trim()) next.phone = "Phone number is required";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        if (!validate()) return;

        setSubmitting(true);
        try {
            await registerCustomer(form);
            navigate("/login");
        } catch (err) {
            const message =
                err.response?.data?.message || "Something went wrong. Please try again.";
            setServerError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={handleSubmit} noValidate>
                <h1>Create your account</h1>
                <p className="auth-subtitle">Join ShopKart in a few seconds.</p>

                {serverError && <div className="form-error">{serverError}</div>}

                <label className="field">
                    <span>Full name</span>
                    <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                    />
                    {errors.fullName && <small>{errors.fullName}</small>}
                </label>

                <label className="field">
                    <span>Email</span>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@gmail.com"
                    />
                    {errors.email && <small>{errors.email}</small>}
                </label>

                <label className="field">
                    <span>Password</span>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="At least 6 characters"
                    />
                    {errors.password && <small>{errors.password}</small>}
                </label>

                <label className="field">
                    <span>Phone number</span>
                    <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="9876543210"
                    />
                    {errors.phone && <small>{errors.phone}</small>}
                </label>

                <button type="submit" disabled={submitting}>
                    {submitting ? "Creating account..." : "Create account"}
                </button>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </form>
        </div>
    );
}

export default Register;