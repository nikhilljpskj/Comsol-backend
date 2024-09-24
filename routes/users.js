const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route to get the logged-in user's details
router.get('/current-user', userController.getUser);

// Route to get all staff users
router.get('/staff', userController.getStaff);

// Route to get a specific user's profile by ID (for logged-in user)
router.get('/:id', userController.getUserProfile);

// Route to update the user's password
router.put('/update-password', userController.updateUserPassword);

module.exports = router;
