# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Vision

**Språkapp** is a free, open-source language learning platform inspired by LingQ and Quizlet. Core features:

- Upload text/PDFs and read them with inline word/phrase translation (click a word or drag to select multiple words)
- Vocabulary flashcard tests (planned)
- Simple user accounts (personal use; no teacher/student roles in MVP)
- AI chatbot for asking questions about reading content (future)

Everything must remain **free to operate** — prefer open-source/free-tier services over paid APIs.

## Tech Stack

- **Frontend**: React 19 + TypeScript (Vite 8), React Router v7, Axios
- **Backend**: Python + FastAPI, SQLite (via SQLAlchemy 2), JWT auth (python-jose + bcrypt)
- **Translation**: MyMemory API (free, no key required, supports `es|no`)
- **PDF parsing**: pdfplumber
- **Testing**: pytest + pytest-asyncio (backend), Vitest + React Testing Library + MSW (frontend)

## Development Commands

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000   # Dev server
pytest                                       # All tests
pytest tests/test_auth.py -v                # Specific file
pytest tests/test_auth.py::test_login -v    # Single test
pytest --cov=app --cov-report=term-missing  # Coverage
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # Dev server (proxies /auth, /documents, /translate to :8000)
npm run test:run   # Run all tests once (CI mode)
npm test           # Watch mode
npm run typecheck  # Type-check without building
npm run lint       # Lint
npm run build      # Production build
```

## Architecture

### Backend (`backend/app/`)
- `main.py` — FastAPI app entry, router registration, lifespan (table creation)
- `core/` — `config.py` (pydantic-settings from `.env`), `database.py` (SQLAlchemy engine + `get_db` dependency), `security.py` (bcrypt hashing, JWT encode/decode)
- `models/` — SQLAlchemy ORM: `User`, `Document`, `Page`, `TranslationCache`
- `schemas/` — Pydantic request/response models (separate from ORM models)
- `routers/` — `auth.py` (register/login/me + `get_current_user` dependency), `documents.py`, `translations.py`
- `services/` — `pdf_parser.py` (pdfplumber, validates magic bytes), `translation.py` (MyMemory client + DB cache)

**Translation flow**: POST `/translate` → check `translation_cache` table → on miss: call `api.mymemory.translated.net` → store in cache. Frontend also has a 500-entry LRU `Map` to avoid repeated backend calls.

**PDF storage**: only extracted text is stored (no raw file). Tokenization into clickable words happens on the frontend at render time — the backend stores plain text per page.

### Frontend (`frontend/src/`)
- `api/` — Axios client with Bearer token interceptor + 401→/login redirect; one file per domain
- `hooks/` — `useAuth.ts` (reads from `localStorage`), `useTranslation.ts` (LRU cache + API call)
- `features/auth/` — `AuthContext.tsx` (provides auth state app-wide), `LoginPage`, `RegisterPage`, `ProtectedRoute`
- `features/reader/` — **The core UI**: `ReaderPage` → `SelectionHandler` → `TextRenderer` → `Token` + `TranslationPopup`
- `features/documents/` — `DocumentListPage`, `UploadPage`

**Reader tokenization**: `TextRenderer` splits text on whitespace, strips leading/trailing punctuation from each chunk, renders clean words as `<Token>` (clickable) and punctuation as plain spans. Paragraph breaks (`\n\n`) render as `<br/>` gaps.

### Testing notes
- Backend: use `StaticPool` SQLite in-memory DB with dependency override on `get_db`. All model imports must happen before `Base.metadata.create_all`.
- Frontend: MSW `setupServer` intercepts axios XHR in jsdom. Use `fireEvent` (not `userEvent`) for file input interactions — userEvent's file upload timing conflicts with async form submission in some Vitest/jsdom combos. React Router v7 uses the Navigation API; a `window.navigation` stub is in `src/tests/setup.ts` to suppress jsdom warnings.
- Frontend: `vi.mock` for module-level mocks can have ESM binding issues in this stack — prefer MSW for API layer tests.

## Key Design Decisions

| Decision | Choice | Reason |
|---|---|---|
| Translation API | MyMemory | Free, no key, supports es→no |
| Translation proxy | Server-side | Centralises quota; key in one .env |
| PDF storage | Text only | Simple auth, minimal disk |
| Tokenization | Frontend at render time | Backend stays simple; can refine without migrations |
| JWT expiry | 7 days, no refresh | Simplicity for personal use |
| DB for MVP | SQLite | Zero setup; swap to PostgreSQL by changing one env var |
