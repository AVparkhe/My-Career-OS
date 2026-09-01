const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const JWT_SECRET = 'career-os-super-secret-key-123'; // In production, use env var

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Auth Routes ---

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = Date.now().toString();

    db.run(
      'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
      [id, name, email, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        
        const token = jwt.sign({ id, email }, JWT_SECRET);
        res.json({ token, user: { id, name, email } });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        careerGoal: user.careerGoal,
        role: user.role,
        bio: user.bio
      }
    });
  });
});

app.post('/api/profile', authenticateToken, (req, res) => {
  const { name, careerGoal, role, bio } = req.body;
  
  db.run(
    'UPDATE users SET name = ?, careerGoal = ?, role = ?, bio = ? WHERE id = ?',
    [name, careerGoal, role, bio, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ success: true });
    }
  );
});

// --- User Data Routes ---

app.get('/api/data', authenticateToken, (req, res) => {
  db.all('SELECT key, data FROM user_data WHERE user_id = ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    const result = {};
    rows.forEach(row => {
      try {
        result[row.key] = JSON.parse(row.data);
      } catch (e) {
        result[row.key] = row.data;
      }
    });
    res.json(result);
  });
});

app.get('/api/data/:key', authenticateToken, (req, res) => {
  const { key } = req.params;
  db.get('SELECT data FROM user_data WHERE user_id = ? AND key = ?', [req.user.id, key], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.json(null);
    try {
      res.json(JSON.parse(row.data));
    } catch (e) {
      res.json(row.data);
    }
  });
});

app.post('/api/data/:key', authenticateToken, (req, res) => {
  const { key } = req.params;
  const data = JSON.stringify(req.body);

  db.run(
    'INSERT INTO user_data (user_id, key, data) VALUES (?, ?, ?) ON CONFLICT(user_id, key) DO UPDATE SET data = excluded.data',
    [req.user.id, key, data],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ success: true });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Career OS backend running on http://localhost:${PORT}`);
});
