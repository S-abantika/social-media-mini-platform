# System Architecture & Technical Design

## 1. High-Level Architectural Pattern

Connectly implements a decoupled, modern Client-Server Single Page Application (SPA) architecture combined with a real-time event-driven WebSocket gateway:

```
+-------------------------------------------------------------+
|                      CLIENT-SIDE SPA                        |
|        (React 18 + Tailwind CSS + Lucide React + Vite)       |
|                                                             |
|  +-------------------------------------------------------+  |
|  |             Application State & Contexts              |  |
|  |     AuthContext  |  SocketContext  |  ToastContext     |  |
|  +-------------------------------------------------------+  |
|          | HTTP REST                 | WebSockets (WSS)     |
|          v                           v                      |
|  +-------------------+      +-------------------------+     |
|  |  Axios Client     |      |  Socket.IO Client       |     |
|  |  (JWT Interceptor)|      |  (Presence, Chat, Alerts)|     |
|  +-------------------+      +-------------------------+     |
+----------|-------------------------------|------------------+
           |                               |
           v                               v
+-------------------------------------------------------------+
|                      SERVER-SIDE RUNTIME                    |
|             (Node.js v24 + Express.js Web Server)           |
|                                                             |
|  +-------------------------------------------------------+  |
|  |                 Middleware Pipeline                   |  |
|  |     Helmet | CORS | Morgan | RateLimit | Multer       |  |
|  +-------------------------------------------------------+  |
|          |                           |                      |
|          v                           v                      |
|  +-------------------+      +-------------------------+     |
|  |  REST Controllers |      |  Socket.IO Handlers     |     |
|  |  (Auth, Posts,    |      |  (Rooms: user_${id},    |     |
|  |   Comments, etc.) |      |   conv_${id}, Presence) |     |
|  +-------------------+      +-------------------------+     |
+----------|-------------------------------|------------------+
           |                               |
           +---------------+---------------+
                           | Mongoose ODM
                           v
+-------------------------------------------------------------+
|                      MONGODB DATABASE                       |
|   Users | Posts | Comments | Follows | Chats | Messages     |
+-------------------------------------------------------------+
```

---

## 2. Key Architecture Principles

1. **Separation of Concerns**: REST endpoints handle transactional CRUD requests and state retrieval; Socket.IO channels handle ephemeral presence, live typing indicators, and instant notification pushes.
2. **Stateless Authentication**: Sessions are managed with signed JWT tokens containing user ID and role claims. No session state is held in server memory, allowing effortless horizontal scaling.
3. **Optimistic UI Updates**: Interactions like liking, following, and bookmarking update UI state immediately on user click, followed by background synchronization with error-reversion safety.
4. **Room-Based Message & Alert Routing**: Each authenticated socket joins a dedicated `user_${userId}` room. This allows targeted notification delivery across multiple browser tabs without polling.
