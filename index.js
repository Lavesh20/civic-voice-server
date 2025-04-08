const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection URI (should be stored in environment variables in production)
const uri = process.env.MONGODB_URI || "mongodb+srv://nikunj:1234@cluster0.djsjf.mongodb.net/prayatna?retryWrites=true&w=majority&appName=cluster0";

// Create a MongoDB client
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectToMongo() {
    try {
      await client.connect();
      console.log('Connected to MongoDB');
  
      // Debug: List database names
      const databasesList = await client.db().admin().listDatabases();
      console.log('Databases:', databasesList);
    } catch (error) {
      console.error('MongoDB connection error:', error);
    }
  }
  
// API route to submit a new complaint


// API route to fetch complaints
app.get('/api/complaints', async (req, res) => {
    try {
      const database = client.db('prayatna');
      const complaintsCollection = database.collection('complaints');
  
      // Debug: Check count
      const count = await complaintsCollection.countDocuments();
      console.log('Number of documents:', count);
  
      // Fetch complaints
      const complaints = await complaintsCollection.find({}).toArray();
      console.log('Fetched complaints:', complaints); // Debugging log
  
      res.json(complaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      res.status(500).json({ error: 'Failed to fetch complaints' });
    }
  });

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

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});