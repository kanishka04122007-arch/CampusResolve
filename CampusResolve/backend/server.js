const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/complaints',    require('./routes/complaintRoutes'));
app.use('/api/coordinator',   require('./routes/coordinatorRoutes'));
app.use('/api/staff',         require('./routes/staffRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin',         require('./routes/adminRoutes'));
app.use('/api/profile',       require('./routes/userRoutes'));
app.use('/api/support',       require('./routes/supportRoutes'));

app.get('/', (req, res) => {
  res.send('CampusResolve API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
