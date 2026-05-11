# Deployment Roots

This file defines the intended deployment roots after the repository restructure.

## Vercel

Frontend deployment should use:

- Root directory: `frontend/`
- Build command: `npm run build`
- Output directory: `dist`

Relevant files:

- [frontend/package.json](/C:/Mycodes/MindScope/frontend/package.json:1)
- [frontend/vercel.json](/C:/Mycodes/MindScope/frontend/vercel.json:1)

## Render

Backend deployment should later use:

- Root directory: `backend/`

The backend service is not implemented yet, but the folder boundary is already reserved so server code can be deployed from `backend/` without mixing with the frontend or data scripts.
