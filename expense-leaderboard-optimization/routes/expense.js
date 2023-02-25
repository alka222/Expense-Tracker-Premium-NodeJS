const express = require('express');

const userAuthentication = require('../middleware/auth');
const expenseController = require('../controllers/expense');

const router = express.Router();

router.post('/addexpense', userAuthentication.authenticate, expenseController.addExpense);
router.get('/getexpenses', userAuthentication.authenticate, expenseController.getExpense);
router.delete('/deleteexpense/:expenseId', userAuthentication.authenticate, expenseController.deleteExpense);

module.exports = router;