const express = require('express');

const userAuthentication = require('../middleware/auth');
const forgotPasswordController = require('../controllers/forgotPassword');

const router = express.Router();

router.use('/forgotpassword', userAuthentication.authenticate, forgotPasswordController.forgotpassword);

router.get('/updatepassword/:resetpasswordid', userAuthentication.authenticate, forgotPasswordController.updatepassword)

router.get('/resetpassword/:id',userAuthentication.authenticate, forgotPasswordController.resetpassword)

module.exports = router;