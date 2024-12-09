const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize express app
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Setup database (SQLite for simplicity)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'task_management.db',
});

// Define User and Task models
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Task = sequelize.define('Task', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'To Do',
  },
});

// Relationships
User.hasMany(Task);
Task.belongsTo(User);

// JWT Secret
const JWT_SECRET = 'yourSecretKey';

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(403);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Sync models with the database
sequelize.sync().then(() => console.log('Database synced'));

// Routes
// Register Route
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await User.create({ username, password: hashedPassword });
    res.status(201).send('User registered');
  } catch (err) {
    res.status(400).send('Error registering user');
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(400).send('Invalid credentials');

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).send('Invalid credentials');

  // Create JWT token
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Fetch tasks for logged-in user
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.findAll({ where: { user_id: req.user.id } });
    res.json(tasks);
  } catch (err) {
    res.status(500).send('Error fetching tasks');
  }
});

// Create new task
app.post('/api/tasks', authenticateToken, async (req, res) => {
  const { title, description, status } = req.body;

  try {
    const task = await Task.create({ title, description, status, user_id: req.user.id });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).send('Error creating task');
  }
});

// Update task
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  try {
    const task = await Task.update({ title, description, status }, { where: { id, user_id: req.user.id } });
    if (task[0] === 0) return res.status(404).send('Task not found or unauthorized');
    res.json({ message: 'Task updated' });
  } catch (err) {
    res.status(500).send('Error updating task');
  }
});

// Delete task
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.destroy({ where: { id, user_id: req.user.id } });
    if (task === 0) return res.status(404).send('Task not found or unauthorized');
    res.send('Task deleted');
  } catch (err) {
    res.status(500).send('Error deleting task');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
