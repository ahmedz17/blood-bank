const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();

const pool = new Pool({
  user: "zoha", // replace with your PostgreSQL username
  host: "localhost",
  database: "CS612", // replace with your PostgreSQL database name
  password: "bloodbank", // replace with your PostgreSQL password
  port: 5432, // default PostgreSQL port
});


app.use(bodyParser.json());


app.use(express.static("public"));


app.post("/api/register", async (req, res) => {
  try {
    const { username, email, phone_number, blood_type, password, role } = req.body;
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, email, phone_number, blood_type, password, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [username, email, phone_number, blood_type, hashedPassword, role]
    );

    res.status(201).json({ message: "User registered successfully", user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password, } = req.body;
  try {
    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    const token = jwt.sign({ userId: user.rows[0].id, role: user.rows[0].role}, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token,role:user.rows[0].role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
/*app.post('/api/donor/request-donation', async (req, res) => {
  const { name,age,disease_status, address, phone_number, blood_type, quantity, donation_date, user_id} = req.body;
  if (!name || !age || !disease_status || !address || !phone_number || !blood_type || !quantity || !donation_date || !user_id) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO Donations (user_id, name, age, disease_status, address, phone_number, blood_type, quantity, donation_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending') RETURNING donation_id`,
      [user_id, name, age, disease_status, address, phone_number, blood_type, quantity, donation_date]
    );
    res.status(201).json({
      message: 'Donation request submitted successfully',
      donation_id: result.rows[0].donation_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error submitting donation request' });
  }
});*/
app.post('/api/donor/request-donation', async (req, res) => {
  console.log('Donation request received:', req.body);
  const { name, age, disease_status, address, phone_number, blood_type, quantity, donation_date } = req.body;
  if (!name || !age || !disease_status || !address || !phone_number || !blood_type || !quantity || !donation_date) {
      return res.status(400).json({ message: 'All fields are required' });
  }
  try {
      const result = await pool.query(
          "INSERT INTO donations (name, age, disease_status, address, phone_number, blood_type, quantity, donation_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
          [name, age, disease_status, address, phone_number, blood_type, quantity, donation_date]
      );
      const donation_id = result.rows[0].donation_id;
      res.status(200).json({message:"Request Submitted Successfully", donation_id });
  } catch (error) {
      console.error('Error processing donation request:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

/*app.get('/api/donor/history', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT donation_date, blood_type, quantity, status
       FROM Donations
       WHERE donor_id = $1`,
      [donation_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No donation history found for this donor' });
    }
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});*/
app.get('/api/donor/history', async (req, res) => {
  const donation_id = req.query.donor_id;
  if (!donation_id) {
    return res.status(400).json({ error: 'Donor ID is required' });
  }
  try {
    const result = await pool.query(
      `SELECT donation_date, blood_type, quantity, status
       FROM Donations
       WHERE donation_id = $1`,
      [donation_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No donation history found for this donor' });
    }
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}); 
app.post('/api/patient/request-blood', async (req, res) => {
  const { name, age, reason, address, phone_number, blood_type, quantity, request_date } = req.body;

  // Validate that all required fields are provided
  if (!name || !age || !reason || !address || !phone_number || !blood_type || !quantity || !request_date) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Insert the blood request into the database
    const result = await pool.query(
      "INSERT INTO patients (name, age, reason, address, phone_number, blood_type, quantity, request_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [name, age, reason, address, phone_number, blood_type, quantity, request_date, 'pending']
    );

    const request_id = result.rows[0].id; // Get the request ID from the returned row
    res.status(200).json({
      message: 'Blood request submitted successfully',
      request_id
    });
  } catch (error) {
    console.error('Error processing blood request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}); 

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

