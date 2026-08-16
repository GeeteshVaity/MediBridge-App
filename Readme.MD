# MediBridge

MediBridge is a full-stack healthcare commerce platform that connects patients with nearby medical shops. Patients can search medicines, add them to a cart, place orders, upload prescriptions, and receive offers from pharmacies. Shopkeepers can manage inventory, accept orders, respond to prescriptions, and handle restocks.

This project uses a modern MERN-style stack with a Next.js frontend and an Express + MongoDB backend.

---

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios
- Lucide Icons
- Leaflet / map UI support

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- CORS
- Dotenv

### Authentication
- Role-based access control
- Patient and shopkeeper roles
- JWT token-based session handling

---

## Key Features

### Patient Features
- User registration and login
- Browse and search medicines
- Add medicines to cart
- Place orders
- Track order status
- Upload prescription documents/images
- Receive offers from nearby medical shops
- Accept the best offer
- View nearby shops on map
- Request unavailable medicines

### Shopkeeper Features
- Inventory management
- Add/update/remove stock
- View pending and accepted orders
- Accept patient orders
- Respond to prescription requests
- Send offers to patients
- Manage restock requests
- Update shop location and contact info
- View dashboard statistics

---

## Project Architecture

- Frontend: Next.js application for user-facing pages
- Backend: Express API server
- Database: MongoDB with Mongoose models
- Authentication: JWT with role checks
- Data models: Users, Orders, Cart, Inventory, Prescriptions, Offers, Notifications, Restock Requests

---

## Prerequisites

Before running the project, ensure you have:

- Node.js 18 or newer
- MongoDB running locally or via MongoDB Atlas
- npm or pnpm
- Git

---

## Environment Variables

Create a `.env` file in the backend root and add:

```env
MONGODB_URI=mongodb://localhost:27017/medibridge
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
```

For the frontend, you may also need environment variables if your app is configured for custom API endpoints:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd MediBridge-App
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

---

## Running the Application

### Start the backend

```bash
cd backend
npm run dev
```

This starts the Express API server.

### Start the frontend

```bash
cd frontend
npm run dev
```

This starts the Next.js app.

---

## Default Development URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

---

## Main API Modules

### Auth
- POST /api/auth/register
- POST /api/auth/login

### Patient
- GET /api/patient/cart
- POST /api/patient/cart
- DELETE /api/patient/cart
- POST /api/patient/create-order
- GET /api/patient/orders
- POST /api/patient/prescriptions
- GET /api/patient/prescriptions
- POST /api/patient/prescriptions/accept-offer

### Shopkeeper
- GET /api/shop/inventory
- POST /api/shop/inventory/add
- DELETE /api/shop/inventory
- GET /api/shop/orders/pending
- POST /api/shop/accept-order
- POST /api/shop/prescriptions/offer

### Public
- GET /api/medicines/search
- GET /api/shops
- POST /api/medicine-requests

---

## Folder Structure

```text
MediBridge-App/
├── backend/
│   ├── config/
│   ├── models/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── app/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   └── package.json
├── .env
├── package.json
└── README.md
```

---

## Notes

This project is designed to support the following workflow:

1. Patient signs up and logs in.
2. Patient searches medicines or uploads a prescription.
3. Nearby shops receive or view the request.
4. Shopkeepers send offers.
5. Patient accepts an offer.
6. Order is created and tracked.

---

## Future Enhancements

- Payment integration
- Real-time notifications
- Chat between patient and shopkeeper
- Admin dashboard
- Delivery tracking
- Better prescription OCR and parsing
- Mobile app version

---

## License

This project is licensed under the MIT License unless otherwise specified.

---

## Conclusion

MediBridge is a practical healthcare marketplace application built with a modern MERN-style architecture, combining patient and shopkeeper workflows, medicine ordering, prescription handling, and local shop discovery in one system.