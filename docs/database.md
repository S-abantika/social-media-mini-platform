# Database Architecture & Schemas

Connectly uses **MongoDB** with the **Mongoose ODM**. Schemas are defined with strict typing, timestamps, validation rules, and indexes.

---

## 1. Entity Relationship Model

```
       +--------------------+
       |       User         |
       +--------------------+
         |   |   |   |   |
         |   |   |   |   +-----------------------+
         |   |   |   +-------------+         |
         |   |   |                 |         |
         |   |   v                 v         v
         |   | +-----------+  +--------+  +---------------+
         |   | | Follow    |  | Post   |  | Conversation  |
         |   | +-----------+  +--------+  +---------------+
         |   |                     |              |
         |   v                     v              v
         | +--------------+   +---------+   +-------------+
         | | Notification |   | Comment |   | Message     |
         | +--------------+   +---------+   +-------------+
         v                         |
       +-----------+               |
       | SavedPost |<--------------+
       +-----------+
```

---

## 2. Collections Specification

### 1. `users`
- **Fields**:
  - `fullName`: String (max: 60, required)
  - `username`: String (unique, lowercase, min: 3, max: 30)
  - `email`: String (unique, lowercase, valid email regex)
  - `password`: String (bcrypt hash, excluded by default)
  - `profileImage`: String (URL path)
  - `coverImage`: String (URL path)
  - `bio`: String (max: 300)
  - `department`: String (e.g. Computer Science, Design)
  - `location`: String (Campus building/lab)
  - `website`: String
  - `followersCount`: Number
  - `followingCount`: Number
  - `postsCount`: Number
  - `isOnline`: Boolean
  - `lastSeen`: Date
  - `role`: Enum (`'user'`, `'admin'`)
- **Indexes**: `{ username: 1 }` (unique), `{ email: 1 }` (unique), Text index on `fullName`, `username`, `bio`, `department`.

### 2. `posts`
- **Fields**:
  - `author`: ObjectId (ref: `User`, indexed)
  - `content`: String (required, max: 2000 chars)
  - `image`: String (optional URL)
  - `likes`: Array of ObjectIds (ref: `User`)
  - `likesCount`: Number (indexed)
  - `commentsCount`: Number
  - `tags`: Array of Strings (indexed)
- **Indexes**: `{ createdAt: -1 }`, `{ author: 1, createdAt: -1 }`, `{ tags: 1 }`, Text index on `content`.

### 3. `comments`
- **Fields**:
  - `post`: ObjectId (ref: `Post`, indexed)
  - `author`: ObjectId (ref: `User`)
  - `content`: String (max: 500)
  - `likes`: Array of ObjectIds (ref: `User`)
  - `parentComment`: ObjectId (ref: `Comment`, optional)
- **Indexes**: `{ post: 1, createdAt: 1 }`.

### 4. `follows`
- **Fields**:
  - `follower`: ObjectId (ref: `User`, indexed)
  - `following`: ObjectId (ref: `User`, indexed)
- **Indexes**: Compound unique index `{ follower: 1, following: 1 }` (prevents duplicate follows).

### 5. `conversations`
- **Fields**:
  - `participants`: Array of ObjectIds (ref: `User`)
  - `lastMessage`: Object (`{ content, sender, createdAt, messageType }`)
  - `unreadCounts`: Map of userId -> count
- **Indexes**: `{ participants: 1 }`, `{ updatedAt: -1 }`.

### 6. `messages`
- **Fields**:
  - `conversation`: ObjectId (ref: `Conversation`, indexed)
  - `sender`: ObjectId (ref: `User`, indexed)
  - `receiver`: ObjectId (ref: `User`, indexed)
  - `content`: String (required)
  - `messageType`: Enum (`'text'`, `'image'`)
  - `isRead`: Boolean
  - `readAt`: Date
- **Indexes**: `{ conversation: 1, createdAt: 1 }`.

### 7. `notifications`
- **Fields**:
  - `recipient`: ObjectId (ref: `User`, indexed)
  - `sender`: ObjectId (ref: `User`)
  - `type`: Enum (`'like'`, `'comment'`, `'follow'`, `'message'`)
  - `post`: ObjectId (ref: `Post`, optional)
  - `comment`: ObjectId (ref: `Comment`, optional)
  - `isRead`: Boolean
- **Indexes**: `{ recipient: 1, isRead: 1, createdAt: -1 }`.

### 8. `savedposts`
- **Fields**:
  - `user`: ObjectId (ref: `User`, indexed)
  - `post`: ObjectId (ref: `Post`, indexed)
- **Indexes**: Compound unique index `{ user: 1, post: 1 }` (prevents duplicate saves).
