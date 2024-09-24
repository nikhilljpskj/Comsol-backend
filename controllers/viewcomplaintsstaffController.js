const db = require('../db/db');
const twilio = require('twilio');
require('dotenv').config();

// Twilio configuration
const accountSid = process.env.ACCOUNT_SID; // Your Account SID
const authToken = process.env.AUTH_TOKEN; // Your Auth Token
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Your Twilio WhatsApp number

const client = twilio(accountSid, authToken);

// Get complaints for the logged-in staff
exports.getComplaintsForStaff = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM complaints WHERE staff_assigned = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).json(results);
  });
};

// Update complaint with diagnosis, additional comment, and location
exports.updateComplaint = (req, res) => {
  const { id } = req.params;
  const { diagnosis, additionalComment, staffLocation } = req.body;

  // SQL query to update the complaint
  const updateSql = 'UPDATE complaints SET diagnosis = ?, status = 2, additional_comments = ?, staff_location = ? WHERE id = ?';

  // First, update the complaint
  db.query(updateSql, [diagnosis, additionalComment, staffLocation, id], (err, result) => {
    if (err) {
      return res.status(500).send({ message: 'Failed to update complaint.' });
    }

    // Fetch the WhatsApp number and customer name from the complaint
    const fetchComplaintSql = 'SELECT whatsapp_number, customer_name, complaint FROM complaints WHERE id = ?';
    db.query(fetchComplaintSql, [id], (err, results) => {
      if (err) {
        return res.status(500).send({ message: 'Failed to fetch complaint details.' });
      }

      const complaint = results[0];
      const whatsappNumber = complaint.whatsapp_number;
      const customerName = complaint.customer_name;
      const customerComplaint = complaint.complaint;

      // Ensure the WhatsApp number is in E.164 format with '+' sign
      const formattedWhatsappNumber = whatsappNumber.startsWith('+') ? whatsappNumber : `+91${whatsappNumber}`;

      // Send WhatsApp message to notify the customer of the status change
      client.messages
        .create({
          body: `Hello ${customerName},\nYour complaint has been Fixed \n. Diagnosis: ${diagnosis}\nComplaint: ${customerComplaint}\n Thankyou for trusting us.`,
          from: `whatsapp:${twilioWhatsAppNumber}`,
          to: `whatsapp:${formattedWhatsappNumber}`
        })
        .then(message => {
          console.log('WhatsApp message sent:', message.sid);
          res.status(200).send({ success: true, message: 'Complaint updated and WhatsApp message sent.' });
        })
        .catch(err => {
          console.error('Failed to send WhatsApp message:', err);
          res.status(500).send({ success: true, message: 'Complaint updated, but failed to send WhatsApp message.' });
        });
    });
  });
};
