# LurnStack MVP Backend API Spec (Admin-only authoring)

**Conventions**

- Base: `/api`
- Auth header: `Authorization: Bearer <token>`
- Standard response:
```json
{ "success": true, "message": "OK", "data": null }
```
- Error response:
```json
{ "success": false, "message": "Reason", "errorCode": "SOME_CODE", "data": null }
```

---

## 1) Student website APIs (Public + Student)

These are the endpoints used by the **student-facing website/app** (browse courses, buy, learn).

### 1.1 Auth (Student)

### POST `/api/auth/register`
Request
```json
{ "FULL_NAME":"Arun", "EMAIL_ADDRESS":"arun@gmail.com", "PASSWORD":"pass123" }
```
Response
```json
{ "success": true, "message":"Registered", "user": { "id":"u1","fullName":"Arun","email":"arun@gmail.com","role":"student" }, "token":"jwt" }
```

### POST `/api/auth/login`
Request
```json
{ "EMAIL_ADDRESS":"arun@gmail.com", "PASSWORD":"pass123" }
```
Response
```json
{ "success": true, "message":"Logged in", "user": { "id":"u1","fullName":"Arun","email":"arun@gmail.com","role":"student" }, "token":"jwt" }
```

### GET `/api/auth/me`
Response
```json
{ "success": true, "data": { "id":"u1","fullName":"Arun","email":"arun@gmail.com","role":"student" } }
```

### 1.2 Categories (Public)

### GET `/api/categories`
Response
```json
{ "success": true, "data": [ { "id":"cat1","name":"Development","slug":"development","courseCount":12 } ] }
```

### GET `/api/categories/:categoryId`
Response
```json
{ "success": true, "data": { "id":"cat1","name":"Development","slug":"development","description":"...", "courseCount":12 } }
```

### 1.3 Courses (Public catalog + public details)

Course card (for listing)
```json
{ "id":"c1","title":"React from Zero","slug":"react-from-zero","thumbnailUrl":"https://...","pricePaise":49900,"currency":"INR","ratingAvg":4.6,"ratingCount":120,"categoryId":"cat1","categoryName":"Development","level":"beginner","language":"en","isPublished":true }
```

### GET `/api/courses`
Query: `?categoryId=cat1&search=react&sort=popular&page=1&limit=12`
Response
```json
{ "success": true, "data": { "items": [ { "id":"c1","title":"React from Zero","pricePaise":49900,"thumbnailUrl":"https://..." } ], "page":1, "limit":12, "total":34 } }
```

### GET `/api/courses/:courseId`
Response (public details; no locked video URLs)
```json
{
  "success": true,
  "data": {
    "id":"c1",
    "title":"React from Zero",
    "description":"...",
    "categoryId":"cat1",
    "thumbnailUrl":"https://...",
    "previewVideoUrl":"https://...",
    "pricePaise":49900,
    "currency":"INR",
    "whatYouWillLearn":["..."],
    "requirements":["..."],
    "level":"beginner",
    "language":"en",
    "instructorName":"Admin Team",
    "sections":[
      { "id":"s1","title":"Getting Started","order":1,
        "lectures":[ { "id":"l1","title":"Intro","order":1,"durationSec":180,"isPreview":true } ]
      }
    ],
    "isPublished": true
  }
}
```

### 1.4 Purchase + Enrollment (Student)

### POST `/api/checkout/session`
Request
```json
{ "items":[ { "courseId":"c1" } ], "successUrl":"https://app/success", "cancelUrl":"https://app/cart" }
```
Response
```json
{ "success": true, "data": { "checkoutSessionId":"cs_123", "paymentUrl":"https://pay/..." } }
```

### GET `/api/me/enrollments`
Response
```json
{ "success": true, "data": [ { "courseId":"c1", "enrolledAt":"2026-05-13T10:10:00Z", "access":"lifetime" } ] }
```

### GET `/api/me/purchases`
Response
```json
{ "success": true, "data": [ { "orderId":"o1","courseId":"c1","pricePaise":49900,"currency":"INR","status":"paid","paidAt":"2026-05-13T10:10:00Z" } ] }
```

### 1.5 Learn (Paid students only) + locked video playback

### GET `/api/courses/:courseId/learn`
Response (only if enrolled)
```json
{
  "success": true,
  "data": {
    "courseId":"c1",
    "sections":[
      { "id":"s1","title":"Getting Started","lectures":[
        { "id":"l1","title":"Intro","durationSec":180, "video": { "playbackUrl":"https://cdn/signed-or-stream/..." } }
      ]}
    ],
    "progress": { "completedLectureIds":["l1"], "percent": 5 }
  }
}
```

If not enrolled
```json
{ "success": false, "message":"Not enrolled", "errorCode":"NOT_ENROLLED", "data": null }
```

### 1.6 Progress (Student)

### POST `/api/me/progress/lecture-complete`
Request
```json
{ "courseId":"c1", "lectureId":"l1" }
```
Response
```json
{ "success": true, "data": { "courseId":"c1", "completedLectureIds":["l1"], "percent": 5 } }
```

---

## 2) Admin panel APIs (Admin-only)

These are the endpoints used by the **admin panel** (create categories/courses/sections/lectures, upload videos, publish).

### 2.1 Auth (Admin)

### POST `/api/auth/login`
Request
```json
{ "EMAIL_ADDRESS":"admin@gmail.com", "PASSWORD":"pass123" }
```
Response
```json
{ "success": true, "message":"Logged in", "user": { "id":"a1","fullName":"Admin","email":"admin@gmail.com","role":"admin" }, "token":"jwt" }
```

### GET `/api/auth/me`
Response
```json
{ "success": true, "data": { "id":"a1","fullName":"Admin","email":"admin@gmail.com","role":"admin" } }
```

### 2.2 Categories (Admin CRUD)

### POST `/api/admin/categories`
Request
```json
{ "name":"Development", "slug":"development", "description":"All dev courses" }
```
Response
```json
{ "success": true, "message":"Created", "data": { "id":"cat1","name":"Development","slug":"development","description":"All dev courses" } }
```

### PATCH `/api/admin/categories/:categoryId`
Request
```json
{ "name":"Dev", "description":"Updated" }
```
Response
```json
{ "success": true, "message":"Updated", "data": { "id":"cat1","name":"Dev","slug":"development","description":"Updated" } }
```

### DELETE `/api/admin/categories/:categoryId`
Response
```json
{ "success": true, "message":"Deleted", "data": null }
```

### 2.3 Courses (Admin CRUD + publish)

### POST `/api/admin/courses`
Request
```json
{ "title":"React from Zero", "slug":"react-from-zero", "categoryId":"cat1", "description":"...", "pricePaise":49900, "currency":"INR", "level":"beginner", "language":"en" }
```
Response
```json
{ "success": true, "message":"Created", "data": { "id":"c1","isPublished":false } }
```

### PATCH `/api/admin/courses/:courseId`
Request
```json
{ "thumbnailUrl":"https://...", "previewVideoUrl":"https://...", "pricePaise":39900, "isPublished": true }
```
Response
```json
{ "success": true, "message":"Updated", "data": { "id":"c1","isPublished":true } }
```

### DELETE `/api/admin/courses/:courseId`
Response
```json
{ "success": true, "message":"Deleted", "data": null }
```

### 2.4 Sections (Admin CRUD)

### POST `/api/admin/courses/:courseId/sections`
Request
```json
{ "title":"Getting Started", "order":1 }
```
Response
```json
{ "success": true, "message":"Created", "data": { "id":"s1","courseId":"c1","title":"Getting Started","order":1 } }
```

### PATCH `/api/admin/sections/:sectionId`
Request
```json
{ "title":"Basics", "order":2 }
```
Response
```json
{ "success": true, "message":"Updated", "data": { "id":"s1","title":"Basics","order":2 } }
```

### DELETE `/api/admin/sections/:sectionId`
Response
```json
{ "success": true, "message":"Deleted", "data": null }
```

### 2.5 Lectures (Admin CRUD)

### POST `/api/admin/sections/:sectionId/lectures`
Request
```json
{ "title":"Intro", "order":1, "isPreview": true, "videoAssetId":"va1" }
```
Response
```json
{ "success": true, "message":"Created", "data": { "id":"l1","sectionId":"s1","title":"Intro","order":1,"isPreview":true,"durationSec":180 } }
```

### PATCH `/api/admin/lectures/:lectureId`
Request
```json
{ "title":"Intro updated", "order":1, "isPreview":false, "videoAssetId":"va2" }
```
Response
```json
{ "success": true, "message":"Updated", "data": { "id":"l1","title":"Intro updated","isPreview":false } }
```

### DELETE `/api/admin/lectures/:lectureId`
Response
```json
{ "success": true, "message":"Deleted", "data": null }
```

### 2.6 Video upload (Admin only)

### POST `/api/admin/uploads/videos/presign`
Request
```json
{ "fileName":"intro.mp4", "contentType":"video/mp4", "sizeBytes":123456789 }
```
Response
```json
{
  "success": true,
  "data": {
    "uploadId":"up1",
    "putUrl":"https://signed-put-url",
    "assetKey":"videos/up1/intro.mp4",
    "expiresInSec":900
  }
}
```

### POST `/api/admin/uploads/videos/complete`
Request
```json
{ "uploadId":"up1", "assetKey":"videos/up1/intro.mp4" }
```
Response
```json
{ "success": true, "data": { "videoAssetId":"va1", "status":"ready", "durationSec":180 } }
```

### GET `/api/admin/videos/:videoAssetId`
Response
```json
{ "success": true, "data": { "videoAssetId":"va1", "status":"ready", "durationSec":180, "originalFileName":"intro.mp4", "assetKey":"videos/up1/intro.mp4" } }
```

### 2.7 Payments webhook (System/Admin-owned)

### POST `/api/webhooks/payment`
Response
```json
{ "success": true, "message":"Webhook processed", "data": null }
```

---

## Quick endpoint summary

Student website uses:
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Browse: `GET /api/categories`, `GET /api/categories/:categoryId`, `GET /api/courses`, `GET /api/courses/:courseId`
- Buy: `POST /api/checkout/session`, `GET /api/me/enrollments`, `GET /api/me/purchases`
- Learn: `GET /api/courses/:courseId/learn`, `POST /api/me/progress/lecture-complete`

Admin panel uses:
- Auth: `POST /api/auth/login`, `GET /api/auth/me`
- Categories CRUD: `POST/PATCH/DELETE /api/admin/categories...`
- Courses CRUD/publish: `POST/PATCH/DELETE /api/admin/courses...`
- Build curriculum: `POST/PATCH/DELETE sections/lectures`
- Upload videos: `POST /api/admin/uploads/videos/presign`, `POST /api/admin/uploads/videos/complete`, `GET /api/admin/videos/:videoAssetId`
- Payments webhook: `POST /api/webhooks/payment`
