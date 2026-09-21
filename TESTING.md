# Connectly - Test Suite & Verification Report

This document details the complete test cases, security evaluations, responsive UI checks, and automated verification results for **Connectly**.

---

## 1. Automated Verification Suite (`test-full-flow.js`)

Connectly includes a 24-step automated verification suite covering the end-to-end full-stack lifecycle.

Execute the test suite:
```bash
cd server
node scripts/test-full-flow.js
```

### Execution Log & Results
```
========================================================
 STARTING FULL-STACK AUTOMATED TEST SUITE FOR CONNECTLY
========================================================
  ✅ PASS: GET /api/health returns 200
  ✅ PASS: Login as Alex (CS Student) successful with JWT
  ✅ PASS: Login as Sarah (HCI Student) successful
  ✅ PASS: Login as Admin Dean successful
  ✅ PASS: GET /api/auth/me returns authenticated user details
  ✅ PASS: Invalid JWT token rejected with 401 Unauthorized
  ✅ PASS: Request without token rejected with 401 Unauthorized
  ✅ PASS: Registration of new student successful with JWT
  ✅ PASS: Duplicate username/email registration rejected with 409 Conflict
  ✅ PASS: Personalized feed returned 8 posts
  ✅ PASS: Post creation with hashtag parsing successful
  ✅ PASS: Sarah liked Alex's post (atomic counter increment)
  ✅ PASS: Sarah commented on post
  ✅ PASS: Post saved to user bookmarks
  ✅ PASS: Saved post appears in GET /api/saved
  ✅ PASS: Follow interaction validated
  ✅ PASS: Self-follow prevented with 400 Bad Request
  ✅ PASS: Conversation started or retrieved
  ✅ PASS: Direct message sent and persisted
  ✅ PASS: Notifications list retrieved successfully
  ✅ PASS: User search returned matching students
  ✅ PASS: Explore filtered by hashtag #hackathon
  ✅ PASS: Admin analytics dashboard data retrieved
  ✅ PASS: Regular student blocked from /admin routes with 403 Forbidden
========================================================
 RESULTS: 24 PASSED, 0 FAILED
========================================================
```

---

## 2. Manual Test Case Matrix

### Module: Authentication & Session
| Test ID | Scenario | Steps | Expected Result | Status |
|---|---|---|---|---|
| TC-AUTH-01 | Student Registration | Fill registration form with unique details, submit | Account created, JWT stored, redirected to feed | Passed |
| TC-AUTH-02 | Duplicate Email / Username | Register with already registered email | 409 Conflict error toast displayed | Passed |
| TC-AUTH-03 | Login with Valid Credentials | Submit valid email and password | Token saved in localStorage, user profile loaded | Passed |
| TC-AUTH-04 | Login with Invalid Password | Submit correct email with wrong password | 401 Unauthorized error message displayed | Passed |
| TC-AUTH-05 | One-Click Demo Login | Click "Alex (CS)" demo button on login page | Authenticates as Alex and enters campus feed | Passed |
| TC-AUTH-06 | Session Expiration & Logout | Click Sign Out in sidebar or settings | Token removed, redirected to login | Passed |

### Module: Posts & Interactions
| Test ID | Scenario | Steps | Expected Result | Status |
|---|---|---|---|---|
| TC-POST-01 | Create Text Post | Write text in composer and click Publish | Post appears instantly at top of feed | Passed |
| TC-POST-02 | Post with Hashtags | Post with `#hackathon #coding` | Hashtags render as interactive clickable links | Passed |
| TC-POST-03 | Post with Photo Attachment | Attach image via file picker, submit | Image uploaded to `/uploads/` and rendered | Passed |
| TC-POST-04 | Atomic Like Toggle | Click heart button on post | Like counter increments by 1, heart fills | Passed |
| TC-POST-05 | Unlike Post | Click filled heart button | Counter decrements by 1, heart un-fills | Passed |
| TC-POST-06 | Add Comment | Open comment drawer, write text, submit | Comment appears in list, post comment count +1 | Passed |
| TC-POST-07 | Delete Comment | Click trash icon on authored comment | Comment removed, post comment count -1 | Passed |
| TC-POST-08 | Bookmark / Save Post | Click bookmark icon on post | Post saved to `/saved` collection | Passed |
| TC-POST-09 | Edit Post | Post author clicks "Edit Post", updates text | Post content updated in real-time | Passed |
| TC-POST-10 | Delete Post | Author clicks "Delete Post", confirms | Post removed from DB, feed, and saved lists | Passed |

### Module: Real-Time Chat & Sockets
| Test ID | Scenario | Steps | Expected Result | Status |
|---|---|---|---|---|
| TC-CHAT-01 | Real-time Message Delivery | User A sends message to User B | Delivered instantly via Socket.IO room | Passed |
| TC-CHAT-02 | Typing Indicator | User A types in message bar | User B sees "... is typing" pulse | Passed |
| TC-CHAT-03 | Online Presence Status | User connects to platform | Status changes to green "Active now" | Passed |
| TC-CHAT-04 | Read Receipts | User B opens unread message thread | Double checkmark turns active for User A | Passed |
| TC-CHAT-05 | Start New Conversation | Click compose in chat, pick classmate | Conversation created and opened | Passed |

### Module: Search & Discovery
| Test ID | Scenario | Steps | Expected Result | Status |
|---|---|---|---|---|
| TC-SRCH-01 | Debounced Query | Type in Explore search bar | API triggers only after user pauses typing (400ms) | Passed |
| TC-SRCH-02 | Hashtag Filter | Click `#robotics` topic pill | Feed filters to posts tagged with robotics | Passed |
| TC-SRCH-03 | Student Discovery | Search student name on Explore page | Matching peer cards displayed with follow button | Passed |

### Module: Administration & Moderation
| Test ID | Scenario | Steps | Expected Result | Status |
|---|---|---|---|---|
| TC-ADM-01 | Student Access to Admin | Normal student visits `/admin` | Blocked and redirected with 403 Forbidden | Passed |
| TC-ADM-02 | Faculty Admin Access | Admin logs in and visits `/admin` | Full analytics KPI dashboard renders | Passed |
| TC-ADM-03 | Content Moderation | Admin clicks "Moderate" on flagged post | Post deleted from database immediately | Passed |

---

## 3. Responsive Layout Verification

| Breakpoint | Target Devices | Verification Details | Status |
|---|---|---|---|
| `< 768px` | Mobile (iPhone / Android) | Sidebar hidden, top Header active, bottom MobileNav active, full-screen chat experience | Verified |
| `768px - 1023px`| Tablets / Small Laptops | Left sidebar docked, center feed full-width, right sidebar collapsed | Verified |
| `>= 1024px` | Desktops & Large Displays | Full 3-column layout (Sidebar, Main Feed, Right Widgets) | Verified |
