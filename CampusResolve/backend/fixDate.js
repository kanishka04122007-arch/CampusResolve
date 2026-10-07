const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const fixDate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find users with no createdAt and set it to now
    const result = await User.updateMany(
      { createdAt: { $exists: false } },
      { $set: { createdAt: new Date() } }
    );
    
    console.log(`Updated ${result.modifiedCount} users to have a createdAt date.`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

fixDate();
