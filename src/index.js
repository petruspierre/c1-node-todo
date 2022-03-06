const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [{
  "id": "b873f28f-6e1b-49d9-96b4-ef05231221cd",
	"name": "Petrus",
	"username": "petruspierre",
	"todos": []
}];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const existingUser = users.find((user) => user.username === username);

  if (!existingUser) {
    return response.status(404).json({ error: 'User does not exists' });
  }

  request.user = existingUser;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const existingUser = users.find((user) => user.username === username);

  if (existingUser) {
    return response.status(400).json({ error: 'User already exists' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const existingTodo = user.todos.find((todo) => todo.id === id);

  if(!existingTodo) {
    return response.status(404).json({ error: 'Todo does not exists' });
  }

  const newTodo = {
    ...existingTodo,
    title,
    deadline: new Date(deadline)
  }

  const userId = users.findIndex((userQuery) => userQuery.id === user.id);
  const todoId = user.todos.findIndex((todoQuery) => todoQuery.id === id);

  users[userId].todos[todoId] = newTodo;

  return response.json(newTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  const existingTodo = user.todos.find((todo) => todo.id === id);

  if(!existingTodo) {
    return response.status(404).json({ error: 'Todo does not exists' });
  }

  const newTodo = {
    ...existingTodo,
    done: true
  }

  const userId = users.findIndex((userQuery) => userQuery.id === user.id);
  const todoId = user.todos.findIndex((todoQuery) => todoQuery.id === id);

  users[userId].todos[todoId] = newTodo;

  return response.json(newTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  const existingTodo = user.todos.find((todo) => todo.id === id);

  if(!existingTodo) {
    return response.status(404).json({ error: 'Todo does not exists' });
  }

  const userId = users.findIndex((userQuery) => userQuery.id === user.id);

  users[userId].todos = users[userId].todos.filter((todo) => todo.id !== id);

  return response.status(204).send();
});

module.exports = app;