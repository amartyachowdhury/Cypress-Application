# Cypress API Documentation

## Base URL

```
http://localhost:5050/api
```

## Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **Report Submission**: 10 requests per hour per IP

## Error Responses

All error responses follow this format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

## Authentication Endpoints

### POST /auth/register

Register a new user.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**

```json
{
  "status": "success",
  "token": "jwt-token",
  "user": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /auth/login

Login with email and password.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "status": "success",
  "token": "jwt-token",
  "user": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /auth/me

Get current user information.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "status": "success",
  "user": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Reports Endpoints

### GET /reports

Get all reports for the authenticated user.

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `status` (optional): Filter by status (pending, in progress, resolved)
- `category` (optional): Filter by category
- `severity` (optional): Filter by severity (low, medium, high)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**

```json
{
  "status": "success",
  "data": [
    {
      "_id": "report-id",
      "title": "Pothole on Main Street",
      "description": "Large pothole causing traffic issues",
      "severity": "high",
      "category": "infrastructure",
      "status": "pending",
      "location": {
        "type": "Point",
        "coordinates": [-74.006, 40.7128]
      },
      "address": "123 Main Street, New York, NY",
      "images": ["image-url-1", "image-url-2"],
      "createdBy": "user-id",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalReports": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### POST /reports

Create a new report.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Pothole on Main Street",
  "description": "Large pothole causing traffic issues",
  "severity": "high",
  "category": "infrastructure",
  "address": "123 Main Street, New York, NY",
  "location": {
    "type": "Point",
    "coordinates": [-74.006, 40.7128]
  },
  "images": ["image-url-1", "image-url-2"]
}
```

**Response (201):**

```json
{
  "status": "success",
  "data": {
    "_id": "report-id",
    "title": "Pothole on Main Street",
    "description": "Large pothole causing traffic issues",
    "severity": "high",
    "category": "infrastructure",
    "status": "pending",
    "location": {
      "type": "Point",
      "coordinates": [-74.006, 40.7128]
    },
    "address": "123 Main Street, New York, NY",
    "images": ["image-url-1", "image-url-2"],
    "createdBy": "user-id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /reports/:id

Get a specific report by ID.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "_id": "report-id",
    "title": "Pothole on Main Street",
    "description": "Large pothole causing traffic issues",
    "severity": "high",
    "category": "infrastructure",
    "status": "pending",
    "location": {
      "type": "Point",
      "coordinates": [-74.006, 40.7128]
    },
    "address": "123 Main Street, New York, NY",
    "images": ["image-url-1", "image-url-2"],
    "createdBy": {
      "_id": "user-id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /reports/:id

Update a report (only by the creator).

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "severity": "medium"
}
```

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "_id": "report-id",
    "title": "Updated title",
    "description": "Updated description",
    "severity": "medium",
    "category": "infrastructure",
    "status": "pending",
    "location": {
      "type": "Point",
      "coordinates": [-74.006, 40.7128]
    },
    "address": "123 Main Street, New York, NY",
    "images": ["image-url-1", "image-url-2"],
    "createdBy": "user-id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### DELETE /reports/:id

Delete a report (only by the creator).

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Report deleted successfully"
}
```

## Admin Endpoints

### POST /admin/login

Admin login.

**Request Body:**

```json
{
  "email": "admin@cypress.com",
  "password": "admin123"
}
```

**Response (200):**

```json
{
  "status": "success",
  "token": "admin-jwt-token",
  "admin": {
    "_id": "admin-id",
    "name": "System Admin",
    "email": "admin@cypress.com",
    "role": "admin"
  }
}
```

### GET /admin/verify

Verify admin token.

**Headers:**

```
Authorization: Bearer <admin-token>
```

**Response (200):**

```json
{
  "status": "success",
  "admin": {
    "_id": "admin-id",
    "name": "System Admin",
    "email": "admin@cypress.com",
    "role": "admin"
  }
}
```

### GET /admin/reports

Get all reports (admin only).

**Headers:**

```
Authorization: Bearer <admin-token>
```

**Query Parameters:**

- `status` (optional): Filter by status
- `category` (optional): Filter by category
- `severity` (optional): Filter by severity
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200):**

```json
{
  "status": "success",
  "data": [
    {
      "_id": "report-id",
      "title": "Pothole on Main Street",
      "description": "Large pothole causing traffic issues",
      "severity": "high",
      "category": "infrastructure",
      "status": "pending",
      "location": {
        "type": "Point",
        "coordinates": [-74.006, 40.7128]
      },
      "address": "123 Main Street, New York, NY",
      "images": ["image-url-1", "image-url-2"],
      "createdBy": {
        "_id": "user-id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalReports": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### PATCH /admin/reports/:id/status

Update report status (admin only).

**Headers:**

```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "in progress"
}
```

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "_id": "report-id",
    "title": "Pothole on Main Street",
    "description": "Large pothole causing traffic issues",
    "severity": "high",
    "category": "infrastructure",
    "status": "in progress",
    "location": {
      "type": "Point",
      "coordinates": [-74.006, 40.7128]
    },
    "address": "123 Main Street, New York, NY",
    "images": ["image-url-1", "image-url-2"],
    "createdBy": "user-id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

## File Upload

### POST /reports/upload

Upload images for reports.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**

```
images: [file1, file2, ...]
```

**Response (200):**

```json
{
  "status": "success",
  "imageUrls": [
    "http://localhost:5050/uploads/image1.jpg",
    "http://localhost:5050/uploads/image2.jpg"
  ]
}
```

## WebSocket Events

### Connection

Connect to WebSocket server:

```javascript
const socket = io('http://localhost:5050');
```

### Authentication

```javascript
socket.emit('authenticate', userId);
```

### Notifications

Listen for notifications:

```javascript
socket.on('notification', notification => {
  console.log('New notification:', notification);
});
```

**Notification Format:**

```json
{
  "type": "info|success|warning|error",
  "title": "Notification Title",
  "message": "Notification message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## Data Models

### User

```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String (unique)",
  "password": "String (hashed)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Report

```json
{
  "_id": "ObjectId",
  "title": "String",
  "description": "String",
  "severity": "String (low|medium|high)",
  "category": "String",
  "status": "String (pending|in progress|resolved)",
  "location": {
    "type": "String (Point)",
    "coordinates": "Array [longitude, latitude]"
  },
  "address": "String",
  "images": "Array of Strings",
  "createdBy": "ObjectId (User)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Admin

```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String (unique)",
  "password": "String (hashed)",
  "role": "String (admin)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```
