const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'todos.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readTodos() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeTodos(todos) {
  fs.writeFileSync(DB_FILE, JSON.stringify(todos, null, 2));
}

app.get('/api/todos', (req, res) => {
  res.json(readTodos());
});

app.post('/api/todos', (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });
  const todos = readTodos();
  const todo = { id: Date.now(), title: title.trim(), done: false, createdAt: new Date().toISOString() };
  todos.push(todo);
  writeTodos(todos);
  res.status(201).json(todo);
});

app.put('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  const todos = readTodos();
  const idx = todos.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const { title, done } = req.body;
  if (title !== undefined) todos[idx].title = title.trim();
  if (done !== undefined) todos[idx].done = done;
  writeTodos(todos);
  res.json(todos[idx]);
});

app.delete('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  const todos = readTodos();
  const idx = todos.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  todos.splice(idx, 1);
  writeTodos(todos);
  res.status(204).end();
});

app.listen(PORT, () => console.log(`Todo app running at http://localhost:${PORT}`));
