# ShopHub - Multi-Vendor E-Commerce Platform

A full-stack multi-vendor e-commerce platform built with **React.js**, **Spring Boot**, **MongoDB**, and **JWT Authentication**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6, Axios |
| Backend | Spring Boot 3.2, Spring Security |
| Database | MongoDB |
| Auth | JWT (jjwt 0.11.5) |
| DevOps | Docker, Docker Compose |

## Architecture

```
┌─────────────────┐     JWT      ┌──────────────────┐     ┌──────────┐
│   React Frontend │ ──────────► │  Spring Boot API  │ ──► │ MongoDB  │
│   (Port 3000)    │ ◄────────── │   (Port 8080)     │     │ (27017)  │
└─────────────────┘             └──────────────────┘     └──────────┘
```

## Features

- **JWT Authentication** — Stateless token-based auth for customers, vendors, and admins
- **Isolated Vendor Dashboards** — Each vendor manages only their own products and orders
- **Multi-Merchant Product Management** — Full CRUD with inventory tracking
- **Role-Based Access Control** — `ROLE_CUSTOMER`, `ROLE_VENDOR`, `ROLE_ADMIN`
- **Admin Panel** — Vendor approval/suspension, user management
- **Order Management** — Multi-vendor cart, real-time stock deduction, status tracking

## Quick Start

### Prerequisites
- Java 17+, Maven 3.8+
- Node.js 18+
- MongoDB (local or Docker)

### Option 1: Docker Compose (Recommended)
```bash
docker-compose up --build
```

### Option 2: Manual Setup

**Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |

### Products
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/products/public` | Public |
| GET | `/api/vendor/products` | Vendor |
| POST | `/api/vendor/products` | Vendor |
| PUT | `/api/vendor/products/{id}` | Vendor (owner only) |
| DELETE | `/api/vendor/products/{id}` | Vendor (owner only) |

### Orders
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/orders` | Customer |
| GET | `/api/orders/my` | Customer |
| GET | `/api/orders/vendor` | Vendor |
| PUT | `/api/orders/{id}/status` | Vendor |

### Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/admin/vendors` | Admin |
| PUT | `/api/admin/vendors/{id}/approve` | Admin |
| PUT | `/api/admin/vendors/{id}/suspend` | Admin |
| GET | `/api/admin/users` | Admin |

## Sample Request

**Register as Vendor:**
```json
POST /api/auth/register
{
  "name": "John's Electronics",
  "email": "john@example.com",
  "password": "securepass123",
  "role": "VENDOR"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "john@example.com",
  "name": "John's Electronics",
  "role": "ROLE_VENDOR"
}
```

## Security

- Passwords hashed with BCrypt
- JWT tokens expire in 24 hours
- Vendor endpoints enforce ownership checks (vendors can only modify their own products)
- CORS configured for `localhost:3000`
