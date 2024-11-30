const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const router = require('./route'); // Import routes


const app = express();
const port = 3000;


app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); // 


app.use(express.static(path.join(__dirname, 'public'))); 

mongoose.connect('mongodb://localhost:27017/incident-management', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error connecting to MongoDB', err));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 

app.get('/login', (req, res) => {
    res.render('login'); 
  });
  

  app.get('/register', (req, res) => {
    res.render('register');
  });

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Check if user exists in the database
  const user = await User.findOne({ username });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id }, 'secret');
    res.cookie('token', token).redirect('/'); // Redirect to the main page 
  } else {
    res.status(401).send('Unauthorized'); // Invalid credentials
  }
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.redirect('/login'); 
});

function isAuthenticated(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login'); 
  }

  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) {
      return res.redirect('/login');
    }
    req.user = decoded; 
    next(); 
  });
}

// Serve the incident management page (only if authenticated)
app.get('/', isAuthenticated, (req, res) => {
    res.render('index');
  });

let incidents = []; 

function renderIncidentTable() {
  const tableBody = document.getElementById('incidentTable').querySelector('tbody');
  tableBody.innerHTML = '';

  incidents.forEach((incident, index) => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${incident.id}</td>
      <td>${incident.description}</td>
      <td>${incident.status}</td>
      <td>
        <button onclick="editIncident(${index})">Edit</button>
        <button onclick="deleteIncident(${index})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Handle incident creation
app.post('/incidents', (req, res) => {
  const { description, status } = req.body;
  const newIncident = { id: incidents.length + 1, description, status };
  incidents.push(newIncident);
  renderIncidentTable();
  res.json(newIncident);
});

// Handle incident update
app.put('/incidents/:id', (req, res) => {
  const { description, status } = req.body;
  const incidentId = parseInt(req.params.id);
  const incident = incidents.find(inc => inc.id === incidentId);

  if (incident) {
    incident.description = description;
    incident.status = status;
    renderIncidentTable();
    res.json(incident);
  } else {
    res.status(404).send('Incident not found');
  }
});

// Handle incident deletion
app.delete('/incidents/:id', (req, res) => {
  const incidentId = parseInt(req.params.id);
  const index = incidents.findIndex(inc => inc.id === incidentId);

  if (index !== -1) {
    incidents.splice(index, 1);
    renderIncidentTable();
    res.sendStatus(200);
  } else {
    res.status(404).send('Incident not found');
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
