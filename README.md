# AIDE Monorepo

AIDE is a modular, event-driven academic management platform built using AWS serverless infrastructure and TypeScript services.

This repository contains:

- Infrastructure definitions
- Service source code
- Shared event-driven integrations
- Deployment configurations

---

# Repository Structure

```txt
/services
    Contains the actual implementation code for each service

/infrastructure
    AWS SAM and infrastructure templates for services
```

---

# Current Progress

| Service | Status |
|---|---|
| school-year-service | In active development |
| course -service | In active development |
| other services | Planned / scaffolded |

---

# School Year Service

Source code can be found in:

```txt
/services/school-year
```

Infrastructure templates can be found in:

```txt
/infrastructure/school-year
```

---

# Course Service

Source code can be foudn in:
```txt
/services/courses
```

Instrastructure templates can be found in:

```txt
/infrastructure/courses
```
---

# Technology Stack

- TypeScript
- AWS Lambda
- AWS SAM
- Amazon EventBridge
- Prisma ORM
- PostgreSQL
- Docker