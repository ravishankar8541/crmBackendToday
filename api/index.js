require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const dbConnection = require('../config/db'); 
const auth = require('../routes/auth');
const client = require('../routes/client');
const billRoutes = require('../routes/billRoutes');
const serviceBillRoutes = require('../routes/serviceBillRoutes');
const emailRoutes = require('../routes/emailRoutes');
const pdfRoutes = require('../routes/pdfRoutes');

const PORT = process.env.PORT || 5000;

// Initialize Database Connection
dbConnection();

// CORS Configuration
const corsOptions = {
  origin: ['https://www.viralcrm.in', 'http://www.viralcrm.in', 'https://viralcrm.in', 'http://viralcrm.in'],
  credentials: true,                
};

// 1. Enable standard CORS requests
app.use(cors(corsOptions));

// 2. Intercept and handle global Preflight (OPTIONS) requests safely for Express 5
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return cors(corsOptions)(req, res, next);
  }
  next();
});

// Standard Middlewares
app.use(express.json());

// Static Files Serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Route Registrations
app.use('/api/auth', auth);
app.use('/api/client', client);
app.use('/api/bills', billRoutes);
app.use('/api/service-bills', serviceBillRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/pdf', pdfRoutes);

// Base Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: "success",
    message: "ViralCRM Backend is Live and Running perfectly!",
    timestamp: new Date()
  });
});

// Static Middleware Debug Route
app.get('/uploads/debug-test', (req, res) => {
  res.send('Static middleware is active!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
