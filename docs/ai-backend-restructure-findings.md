# AI Backend Restructure Findings

This document is only about file structuring work needed to make the codebase ready for future AI integration and deployment.

It does not cover AI feature setup, prompt design, routes, model logic, or backend implementation details. The goal here is to make the source code layout clean enough so AI work can be added safely later.

## Primary Goal

The codebase should be reorganized so it has clear runtime boundaries:

- `frontend/` for the deployed Vite React app
- `backend/` for the future deployed Node.js + Express service
- `data/` for dataset files and Python data-processing scripts

This structure should be the first focus before AI feature work starts.

## Quick Summary

Right now the repo is still partly in transition:

- the frontend app has already been moved into `frontend/`
- `data/` now owns the dataset files and Python scripts
- `backend/` exists as a reserved folder for future server code
- some docs and paths still reflect the old root-level structure

Before implementing the AI feature, the project should first be cleaned up so deployment roots, env-file ownership, and file locations are predictable.

## Ordered TODO Checklist

- [x] Create the top-level folders: `frontend/`, `backend/`, and `data/`.
- [x] Move the current Vite frontend files into `frontend/`.
- [x] Move the current `dataset/` contents into `data/`.
- [x] Remove the old `dataset/` folder after its contents are moved.
- [x] Keep `backend/` as the reserved root for the future Express service.
- [x] Decide whether frontend API helpers should live in `frontend/src/api/` or stay in `frontend/src/lib/`.
- [x] If `supabase.ts` is moved, update imports in the frontend.
- [ ] Split env-file ownership by folder so each runtime has its own env location.
- [ ] Keep only browser-safe variables in `frontend/.env`.
- [ ] Reserve backend-only secrets for `backend/.env`.
- [ ] Reserve dataset/script variables for `data/.env`.
- [ ] Update `.gitignore` if needed so `frontend/.env`, `backend/.env`, and `data/.env` remain ignored.
- [ ] Update README commands so frontend commands run from `frontend/`.
- [ ] Update README and docs so dataset/script commands use `data/` instead of `dataset/`.
- [ ] Update markdown links and path references that still assume the frontend lives at the repo root.
- [ ] Confirm the frontend still builds from `frontend/`.
- [ ] Prepare deployment roots so Vercel points to `frontend/` and Render can later point to `backend/`.

## Current Structure Status

### Completed

- The frontend app is no longer at the repo root.
- The frontend package files now belong under `frontend/`.
- The project now has a visible place for frontend, backend, and data concerns.
- `frontend/src/api/` is now the chosen home for frontend API helpers.

### Still Pending

- Documentation still needs path cleanup.
- Environment ownership is not fully separated by runtime yet.
- The backend folder is still only a placeholder and does not contain server code yet.

## What Needs To Be True Before AI Work Starts

The source tree should be stable enough that AI code can be added without mixing concerns.

That means:

- frontend code should live only under `frontend/`
- backend code should live only under `backend/`
- dataset scripts and CSV files should live only under `data/`
- deployment targets should already match those folders
- env files should already be separated by runtime
- docs should already use the new folder paths

If this is not done first, AI implementation work will end up mixed with migration work, which makes debugging and deployment harder.

## Folder Ownership

### `frontend/`

This folder should own:

```txt
src/
public/
index.html
package.json
package-lock.json
vite.config.ts
eslint.config.js
tsconfig.json
tsconfig.app.json
tsconfig.node.json
.env
.env.example
dist/
node_modules/
```

Purpose:

- local frontend development
- Vite build output
- Vercel deployment root

### `backend/`

This folder should exist as the only future backend root.

For now, the important part is not implementation. The important part is preserving this folder boundary so backend code does not end up mixed back into the frontend or repo root.

Purpose:

- future Express service root
- future Render deployment root
- future server-only environment ownership

### `data/`

This folder should own all dataset and Python processing files.

Target contents:

```txt
Teen_Mental_Health_Dataset.csv
Teen_Mental_Health_Dataset.cleaned.csv
cleaning.py
config.py
run_cleaning_pipeline.py
upload_to_supabase.py
cleaning_summary.json
```

Purpose:

- raw and cleaned dataset files
- upload scripts
- cleaning pipeline scripts
- script-specific environment values

## Path Fixes Still Required

The following areas still need structure-related cleanup:

- commands in `README.md` that still assume frontend files are at the repo root
- commands in `README.md` and docs that still reference `dataset/`
- markdown links in docs that still reference old file locations

## Deployment Readiness

The structure should support deployment cleanly:

- `frontend/` should be the Vercel root directory
- `backend/` should be the Render root directory later
- repo root should stop acting like the frontend app root

This is a structure concern first, not an AI feature concern.

## Recommended Target Shape

```txt
AppDev_Final_Project/
  frontend/
    src/
      api/
      components/
      pages/
      lib/
      types/
    public/
    index.html
    package.json
    package-lock.json
    vite.config.ts
    tsconfig.json
    tsconfig.app.json
    tsconfig.node.json
    eslint.config.js
    .env.example

  backend/

  data/
    Teen_Mental_Health_Dataset.csv
    Teen_Mental_Health_Dataset.cleaned.csv
    cleaning.py
    config.py
    run_cleaning_pipeline.py
    upload_to_supabase.py
    cleaning_summary.json

  docs/
  README.md
  .gitignore
```

## Final Note

This restructure should be treated as source-code preparation for AI integration and deployment.

The backend feature work should start only after:

- the dataset folder move is complete
- the docs reflect the new layout
- env ownership is separated
- the frontend build is confirmed from `frontend/`
