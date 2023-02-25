const Expense = require('../models/expenses');
const jwt = require('jsonwebtoken')

exports.addExpense = async (req, res, next) => {

    console.log(req.body)
    console.log('req>>>> ' + req.user.id)
    try{
        
        const {amount, description, category} = req.body;

        if(amount == undefined || amount.length === 0){
            return res.status(400).json({err : 'bad parameters . something is missing'})
        }


        await Expense.create({amount, description, category, userId: req.user.id})
        .then(expense => {
                return res.status(201).json({expense, success: true})
            })
        .catch(err => {
            return res.status(400).json({error: err, success: false})
        })
            

        
    }

    catch(err){
        res.status(500).json(err)
    }


}


exports.getExpense = async (req, res, next) => {

    // console.log(req.user.id)
    try{        

        await Expense.findAll({ where : { userId: req.user.id }})
       //   req.user.getExpense()  //another simpler way of doint this
        .then(expenses => {
            return res.status(200).json({expenses, success: true})
        })
        .catch(err => {
            return res.status(400).json({error: err, success: false})
        })
    }
    catch(err){
        res.status(500).json(err)
    }
}

exports.deleteExpense = async (req, res, next) => {

    try{
        const expenseid = req.params.expenseId;

        await Expense.destroy({ where: {id : expenseid, userId : req.user.id}})
        .then(() => {
            return res.status(204).json({ success: true, message: "Deleted Successfuly"})
        })
        .catch(err => {          
            console.log(err);
            return res.status(403).json({ success: false, message: "Failed"})
        })
    }

    catch(err){
        console.log(err);
        return res.status(500).json({ success: false, message: "Failed"})
    }
}