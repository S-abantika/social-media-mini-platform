# Socket.IO Event Architecture

Connectly uses **Socket.IO** for real-time presence tracking, direct messaging, typing indicators, read receipts, and live notification delivery.

Server Gateway URL: `http://localhost:5000`

---

## 1. Handshake Authentication & Rooms

### Handshake
When connecting, the client passes its JWT token in `auth.token`:
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: localStorage.getItem('connectly_token') }
});
```
The server middleware verifies the token and binds `socket.userId = decoded.userId`.

### Rooms
1. **User Room (`user_${userId}`)**: Joined upon connection. Used to deliver private notifications, conversation preview updates, and friend events directly to the user across any open browser tabs.
2. **Conversation Room (`conv_${conversationId}`)**: Joined when opening a conversation thread.

---

## 2. Event Catalog

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `connection` | Client -> Server | Handshake auth `{ token }` | Authenticates socket and joins user room |
| `join_conversation` | Client -> Server | `conversationId` | Joins `conv_${conversationId}` room |
| `leave_conversation` | Client -> Server | `conversationId` | Leaves conversation room |
| `send_message` | Client -> Server | `{ conversationId, receiverId, content, messageType }` | Persists message, emits to conversation & receiver room |
| `receive_message` | Server -> Client | Full `Message` object | Emitted to room participants instantly |
| `conversation_updated` | Server -> Client | `{ conversationId, lastMessage }` | Pushed to receiver's user room to update preview |
| `typing` | Client -> Server | `{ conversationId, receiverId, username }` | Broadcasts `user_typing` to conversation |
| `user_typing` | Server -> Client | `{ conversationId, userId, username }` | Shows typing pulse in chat window |
| `stop_typing` | Client -> Server | `{ conversationId, receiverId }` | Broadcasts `user_stop_typing` to conversation |
| `user_stop_typing` | Server -> Client | `{ conversationId, userId }` | Hides typing pulse |
| `message_read` | Client -> Server | `{ conversationId, messageIds, senderId }` | Updates DB `isRead: true`, emits `read_receipt` |
| `read_receipt` | Server -> Client | `{ conversationId, readBy, readAt }` | Turns checkmarks into blue double checkmarks |
| `user_online` | Server -> Broadcast | `{ userId }` | Broadcasts peer came online |
| `user_offline` | Server -> Broadcast | `{ userId, lastSeen }` | Broadcasts peer went offline |
| `new_notification` | Server -> Client | Full `Notification` object | Pushed to `user_${recipientId}` |
