# Connectly: Modern University Social Networking Platform
## Academic Project Report & Technical Documentation

---

### Executive Summary
**Project Name**: Connectly  
**Domain**: Full-Stack Web Development, Real-Time Distributed Systems, Human-Computer Interaction  
**Tech Stack**: React.js, Tailwind CSS, Node.js, Express.js, MongoDB (Mongoose), Socket.IO, JWT  

---

## 1. Introduction
Modern university campuses are vibrant epicenters of interdisciplinary innovation, student organizations, research initiatives, and social collaboration. However, students frequently face fragmentation across disjointed communication channels—instant messaging groups, outdated forum boards, and commercial social media. 

**Connectly** was designed and implemented as an original, full-stack campus collaboration platform. Built using modern web standards, Connectly bridges the gap between social engagement and academic networking, providing students and faculty with an organized, real-time platform to share project milestones, discuss coursework, discover research opportunities, and communicate directly.

---

## 2. Problem Statement
Existing mainstream social networks (such as Instagram, Twitter/X, and Facebook) are engineered around algorithmic advertising models, virality, and global engagement metrics. In university contexts, these platforms present significant drawbacks:
1. **Algorithmic Noise**: Campus announcements and collaborative project requests are drowned out by global entertainment feeds and advertising.
2. **Lack of Departmental Context**: Mainstream platforms lack academic structuring such as department affiliations, lab locations, and course project repositories.
3. **Data Privacy & Boundaries**: Students are forced to mix their personal social lives with academic collaboration, leading to privacy hesitations.
4. **Scattered Communication**: Class discussions, study groups, and hackathon teams are splintered across messaging apps without searchable, persistent knowledge archives.

---

## 3. Project Objectives
The primary objectives of the Connectly project are:
1. **Architect a Full-Stack Web Platform**: Create a cohesive client-server application adhering to industry-standard software architecture.
2. **Implement Real-Time Capabilities**: Utilize WebSockets (Socket.IO) for instant direct messaging, live online presence, typing indicators, read receipts, and push notifications.
3. **Develop a Responsive, Premium UI/UX**: Design a SaaS-inspired interface using Tailwind CSS and Lucide React that functions flawlessly across desktop, tablet, and mobile devices.
4. **Ensure Robust Security**: Implement JSON Web Token (JWT) stateless authentication, bcryptjs cryptographic password hashing, input sanitization, rate limiting, and role-based authorization.
5. **Optimize Database Persistence**: Design relational document schemas in MongoDB using Mongoose with indexes for high-throughput queries.

---

## 4. Existing System vs. Proposed System

| Feature | Existing Systems (Ad-Hoc / Social) | Proposed System (Connectly) |
|---|---|---|
| **Audience Focus** | Generic global public | University students, researchers, faculty |
| **Feed Algorithm** | Ad-driven engagement maximization | Chronological & academic social graph |
| **Department Tags** | None | Embedded department & lab affiliations |
| **Real-time Messaging** | Separate external apps required | Integrated Socket.IO messaging with read status |
| **Search & Discovery** | Broad, polluted keywords | Debounced search by student, major, and hashtag |
| **Faculty Moderation** | Impersonal automated bans | Campus administrative hub with KPI metrics |

---

## 5. System Features

1. **User Authentication & Profiles**:
   - Secure registration with academic department selection and password validation.
   - JWT token generation and authentication interceptors.
   - Profile management with avatar and cover image uploads, bio, location, and website.
   - Followers and Following management with self-follow prevention.
2. **Post Management & Social Feed**:
   - Post creation supporting rich text, character counters, photo uploads, and `#hashtag` parsing.
   - Chronological personalized home feed aggregating followed peers and own posts.
   - Explore feed with popular campus hashtags and debounced search.
   - Atomic likes, threaded comments, and personal bookmarks.
3. **Real-Time Communication**:
   - One-on-one direct messaging with Socket.IO.
   - Live presence indicator (online/offline and last-seen timestamps).
   - Typing indicator and double-checkmark read receipts.
   - Targeted notification delivery across multi-tab sessions.
4. **Campus Administration Hub**:
   - System KPI cards (total students, posts, comments, conversations, active peers).
   - Searchable student directory.
   - Content moderation for flagged or inappropriate posts.

---

## 6. Technology Stack Analysis

- **Frontend (React 18 & Vite)**:
  - Component-driven architecture facilitating reusable UI units (`Button`, `Avatar`, `Modal`, `PostCard`).
  - React Context API (`AuthContext`, `SocketContext`, `ToastContext`) for predictable global state.
  - Tailwind CSS provides a custom design system with sleek slate/indigo color palettes and responsive breakpoints.
  - Lucide React provides crisp, scalable SVG icons.
- **Backend (Node.js & Express.js)**:
  - Asynchronous non-blocking event loop ideal for I/O-heavy social media operations.
  - Express middleware pipeline for Helmet security headers, CORS origin protection, JSON body parsing, and centralized error handling.
- **Database (MongoDB & Mongoose)**:
  - Schema-enforced document storage with Mongoose ODM.
  - Compound unique indexes preventing duplicate follows and saves.
  - Text indexes enabling multi-field student discovery.
- **Real-Time Layer (Socket.IO)**:
  - Low-latency bidirectional WebSocket connection with HTTP long-polling fallback.
  - Handshake JWT authentication and room-based targeted emissions.

---

## 7. System Architecture & Flow

Connectly follows a client-server Single Page Application (SPA) architecture:
1. **Client Layer**: React SPA compiled with Vite, consuming REST endpoints via an Axios instance with automatic authorization interceptors.
2. **Gateway / API Layer**: Express router matching incoming HTTP requests to dedicated controllers (`authController`, `postController`, etc.) through authentication middleware.
3. **Real-Time Gateway**: Socket.IO server handling socket handshake, user-specific rooms (`user_${userId}`), and conversation rooms (`conv_${conversationId}`).
4. **Data Layer**: Local MongoDB database running on port 27017, storing collections for Users, Posts, Comments, Follows, Conversations, Messages, Notifications, and SavedPosts.

---

## 8. Database Design & Schemas
The database contains 8 collections structured to minimize document bloat:
- `User`: Handles identity, credentials, department affiliation, and presence.
- `Post`: Stores content, media URLs, tags, and like arrays.
- `Comment`: Linked to Post and User with parent comment support.
- `Follow`: Normalized relationship table with compound unique index `{ follower: 1, following: 1 }`.
- `Conversation`: Manages conversation participants and last message previews.
- `Message`: Stores individual message bodies with delivery and read timestamps.
- `Notification`: Records user interactions (like, comment, follow).
- `SavedPost`: Normalized bookmarks table with compound unique index `{ user: 1, post: 1 }`.

---

## 9. Security & Best Practices

1. **Cryptographic Protection**: Passwords hashed with `bcryptjs` (salt rounds = 10); plaintext passwords never stored or returned in API responses.
2. **Stateless Authorization**: Signed JSON Web Tokens with 7-day expiration; verified on both REST requests and Socket.IO handshakes.
3. **CORS & HTTP Headers**: Origin restricted strictly to the frontend URL; Helmet headers prevent clickjacking and MIME-type sniffing.
4. **Input Sanitization**: Mongoose schemas enforce data types, string length bounds, and regex validation for emails and usernames.
5. **Ownership Guards**: Author IDs verified before allowing post/comment update or deletion.
6. **Rate Limiting**: `express-rate-limit` prevents brute-force attempts on authentication routes.

---

## 10. Testing & Quality Assurance

Comprehensive testing was conducted across automated test suites, manual user verification, and edge cases:
- **Automated Verification**: `server/scripts/test-full-flow.js` validated 24 distinct operations covering authentication, post lifecycles, atomic likes, comments, follows, messaging, and admin route protection with a **100% pass rate (24/24)**.
- **Edge Cases Tested**:
  - Duplicate user registration rejected with 409 Conflict.
  - Unauthorized requests without token rejected with 401.
  - Self-follow prevented with 400 Bad Request.
  - Non-admin student blocked from `/admin` with 403 Forbidden.
- **Responsive Layout Verification**: Tested across 390px (mobile), 768px (tablet), and 1280px+ (desktop) screens with no horizontal overflow.

---

## 11. Limitations & Future Scope

### Limitations
1. **Local Upload Storage**: Images are stored locally on the server filesystem (`server/uploads`); for production scale, AWS S3 or Cloudinary should be configured.
2. **Media Formats**: The platform currently supports standard images (JPEG, PNG, WEBP, GIF); video and audio attachments are not yet supported.

### Future Scope
1. **Campus Group / Channels**: Creating department-specific public channels (e.g. #cs-research, #robotics-club).
2. **Events Calendar & RSVP**: Dedicated calendar component for campus hackathons, guest lectures, and student club meetings.
3. **End-to-End Encryption**: Implementing client-side Web Crypto API encryption for confidential peer-to-peer chats.
4. **Native Mobile App**: Packaging with React Native for iOS and Android app stores.

---

## 12. Conclusion
The **Connectly** project successfully demonstrates the design, engineering, and implementation of a modern, production-grade social platform tailored for university communities. By combining React, Tailwind CSS, Node.js, Express, MongoDB, and Socket.IO, Connectly achieves high performance, responsive aesthetics, and robust real-time communication, fulfilling all college project requirements and serving as a model for modern academic networking software.
