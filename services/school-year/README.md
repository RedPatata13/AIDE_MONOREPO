# AIDE School Year Service

The School Year Service manages school year and term lifecycle operations for the AIDE platform.

This service is built using:

- AWS SAM
- AWS Lambda (Container Image)
- Amazon EventBridge
- Prisma ORM
- TypeScript
- API Gateway HTTP API

---

# Features

## School Year Operations

- End current school year
- Lock school year
- Restore completed school year
- Activate school year drafts
- Update school year details
- Listen for school year lifecycle events

## Term Operations

- End current term
- Lock term
- Restore completed term
- Activate upcoming terms

## Template Operations

- Update school year templates

## Event-Driven Workflows

This service publishes and consumes EventBridge events for:

- schoolYearInstance.created
- schoolYearInstance.deactivated
- schoolYearTemplate.updated
- term.created
- term.deactivated

---

# Architecture

```txt
API Gateway
    ↓
Lambda Handlers
    ↓
Prisma ORM
    ↓
Database

EventBridge
    ↕
Lifecycle Events
```

---

# Environment Variables

| Variable | Description |
|---|---|
| NODE_ENV | Deployment environment |
| DATABASE_URL | Prisma database connection string |
| EVENT_BUS_NAME | Shared EventBridge bus |
| COGNITO_USER_POOL_ID | Cognito User Pool ID |
| COGNITO_CLIENT_ID | Cognito App Client ID |

---

# API Endpoints

## School Year Endpoints

### End Current School Year

```http
POST /school-year/end
```

Ends the currently active school year.

---

### Lock School Year

```http
PATCH /school-year/lock/{id}
```

Locks a school year instance.

Path Parameters:

| Parameter | Description |
|---|---|
| id | School year instance ID |

---

### Restore School Year

```http
PATCH /school-year/restore/{id}
```

Restores a completed school year if within the allowed restore window.

Path Parameters:

| Parameter | Description |
|---|---|
| id | School year instance ID |

---

### Update School Year

```http
PATCH /school-year/update/{id}
```

Partially updates a school year.

Path Parameters:

| Parameter | Description |
|---|---|
| id | School year instance ID |

Example Body:

```json
{
  "name": "SY 2026-2027",
  "description": "Updated school year"
}
```

---

### Activate School Year Draft

```http
PATCH /school-year/activate/{id}
```

Activates a draft school year instance.

Path Parameters:

| Parameter | Description |
|---|---|
| id | Draft school year ID |

---

## Term Endpoints

### End Current Term

```http
POST /term/end
```

Ends the currently active term.

---

### Lock Term

```http
PATCH /term/lock/{id}
```

Locks a term.

Path Parameters:

| Parameter | Description |
|---|---|
| id | Term ID |

---

### Restore Term

```http
PATCH /term/restore/{id}
```

Restores a completed term.

Path Parameters:

| Parameter | Description |
|---|---|
| id | Term ID |

---

### Activate Upcoming Term

```http
PATCH /term/activate/{id}
```

Activates an upcoming term.

Path Parameters:

| Parameter | Description |
|---|---|
| id | Term ID |

---

## Template Endpoints

### Update School Year Template

```http
PATCH /school-year-template/update/{id}
```

Updates a school year template.

Path Parameters:

| Parameter | Description |
|---|---|
| id | Template ID |

Example Body:

```json
{
  "name": "College Academic Template",
  "description": "Updated template description"
}
```

---

# Event Listeners

## SchoolYearCreatedListener

Consumes:

```txt
schoolYearInstance.created
```

Responsibilities:

- Generate terms for activated school years
- Publish related term events

---

## SchoolYearDeactivatedListener

Consumes:

```txt
schoolYearInstance.deactivated
```

Responsibilities:

- Deactivate associated terms
- Publish term deactivation events

---

# Local Development

## Build

```bash
sam build
```

---

## Start Local API

```bash
sam local start-api --env-vars env/dev.json
```

---

## Invoke Specific Function

```bash
sam local invoke UpdateSchoolYear -e events/update-school-year.json --env-vars env/dev.json
```

---

# Deployment

## Deploy to AWS

```bash
sam deploy --guided
```

---

# EventBridge Integration

This service publishes events to the shared EventBridge bus:

```txt
aide-identity-${Environment}
```

Events are used to coordinate workflows between AIDE services.

---

# Error Handling

The service uses:

- HTTP status codes
- Prisma error handling
- EventBridge retries
- Dead-letter queue support (recommended)
- Transactional database operations

---

# Future Improvements TBD

- Add request validation middleware
- Add authentication/authorization middleware
- Add DLQs for async event consumers
- Add structured logging
- Add OpenTelemetry tracing
- Add idempotency guards for event handlers
- Add contract testing for EventBridge schemas

---

# Technologies

- TypeScript
- AWS SAM
- AWS Lambda
- Amazon EventBridge
- Prisma ORM
- PostgreSQL
- Docker
- API Gateway HTTP API