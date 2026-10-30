# Tandem Market

Tandem Market is a full-stack multi-vendor marketplace built as a learning and portfolio project. Buyers can browse independent sellers, search and filter products, manage a cart, and place demo orders. Sellers can create a storefront, list products, manage inventory, and fulfill their own orders.

## Tech stack

- **Backend:** Python, Django, Django REST Framework, SQLite for local development
- **Frontend:** React, Vite, React Router, Bootstrap
- **Architecture:** Separate Django API and React client

## Features

- Buyer and seller registration with role-specific views
- Public product catalog with search, category filters, sorting, and product pages
- Seller storefronts and product listing management
- Browser cart with server-side price and stock validation at checkout
- Buyer order history and seller-scoped order fulfillment
- Seller dashboard for products, inventory, orders, and sales
- Demo cash-on-delivery flow; no real payment is processed

## Project structure

```text
backend/    Django REST API
frontend/   React + Vite application
```

## Run locally on Windows

### 1. Start the backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
.\.venv\Scripts\python manage.py migrate
.\.venv\Scripts\python manage.py seed_demo
.\.venv\Scripts\python manage.py runserver 127.0.0.1:8000
```

### 2. Start the frontend in a second PowerShell window

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal. The development server proxies API requests to Django on port 8000. Set `VITE_API_PROXY_TARGET` if Django is running elsewhere.

The local demo seller is `tandemstudio`. Its demo password is defined by the `seed_demo` command and must never be reused for a real account. Create a separate buyer account through the app.

## Scope and next steps

This is a portfolio MVP. Checkout demonstrates order creation and inventory checks but does not charge a payment method. Before production use, configure a private Django secret, turn off debug mode, set allowed hosts and CORS origins, use PostgreSQL and persistent image storage, and integrate a payment provider.
