const express = require('express');

const userAuthentication = require('../middleware/auth');
const forgotPasswordController = require('../controllers/forgotPassword');

const router = express.Router();

router.use('/forgotpassword', forgotPasswordController.forgotpassword);

router.get('/updatepassword/:resetpasswordid', forgotPasswordController.updatepassword)

router.get('/resetpassword/:id', forgotPasswordController.resetpassword)

module.exports = router;