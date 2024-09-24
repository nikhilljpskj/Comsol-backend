const db = require('../db/db');
const bcrypt = require('bcryptjs');

// Register Controller
exports.register = (req, res) => {
  const { firstName, lastName, userType, email, mobile, office, officeAddress, gender, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = 'INSERT INTO users (first_name, last_name, user_type, email, mobile, office, office_address, gender, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [firstName, lastName, userType, email, mobile, office, officeAddress, gender, hashedPassword], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).send({ message: 'User registered successfully' });
  });
};

// Login Controller
exports.login = (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) return res.status(401).send({ success: false, message: 'User not found' });

    const user = result[0];
    const passwordMatch = bcrypt.compareSync(password, user.password); // Use bcryptjs to compare passwords
    if (!passwordMatch) return res.status(401).send({ success: false, message: 'Invalid credentials' });

    req.session.user = user; // Storing user in session
    res.status(200).send({ success: true, message: 'Login successful', user });
  });
};

// Logout Controller
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send(err);
    res.status(200).send({ message: 'Logout successful' });
  });
};

// Current User Controller
exports.getCurrentUser = (req, res) => {
  console.log('Current User Request:', req.session.user); // Debugging line
  if (!req.session.user) {
    return res.status(401).send({ success: false, message: 'Not authenticated' });
  }
  res.status(200).send({ success: true, user: req.session.user });
};

