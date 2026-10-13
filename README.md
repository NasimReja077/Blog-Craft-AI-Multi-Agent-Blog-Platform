# BlogCraft AI: Multi-Agent Blog Platform

A full-stack MERN app where a team of five AI agents researches, plans, optimizes, writes and edits a complete blog post for you. Powered by **Groq + LangChain**.

## Features

- Five-agent pipeline: Research, Planner, SEO, Writer, Editor
- Live progress tracking while the article is being generated
- SEO data per post: primary and secondary keywords, title options, meta description, slug
- Markdown rendering with GitHub-flavored tables, lists and code blocks
- JWT authentication with per-user blog ownership checks
- Rate limit safe: automatic retries on Groq `429` errors, capped output tokens, trimmed context between agents
- Responsive dark UI with animated navbar, gradient hero and mobile menu

## Tech Stack

### Backend
- Node.js + Express 4
- MongoDB + Mongoose
- Groq via LangChain (`@langchain/groq`, `@langchain/core`)
- JWT auth, bcryptjs, Helmet, CORS, express-rate-limit, Morgan
- Jest + Supertest + MongoMemoryServer

### Frontend
- React 19 + Vite
- Tailwind CSS v4 (custom theme colors defined with `@theme` in `index.css`)
- Framer Motion
- Redux Toolkit (`createAsyncThunk`)
- React Router, React Markdown + remark-gfm, React Hot Toast
- Vitest + React Testing Library

## Project Structure

```
backend/
├── __tests__/          # Jest tests (auth, blogs, health, user model)
├── config/db.js        # MongoDB connection
├── controllers/        # authController, blogController
├── middleware/auth.js  # JWT protect middleware
├── models/             # User, Blog
├── routes/             # auth, blogs
├── utils/multiAgent.js # 5-agent generation pipeline
├── app.js              # Express app (kept separate for testing)
└── server.js           # Entry point

frontend/
└── src/
    ├── components/     # Navbar
    ├── features/       # Redux slices (auth, blogs)
    ├── pages/          # Home, Login, Register, Dashboard, Generate, BlogDetail
    ├── services/api.js # Axios instance
    ├── store/          # Redux store
    └── __tests__/      # Vitest tests
```

## Quick Start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET and GROQ_API_KEY
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` and proxies `/api` to `http://localhost:5000` during development.

> Requires Node.js 20.19+ (Vite 8).

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/blogcraft
JWT_SECRET=your_long_random_secret
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
GROQ_API_KEY=your_groq_key
GROQ_MODEL=openai/gpt-oss-120b
```

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | Secret used to sign tokens |
| `JWT_EXPIRE` | Token lifetime (default `7d`) |
| `FRONTEND_URL` | Allowed CORS origin (no trailing slash) |
| `GROQ_API_KEY` | Get one at https://console.groq.com/keys |
| `GROQ_MODEL` | Groq model name (default `openai/gpt-oss-120b`) |

### Frontend (production only)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL without the `/api` suffix (for example, `https://blog-craft-ai.onrender.com`) |

Set `VITE_API_URL` in `frontend/.env` for local builds; copy `frontend/.env.example` as a starting point. In production, set the same variable in the frontend host's build environment.

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Current user |
| POST | `/api/blogs/generate` | Yes | Start multi-agent generation |
| GET | `/api/blogs` | Yes | List your blogs |
| GET | `/api/blogs/:id` | Yes | Get one blog |
| PUT | `/api/blogs/:id` | Yes | Update title / content |
| DELETE | `/api/blogs/:id` | Yes | Delete a blog |
| GET | `/api/health` | No | Health check |

## Multi-Agent Flow

1. **Research Agent**: builds a structured research brief
2. **Planner Agent**: creates the outline and title options
3. **SEO Agent**: returns keywords, titles, meta description and slug as JSON
4. **Writer Agent**: writes the full draft in Markdown
5. **Editor Agent**: polishes clarity, flow and tone

The blog status moves through `pending → researching → planning → writing → editing → completed` (or `failed`). The API responds immediately after creating the blog, and the pipeline continues in the background while the frontend polls for progress.

## Running Tests

**Backend** (Jest + Supertest + MongoMemoryServer, no real database or Groq calls needed):

```bash
cd backend
npm test
```

**Frontend** (Vitest + React Testing Library):

```bash
cd frontend
npm run test:run
```

| File | What it tests |
|------|---------------|
| `backend/__tests__/auth.test.js` | Register, login, get current user (success and error cases) |
| `backend/__tests__/blogs.test.js` | Generate, list, get, update, delete, plus auth and ownership guards |
| `backend/__tests__/health.test.js` | Health endpoint |
| `backend/__tests__/userModel.test.js` | Password hashing and `matchPassword` |
| `frontend/src/__tests__/Home.test.jsx` | Home page heading, agent cards, call to action |
| `frontend/src/__tests__/Navbar.test.jsx` | Logged-out and logged-in navbar states |

The multi-agent generator is mocked in tests, so no Groq calls are made.

## Deploying on Render

Deploy as two services: a **Web Service** for the API and a **Static Site** for the frontend. You can use the `render.yaml` blueprint, or set them up manually:

### Backend (Web Service)

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`
- Environment: `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `GROQ_API_KEY`, `GROQ_MODEL`, `FRONTEND_URL`

### Frontend (Static Site)

- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment: set `VITE_API_URL` to the backend URL
- Rewrite rule: `/*` → `/index.html` (so page refreshes on routes like `/dashboard` work)

### Deployment checklist

- Add `app.set('trust proxy', 1);` in `backend/app.js` so rate limiting works behind Render's proxy
- In MongoDB Atlas, allow network access from `0.0.0.0/0`
- Deploy the backend first, set `VITE_API_URL` on the frontend, then set `FRONTEND_URL` on the backend to the static site URL and redeploy
- On Render's free plan the API sleeps after inactivity. A restart during generation leaves a blog stuck in progress, so use a paid instance or ping `/api/health` periodically

## Notes

- Groq's free tier is limited to about 8000 tokens per minute. The pipeline retries automatically after rate limit errors, so a full generation can take a few minutes.
- Generated content can contain inaccuracies. The agents are told not to invent facts, but always review before publishing.