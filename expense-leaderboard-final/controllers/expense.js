const Expense = require('../models/expenses');
const jwt = require('jsonwebtoken')
const User = require('../models/users');
const sequelize = require('../util/database');

exports.addExpense = async (req, res, next) => {

    console.log(req.body)
    console.log('req>>>> ' + req.user.id)
    try{
        
        const t = await sequelize.transaction();
        const {amount, description, category} = req.body;

        if(amount == undefined || amount.length === 0){
            return res.status(400).json({err : 'bad parameters . something is missing'})
        }


        await Expense.create({amount, description, category, userId: req.user.id}, { transaction: t })
        .then(expense => {
            const totalExpense = Number(req.user.totalExpenses) + Number(amount);
            console.log(totalExpense);

            User.update({
                totalExpenses: totalExpense
            },{
                where: {id: req.user.id },
                transaction: t
            })
            .then(async() => {
                await t.commit();
                res.status(201).json({expense: expense, success: true})
            })
            .catch(async(err) => {
                await t.rollback();
                return res.status(500).json({error: err, success: false})
            })
            })
        .catch(async(err) => {
            await t.rollback();
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
        const t = await sequelize.transaction();
        const expenseid = req.params.expenseId;

        await Expense.destroy({ where: {id : expenseid, userId : req.user.id}}, {transaction: t})
        .then(() => {
            const totalExpense = Number(req.user.totalExpenses) - Number(amount);
            console.log(totalExpense);

            User.update({
                totalExpenses: totalExpense
            },{
                where: {id: req.user.id },
                transaction: t
            })

            .then(async() => {
                await t.commit();
                res.status(204).json({ success: true, message: "Deleted Successfuly"})
            })
            .catch(async(err) => {
                await t.rollback();
                console.log(err);
                return res.status(403).json({ success: false, message: "Failed"})
            })
        })
        .catch(async(err) => {
            await t.rollback();
            return res.status(400).json({error: err, success: false})
        })
    }

    catch(err){
        console.log(err);
        return res.status(500).json({ success: false, message: "Failed"})
    }
}