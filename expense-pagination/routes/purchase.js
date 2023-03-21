const express = require('express');

const userAuthentication = require('../middleware/auth');
const purchaseController = require('../controllers/purchase');

const router = express.Router();

router.get('/premiummembership', userAuthentication.authenticate, purchaseController.purchasePremium);

router.post('/updatetransactionstatus', userAuthentication.authenticate, purchaseController.updateTransactionStatus);

module.exports = router;