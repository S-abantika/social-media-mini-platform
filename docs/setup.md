# Development Setup & Troubleshooting

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher (v24 recommended)
- **MongoDB**: Community Server v6.0+ (running locally on `mongodb://127.0.0.1:27017`)
- **Package Manager**: npm v9+

---

## 2. Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/connectly
JWT_SECRET=connectly_jwt_super_secret_key_2026_campus_network
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_SERVER_URL=http://localhost:5000
```

---

## 3. Installation & Startup

### Step 1: Install Server Dependencies & Seed Data
```bash
cd server
npm install
npm run seed
```

### Step 2: Start Backend Server
```bash
npm start
# Server listens on port 5000
```

### Step 3: Install Client Dependencies & Run
```bash
cd ../client
npm install
npm run dev
# Vite runs on http://localhost:5173
```

---

## 4. Troubleshooting Guide

| Issue | Cause | Resolution |
|---|---|---|
| `MongoServerError: connect ECONNREFUSED` | MongoDB is not running on 127.0.0.1:27017 | Start MongoDB Windows service (`net start MongoDB`) or run `mongod` |
| `CORS Error in Browser` | Origin mismatch | Verify `CLIENT_URL` in `server/.env` matches `http://localhost:5173` |
| `Invalid token / Unauthorized` | Token expired | Clear browser localStorage (`connectly_token`) and log in again |
| `Uploaded image not showing` | Static path issue | Verify `server/uploads` directory exists; server statically serves `/uploads` |
