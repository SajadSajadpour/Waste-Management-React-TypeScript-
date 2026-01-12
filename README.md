# Cycler Dashboard Demo

## Overview
Cycler Dashboard Demo is a React + TypeScript frontend that showcases a multi‑domain operations dashboard for a commercial Cycler fleet. The app is fully client‑side with mock data and demonstrates navigation, routing, role‑based access, and reusable UI patterns.

## Features
- Authenticated demo flow with login/logout and persisted session
- Role‑aware navigation and capability gating
- Business, Operations, and Engineering areas with routed pages
- Directory pages with search, filters, empty states, and row navigation
- Detail views for companies and devices
- Shared DataTable with sorting, sticky headers, and row actions
- Mock services, data, and Redux slices for domain data

## Tech Stack
- React 19 + TypeScript
- Vite
- Redux Toolkit + React Redux
- React Router
- Tailwind CSS
- shadcn-style UI primitives (Radix UI)
- TanStack Table
- Recharts

## Installation & Setup
```bash
npm install
```

## Running the Project
```bash
npm run dev
```
Open the local URL printed by Vite.

Other scripts:
```bash
npm run build
npm run preview
npm run lint
```

## Environment Variables
None required. The app runs entirely with local mock data.

## Project Structure
```
src/
  app/                    # App shell, router, providers, store
  domains/                # Domain pages (business, operations, engineering)
  pages/                  # Top-level pages (login, profile, directories)
  shared/
    components/           # Reusable UI components
    hooks/                # Domain hooks
    mock/                 # Mock data JSON + types
    services/             # Mock service layer
    ui/                   # shadcn-style primitives
    utils/                # Shared utilities
```

## Contributing
This is a demo project. If you want to extend it, keep changes small and aligned with existing patterns (shared components, selectors, and mock data). Use pull requests and include a clear summary of UI changes.

## License
MIT

## Author
- Name: Sajad
