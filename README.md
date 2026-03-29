# Språkapp

A free, open-source language learning platform. Read real texts in a foreign language, translate words and phrases inline, save vocabulary, and practice with flashcards. Teachers can create shared class pages with texts, vocab lists, and grammar exercises for students.

---

## Table of Contents

- [Reading & Translation](#reading--translation)
- [Vocabulary Lists](#vocabulary-lists)
- [Flashcard Practice](#flashcard-practice)
- [Class Pages](#class-pages)
- [Grammar Exercises](#grammar-exercises)
- [Developer Setup](#developer-setup)

---

## Reading & Translation

Upload a PDF or paste text directly. The app stores the text and lets you read it one page at a time with a translation panel on the right (desktop) or sliding up from the bottom (mobile).

**Translating a single word**

Click or tap any word. The translation appears in the panel. Click the ✕ to close.

**Translating a phrase**

Tap the first word — it becomes highlighted (the anchor). Then tap the last word of the phrase. The panel shows the translation of everything between the two taps.

On desktop you can also click and drag across words to select a phrase.

**Saving a word to a vocab list**

Once a translation is showing, a dropdown appears at the bottom of the panel. Pick an existing list and click **Add**, or choose **+ New vocab list** from the dropdown to create one on the spot.

**Navigation**

Use the **← Prev** / **Next →** buttons to move between pages. The **← My Documents** link returns to your document list.

---

## Vocabulary Lists

Vocab lists are per language (e.g. a Spanish list only contains Spanish words).

**Creating a list**

Go to **Vocab** in the navigation bar. Click **+ New list**, give it a name, and choose the language.

**Adding words manually**

Open a list and use the **Add words** input. Format: `native:target` — one pair per line. Example:

```
hello:hola
goodbye:adiós
```

**Adding words from the reader**

While reading, tap a word, wait for the translation, then pick a list from the dropdown in the panel and click **Add**. The word and its translation are saved automatically.

**Editing and deleting**

Each list shows its entries in a table. Click the trash icon on any entry to remove it. Use the **Rename** button to rename the list, or **Delete list** to remove it entirely.

---

## Flashcard Practice

Open a vocab list and click **Practice**. Choose a direction:

| Direction | Shown | You type |
|---|---|---|
| Target → Native | Foreign word | Your native language |
| Native → Target | Your native language | Foreign word |
| Mixed | Random | Either |

Type your answer and press **Submit**. The app tells you if you were right and shows the correct answer if you were wrong. At the end you see how many you got correct.

**Special characters**

For languages like Spanish, French, or German, character buttons (á, é, ñ, ü, etc.) appear below the input so you don't need a foreign keyboard.

---

## Class Pages

Class pages let you share a curated set of texts, vocab lists, and grammar exercises with a shareable link — no teacher/student accounts needed.

**Creating a class**

Go to **Classes** in the navigation bar. Click **+ New class**, enter a name and an optional description.

**Managing content**

Click **Manage** on a class to open the management page. From here you can:

- Add texts from your document library (they stay in your library too)
- Add vocab lists from your library
- Create and manage grammar exercises (see below)
- Copy the shareable link

**Sharing**

Click **Copy link** to get a URL like `yourapp.com/class/abc123xyz`. Anyone with this link can:

- Read the texts in the reader
- View the vocab tables
- Do grammar exercises and see their score

Translation in the reader requires an account. Viewing the class page and doing exercises does not.

---

## Grammar Exercises

Grammar exercises let a teacher mark specific words in a text as correct answers. Students read the same text, click what they think matches, and get immediate feedback.

### Creating an exercise (teacher)

1. Open a class → **Manage** → click **+ New exercise**
2. Fill in:
   - **Title** — e.g. "Chapter 3 — Indefinido"
   - **Instruction** — what students should look for, e.g. "Mark all verbs in the indefinido tense"
   - **Text** — paste or type the text students will read
3. Click **Continue: Mark words →**
4. The text appears with all words clickable. Click each correct word to mark it (highlighted in gold). Click again to unmark.
5. Click **Save exercise**

The instruction can be anything — verb tenses, adjectives, nouns, false friends, whatever fits the lesson.

**Editing an exercise**

From the manage page, click **Edit** next to an exercise. You can update the title, instruction, and re-mark words. Clicking **Edit text** on the marking screen returns to the form and clears all marks (since word positions would shift).

### Doing an exercise (student)

1. Open the class link → click an exercise
2. Read the instruction banner at the top
3. Click the words you think match (blue highlight)
4. Click **Submit**

After submitting, the text is coloured:

| Colour | Meaning |
|---|---|
| Green | You selected it and it was correct |
| Red | You selected it but it was wrong |
| Amber (dashed) | Correct answer you missed |

Your score is shown as `X / Y correct`. Click **Try again** to reset and have another go.

---

## Developer Setup

**Requirements:** Python 3.11+, Node.js 18+

**Backend**

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # fill in SECRET_KEY and DEEPL_API_KEY
uvicorn app.main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev                   # proxies API calls to :8000
```

**Running tests**

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm run test:run
```

**Environment variables (backend `.env`)**

| Variable | Description |
|---|---|
| `SECRET_KEY` | JWT signing secret (any long random string) |
| `DEEPL_API_KEY` | DeepL API key for translation |
| `DATABASE_URL` | SQLAlchemy URL, defaults to local SQLite |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins, e.g. `https://yourapp.pages.dev` |

**Tech stack**

- Frontend: React 19 + TypeScript, Vite, React Router v7, Axios
- Backend: FastAPI, SQLAlchemy 2, SQLite (swap to PostgreSQL by changing `DATABASE_URL`)
- Translation: DeepL API (primary), MyMemory (fallback)
- PDF parsing: pdfplumber
