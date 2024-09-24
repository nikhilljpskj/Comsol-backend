const mysql = require('mysql2');

// Use your Railway connection URL directly here
const dbUrl = 'mysql://root:ftFhdeLYRnHiJrkXHipTLKGEweSFqCcc@mysql.railway.internal:3306/railway';

const db = mysql.createConnection(dbUrl);

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL via Railway URL');
});

module.exports = db;
