const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const superAdminRoute = require('./routes/superAdminRoute') // Import your routes
const templateRouter = require('./routes/templateRouter')// Import your routes
const taskRoutes = require('./routes/taskReports')
const bugreport = require('./routes/bugreport')

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS)
app.use(bodyParser.json()); // Parse incoming requests with JSON payloads


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Use the superadminRouter for routes related to templates
app.use('/api/superadmin', superAdminRoute);
app.use('/api/template', templateRouter);
app.use('/api/taskreports', taskRoutes);
app.use('/api/bugreport',bugreport)
// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`,process.env.MONGO_URI));
