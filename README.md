# Connectly - Campus Social Network
> A modern, full-stack university social networking platform built with React.js, Tailwind CSS, Node.js, Express.js, MongoDB (Mongoose), and Socket.IO.

[![Full-Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20Express%20%7C%20MongoDB%20%7C%20Socket.IO-indigo.svg)](https://github.com)
[![Status](https://img.shields.io/badge/Status-Completed%20%26%20Verified-emerald.svg)](https://github.com)

---

## 1. Project Overview

**Connectly** is an original social networking platform created specifically for college and university communities. Unlike commercial platforms designed around algorithmic ad delivery, Connectly functions as an academic collaboration and campus community hub. Students and faculty can share research, project updates, hackathon announcements, coordinate campus activities, follow peers across departments, and chat in real time.

---

## 2. Key Features

- **Authentication & Security**:
  - Secure JWT authentication with HMAC SHA-256 tokens and bcryptjs password hashing.
  - Role-based access control (Student vs Admin/Faculty Dean).
  - Protected API endpoints, rate limiting, and Helmet HTTP security headers.
  - One-click demo login buttons for instant evaluation.
- **Personalized Feed & Posts**:
  - Feed algorithm displaying posts from followed peers and personal updates.
  - Post composer with text, character limit counter, photo uploads, and automatic `#hashtag` parsing.
  - Optimistic UI interactions for likes, inline comments, bookmarks, and sharing.
  - Content editing and ownership validation for post authors and admins.
- **Profiles & Academic Social Graph**:
  - Department tags (e.g. Computer Science, HCI, Robotics, AI, Business).
  - Avatar and cover banner uploads.
  - Follow / Unfollow system with follower and following count modals.
  - Self-follow prevention and duplicate follow avoidance.
- **Explore & Debounced Discovery**:
  - Debounced search bar querying both posts and student profiles without overloading APIs.
  - Trending campus topics filter pills (`#hackathon`, `#robotics`, `#uxdesign`, `#campuslife`).
- **Real-Time Messaging (Socket.IO)**:
  - 1-on-1 direct conversations with real-time delivery across rooms.
  - Live presence tracking (Online / Last seen timestamps).
  - Real-time typing indicators (`... is typing`).
  - Read receipts with visual delivery checkmarks.
- **Real-Time Notifications**:
  - Instant alerts for likes, comments, and new followers via targeted Socket.IO rooms.
  - Unread notification badges and one-click "Mark all as read".
- **Faculty / Admin Hub**:
  - Comprehensive KPI dashboard (Total Students, Posts, Discussions, Active Connections).
  - Student directory table with search.
  - Content moderation tools for managing inappropriate posts.
- **Responsive SaaS UI**:
  - Modern, minimal SaaS aesthetic built with Tailwind CSS and Lucide React.
  - 3-column desktop layout (Navigation, Feed, Right Widgets).
  - Mobile bottom navigation bar and full-screen chat experience.

---

## 3. Technology Stack

### Frontend
- **React.js 18** (Vite SPA architecture)
- **React Router DOM v6** (Nested layout routing, route guards)
- **Tailwind CSS** (Custom theme tokens, dark mode compatibility)
- **Lucide React** (Consistent UI iconography)
- **Axios** (Centralized client with automatic JWT request/response interceptors)
- **Socket.IO Client** (WebSocket event gateway for real-time presence & messaging)

### Backend
- **Node.js** (v24 runtime)
- **Express.js** (REST API framework)
- **MongoDB** & **Mongoose ODM** (Document database with compound indexes)
- **Socket.IO** (Real-time bidirectional event transport)
- **JSON Web Tokens (JWT)** & **bcryptjs** (Authentication & password security)
- **Multer** (Local multipart file upload handling)
- **Helmet, CORS, Morgan, Express-Rate-Limit** (Security & logging)

---

## 4. Folder Structure

```
social-media-analytics/
├── PROJECT_PLAN.md               # Master architectural blueprint
├── README.md                     # Main documentation & run instructions
├── TESTING.md                    # Comprehensive test verification results
├── docs/                         # Academic documentation suite
│   ├── architecture.md           # System and component architecture
│   ├── database.md               # Schemas, relationships, and indexes
│   ├── api.md                    # REST API endpoint reference
│   ├── socket-events.md          # Real-time event catalog
│   ├── setup.md                  # Development environment guide
│   └── project-report.md         # Full college project academic report
│
├── server/
│   ├── src/
│   │   ├── config/db.js          # MongoDB connection handler
│   │   ├── controllers/          # Business logic handlers
│   │   ├── middleware/           # Auth, error, and upload middlewares
│   │   ├── models/               # Mongoose data schemas (8 models)
│   │   ├── routes/               # Express REST route controllers
│   │   ├── services/             # Notification and messaging services
│   │   ├── sockets/              # Socket.IO modular event handlers
│   │   ├── utils/                # JWT generator and pagination helpers
│   │   ├── app.js                # Express app setup and middleware pipeline
│   │   └── server.js             # HTTP server & WebSocket bootstrap
│   ├── scripts/
│   │   ├── seed.js               # Realistic university seed generator
│   │   └── test-full-flow.js     # 24-step automated verification suite
│   ├── uploads/                  # Uploaded user avatars and post photos
│   ├── .env                      # Server environment configuration
│   └── package.json
│
└── client/
    ├── src/
    │   ├── components/           # Common UI, Layout, Post, Profile, Chat, Notif
    │   ├── context/              # AuthContext, SocketContext, ToastContext
    │   ├── hooks/                # useAuth, useSocket, useToast, useDebounce
    │   ├── pages/                # Auth, Home, Explore, Profile, Chat, Admin
    │   ├── routes/               # ProtectedRoute, AdminRoute, AppRoutes
    │   ├── services/             # Axios API service modules
    │   ├── App.jsx               # Root application wrapper
    │   ├── main.jsx              # Application entrypoint
    │   └── index.css             # Tailwind base and design utilities
    ├── .env                      # Client environment configuration
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 5. Quick Start & Running the Project

### Prerequisites
- Node.js (v18 or higher; tested on v24)
- MongoDB Server running locally on port 27017

### 1. Backend Setup
```bash
cd server
npm install
npm run seed     # Populates 10 realistic campus users, 15 posts, chats, follows
npm start        # Launches backend server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev      # Launches Vite React client on http://localhost:5173
```

Open your browser at **`http://localhost:5173`**.

---

## 6. Demo Credentials

For quick evaluation, click the demo buttons on the Login page or use:

| Role | Email | Password | Details |
|---|---|---|---|
| **CS Student** | `alex@connectly.edu` | `Password123!` | Junior CS major, active posts & chats |
| **HCI Student** | `sarah@connectly.edu` | `Password123!` | Design Lead, campus shuttle tester |
| **Robotics Student** | `liam@connectly.edu` | `Password123!` | Drone racing & quadrupeds builder |
| **Faculty Dean / Admin** | `admin@connectly.edu` | `AdminPass123!` | Access to `/admin` dashboard & moderation |

---

## 7. Verification & Testing Status

Automated end-to-end API test suite:
```bash
cd server
node scripts/test-full-flow.js
```

**Results: 24 PASSED, 0 FAILED** across Authentication, JWT Security, Post CRUD, Atomic Likes, Comments, Bookmarks, Follow Graph, Real-Time Messaging, Notifications, Search, and Role-Based Moderation.

For complete test case specifications, refer to [TESTING.md](file:///c:/Users/Administrator/social-media-analytics/TESTING.md).
