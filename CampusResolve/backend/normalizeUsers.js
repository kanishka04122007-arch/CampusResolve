const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    let updatedCount = 0;

    for (const u of users) {
      let changed = false;
      const rawRole = (u.role || '').toLowerCase();
      let normalizedRole = 'student';
      if (rawRole.includes('admin')) normalizedRole = 'admin';
      else if (rawRole.includes('coord')) normalizedRole = 'coordinator';
      else if (rawRole.includes('staff')) normalizedRole = 'staff';
      else if (rawRole.includes('student')) normalizedRole = 'student';

      if (u.role !== normalizedRole) {
        u.role = normalizedRole;
        changed = true;
      }

      if (!u.createdAt) {
        u.createdAt = new Date();
        changed = true;
      }

      if (u.isActive === undefined || u.isActive === null) {
        u.isActive = true;
        changed = true;
      }

      if (changed) {
        await u.save();
        updatedCount++;
      }
    }

    console.log(`Successfully normalized ${updatedCount} users. Total users: ${users.length}`);
    process.exit(0);
  } catch (err) {
    console.error('Error normalizing users:', err);
    process.exit(1);
  }
};

run();
