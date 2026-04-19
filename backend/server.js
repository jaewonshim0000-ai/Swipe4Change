// Swipe4Change Backend API — Deploy to Render.com
// Setup: Create a new Web Service on Render, point to this folder,
// set build command: npm install, start command: node server.js

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => res.json({ status: 'ok', service: 'swipe4change-api' }));
app.get('/health', (req, res) => res.json({ status: 'healthy' }));

// --- API Routes (connect to Supabase in production) ---

// Petitions
app.get('/api/petitions', (req, res) => {
  // In production: query Supabase petitions table with filters
  res.json({ message: 'GET /api/petitions — connect to Supabase' });
});

app.get('/api/petitions/:id', (req, res) => {
  res.json({ message: `GET /api/petitions/${req.params.id}` });
});

app.post('/api/petitions', (req, res) => {
  // Create petition — validate, save to Supabase
  res.json({ message: 'POST /api/petitions', data: req.body });
});

// Signatures
app.post('/api/sign', (req, res) => {
  // Record signature — increment count, save to signatures table
  res.json({ message: 'POST /api/sign', data: req.body });
});

app.get('/api/user/:id/signatures', (req, res) => {
  res.json({ message: `GET /api/user/${req.params.id}/signatures` });
});

// Users
app.post('/api/user', (req, res) => {
  res.json({ message: 'POST /api/user', data: req.body });
});

app.get('/api/user/:id', (req, res) => {
  res.json({ message: `GET /api/user/${req.params.id}` });
});

// Saved
app.post('/api/save', (req, res) => {
  res.json({ message: 'POST /api/save', data: req.body });
});

app.get('/api/user/:id/saved', (req, res) => {
  res.json({ message: `GET /api/user/${req.params.id}/saved` });
});

// Notifications
app.get('/api/user/:id/notifications', (req, res) => {
  res.json({ message: `GET /api/user/${req.params.id}/notifications` });
});

// Comments
app.post('/api/comment', (req, res) => {
  res.json({ message: 'POST /api/comment', data: req.body });
});

app.listen(PORT, () => {
  console.log(`Swipe4Change API running on port ${PORT}`);
});
