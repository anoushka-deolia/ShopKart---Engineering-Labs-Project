const CATEGORIES = ["All Categories", "Electronics", "Fashion", "Books", "Home"];

function SearchBar({ search, onSearchChange, category, onCategoryChange, sort, onSortChange }) {
    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="search-input"
            />
            <select
                value={category}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="search-select"
            >
                {CATEGORIES.map((c) => (
                    <option key={c} value={c === "All Categories" ? "" : c}>
                        {c}
                    </option>
                ))}
            </select>
            <select
                value={sort}
                onChange={(e) => onSortChange(e.target.value)}
                className="search-select"
            >
                <option value="">Sort by</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
            </select>
        </div>
    );
}

export default SearchBar;