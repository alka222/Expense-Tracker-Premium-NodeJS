const express = require('express');

const userAuthentication = require('../middleware/auth');
const forgotPasswordController = require('../controllers/forgotPassword');

const router = express.Router();

router.post('/forgotpassword', userAuthentication.authenticate, forgotPasswordController.forgotPassword);


module.exports = router;