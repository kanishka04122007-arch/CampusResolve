const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await User.collection.updateOne(
    { email: 'admin@campusresolve.com' },
    { $set: { createdAt: new Date() } }
  );
  console.log('Fixed natively');
  process.exit(0);
});
