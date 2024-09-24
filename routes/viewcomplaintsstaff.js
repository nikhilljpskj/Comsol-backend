const express = require('express');
const router = express.Router();
const viewComplaintsStaffController = require('../controllers/viewcomplaintsstaffController');

// Route to get complaints assigned to the staff
router.get('/viewcomplaintsstaff/:id', viewComplaintsStaffController.getComplaintsForStaff);

// Route to update complaint with diagnosis, additional comments, and location
router.put('/viewcomplaintsstaff/update/:id', viewComplaintsStaffController.updateComplaint);

module.exports = router;
