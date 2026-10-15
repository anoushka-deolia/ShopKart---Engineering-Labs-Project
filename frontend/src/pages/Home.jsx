import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getMyProfile } from "../services/api";

function Home() {
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const fetchProfile = async () => {
            try {
                const res = await getMyProfile();
                if (isMounted) setCustomer(res.data);
            } catch (err) {
                // No valid cookie / expired token → not logged in.
                if (isMounted) navigate("/login", { replace: true });
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchProfile();
        return () => {
            isMounted = false;
        };
    }, [navigate]);

    if (loading) {
        return <div className="page-loading">Loading your account...</div>;
    }

    if (!customer) return null; // already redirecting

    return (
        <div>
            <Navbar />
            <div className="home-page">
                <div className="home-card">
                    <h1>Welcome, {customer.fullName}!</h1>
                    <p className="home-subtitle">Here's your ShopKart account.</p>

                    <div className="home-details">
                        <div className="detail-row">
                            <span className="detail-label">Name</span>
                            <span>{customer.fullName}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Email</span>
                            <span>{customer.email}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Phone</span>
                            <span>{customer.phone}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;