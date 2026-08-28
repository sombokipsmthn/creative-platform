# KIPSMTHN Creative Platform

> A unified platform for creative professionals to manage their work, clients, projects, production workflows, and client delivery.

## What is Creative Platform?

**KIPSMTHN Creative Platform** is a creative business platform built for photography, video, brand films, and visual storytelling.

It brings the different parts of running a creative production business into one place — from presenting work and managing clients to creating quotes, tracking projects, invoicing, and delivering finished work through private galleries.

The platform is designed around the needs of independent creatives and production studios, with a focus on simplifying the journey from **client inquiry to project delivery**.

---

## Features

### 🌐 Public Portfolio

A public-facing website for:

- Showcasing creative work
- Presenting services
- Introducing the creator/studio
- Providing a way for potential clients to get in touch

### 👥 Client Management

A central place to manage client relationships and associated projects.

### 📋 Quotes & Invoices

Tools for creating and managing production quotations and invoices, including:

- Production services
- Equipment
- Day rates
- Deposits
- Discounts
- Taxes
- Multiple currencies

### 🎬 Project Management

Projects provide a connection between clients, creative work, and the wider production workflow.

### 📸 Client Galleries

Private client delivery galleries designed for:

- Viewing finished work
- Favorites
- Selections
- Proofing
- Comments
- Downloads
- PIN-protected access

### 🎒 Equipment Management

An equipment catalogue that supports production planning and quotation workflows, including day-rate pricing for different categories of production equipment.

### 💼 Business Management

Additional tools for managing:

- Expenses
- Creator profile
- Branding
- Watermarks
- Templates
- Presets
- Business preferences

---

## Architecture

Creative Platform is built around three connected experiences:

```text
             CREATIVE PLATFORM
                    │
       ┌────────────┼────────────┐
       │            │            │
       ▼            ▼            ▼
    PUBLIC        CREATOR       CLIENT
    WEBSITE       DASHBOARD     PORTAL
       │            │            │
    Portfolio       CRM        Galleries
    Services       Quotes      Proofing
    Work           Invoices    Favorites
    Contact        Projects    Downloads
                   Expenses
```

The platform uses a shared backend and database so that clients, projects, quotes, invoices, and creative deliveries can eventually work together as one connected workflow.

The underlying architecture also uses creator ownership relationships, allowing the platform to evolve from its current single-creator implementation toward a multi-creator platform.

---

## Technology

Creative Platform is built with:

- **Next.js** — application framework
- **React** — user interface
- **TypeScript** — application language
- **Tailwind CSS** — styling
- **Drizzle ORM** — database layer
- **PostgreSQL** — database
- **Clerk** — authentication
- **Framer Motion** — animation
- **Lucide React** — icons
- **Vercel** — hosting target

---

## Project Goals

The goal is to create a single operating platform for creative production businesses.

The long-term vision is to connect the entire workflow:

```text
Client
   ↓
Project
   ↓
Quote
   ↓
Production
   ↓
Gallery
   ↓
Proofing
   ↓
Approval
   ↓
Invoice
   ↓
Delivery
```

Instead of relying on disconnected tools for each stage, Creative Platform aims to provide one connected system for managing the creative business and its client relationships.

---

## Current Status

**Active Development**

The platform already has working foundations for:

- Public website
- Authentication
- Creator dashboard
- Client management interface
- Quotation workflow
- Invoice management
- Equipment management
- Client gallery interface
- Database infrastructure

Several areas are still being developed, particularly the transition from prototype interfaces and demo data to fully database-backed production workflows.

The gallery system is also being expanded toward a complete professional client delivery and proofing experience.

---

## Vision

Creative Platform is being built to become the digital backbone of a modern creative studio — connecting **business management, production, and client delivery** in one platform.

**From first inquiry to final delivery.**
