const express = require('express');
const { getProfile, updateProfile, updateProfilePicture, removeProfilePicture, changePassword } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/upload-image', upload.single('profilePicture'), updateProfilePicture);
router.delete('/remove-image', removeProfilePicture);
router.put('/change-password', changePassword);

module.exports = router;
