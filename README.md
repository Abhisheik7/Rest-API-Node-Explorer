# BFHL Node Explorer

This project implements a full-stack web application for processing and visualizing hierarchical node structures.

## Structure
- `/backend`: Express.js REST API
- `/frontend`: React (Vite) Single Page Application

## Prerequisites
- Node.js (v18+ recommended)

## Running Locally

### Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   (Alternatively, run `node index.js`). The server will run on `http://localhost:3000`.

### Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the provided local URL (usually `http://localhost:5173`) in your browser.

## Deployment

### Backend (Render)
1. Push this repository to GitHub.
2. Go to Render (render.com) and create a new "Web Service".
3. Connect your GitHub repository.
4. Set the Root Directory to `backend`.
5. Build Command: `npm install`
6. Start Command: `node index.js`
7. (Optional) Add `PORT` environment variable if needed.

### Frontend (Vercel)
1. Go to Vercel (vercel.com) and click "Add New Project".
2. Import the same GitHub repository.
3. Edit the "Root Directory" to be `frontend`.
4. Vercel will automatically detect Vite. Build command is `npm run build`, Output directory is `dist`.
5. Add an Environment Variable:
   - Name: `VITE_API_URL`
   - Value: URL of your deployed Render backend (e.g., `https://your-backend.onrender.com`).
6. Deploy!

## Example Request & Response

### Request
```bash
curl -X POST http://localhost:3000/bfhl \
-H "Content-Type: application/json" \
-d '{"data": ["A->B", "A->C", "B->D", "hello", "1->2"]}'
```

### Response
```json
{
  "user_id": "abhisheik7",
  "email_id": "ay3197@srmist.edu.in",
  "college_roll_number": "RA2311003020310",
  "invalid_entries": [
    "hello",
    "1->2"
  ],
  "duplicate_edges": [],
  "hierarchies": [
    {
      "root": "A",
      "tree": {
        "B": {
          "D": {}
        },
        "C": {}
      },
      "depth": 3
    }
  ],
  "total_trees": 1,
  "total_cycles": 0,
  "largest_tree_root": "A"
## Submission Checklist

For submission you will need to share:
- Your hosted API base URL (evaluator will call `<your-url>/bfhl`)
- Your hosted frontend URL
- Your public GitHub repository URL
