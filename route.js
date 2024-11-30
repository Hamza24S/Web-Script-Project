const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('./models/user');

// Route for login page
router.get('/login', (req, res) => {
  res.render('login'); // Render the login.ejs file
});

// Route for register page
router.get('/register', (req, res) => {
  res.render('register'); // Render the register.ejs file
});

// Registration endpoint (POST)
router.post('/register', async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = new User({ username: req.body.username, password: hashedPassword });
  await user.save();
  res.redirect('/login'); // Redirect to login after successful registration
});

// Login endpoint (POST)
router.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user && (await bcrypt.compare(req.body.password, user.password))) {
    const token = jwt.sign({ id: user._id }, 'secret');
    res.cookie('token', token).redirect('/'); // Store token and redirect
  } else {
    res.status(401).send('Unauthorized');
  }
});

module.exports = router;
