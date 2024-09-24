const db = require('../db/db');
const twilio = require('twilio');
require('dotenv').config()

// Twilio configuration
const accountSid = process.env.ACCOUNT_SID; // Your Account SID
const authToken = process.env.AUTH_TOKEN; // Your Auth Token
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Your Twilio WhatsApp number

const client = twilio(accountSid, authToken);

// Register a new complaint
exports.registerComplaint = (req, res) => {
  const { customerName, customerEmail, mobileNumber, whatsappNumber, complaint, location } = req.body;

  // Ensure the whatsappNumber is in E.164 format with '+' sign
  const formattedWhatsappNumber = whatsappNumber.startsWith('+') ? whatsappNumber : `+91${whatsappNumber}`;

  const sql = 'INSERT INTO complaints (customer_name, customer_email, mobile_number, whatsapp_number, complaint, location, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [customerName, customerEmail, mobileNumber, formattedWhatsappNumber, complaint, location, 0], (err, result) => {
    if (err) {
      console.error('Error inserting complaint:', err);
      return res.status(500).send({ message: 'Failed to register complaint.' });
    }

    // Send WhatsApp message
    client.messages
      .create({
        body: `Your complaint has been registered successfully. Complaint details: \nCustomer Name: ${customerName}\nComplaint: ${complaint}`,
        from: `whatsapp:${twilioWhatsAppNumber}`,
        to: `whatsapp:${formattedWhatsappNumber}`
      })
      .then(message => {
        console.log('WhatsApp message sent:', message.sid);
        res.status(200).send({ message: 'Complaint registered successfully and WhatsApp message sent.' });
      })
      .catch(err => {
        console.error('Failed to send WhatsApp message:', err);
        res.status(500).send({ message: 'Complaint registered successfully, but failed to send WhatsApp message.' });
      });
  });
};


// Fetch assigned complaints only [staff]
exports.getAssignedComplaints = (req, res) => {
  const {assignedStaffID} = req.params;
  const sql = 'SELECT * FROM complaints where staff_assigned=? ORDER BY created_at DESC';
  db.query(sql, [assignedStaffID], (err, results) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(results);
  });
};

// Fetch assigned complaints count [staff]
exports.getAssignedComplaintsCount = (req, res) => {
  const {assignedStaffID} = req.params;
  const sql = 'SELECT COUNT(id) as complaint_count FROM complaints where staff_assigned=?';
  db.query(sql, [assignedStaffID], (err, results) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(results);
  });
};

// Fetch count of active projects, pending assignments, and employee count
exports.getCountOfAllComplaints = (req, res) => {
  const countActiveProjectsQuery = 'SELECT count(id) as count_active_projects FROM complaints WHERE status != "2"';
  const countPendingAssignmentQuery = 'SELECT count(id) as count_pending_assignment FROM complaints WHERE status = "1"';
  const employeeCountQuery = 'SELECT count(id) as employee_count FROM users';

  // Run all queries in parallel using Promise.all
  Promise.all([
    new Promise((resolve, reject) => {
      db.query(countActiveProjectsQuery, (err, results) => {
        if (err) return reject(err);
        resolve(results[0].count_active_projects);  // Accessing first row
      });
    }),
    new Promise((resolve, reject) => {
      db.query(countPendingAssignmentQuery, (err, results) => {
        if (err) return reject(err);
        resolve(results[0].count_pending_assignment); // Accessing first row
      });
    }),
    new Promise((resolve, reject) => {
      db.query(employeeCountQuery, (err, results) => {
        if (err) return reject(err);
        resolve(results[0].employee_count); // Accessing first row
      });
    })
  ])
    .then(([count_active_projects, count_pending_assignment, employee_count]) => {
      // Return results in a single object
      res.status(200).json({
        count_active_projects,
        count_pending_assignment,
        employee_count
      });
    })
    .catch((err) => {
      res.status(500).send(err);
    });
};

// Fetch all complaints
exports.getAllComplaints = (req, res) => {
  const sql = 'SELECT * FROM complaints ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(results);
  });
};

// Assign staff to complaint and send WhatsApp message
exports.assignStaffToComplaint = (req, res) => {
  const { id } = req.params; // Complaint ID
  const { staff_assigned } = req.body;

  // Fetch the complaint to get the WhatsApp number and customer name
  const getComplaintSql = 'SELECT whatsapp_number, customer_name FROM complaints WHERE id = ?';
  db.query(getComplaintSql, [id], (err, results) => {
    if (err) return res.status(500).send({ message: 'Failed to fetch complaint.' });

    const complaint = results[0];
    const whatsappNumber = complaint.whatsapp_number;
    const customerName = complaint.customer_name;

    // Ensure the WhatsApp number is in E.164 format
    const formattedWhatsAppNumber = whatsappNumber.startsWith('+') ? whatsappNumber : `+${whatsappNumber}`;

    // Update the complaint with the assigned staff and set status to 1 (assigned)
    const updateSql = 'UPDATE complaints SET staff_assigned = ?, status = 1 WHERE id = ?';
    db.query(updateSql, [staff_assigned, id], (err, result) => {
      if (err) return res.status(500).send({ message: 'Failed to assign employee.' });

      // Send WhatsApp message

      complaintStatusUrl = `${process.env.DEV_PATH_CLIENT}/customer/complaint-status/${id}`

      client.messages
      .create({
        body: `Hello ${customerName}, your complaint has been assigned to our staff member with ID: ${staff_assigned}. You can check the status of your complaint here: ${complaintStatusUrl}`,
        from: `whatsapp:${twilioWhatsAppNumber}`,
        to: `whatsapp:${formattedWhatsAppNumber}`
      })
        .then(message => {
          console.log('WhatsApp message sent:', message.sid);
          res.status(200).send({ message: 'Employee assigned successfully and WhatsApp message sent.' });
        })
        .catch(err => {
          console.error('Failed to send WhatsApp message:', err);
          res.status(500).send({ message: 'Employee assigned successfully, but failed to send WhatsApp message.' });
        });
    });
  });
};


// Fetch number of complaints over time
exports.getComplaintsOverTime = (req, res) => {
  const sql = `
    SELECT DATE(created_at) AS date, COUNT(id) AS count
    FROM complaints
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at);
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(results);
  });
};

// Fetch number of completed complaints over time
exports.getCompletedComplaintsOverTime = (req, res) => {
  const sql = `
    SELECT DATE(created_at) AS date, COUNT(id) AS count
    FROM complaints
    WHERE status = '2'
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at);
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(results);
  });
};

// Fetch complaint details by ID
exports.getComplaintById = (req, res) => {
  const { id } = req.params;
  const getComplaintSql = `
    SELECT id, customer_name, whatsapp_number, complaint, staff_assigned, status 
    FROM complaints WHERE id = ?`;
  
  db.query(getComplaintSql, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send({ message: 'Complaint not found.' });
    }
    res.status(200).send(results[0]);
  });
};

