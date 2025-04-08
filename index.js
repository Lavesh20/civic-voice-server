const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = ['https://civicvoice-rosy.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// MongoDB connection URI
const uri = process.env.MONGODB_URI || "mongodb+srv://nikunj:1234@cluster0.djsjf.mongodb.net/prayatna?retryWrites=true&w=majority&appName=cluster0";

// Create a MongoDB client
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectToMongo() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const databasesList = await client.db().admin().listDatabases();
    console.log('Databases:', databasesList);
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// API route to fetch all complaints
app.get('/api/complaints', async (req, res) => {
  try {
    const database = client.db('prayatna');
    const complaintsCollection = database.collection('complaints');

    const count = await complaintsCollection.countDocuments();
    console.log('Number of documents:', count);

    const complaints = await complaintsCollection.find({}).toArray();
    console.log('Fetched complaints:', complaints);

    res.json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// API route to fetch complaints by department
app.get('/api/complaints/department/:department', async (req, res) => {
  try {
    const department = req.params.department;
    const database = client.db('prayatna');
    const complaintsCollection = database.collection('complaints');

    const count = await complaintsCollection.countDocuments({ department });
    console.log(`Number of documents for department ${department}:`, count);

    const complaints = await complaintsCollection.find({ department }).toArray();
    console.log(`Fetched ${complaints.length} complaints for department:`, department);

    res.json(complaints);
  } catch (error) {
    console.error(`Error fetching complaints for department ${req.params.department}:`, error);
    res.status(500).json({ error: 'Failed to fetch department complaints' });
  }
});

// Start the server
app.listen(PORT, async () => {
  await connectToMongo();
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});
