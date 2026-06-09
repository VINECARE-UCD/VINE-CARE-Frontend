# 🌿 VineCare — Frontend

**React/Next.js Web Application for Precision Viticulture**

A modern, responsive web application for vineyard managers to manage drone imagery, track phenology, view agronomic KPIs, and monitor yield predictions in real-time.

---

## 📋 Overview

VineCare Frontend is a **React 19 + Vite + Tailwind CSS** application that provides an intuitive dashboard for precision agriculture operations at KOKOTOS ESTATE.

### Key Features

| **Module** | **Description** |
|---|---|
| **🌾 Farms & Blocks** | Manage vineyard blocks with GPS boundaries, grape varieties, and location data |
| **🚁 Drone Flights** | Upload and manage drone imagery (JPG/PNG/JPEG) with flight metadata |
| **🌱 Phenology Tracking** | Monitor vine growth stages throughout the growing season |
| **📊 KPIs Dashboard** | View agronomic key performance indicators in real-time |
| **⚡ Actions** | Log and manage farm actions and task assignments for field crews |
| **🔮 Predictions** | Display ML-based yield and disease risk predictions |
| **🔔 Notifications** | Receive alerts and recommendations from the backend notification service |
| **🔐 Authentication** | Secure login with token-based authentication |

---

## 🛠️ Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + PostCSS
- **State Management**: React Hooks (useState, useContext)
- **HTTP Client**: Fetch API
- **Charts**: Recharts (for KPI visualizations)
- **Linting**: ESLint + React plugins

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ (recommended 18+)
- **npm** or **yarn**
- Backend services running (data-collection, notification, phenology)
- AWS ALB endpoints accessible

### 1. Clone the Repository

```bash
git clone https://github.com/VINECARE-UCD/VINE-CARE-Frontend.git
cd VINE-CARE-Frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file (or copy and edit `.env.example`):

```bash
cp .env.example .env.local
```

Edit `.env.local` with your backend API endpoints:

```env
# Backend Microservices API URLs
VITE_API_URL=http://vine-care-alb-endpoint.eu-central-1.elb.amazonaws.com/phenology/api
VITE_DATA_COLLECTION_URL=http://vine-care-alb-endpoint.eu-central-1.elb.amazonaws.com/data/api
VITE_NOTIFICATION_URL=http://vine-care-alb-endpoint.eu-central-1.elb.amazonaws.com/notifications/api

# Local Development (if running services locally)
# VITE_API_URL=http://localhost:8002/api
# VITE_DATA_COLLECTION_URL=http://localhost:8000/api
# VITE_NOTIFICATION_URL=http://localhost:8001/api

# Optional: Application Configuration
VITE_APP_NAME=VineCare
VITE_APP_VERSION=1.0.0
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at: `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder, ready for deployment to AWS EC2.

---

## 📁 Project Structure

```
VINE-CARE-Frontend/
├── src/
│   ├── components/
│   │   ├── ActionsList.jsx          # Farm actions module
│   │   ├── BlocksList.jsx           # Vineyard blocks management
│   │   ├── FarmsList.jsx            # Farms overview
│   │   ├── FlightsList.jsx          # Drone flights & uploads
│   │   ├── KPIsList.jsx             # Agronomic KPI dashboard
│   │   ├── PhenologyList.jsx        # Phenology tracking
│   │   ├── PredictionsList.jsx      # Yield & disease predictions
│   │   ├── Login.jsx                # Authentication
│   │   └── Toast.jsx                # Notifications/toasts
│   ├── api.js                        # API client & fetch wrapper
│   ├── App.jsx                       # Root component & routing
│   ├── main.jsx                      # Entry point
│   └── index.css                     # Tailwind CSS imports
├── public/                           # Static assets
├── .env.example                      # Environment variables template
├── package.json                      # Dependencies & scripts
├── vite.config.js                    # Vite configuration
├── tailwind.config.js                # Tailwind CSS config
├── postcss.config.js                 # PostCSS configuration
├── eslint.config.js                  # Linting rules
└── README.md                         # This file
```

---

## 🔌 API Integration

The frontend communicates with three backend microservices via HTTP REST APIs:

### **1. Phenology Service (Port 8002)**
```
Base URL: VITE_API_URL
Endpoints:
  GET    /phenology/stages/<block_id>/     Fetch phenology timeline
  POST   /phenology/track/                 Log vine growth stage
  GET    /api/health/                      Health check
```

### **2. Data Collection Service (Port 8000)**
```
Base URL: VITE_DATA_COLLECTION_URL
Endpoints:
  POST   /data/upload/                     Upload drone images
  GET    /data/images/<block_id>/          Retrieve block images
  POST   /data/process/                    Trigger image processing
  GET    /api/health/                      Health check
```

### **3. Notification Service (Port 8001)**
```
Base URL: VITE_NOTIFICATION_URL
Endpoints:
  POST   /notifications/send/              Send alert/notification
  GET    /notifications/history/           Retrieve notification history
  GET    /api/health/                      Health check
```

### Authentication
All requests use **token-based authentication**:
```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `token ${authToken}`
}
```

---

## 🌐 Deployment to AWS EC2

### Frontend EC2 Instances
- **Instance 1**: eu-central-1a, public subnet, public IP: 51.102.185.126
- **Instance 2**: eu-central-1b, public subnet, public IP: 63.178.194.206

### Build & Deploy Steps

#### **1. Build the Frontend**
```bash
npm install
npm run build
# Creates dist/ folder with optimized production build
```

#### **2. Copy to EC2 Instance**
```bash
scp -i your-key.pem -r dist/* ec2-user@51.102.185.126:/var/www/vinecare/
```

#### **3. On the EC2 Instance**
```bash
# Install Node.js (if not already installed)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install a simple HTTP server (e.g., serve)
sudo npm install -g serve

# Serve the built app
serve -s /var/www/vinecare/dist -l 3000
```

#### **4. Configure ALB**
- ALB routes requests to frontend instances
- Frontend served on port 3000 (or Nginx on port 80)
- TLS/HTTPS termination at the ALB

#### **5. Set Environment Variables on EC2**
Create `.env` file in the production build directory:
```bash
cat > /var/www/vinecare/.env << 'EOF'
VITE_API_URL=http://vine-care-alb.eu-central-1.elb.amazonaws.com/phenology/api
VITE_DATA_COLLECTION_URL=http://vine-care-alb.eu-central-1.elb.amazonaws.com/data/api
VITE_NOTIFICATION_URL=http://vine-care-alb.eu-central-1.elb.amazonaws.com/notifications/api
EOF
```

---

## 🔧 Development Workflow

### Running Locally with Backend Services

If you're running backend services locally on your machine:

```bash
# Terminal 1: Start backend services (Docker Compose)
cd ../VINE-CARE-Backend
docker-compose up -d

# Terminal 2: Start frontend dev server
cd ../VINE-CARE-Frontend
npm run dev
```

Your app will connect to local backends:
- Phenology: `http://localhost:8002/api`
- Data Collection: `http://localhost:8000/api`
- Notification: `http://localhost:8001/api`

### Hot Module Replacement (HMR)

Vite automatically reloads the app when you save changes — no manual refresh needed.

### Linting

```bash
npm run lint
```

---

## 📊 Component Reference

### **Login.jsx**
Handles user authentication. Sends credentials to the backend and stores the auth token in localStorage.

### **BlocksList.jsx**
Displays all vineyard blocks with:
- GPS boundary coordinates
- Grape variety
- Farm name
- Filter by farm dropdown

### **FlightsList.jsx**
Manages drone image uploads:
- Drag & drop or file browser upload
- Up to 100 images per batch
- Block ID and altitude metadata
- Progress indication

### **PhenologyList.jsx**
Tracks vine growth stages with timeline visualization using Recharts.

### **KPIsList.jsx**
Displays agronomic metrics:
- Leaf area index (LAI)
- Canopy density
- Disease risk scores
- Yield estimates

### **PredictionsList.jsx**
Shows ML-based predictions:
- Yield forecasts by block
- Disease probability
- Harvest timing recommendations

### **Toast.jsx**
Notification component for alerts, errors, and success messages.

---

## 🌍 Environment Variables Reference

| Variable | Purpose | Example |
|---|---|---|
| `VITE_API_URL` | Phenology service endpoint | `http://localhost:8002/api` |
| `VITE_DATA_COLLECTION_URL` | Data collection service endpoint | `http://localhost:8000/api` |
| `VITE_NOTIFICATION_URL` | Notification service endpoint | `http://localhost:8001/api` |
| `VITE_APP_NAME` | Application display name | `VineCare` |
| `VITE_APP_VERSION` | App version for display | `1.0.0` |

See [`.env.example`](./.env.example) for complete reference.

---

## 🔒 Security Best Practices

- ✅ **Environment variables** for sensitive URLs (never hardcode API endpoints)
- ✅ **Token-based authentication** (JWT or custom tokens from backend)
- ✅ **CORS headers** configured on backend ALBs
- ✅ **HTTPS only** in production (ALB terminates TLS)
- ✅ **No credentials in frontend code** (tokens stored in secure storage)

---

## 📈 Performance Optimization

- **Vite** provides fast development server and optimized production builds
- **Code splitting** enabled by default for lazy-loaded components
- **Tree-shaking** removes unused code in production
- **Recharts** used for efficient KPI visualization
- **Tailwind CSS** provides utility-first styling with minimal CSS

---

## 🚨 Troubleshooting

### **"Cannot find module" errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### **Backend API not responding**
- Verify `.env.local` has correct API URLs
- Check backend services are running: `curl http://localhost:8002/api/health/`
- Verify ALB is accessible from your network

### **Port 5173 already in use**
```bash
npm run dev -- --port 5174
```

---

## 📞 Support & Contact

For issues related to the VineCare frontend:
- Check the [README](./README.md) troubleshooting section
- Review browser console for error messages
- Verify backend services are healthy
- Check `.env.local` configuration

---

## 📄 License

This project is developed for KOKOTOS ESTATE and is confidential. All rights reserved.

---

**Last Updated**: June 2026  
**Framework**: React 19 + Vite  
**Deployment**: AWS EC2 (eu-central-1)  
**Status**: Production
