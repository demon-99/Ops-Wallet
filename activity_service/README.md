# activity_service

Tracks user activity events (logins, navigations, tool runs, etc.) and stores them in MongoDB.

## Run

```bash
# from this folder
../user_service/mvnw -f pom.xml spring-boot:run
# or with your own maven
mvn spring-boot:run
```

Default port: **8083**.
Default Mongo: `mongodb://localhost:27017/newproduct_activity_service`
(override with the `MONGODB_URI` env var or `spring.data.mongodb.uri`).

## Endpoints

Base path: `/api/activity`

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/log` | Record a new activity event |
| `GET`  | `/user/{userId}` | Paged history for a user (`page`, `size`, optional `activityType`) |
| `GET`  | `/user/{userId}/recent` | Latest 20 events for a user |
| `GET`  | `/user/{userId}/count?hours=24` | Count of events in the last N hours |

### `POST /api/activity/log`

```json
{
  "userId": "65f1...",
  "activityType": "LOGIN",
  "description": "User signed in",
  "metadata": { "method": "password" },
  "sessionId": "sess_abc"
}
```

`ipAddress` and `userAgent` are auto-filled from the request when omitted.

## Storage

- Database: `newproduct_activity_service`
- Collection: `user_activities`
- Indexed fields: `userId`, `activityType`, `createdAt`
