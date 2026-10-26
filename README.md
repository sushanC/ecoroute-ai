# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Route operations map

The route optimization page reads bins, trucks, and pickup requests from the backend `/api/bins`, `/api/trucks`, and `/api/requests` endpoints. It sends the existing application JWT when available. These backend collection GET routes currently do not enforce authentication, so the bearer token is not authorization enforcement until the backend routes add their existing `protect` middleware; this page does not change that API contract.

The map uses OpenStreetMap tiles with attribution. Road geometry, distance, and duration come from the OSRM route API. The default `router.project-osrm.org` host is a public demo service for reasonable non-commercial use; configure `VITE_ROUTING_BASE_URL` to an approved or self-hosted OSRM-compatible endpoint for production or commercial use. Routing estimates are not traffic-aware and truck markers show the backend's stored coordinates, not live GPS. The planner keeps the existing priority-first ordering and balanced stop slicing; it previews assignments and does not persist them to truck records.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
