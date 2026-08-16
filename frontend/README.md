# 💊 MediBridge

**Connecting Patients with Nearby Medical Stores in Real Time**

MediBridge is a modern healthcare platform that bridges the gap between patients and medical stores. Upload prescriptions, search for medicines, and get your orders fulfilled by verified stores near you.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [API Endpoints](#-api-endpoints)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### For Patients
- **🔐 User Authentication** - Secure signup and login with JWT-based authentication
- **📤 Prescription Upload** - Upload prescription images and let nearby stores prepare your order
- **💊 Medicine Search** - Search for medicines with real-time availability from nearby stores
- **🗺️ Find Nearby Stores** - Discover medical stores close to you using location-based search with Leaflet maps
- **🛒 Shopping Cart** - Add medicines to cart and manage your orders
- **📦 Order Tracking** - Track your order status from placement to delivery
- **🔔 Real-time Notifications** - Get notified when stores respond to your prescriptions
- **📊 Dashboard** - View your order history, active orders, and prescriptions at a glance

### For Shopkeepers
- **📦 Inventory Management** - Add, update, and manage medicine stock with expiry tracking
- **📋 Order Management** - View and manage incoming orders from patients
- **📄 Prescription Handling** - Review uploaded prescriptions and send offers to patients
- **⚠️ Low Stock Alerts** - Get notified when stock runs low
- **📍 Location Setup** - Set your store location for proximity-based discovery
- **🔄 Restock Requests** - Request restocks and manage supplier communications
- **📈 Dashboard Analytics** - View pending orders, low stock items, and store performance

### General Features
- **🌙 Dark/Light Mode** - Toggle between dark and light themes
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **🔒 Secure API** - Protected API routes with JWT middleware
- **⚡ Fast Performance** - Built with Next.js App Router and Turbopack for optimal performance

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first CSS framework |
| **Radix UI** | Accessible UI primitives |
| **Lucide Icons** | Beautiful icon set |
| **React Hook Form** | Form handling |
| **Zod** | Schema validation |
| **Recharts** | Data visualization |
| **Leaflet** | Interactive maps |
| **next-themes** | Dark mode support |

### Backend
| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | Backend API |
| **MongoDB Atlas** | Cloud database |
| **Mongoose** | MongoDB ODM |
| **JWT** | Authentication tokens |
| **bcrypt.js** | Password hashing |

### Development
| Technology | Purpose |
|------------|---------|
| **Turbopack** | Fast development builds |
| **ESLint** | Code linting |
| **PostCSS** | CSS processing |

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** or **pnpm** - Package manager
- **MongoDB Atlas Account** - [Sign up](https://www.mongodb.com/atlas) (or local MongoDB installation)
- **Git** - [Download](https://git-scm.com/)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/medibridge.git
cd medibridge
```

### 2. Navigate to the Project Directory

```bash
cd "New folder"
```

### 3. Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

Using pnpm:
```bash
pnpm install
```

---

## 🔐 Environment Variables

Create a `.env` file in the `New folder` directory with the following variables:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/medibridge?retryWrites=true&w=majority

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Optional: Groq API Key (for AI features)
GROQ_API_KEY=your-groq-api-key
```

### Setting up MongoDB Atlas

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Click "Connect" and choose "Connect your application"
4. Copy the connection string and replace `<username>`, `<password>`, and `<cluster>` with your details
5. Replace the database name with `medibridge`

### Generating JWT Secret

You can generate a secure JWT secret using:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

This starts the development server with Turbopack at `http://localhost:3000`

### Production Build

```bash
npm run build
npm run start
```

### Lint Check

```bash
npm run lint
```

---

## 📁 Project Structure

```
New folder/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── medicine-requests/    # Medicine request management
│   │   ├── medicines/            # Medicine search
│   │   ├── notifications/        # Notification system
│   │   ├── patient/              # Patient-specific endpoints
│   │   ├── shop/                 # Shop dashboard & management
│   │   └── shops/                # Shop discovery
│   ├── login/                    # Login page
│   ├── signup/                   # Registration page
│   ├── patient/                  # Patient dashboard & pages
│   │   ├── cart/                 # Shopping cart
│   │   ├── medicines/            # Medicine search
│   │   ├── orders/               # Order history
│   │   ├── prescription/         # Upload prescriptions
│   │   └── stores/               # Find nearby stores
│   └── shopkeeper/               # Shopkeeper dashboard & pages
│       ├── inventory/            # Manage inventory
│       ├── orders/               # Manage orders
│       ├── prescriptions/        # Handle prescriptions
│       ├── location/             # Set store location
│       └── restock/              # Restock management
├── components/                   # Reusable UI components
│   └── ui/                       # shadcn/ui components
├── contexts/                     # React contexts
│   └── AuthContext.tsx           # Authentication context
├── hooks/                        # Custom React hooks
├── lib/                          # Utility functions
│   ├── auth-middleware.ts        # JWT verification
│   ├── jwt.ts                    # JWT utilities
│   ├── mongodb.ts                # Database connection
│   └── utils.ts                  # Helper functions
├── models/                       # Mongoose models
│   ├── Cart.ts                   # Shopping cart model
│   ├── Inventory.ts              # Store inventory model
│   ├── MedicineRequest.ts        # Medicine requests
│   ├── Notification.ts           # Notifications
│   ├── Order.ts                  # Orders model
│   ├── Prescription.ts           # Prescriptions model
│   ├── PrescriptionOffer.ts      # Shop offers
│   ├── RestockRequest.ts         # Restock requests
│   └── User.ts                   # User model
├── scripts/                      # Utility scripts
│   └── seed-medicines.js         # Database seeding
└── styles/                       # Global styles
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

MediBridge is optimized for deployment on [Vercel](https://vercel.com/), the platform from the creators of Next.js.

#### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/medibridge)

#### Option 2: Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd "New folder"
   vercel
   ```

4. **Set Environment Variables**
   
   In your Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add the following variables:
     - `MONGODB_URI` - Your MongoDB connection string
     - `JWT_SECRET` - Your JWT secret key
     - `GROQ_API_KEY` - (Optional) Your Groq API key

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

#### Vercel Configuration Tips

- **Root Directory**: Set to `New folder` in your Vercel project settings
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### Alternative Deployment Options

#### Docker (Coming Soon)

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Other Platforms
- **Railway** - Works out of the box with Next.js
- **Render** - Set build command to `npm run build`
- **DigitalOcean App Platform** - Use the Next.js preset

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |

### Patient
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patient/dashboard` | Get dashboard stats |
| GET | `/api/patient/cart` | Get cart items |
| POST | `/api/patient/cart` | Add to cart |
| POST | `/api/patient/create-order` | Create order |

### Shop
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shop/dashboard` | Get shop dashboard |
| GET | `/api/shops` | Get nearby shops |
| GET | `/api/medicines/search` | Search medicines |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| POST | `/api/notifications/mark-read` | Mark as read |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit your changes**
   ```bash
   git commit -m "Add some amazing feature"
   ```

4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Vercel](https://vercel.com/) - Deployment Platform
- [MongoDB Atlas](https://www.mongodb.com/atlas) - Cloud Database
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Radix UI](https://www.radix-ui.com/) - Accessible Primitives
- [Lucide Icons](https://lucide.dev/) - Beautiful Icons

---

<p align="center">
  Made with ❤️ by the MediBridge Team
</p>
