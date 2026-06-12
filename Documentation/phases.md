# Family Tree Application - Development Phases

## Project Goal

Build a minimal family tree application using:

* Angular
* ASP.NET Core Web API
* SQL Server

Target duration:

* 1 day hobby project
* 6–8 hours of implementation

---

# Phase 1 - Project Setup

## Objective

Establish the project foundation.

## Tasks

### Backend

* Create ASP.NET Core Web API
* Configure SQL Server
* Configure Entity Framework Core
* Create initial migration
* Enable Swagger

### Frontend

* Create Angular application
* Configure routing
* Create shared layout
* Configure API environment

## Deliverables

* Backend running
* Frontend running
* Database connected

---

# Phase 2 - Person Management

## Objective

Manage family members.

## Features

### Person List

* View all people
* Search by name

### Person Creation

* Add person

### Person Update

* Edit person details

### Person Deletion

* Remove person

## Person Fields

* First Name
* Last Name
* Gender
* Date Of Birth
* Phone
* Email
* Facebook
* Instagram
* LinkedIn
* Notes

## Deliverables

* Full CRUD for Person

---

# Phase 3 - Relationship Management

## Objective

Connect people through family relationships.

## Features

### Create Relationship

Examples:

* Parent
* Child
* Spouse
* Sibling

### Delete Relationship

Remove existing relationship.

### View Relationships

Display all relationships for a person.

## Deliverables

* Relationship CRUD

---

# Phase 4 - Person Details Page

## Objective

Provide a complete view of a family member.

## Features

### Profile Section

* Name
* DOB
* Contact Information
* Social Profiles

### Relationship Section

Display:

* Parents
* Children
* Spouse
* Siblings

### Add Relationship

Quick relationship creation.

## Deliverables

* Fully functional person details page

---

# Phase 5 - Family Tree API

## Objective

Generate graph data for visualization.

## Features

### Tree Endpoint

Return:

* Nodes
* Edges

Example:

Person → Relationship → Person

### Tree Traversal

Load connected family members.

## Deliverables

* Tree API endpoint

---

# Phase 6 - Tree Visualization

## Objective

Display the family graph.

## Features

### Family Tree Page

Visualize:

* Parents
* Children
* Siblings
* Spouse

### Library

Recommended:

* ngx-graph

## Deliverables

* Interactive family tree

---

# Phase 7 - Polish

## Features

### Validation

Prevent:

* Self relationships
* Duplicate relationships

### UX Improvements

* Loading indicators
* Confirmation dialogs
* Notifications

### Dashboard

Simple metrics:

* Total People
* Total Relationships

## Deliverables

* MVP complete

---

# Out Of Scope

For Version 1:

* Authentication
* Authorization
* File uploads
* Multiple family trees
* GEDCOM import/export
* Audit logging
* CQRS
* Event sourcing
* Complex genealogy calculations

---

# Success Criteria

Users can:

1. Add family members
2. Edit family members
3. Connect members using relationships
4. View a person's family
5. Visualize the family tree
6. Persist all data in SQL Server
