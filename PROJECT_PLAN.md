# Connectly - Full-Stack Social Media Mini Platform
## Master Project Plan & Architectural Specification

Connectly is an original, full-stack social networking platform designed specifically for university and college communities. It offers a modern SaaS-style dashboard interface for academic networking, knowledge sharing, campus events, and real-time collaboration.

---

## 1. Project Overview & Technology Stack

| Layer | Technologies & Libraries |
|---|---|
| **Frontend** | React 18+, React Router DOM v6, Axios, Socket.IO Client, Tailwind CSS, Lucide React |
| **Backend** | Node.js (v24), Express.js, MongoDB, Mongoose, JSON Web Tokens (JWT), bcryptjs, Socket.IO, Multer, Helmet, Cors, Morgan, Express-Rate-Limit |
| **Database** | MongoDB Server (running locally on port 27017) |
| **Architecture** | Client-Server Single Page Application (SPA) with RESTful APIs & WebSocket event gateway |

---

## 2. System Architecture

```
+-------------------------------------------------------------------------+
|                              CONNECTLY CLIENT                           |
|                      (React + Tailwind CSS + Lucide)                    |
|                                                                         |
|  +-------------------+  +---------------------+  +-------------------+  |
|  |    AuthContext    |  |    SocketContext    |  |   ToastContext    |  |
|  +-------------------+  +---------------------+  +-------------------+  |
|           |                        |                       |            |
|           v                        v                       v            |
|  +-------------------+  +---------------------+  +-------------------+  |
|  |  Axios API Client |  |  Socket.IO Client   |  | UI Component Tree |  |
|  +-------------------+  +---------------------+  +-------------------+  |
+-----------|------------------------|------------------------------------+
            | HTTP / REST            | WebSocket (WSS)
            v                        v
+-------------------------------------------------------------------------+
|                              EXPRESS SERVER                             |
|                        (Node.js + Socket.IO Server)                     |
|                                                                         |
|  +-------------------+  +---------------------+  +-------------------+  |
|  |  REST Middleware  |  |  Auth / Role Guards |  |  Socket Gateway   |  |
|  +-------------------+  +---------------------+  +-------------------+  |
|           |                        |                       |            |
|           v                        v                       v            |
|  +-------------------+  +---------------------+  +-------------------+  |
|  | API Controllers   |  | Multer Local Upload |  | Realtime Presence |  |
|  | (Auth, Posts, etc)|  | Storage (/uploads)  |  | & Chat Rooms      |  |
|  +-------------------+  +---------------------+  +-------------------+  |
+-----------|-------------------------------------------------------------+
            | Mongoose ODM
            v
+-------------------------------------------------------------------------+
|                             MONGODB DATABASE                            |
|  Users | Posts | Comments | Follows | Conversations | Messages | Notifs |
+-------------------------------------------------------------------------+
```

---

## 3. Directory & Folder Structure

```
social-media-analytics/
├── PROJECT_PLAN.md
├── README.md
├── TESTING.md
├── docs/
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   ├── socket-events.md
│   ├── setup.md
│   └── project-report.md
│
├── server/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── postController.js
│   │   │   ├── commentController.js
│   │   │   ├── followController.js
│   │   │   ├── savedPostController.js
│   │   │   ├── messageController.js
│   │   │   ├── notificationController.js
│   │   │   └── adminController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   └── uploadMiddleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Post.js
│   │   │   ├── Comment.js
│   │   │   ├── Follow.js
│   │   │   ├── Conversation.js
│   │   │   ├── Message.js
│   │   │   ├── Notification.js
│   │   │   └── SavedPost.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── postRoutes.js
│   │   │   ├── commentRoutes.js
│   │   │   ├── followRoutes.js
│   │   │   ├── savedPostRoutes.js
│   │   │   ├── messageRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── services/
│   │   │   ├── notificationService.js
│   │   │   └── messageService.js
│   │   ├── sockets/
│   │   │   ├── socketHandler.js
│   │   │   ├── chatSocket.js
│   │   │   └── presenceSocket.js
│   │   ├── utils/
│   │   │   ├── generateToken.js
│   │   │   └── pagination.js
│   │   ├── app.js
│   │   └── server.js
│   ├── scripts/seed.js
│   ├── uploads/
│   ├── .env
│   ├── .env.example
│   └── package.json
│
└── client/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── common/
    │   │   ├── layout/
    │   │   ├── post/
    │   │   ├── profile/
    │   │   ├── chat/
    │   │   └── notification/
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   ├── SocketContext.jsx
    │   │   └── ToastContext.jsx
    │   ├── hooks/
    │   ├── services/
    │   ├── routes/
    │   ├── pages/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    ├── .env.example
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── vite.config.js
```

---

## 4. Database Collections & Relationships

1. **User**: Credentials, profiles, counters, presence flags, academic details.
2. **Post**: Text content, image URL, author reference, likes array, comment counter.
3. **Comment**: Post reference, author reference, text content, likes, optional parentComment.
4. **Follow**: Follower and following references with unique compound index.
5. **Conversation**: Participants array, lastMessage preview, unread counts map.
6. **Message**: Conversation reference, sender, receiver, content, read flag, timestamp.
7. **Notification**: Recipient, sender, event type (follow/like/comment/message), targets, read flag.
8. **SavedPost**: User and post references with unique compound index.

---

## 5. API Endpoints Catalog

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Users**: `/api/users/profile/:username`, `/api/users/profile`, `/api/users/avatar`, `/api/users/:id/followers`, `/api/users/:id/following`, `/api/users/search`, `/api/users/suggested`
- **Posts**: `/api/posts/feed`, `/api/posts/explore`, `/api/posts/user/:username`, `/api/posts/:id`, `/api/posts` (POST, PUT, DELETE), `/api/posts/:id/like`
- **Comments**: `/api/comments/post/:postId`, `/api/comments/post/:postId` (POST), `/api/comments/:id` (DELETE)
- **Follow**: `/api/follow/:userId` (POST, DELETE), `/api/follow/status/:userId`
- **Saved**: `/api/saved`, `/api/saved/:postId` (POST, DELETE)
- **Messages**: `/api/messages/conversations`, `/api/messages/conversations` (POST), `/api/messages/:conversationId`, `/api/messages` (POST)
- **Notifications**: `/api/notifications`, `/api/notifications/:id/read`, `/api/notifications/read-all`
- **Admin**: `/api/admin/stats`, `/api/admin/users`, `/api/admin/posts/:id` (DELETE)

---

## 6. Socket.IO Event Architecture

- `connection`: JWT handshake verification, user room registration (`user_<userId>`)
- `join_conversation` & `leave_conversation`: Channel routing for instant message flow
- `send_message` & `receive_message`: Instant delivery across sender and receiver
- `typing` & `stop_typing`: Instant user typing feedback
- `message_read` & `read_receipt`: Double-check delivery and read verification
- `user_online` & `user_offline`: Real-time presence broadcast
- `new_notification`: Targeted alert delivery for likes, comments, and follows

---

## 7. Frontend Routing

- `/login` & `/register` & `/forgot-password`: Public authentication
- `/` or `/home`: Feed + post composer + active peers
- `/explore`: Debounced search + trending campus topics
- `/notifications`: Live notification feed with read toggles
- `/messages` & `/messages/:conversationId`: Real-time chat dashboard
- `/saved`: Saved posts collection
- `/profile` & `/profile/:username`: User profile, academic info, tabbed posts/media
- `/settings`: Account settings, avatar upload, and profile editing
- `/admin`: Moderation & campus analytics dashboard

---

## 8. Implementation Phases & Status

- **Phase 1**: Project setup, dependencies, base folder structure. `[COMPLETED]`
- **Phase 2**: Authentication, User model, JWT security, AuthContext. `[COMPLETED]`
- **Phase 3**: User profiles, avatar upload, follow/unfollow system. `[COMPLETED]`
- **Phase 4**: Posts, images, likes, comments, and saved posts. `[COMPLETED]`
- **Phase 5**: Feed algorithm, Explore page, debounced search. `[COMPLETED]`
- **Phase 6**: Notifications system with real-time alerts. `[COMPLETED]`
- **Phase 7**: Real-time chat (Socket.IO), typing, presence, read receipts. `[COMPLETED]`
- **Phase 8**: Responsive design, mobile bottom nav, toasts, modals. `[COMPLETED]`
- **Phase 9**: Admin dashboard, statistics, and moderation. `[COMPLETED]`
- **Phase 10**: Realistic seed script, academic report, documentation, testing. `[COMPLETED]`

---

## 9. Verification & Audit Sign-Off

- **Backend Health**: Express API + Socket.IO Server active on port 5000.
- **Frontend Health**: Vite React SPA active on port 5173.
- **Database**: Local MongoDB connected and seeded with 10 users, 15 posts, 40 follows, chats, and notifications.
- **Automated Verification**: `test-full-flow.js` executed with **24/24 tests passing (100%)**.
- **Documentation**: Comprehensive report in `docs/project-report.md`, API reference in `docs/api.md`, architecture in `docs/architecture.md`, test cases in `TESTING.md`.

