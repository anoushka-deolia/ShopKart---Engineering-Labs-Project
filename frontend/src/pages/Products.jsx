import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import ProductCard from "../components/ProductCard";
import { getProducts, getWishlist } from "../services/api";

function Products() {
    const [products, setProducts] = useState([]);
    const [wishlistIds, setWishlistIds] = useState(new Set());
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [sort, setSort] = useState("");
    const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"

    // Know which products are already saved so cards render the correct
    // initial heart state instead of always starting as "not saved".
    useEffect(() => {
        getWishlist()
            .then((res) => {
                setWishlistIds(new Set(res.data.wishlist.map((p) => p._id)));
            })
            .catch(() => {
                // Non-critical — cards just default to "not saved" if this fails.
            });
    }, []);

    useEffect(() => {
        // Debounce so we don't fire a request on every keystroke.
        const timeoutId = setTimeout(() => {
            const params = {};
            if (search.trim()) params.search = search.trim();
            if (category) params.category = category;
            if (sort) params.sort = sort;

            setStatus("loading");
            getProducts(params)
                .then((res) => {
                    setProducts(res.data.products);
                    setStatus("ready");
                })
                .catch(() => {
                    setStatus("error");
                });
        }, 350);

        return () => clearTimeout(timeoutId);
    }, [search, category, sort]);

    return (
        <div>
            <Navbar />
            <div className="products-page">
                <h1>Products</h1>
                <SearchBar
                    search={search}
                    onSearchChange={setSearch}
                    category={category}
                    onCategoryChange={setCategory}
                    sort={sort}
                    onSortChange={setSort}
                />

                {status === "loading" && (
                    <p className="state-message">Loading products...</p>
                )}

                {status === "error" && (
                    <p className="state-message error">
                        Something went wrong while loading products.
                    </p>
                )}

                {status === "ready" && products.length === 0 && (
                    <p className="state-message">No products found.</p>
                )}

                {status === "ready" && products.length > 0 && (
                    <div className="product-grid">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                initiallySaved={wishlistIds.has(product._id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Products;