
# Family Tree Application - Architecture

## Overview

The application uses a simple three-tier architecture suitable for a small hobby project.

```text
+----------------------+
|      Angular UI      |
+----------+-----------+
           |
           | HTTP/JSON
           |
+----------v-----------+
|   ASP.NET Core API   |
+----------+-----------+
           |
           | EF Core
           |
+----------v-----------+
|      SQL Server      |
+----------------------+
```

---

# Technology Stack

## Frontend

* Angular
* Angular Material (optional)
* ngx-graph

## Backend

* ASP.NET Core Web API
* Entity Framework Core

## Database

* SQL Server

---

# Solution Structure

```text
FamilyTree.sln

src/

├── FamilyTree.Api
│
├── FamilyTree.Domain
│
├── FamilyTree.Infrastructure
│
└── FamilyTree.UI
```

For a one-day project:

```text
FamilyTree.sln

├── FamilyTree.Api
└── FamilyTree.UI
```

is sufficient.

---

# High Level Design

## Person

Represents an individual family member.

```text
Person
 ├─ Id
 ├─ FirstName
 ├─ LastName
 ├─ DateOfBirth
 ├─ ContactInfo
 └─ SocialProfiles
```

---

## Relationship

Represents a connection between two people.

```text
Relationship

PersonA
RelationshipType
PersonB
```

Example:

```text
John -> Parent -> Mike
```

---

# Domain Model

```text
+-----------+
|  Person   |
+-----------+
| Id        |
| Name      |
| DOB       |
| Phone     |
+-----------+
      |
      |
      | 1..*
      |
+-----------+
|Relationship|
+-----------+
| Id        |
| Type      |
| PersonId  |
| RelatedId |
+-----------+
```

---

# Database Design

## Persons

```sql
Persons
-------
Id
FirstName
LastName
Gender
DateOfBirth
Phone
Email
Facebook
Instagram
LinkedIn
Notes
CreatedAt
UpdatedAt
```

---

## Relationships

```sql
Relationships
-------------
Id
PersonId
RelatedPersonId
RelationshipType
CreatedAt
```

---

# Relationship Types

```csharp
public enum RelationshipType
{
    Parent = 1,
    Child = 2,
    Spouse = 3,
    Sibling = 4
}
```

---

# API Design

## Person APIs

```http
GET     /api/persons

GET     /api/persons/{id}

POST    /api/persons

PUT     /api/persons/{id}

DELETE  /api/persons/{id}
```

---

## Relationship APIs

```http
POST    /api/relationships

DELETE  /api/relationships/{id}

GET     /api/persons/{id}/relationships
```

---

## Tree APIs

```http
GET /api/tree/{personId}
```

Response:

```json
{
  "nodes": [],
  "links": []
}
```

---

# Angular Architecture

```text
src/app

├── core
│   ├── services
│   └── interceptors
│
├── shared
│   ├── components
│   └── models
│
├── persons
│   ├── list
│   ├── details
│   └── edit
│
├── relationships
│
├── tree
│
└── dashboard
```

---

# Component Structure

```text
AppComponent

├── DashboardComponent
├── PersonListComponent
├── PersonDetailsComponent
├── PersonFormComponent
└── FamilyTreeComponent
```

---

# Request Flow

```text
User

  ↓

Angular Component

  ↓

Angular Service

  ↓

HTTP Request

  ↓

API Controller

  ↓

EF Core

  ↓

SQL Server
```

---

# Tree Visualization Flow

```text
FamilyTreeComponent

        ↓

GET /api/tree/{id}

        ↓

Tree DTO

        ↓

ngx-graph

        ↓

Rendered Family Tree
```

---

# Security

For MVP:

* No authentication
* No authorization

Future:

* JWT Authentication
* User-owned family trees

---

# Non-Functional Requirements

## Performance

* Support up to 5,000 people
* Response time under 500ms

## Reliability

* SQL Server persistence
* EF Core migrations

## Maintainability

* Feature-based Angular modules
* Repository pattern optional
* DTO-based API contracts

---

# Future Enhancements

## V2

* Photos
* Family groups
* Marriage dates
* Deceased information

## V3

* GEDCOM import/export
* Relationship inference
* Ancestor search
* Descendant search

## V4

* Authentication
* Sharing
* Collaboration
* Multiple family trees

---

# MVP Summary

Core entities:

* Person
* Relationship

Core pages:

* Person List
* Person Details
* Person Form
* Family Tree

Core APIs:

* Person CRUD
* Relationship CRUD
* Tree Retrieval

This architecture intentionally favors simplicity and rapid delivery over enterprise patterns, making it suitable for a one-day implementation.
