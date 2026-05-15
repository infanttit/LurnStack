# Trainer and Student Live Course API Documentation

This document covers only the trainer dashboard and student Courses/Categories live session flow.

Admin live class APIs are intentionally not included here.

## Base URL

```txt
https://your-domain.com/api
```

## Authentication

All protected endpoints should receive the JWT token in the request header.

```txt
Authorization: Bearer <token>
```

## Common Response Format

Success response:

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": {}
}
```

## Status Values

Session status values:

```txt
draft
published
cancelled
deleted
completed
```

Student-facing Courses and Categories pages should show only sessions where:

```json
{
  "status": "published"
}
```

## Time Format Rules

The trainer selects class timing like:

```txt
10:30 AM to 11:30 AM
```

Backend request should receive:

```json
{
  "scheduledDate": "2026-05-20",
  "startTime": "10:30",
  "endTime": "11:30"
}
```

Backend should calculate:

```json
{
  "scheduledAt": "2026-05-20T10:30:00+05:30",
  "endsAt": "2026-05-20T11:30:00+05:30",
  "durationMinutes": 60
}
```

Use India timezone:

```txt
Asia/Kolkata
```

---

# 1. Trainer Endpoints

## 1.1 Get Trainer Sessions

Used in the trainer dashboard to show only the logged-in trainer's uploaded live classes.

```txt
GET /api/trainer/sessions
```

Response:

```json
{
  "success": true,
  "message": "Trainer sessions fetched successfully",
  "data": [
    {
      "id": "session_101",
      "courseTitle": "React Live Masterclass",
      "category": "Web Development",
      "description": "Learn React hooks and state management in a live trainer-led class.",
      "classTitle": "Hooks and State Management",
      "thumbnail": "https://cdn.example.com/classes/react.jpg",
      "trainerId": "trainer_101",
      "trainerName": "Trainer Kumar",
      "trainerEmail": "trainer@example.com",
      "scheduledDate": "2026-05-20",
      "startTime": "10:30",
      "endTime": "11:30",
      "scheduledAt": "2026-05-20T10:30:00+05:30",
      "endsAt": "2026-05-20T11:30:00+05:30",
      "durationMinutes": 60,
      "meetingLink": "https://meet.google.com/abc-defg-hij",
      "status": "published",
      "createdAt": "2026-05-15T10:00:00.000Z",
      "updatedAt": "2026-05-15T10:00:00.000Z"
    }
  ]
}
```

## 1.2 Create Trainer Session

Used when a trainer creates a new live class.

```txt
POST /api/trainer/sessions
```

Request:

```json
{
  "courseTitle": "React Live Masterclass",
  "category": "Web Development",
  "description": "Learn React hooks and state management in a live trainer-led class.",
  "classTitle": "Hooks and State Management",
  "thumbnail": "https://cdn.example.com/classes/react.jpg",
  "scheduledDate": "2026-05-20",
  "startTime": "10:30",
  "endTime": "11:30",
  "meetingLink": "https://meet.google.com/abc-defg-hij"
}
```

Response:

```json
{
  "success": true,
  "message": "Live class created successfully",
  "data": {
    "id": "session_101",
    "courseTitle": "React Live Masterclass",
    "category": "Web Development",
    "description": "Learn React hooks and state management in a live trainer-led class.",
    "classTitle": "Hooks and State Management",
    "thumbnail": "https://cdn.example.com/classes/react.jpg",
    "trainerId": "trainer_101",
    "trainerName": "Trainer Kumar",
    "trainerEmail": "trainer@example.com",
    "scheduledDate": "2026-05-20",
    "startTime": "10:30",
    "endTime": "11:30",
    "scheduledAt": "2026-05-20T10:30:00+05:30",
    "endsAt": "2026-05-20T11:30:00+05:30",
    "durationMinutes": 60,
    "meetingLink": "https://meet.google.com/abc-defg-hij",
    "status": "published",
    "createdAt": "2026-05-15T10:00:00.000Z"
  }
}
```

## 1.3 Get Single Trainer Session

Used for viewing or editing a specific trainer session.

```txt
GET /api/trainer/sessions/:sessionId
```

Response:

```json
{
  "success": true,
  "message": "Trainer session fetched successfully",
  "data": {
    "id": "session_101",
    "courseTitle": "React Live Masterclass",
    "category": "Web Development",
    "description": "Learn React hooks and state management in a live trainer-led class.",
    "classTitle": "Hooks and State Management",
    "thumbnail": "https://cdn.example.com/classes/react.jpg",
    "trainerId": "trainer_101",
    "trainerName": "Trainer Kumar",
    "scheduledDate": "2026-05-20",
    "startTime": "10:30",
    "endTime": "11:30",
    "scheduledAt": "2026-05-20T10:30:00+05:30",
    "endsAt": "2026-05-20T11:30:00+05:30",
    "durationMinutes": 60,
    "meetingLink": "https://meet.google.com/abc-defg-hij",
    "status": "published"
  }
}
```

## 1.4 Update Trainer Session

Used when a trainer edits class details.

```txt
PATCH /api/trainer/sessions/:sessionId
```

Request:

```json
{
  "courseTitle": "Advanced React Live Class",
  "category": "Frontend Development",
  "description": "Updated class description.",
  "classTitle": "React Performance Optimization",
  "thumbnail": "https://cdn.example.com/classes/react-advanced.jpg",
  "scheduledDate": "2026-05-21",
  "startTime": "14:00",
  "endTime": "15:30",
  "meetingLink": "https://meet.google.com/new-link"
}
```

Response:

```json
{
  "success": true,
  "message": "Live class updated successfully",
  "data": {
    "id": "session_101",
    "scheduledAt": "2026-05-21T14:00:00+05:30",
    "endsAt": "2026-05-21T15:30:00+05:30",
    "durationMinutes": 90,
    "status": "published"
  }
}
```

## 1.5 Delete Trainer Session

```txt
DELETE /api/trainer/sessions/:sessionId
```

Response:

```json
{
  "success": true,
  "message": "Live class deleted successfully"
}
```

## 1.6 Publish Trainer Session

Optional endpoint. Needed only if the backend supports draft mode.

```txt
PATCH /api/trainer/sessions/:sessionId/publish
```

Response:

```json
{
  "success": true,
  "message": "Live class published successfully",
  "data": {
    "id": "session_101",
    "status": "published"
  }
}
```

## 1.7 Cancel Trainer Session

```txt
PATCH /api/trainer/sessions/:sessionId/cancel
```

Request:

```json
{
  "reason": "Trainer unavailable"
}
```

Response:

```json
{
  "success": true,
  "message": "Live class cancelled successfully",
  "data": {
    "id": "session_101",
    "status": "cancelled"
  }
}
```

---

# 2. Trainer Image Upload Endpoints

## 2.1 Get Image Upload URL

Used for trainer live class thumbnail upload.

```txt
POST /api/trainer/uploads/images/presign
```

Request:

```json
{
  "fileName": "react-class.jpg",
  "fileType": "image/jpeg",
  "folder": "trainer-classes"
}
```

Response:

```json
{
  "success": true,
  "message": "Upload URL generated successfully",
  "data": {
    "uploadUrl": "https://storage.example.com/signed-upload-url",
    "fileUrl": "https://cdn.example.com/trainer-classes/react-class.jpg"
  }
}
```

## 2.2 Complete Image Upload

```txt
POST /api/trainer/uploads/images/complete
```

Request:

```json
{
  "fileUrl": "https://cdn.example.com/trainer-classes/react-class.jpg"
}
```

Response:

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://cdn.example.com/trainer-classes/react-class.jpg"
  }
}
```

---

# 3. Student Session Endpoints

## 3.1 Get Student Sessions

Used for student Courses and Categories pages.

```txt
GET /api/sessions
```

Optional query params:

```txt
GET /api/sessions?category=Web%20Development&search=react&filter=upcoming
```

Response:

```json
{
  "success": true,
  "message": "Sessions fetched successfully",
  "data": [
    {
      "id": "session_101",
      "courseTitle": "React Live Masterclass",
      "category": "Web Development",
      "description": "Learn React hooks and state management in a live trainer-led class.",
      "classTitle": "Hooks and State Management",
      "thumbnail": "https://cdn.example.com/classes/react.jpg",
      "trainerId": "trainer_101",
      "trainerName": "Trainer Kumar",
      "scheduledDate": "2026-05-20",
      "startTime": "10:30",
      "endTime": "11:30",
      "scheduledAt": "2026-05-20T10:30:00+05:30",
      "endsAt": "2026-05-20T11:30:00+05:30",
      "durationMinutes": 60,
      "status": "published",
      "isAddedToCard": false,
      "isJoined": false
    }
  ]
}
```

## 3.2 Get Student Session Details

Used for student course/session details page.

```txt
GET /api/sessions/:sessionId
```

Response:

```json
{
  "success": true,
  "message": "Session details fetched successfully",
  "data": {
    "id": "session_101",
    "courseTitle": "React Live Masterclass",
    "category": "Web Development",
    "description": "Learn React hooks and state management in a live trainer-led class.",
    "classTitle": "Hooks and State Management",
    "thumbnail": "https://cdn.example.com/classes/react.jpg",
    "trainer": {
      "id": "trainer_101",
      "name": "Trainer Kumar",
      "email": "trainer@example.com",
      "bio": "Senior React trainer",
      "skills": ["React", "JavaScript", "Frontend"],
      "profileImage": "https://cdn.example.com/trainers/trainer.jpg"
    },
    "scheduledDate": "2026-05-20",
    "startTime": "10:30",
    "endTime": "11:30",
    "scheduledAt": "2026-05-20T10:30:00+05:30",
    "endsAt": "2026-05-20T11:30:00+05:30",
    "durationMinutes": 60,
    "meetingLink": "https://meet.google.com/abc-defg-hij",
    "status": "published",
    "isAddedToCard": false,
    "isJoined": false
  }
}
```

## 3.3 Add Session Card

Student adds a class/session to card.

```txt
POST /api/sessions/:sessionId/add-card
```

Response:

```json
{
  "success": true,
  "message": "Session added to card successfully",
  "data": {
    "cardId": "card_101",
    "sessionId": "session_101",
    "studentId": "student_101"
  }
}
```

## 3.4 Remove Session Card

```txt
DELETE /api/sessions/:sessionId/add-card
```

Response:

```json
{
  "success": true,
  "message": "Session removed from card successfully"
}
```

## 3.5 Get My Session Cards

Used to show the student's added session cards.

```txt
GET /api/me/session-cards
```

Response:

```json
{
  "success": true,
  "message": "Session cards fetched successfully",
  "data": [
    {
      "cardId": "card_101",
      "sessionId": "session_101",
      "courseTitle": "React Live Masterclass",
      "classTitle": "Hooks and State Management",
      "category": "Web Development",
      "trainerName": "Trainer Kumar",
      "thumbnail": "https://cdn.example.com/classes/react.jpg",
      "scheduledAt": "2026-05-20T10:30:00+05:30",
      "endsAt": "2026-05-20T11:30:00+05:30",
      "durationMinutes": 60,
      "status": "published",
      "addedAt": "2026-05-15T10:20:00.000Z"
    }
  ]
}
```

## 3.6 Join Session

Student joins the live class.

```txt
POST /api/sessions/:sessionId/join
```

Response:

```json
{
  "success": true,
  "message": "Session joined successfully",
  "data": {
    "bookingId": "booking_101",
    "sessionId": "session_101",
    "studentId": "student_101",
    "meetingLink": "https://meet.google.com/abc-defg-hij",
    "joinedAt": "2026-05-15T10:30:00.000Z"
  }
}
```

## 3.7 Get My Joined Sessions

```txt
GET /api/me/session-bookings
```

Response:

```json
{
  "success": true,
  "message": "Joined sessions fetched successfully",
  "data": [
    {
      "bookingId": "booking_101",
      "sessionId": "session_101",
      "courseTitle": "React Live Masterclass",
      "classTitle": "Hooks and State Management",
      "category": "Web Development",
      "trainerName": "Trainer Kumar",
      "thumbnail": "https://cdn.example.com/classes/react.jpg",
      "scheduledAt": "2026-05-20T10:30:00+05:30",
      "endsAt": "2026-05-20T11:30:00+05:30",
      "durationMinutes": 60,
      "meetingLink": "https://meet.google.com/abc-defg-hij",
      "status": "joined"
    }
  ]
}
```

---

# 4. Final Endpoint List

## Trainer Session APIs

```txt
GET    /api/trainer/sessions
POST   /api/trainer/sessions
GET    /api/trainer/sessions/:sessionId
PATCH  /api/trainer/sessions/:sessionId
DELETE /api/trainer/sessions/:sessionId
PATCH  /api/trainer/sessions/:sessionId/publish
PATCH  /api/trainer/sessions/:sessionId/cancel
```

## Trainer Image Upload APIs

```txt
POST   /api/trainer/uploads/images/presign
POST   /api/trainer/uploads/images/complete
```

## Student Session APIs

```txt
GET    /api/sessions
GET    /api/sessions/:sessionId
POST   /api/sessions/:sessionId/add-card
DELETE /api/sessions/:sessionId/add-card
GET    /api/me/session-cards
POST   /api/sessions/:sessionId/join
GET    /api/me/session-bookings
```

---

# 5. Minimum Backend Build List

If the backend team wants to build the first working version quickly, start with these endpoints:

```txt
GET    /api/trainer/sessions
POST   /api/trainer/sessions
PATCH  /api/trainer/sessions/:sessionId
DELETE /api/trainer/sessions/:sessionId

POST   /api/trainer/uploads/images/presign
POST   /api/trainer/uploads/images/complete

GET    /api/sessions
GET    /api/sessions/:sessionId
POST   /api/sessions/:sessionId/add-card
GET    /api/me/session-cards
POST   /api/sessions/:sessionId/join
GET    /api/me/session-bookings
```

---

# 6. Backend Implementation Notes

- Trainer dashboard must show only sessions created by the logged-in trainer.
- Student Courses and Categories pages must show only `published` trainer sessions.
- `startTime` and `endTime` should use 24-hour format in the API, for example `10:30` and `11:30`.
- Frontend can display the same time as `10:30 AM to 11:30 AM`.
- Backend should calculate `durationMinutes` from `startTime` and `endTime`.
- Backend should generate `scheduledAt` and `endsAt` in ISO format with timezone.
- Meeting link should be returned only for authenticated users.
- If the backend wants to hide the meeting link until join, then `GET /api/sessions/:sessionId` can return `meetingLink: null`, and `POST /api/sessions/:sessionId/join` should return the actual meeting link.
- Existing admin live class APIs do not need to change for this flow.
