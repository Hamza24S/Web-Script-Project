const User = require('./models/user');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const router = require('./route'); // Import routes

const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    description: { type: String, required: true },
    status: { type: String, required: true },
    userId: { type: String, required: true } 
});

// Create the Incident model
const Incident = mongoose.model('Incident', incidentSchema);


const app = express();
const port = 3000;


app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); // 
app.use('/', router);
app.use(express.static(path.join(__dirname, 'public'))); 

mongoose.connect('mongodb://localhost:27017/incident-management', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error connecting to MongoDB', err));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 

app.get('/incidents', isAuthenticated, async (req, res) => {
  try {
      const incidents = await Incident.find({ userId: req.user.id });
      res.json(incidents); 
  } catch (error) {
      console.error('Error fetching incidents:', error);
      res.status(500).send('Error fetching incidents');
  }
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

app.post('/incidents', isAuthenticated, async (req, res) => {
  try {
      const newIncident = new Incident({
          description: req.body.description,
          status: req.body.status,
          userId: req.user.id // Associate the incident with the logged-in user
      });
      await newIncident.save();
      res.json(newIncident); // Return the created incident
  } catch (error) {
      console.error('Error creating incident:', error);
      res.status(500).send('Error creating incident');
  }
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

app.delete('/incidents/:id', isAuthenticated, async (req, res) => {
  try {
      const result = await Incident.findOneAndDelete({
          _id: req.params.id,
          userId: req.user.id // Ensure user owns the incident
      });
      if (!result) {
          return res.status(404).send('Incident not found');
      }
      res.sendStatus(200);
  } catch (error) {
      console.error('Error deleting incident:', error);
      res.status(500).send('Error deleting incident');
  }
});





// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
