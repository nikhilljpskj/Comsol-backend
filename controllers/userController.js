const db = require('../db/db');

const bcrypt = require('bcryptjs');
// Get the logged-in user from session
exports.getUser = (req, res) => {
  if (!req.session.user) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
  res.status(200).send(req.session.user);
};

// Get all users with user_type = 'Staff'
exports.getStaff = (req, res) => {
  const sql = 'SELECT id, first_name, last_name FROM users WHERE user_type = "Staff"';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(results);
  });
};



// Get user details by ID
exports.getUserProfile = (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT first_name, last_name, email, mobile, office, office_address, gender FROM users WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) return res.status(404).send({ message: 'User not found' });
    
    res.status(200).json(result[0]);
  });
};

// Update user password
exports.updateUserPassword = (req, res) => {
  const { id, password } = req.body;

  // Hash the new password
  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = 'UPDATE users SET password = ? WHERE id = ?';
  db.query(sql, [hashedPassword, id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).send({ success: true, message: 'Password updated successfully' });
  });
};
