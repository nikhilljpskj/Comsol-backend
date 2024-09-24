const express = require('express');
const router = express.Router();
const complaintsController = require('../controllers/complaintsController');

// Define the route for complaints
router.post('/', complaintsController.registerComplaint);

router.get('/', complaintsController.getAllComplaints);

router.get('/admin-stats', complaintsController.getCountOfAllComplaints);

router.get('/:assignedStaffID/count', complaintsController.getAssignedComplaintsCount);

router.get('/:assignedStaffID/assigned', complaintsController.getAssignedComplaints);

router.put('/:id/assign', complaintsController.assignStaffToComplaint);

router.get('/complaints-over-time', complaintsController.getComplaintsOverTime);

router.get('/completed-complaints-over-time', complaintsController.getCompletedComplaintsOverTime);

router.get('/:id', complaintsController.getComplaintById);



module.exports = router;
