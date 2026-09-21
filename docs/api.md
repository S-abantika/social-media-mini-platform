# Connectly REST API Documentation

Base URL: `http://localhost:5000/api`

Standard Response Format:
```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... },
  "pagination": { ... }
}
```

---

## 1. Authentication Endpoints

### Register User
- **POST** `/auth/register`
- **Access**: Public
- **Body**:
  ```json
  {
    "fullName": "Jordan Taylor",
    "username": "jordant",
    "email": "jordan@connectly.edu",
    "password": "Password123!",
    "confirmPassword": "Password123!",
    "department": "Business Administration"
  }
  ```
- **Response**: `201 Created` with JWT token and safe user object.

### Login User
- **POST** `/auth/login`
- **Access**: Public
- **Body**:
  ```json
  {
    "identifier": "alex@connectly.edu",
    "password": "Password123!"
  }
  ```
- **Response**: `200 OK` with JWT token and user profile.

### Current User Profile
- **GET** `/auth/me`
- **Access**: Private (Bearer Token)
- **Response**: `200 OK` with authenticated user profile.

---

## 2. User & Profile Endpoints

- **GET** `/users/profile/:username`: Get public profile by username with follow status.
- **PUT** `/users/profile`: Update current user's profile details.
- **POST** `/users/avatar`: Upload profile picture file (`multipart/form-data`).
- **GET** `/users/:id/followers`: List followers of user.
- **GET** `/users/:id/following`: List users followed by user.
- **GET** `/users/search?q=query`: Debounced search query for students.
- **GET** `/users/suggested`: List recommended peers to follow.

---

## 3. Post Endpoints

- **GET** `/posts/feed?page=1`: Get personalized feed (posts from followed users + own).
- **GET** `/posts/explore?page=1&tag=tag&search=search`: Discover trending posts.
- **GET** `/posts/user/:username`: Get posts by user.
- **GET** `/posts/:id`: Get single post details.
- **POST** `/posts`: Create post (supports optional image upload & hashtags).
- **PUT** `/posts/:id`: Update post content (author/admin only).
- **DELETE** `/posts/:id`: Delete post (author/admin only).
- **POST** `/posts/:id/like`: Toggle like/unlike on post.

---

## 4. Comment Endpoints

- **GET** `/comments/post/:postId`: Get comments on a post.
- **POST** `/comments/post/:postId`: Post a comment.
- **DELETE** `/comments/:id`: Delete comment (author/post-author/admin only).

---

## 5. Follow Endpoints

- **POST** `/follow/:userId`: Follow a user.
- **DELETE** `/follow/:userId`: Unfollow a user.
- **GET** `/follow/status/:userId`: Check follow relationship.

---

## 6. Saved Posts Endpoints

- **GET** `/saved?page=1`: Get user's saved/bookmarked posts.
- **POST** `/saved/:postId`: Save post.
- **DELETE** `/saved/:postId`: Unsave post.

---

## 7. Messages & Conversations Endpoints

- **GET** `/messages/conversations`: Get user's active conversations.
- **POST** `/messages/conversations`: Get or start conversation with recipient.
- **GET** `/messages/:conversationId`: Get message history.
- **POST** `/messages`: Send message via REST fallback.

---

## 8. Notifications Endpoints

- **GET** `/notifications?page=1`: List notifications & unread count.
- **PATCH** `/notifications/:id/read`: Mark single notification read.
- **PATCH** `/notifications/read-all`: Mark all notifications read.

---

## 9. Admin Endpoints

- **GET** `/admin/stats`: Get platform metrics (users, posts, chats, online peers).
- **GET** `/admin/users?page=1&search=...`: Moderate student directory.
- **DELETE** `/admin/posts/:id`: Moderate and delete inappropriate content.
