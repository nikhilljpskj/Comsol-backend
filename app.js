const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');

// Assuming you are using routes from another file like authRoutes
const authRoutes = require('./routes/auth');  // Make sure this is correctly exported
const complaintsRoutes = require('./routes/complaints');
const usersRoutes = require('./routes/users');
const viewComplaintStaffRoutes = require('./routes/viewcomplaintsstaff');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Sessions
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Set to true if using HTTPS
}));

// Route setup
app.use('/api/auth', authRoutes);  // Check that authRoutes is a router or middleware function
app.use('/api/complaints', complaintsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api', viewComplaintStaffRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
