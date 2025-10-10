const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Enable CORS for your frontend domain
app.use(cors({
  origin: 'https://calm-tree-0799eba00.1.azurestaticapps.net'
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Import and use authentication routes
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

// Test root route (your original content)
app.get('/', (req, res) => {
  res.send('The CI/CD pipeline works! This is an automated update.');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

