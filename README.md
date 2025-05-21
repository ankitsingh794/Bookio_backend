# 🚀 Bookio Backend

Backend API server for Bookio — a real-time event ticket booking platform built with Node.js, Express & MongoDB.

---

## ✨ Features

- 🔐 User authentication & authorization (JWT)
- 👥 Role-based access control (Admin, User)
- 📅 Event CRUD operations with geolocation support
- 🎟️ Real-time booking management
- 💬 User feedback & support system
- 🖼️ Image upload via Cloudinary
- 🔄 Secure password reset via email
- 🚦 Account status management (active, suspended, banned)

---

## 🛠️ Tech Stack

- Node.js & Express.js
- MongoDB & Mongoose
- JWT for auth
- Multer & Cloudinary for image uploads
- Nodemailer for email
- Helmet & CORS for security

---

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- MongoDB instance (local or cloud)
- Cloudinary account for image uploads
- SMTP email credentials

### Installation

```bash
git clone https://github.com/ankitsingh794/Bookio_backend.git
cd Bookio_backend
npm install
````

Create a `.env` file in the root with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the server:

```bash
node server.js
```

Server runs at: `http://localhost:5000`

---

## 📚 API Routes Overview

### Auth

| Method | Endpoint                          | Description            |
| ------ | --------------------------------- | ---------------------- |
| POST   | `/api/auth/register`              | Register new user      |
| POST   | `/api/auth/login`                 | User login             |
| POST   | `/api/auth/forgot-password`       | Request password reset |
| PUT    | `/api/auth/reset-password/:token` | Reset password         |

### Events

| Method | Endpoint          | Description               |
| ------ | ----------------- | ------------------------- |
| GET    | `/api/events`     | Get all events            |
| GET    | `/api/events/:id` | Get event details         |
| POST   | `/api/events`     | Create event (protected)  |
| PUT    | `/api/events/:id` | Update event (protected)  |
| DELETE | `/api/events/:id` | Delete event (admin only) |

### Users

| Method | Endpoint                | Description                        |
| ------ | ----------------------- | ---------------------------------- |
| PATCH  | `/api/users/:id`        | Update user profile (protected)    |
| PATCH  | `/api/users/:id/status` | Update account status (admin only) |

### Bookings

| Method | Endpoint                       | Description                       |
| ------ | ------------------------------ | --------------------------------- |
| POST   | `/api/bookings`                | Create booking (protected)        |
| GET    | `/api/bookings/user`           | User's bookings (protected)       |
| GET    | `/api/bookings/event/:eventId` | Bookings for event (protected)    |
| PUT    | `/api/bookings/:bookingId`     | Update booking status (protected) |
| DELETE | `/api/bookings/:bookingId`     | Delete booking (protected)        |

### Feedback

| Method | Endpoint                        | Description                               |
| ------ | ------------------------------- | ----------------------------------------- |
| POST   | `/api/feedback/support`         | Submit app support feedback               |
| GET    | `/api/feedback/support`         | Get all support feedback (admin only)     |
| POST   | `/api/feedback/event`           | Submit event feedback                     |
| GET    | `/api/feedback/event`           | Organizer gets event feedback (protected) |
| PUT    | `/api/feedback/event/:id/reply` | Reply to event feedback (protected)       |
| DELETE | `/api/feedback/event/:id`       | Delete event feedback (protected)         |

### Upload

| Method | Endpoint            | Description                |
| ------ | ------------------- | -------------------------- |
| POST   | `/api/upload/image` | Upload image to Cloudinary |

