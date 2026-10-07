const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); 
const dotenv = require('dotenv');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@campusresolve.com';
    let admin = await User.findOne({ email: adminEmail });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    if (admin) {
      console.log('Admin user found. Updating password to hashed version...');
      admin.password = hashedPassword;
      // Ensure role is exactly lowercase 'admin'
      admin.role = 'admin';
      admin.isActive = true;
      await admin.save();
      console.log('Admin user updated successfully with hashed password.');
    } else {
      console.log('Admin user not found. Creating new admin user...');
      admin = new User({
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      await admin.save();
      console.log('Admin user created successfully.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
