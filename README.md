# ScholarPath — Scholarship Recommendation Website

A full-stack scholarship recommendation system built with **FastAPI + MySQL + Vanilla HTML/CSS/JS**.

---

## 🗂 Project Structure

```
dh project/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # MySQL connection
│   ├── models.py            # Pydantic models
│   ├── .env                 # DB credentials
│   ├── requirements.txt
│   └── routers/
│       └── scholarships.py  # All API endpoints
├── frontend/
│   ├── index.html           # Home / Landing page
│   ├── form.html            # Multi-step recommendation form
│   ├── results.html         # Scholarship results grid
│   ├── detail.html          # Full scholarship detail page
│   ├── about.html           # About page
│   ├── contact.html         # Contact page
│   ├── css/style.css        # Full design system
│   └── js/
│       ├── form.js          # Form submission logic
│       ├── results.js       # Results rendering
│       └── detail.js        # Detail page loader
├── sql/
│   └── schema_and_data.sql  # MySQL table + 10 records
├── start_server.bat         # One-click server start
└── README.md
```

---

## 🚀 Setup Instructions

### Step 1 — Run SQL on your local MySQL

```sql
-- Open MySQL and run:
USE dh_db;
SOURCE path/to/sql/schema_and_data.sql;
-- OR import directly in MySQL Workbench / phpMyAdmin
```

### Step 2 — Install Python dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 3 — Start the server

**Option A — Double-click `start_server.bat`**

**Option B — From terminal:**
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Step 4 — Open in browser

```
http://localhost:8000
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/recommend` | Get filtered scholarship recommendations |
| `GET`  | `/api/scholarships` | List all active scholarships |
| `GET`  | `/api/scholarships/{id}` | Full detail for one scholarship |

**Interactive API docs:** `http://localhost:8000/docs`

---

## 🗄 Database Config

Edit `backend/.env` to change credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=314638
DB_NAME=dh_db
```

---

## 🎨 Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Landing page with hero, features |
| Form | `/form.html` | 4-step recommendation form |
| Results | `/results.html` | Filtered scholarship cards |
| Detail | `/detail.html?id=N` | Full scholarship information |
| About | `/about.html` | Mission, vision, coverage |
| Contact | `/contact.html` | Contact form + FAQ |
