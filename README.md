# ShopKart — Full-Stack E-Commerce Application

ShopKart is a full-stack e-commerce web application developed as part of the Engineering Labs project. It provides a shopping experience with customer authentication, product browsing, search, wishlist management, cart functionality, checkout, and order tracking.

The project follows a client-server architecture using the MERN stack, with a React frontend and a Node.js/Express backend connected to MongoDB.

## Features

### Authentication
- Customer registration and login
- Password hashing using bcrypt
- JWT-based authentication
- HttpOnly cookie-based session handling
- Protected customer profile access
- Logout functionality

### Product Catalogue
- Browse available products
- View individual product details
- Search and filter products
- Sort product listings

### Shopping Cart
- Add products to the cart
- Update product quantities
- Remove products from the cart
- View cart items and order summary

### Wishlist
- Add products to the wishlist
- View saved products
- Remove products from the wishlist

### Checkout and Orders
- Checkout with a shipping address
- Razorpay payment integration
- Payment verification and failure handling
- View order history
- View individual order details
- Order success page

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, JavaScript, HTML, CSS |
| Frontend tooling | Vite |
| Routing | React Router DOM |
| HTTP requests | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens (JWT), bcrypt |
| Session handling | cookie-parser, HttpOnly cookies |
| Payments | Razorpay |
| Environment configuration | dotenv |
| Version control | Git and GitHub |

## Project Structure

```text
ShopKart/
├── backend/
│   ├── config/
│   │   └── razorpay.js
│   ├── controllers/
│   │   ├── cart.controller.js
│   │   ├── customer.controller.js
│   │   ├── order.controller.js
│   │   ├── product.controller.js
│   │   └── wishlist.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── customer.model.js
│   │   ├── order.model.js
│   │   └── product.model.js
│   ├── routes/
│   │   ├── cart.routes.js
│   │   ├── customer.routes.js
│   │   ├── order.routes.js
│   │   ├── product.routes.js
│   │   └── wishlist.routes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CartItem.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── OrderCard.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── WishlistCard.jsx
│   │   ├── context/
│   │   │   └── CartContext.jsx
│   │   ├── pages/
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── OrderDetails.jsx
│   │   │   ├── OrderSuccess.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Wishlist.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the application:

- [Node.js](https://nodejs.org/) and npm
- [MongoDB Atlas](https://www.mongodb.com/atlas) or a local MongoDB instance
- A [Razorpay account](https://razorpay.com/) with API credentials for payment integration
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/anoushka-deolia/ShopKart---Engineering-Labs-Project.git
cd ShopKart---Engineering-Labs-Project
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure backend environment variables

Create a `.env` file inside the `backend/` directory.

Add the following variables using your own credentials:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_private_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

**Important:** Replace the example values with your actual local configuration. Never commit your `.env` file, passwords, API secrets, or database credentials to GitHub.

The backend uses these variables for database connectivity, JWT generation, and Razorpay configuration.

### 4. Start the backend server

From the `backend/` directory, run:

```bash
node index.js
```

The backend listens on:

```text
http://localhost:5000
```

A successful startup should display the server message in the terminal. Check the terminal for a successful MongoDB connection as well.

### 5. Install frontend dependencies

Open a **second terminal** at the project root and run:

```bash
cd frontend
npm install
```

### 6. Start the frontend

From the `frontend/` directory, run:

```bash
npm run dev
```

Vite will display the local development URL in the terminal, normally:

```text
http://localhost:5173
```

Open that URL in your browser.

The frontend API service is configured to communicate with the backend at `http://localhost:5000`. The backend CORS configuration allows the local frontend origin and credentials.

## API Overview

The backend exposes REST API routes for the following resources:

| Resource | Base route | Purpose |
|---|---|---|
| Customers | `/customers` | Registration, login, profile, and logout |
| Products | `/products` | Product listing and product details |
| Wishlist | `/wishlist` | Wishlist operations |
| Cart | `/cart` | Cart operations and quantity updates |
| Orders | `/orders` | Checkout, payments, and order management |

### Customer endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/customers/register` | Register a customer |
| POST | `/customers/login` | Authenticate a customer |
| GET | `/customers/me` | Retrieve the authenticated customer's profile |
| POST | `/customers/logout` | Log out the customer |

### Cart endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/cart` | Retrieve the cart |
| POST | `/cart/:productId` | Add a product to the cart |
| PATCH | `/cart/:productId` | Update product quantity |
| DELETE | `/cart/:productId` | Remove a product from the cart |

### Wishlist endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/wishlist` | Retrieve wishlist items |
| POST | `/wishlist/:productId` | Add a product to the wishlist |
| DELETE | `/wishlist/:productId` | Remove a product from the wishlist |

### Order and payment endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/orders/create-payment-order` | Initiate checkout and create a payment order |
| POST | `/orders/verify-payment` | Verify payment |
| POST | `/orders/payment-failed` | Report a failed payment |
| GET | `/orders` | Retrieve the customer's orders |
| GET | `/orders/:id` | Retrieve an individual order |

The frontend uses Axios to communicate with these APIs. Protected requests use cookie-based authentication.

## Security Practices

- Passwords are hashed using bcrypt.
- JWTs are generated using a secret stored in an environment variable.
- Authentication uses an HttpOnly cookie.
- Razorpay credentials are configured through environment variables.
- Environment files and `node_modules/` are excluded using `.gitignore`.
- Payment verification is handled by the backend.

Never expose private credentials in frontend code or commit real secrets to the repository.

## Development Notes

- Install dependencies separately in `backend/` and `frontend/`.
- Keep the backend and frontend running in separate terminals during local development.
- Ensure MongoDB is available and the connection string is valid.
- Configure valid Razorpay credentials before testing payment functionality.
- The backend CORS origin is currently configured for `http://localhost:5173`.

## Future Improvements

Potential improvements include automated testing, improved error handling, deployment configuration, and additional documentation.

## Repository

GitHub: [ShopKart — Engineering Labs Project](https://github.com/anoushka-deolia/ShopKart---Engineering-Labs-Project)

---

Developed as part of the Engineering Labs project.
