const Expense = require('../models/expenses');
const jwt = require('jsonwebtoken')
const User = require('../models/users');
const sequelize = require('../util/database');
const UserServices = require('../services/userservices');
const S3Services = require('../services/S3services')

/*
function uploadToS3( data , filename){
    const  BUCKET_NAME = process.env.BUCKET_NAME
    const IAM_USER_KEY = process.env.IAM_ACCESS_KEY 
   const IAM_SECRET_KEY  = process.env.IAM_SECRET

    // make new instance with keys to access
    let s3Bucket = new AWS.S3({
       accessKeyId: IAM_USER_KEY,
         secretAccessKey: IAM_SECRET_KEY
    })

    //create bucket with parameter to upload
    //our bucket is already created in S3, so no need to create again

   var params = {
        Bucket: BUCKET_NAME,
         Key: filename,
        Body: data,
        ACL: 'public-read' // to give public access to file
    }

 return new Promise((resolve, reject) => {
       s3Bucket.upload(params, (err ,s3response)=>{
             if(err){
              console.log('something went wrong'+err)

           }else{
                console.log(s3response)
                resolve(s3response.Location)  
            }
        })
})

 }
 */

exports.addExpense = async (req, res, next) => {

    console.log(req.body)
    console.log('req>>>> ' + req.user.id)
    try{
        
        const t = await sequelize.transaction();
        const {amount, description, category} = req.body;

        if(amount == undefined || amount.length === 0){
            return res.status(400).json({err : 'bad parameters . something is missing'})
        }


        const expense = await Expense.create({amount, description, category, userId: req.user.id}, { transaction: t })
        
            const totalExpense = Number(req.user.totalExpenses) + Number(amount);
            console.log(totalExpense);

            await User.update({
                totalExpenses: totalExpense
            },{
                where: {id: req.user.id },
                transaction: t
            })
           
            await t.commit();
            res.status(201).json({expense: expense, success: true})
           
        }

    catch(err){
        await t.rollback();
        return res.status(500).json({error: err, success: false})
    }


}


// exports.getExpense = async (req, res, next) => {

//     // console.log(req.user.id)
//     try{        

//         await Expense.findAll({ where : { userId: req.user.id }})
//        //   req.user.getExpense()  //another simpler way of doint this
//         .then(expenses => {
//             return res.status(200).json({expenses, success: true})
//         })
//         .catch(err => {
//             return res.status(400).json({error: err, success: false})
//         })
//     }
//     catch(err){
//         res.status(500).json(err)
//     }
// }

// const ITEMS_PER_PAGE = 10;

exports.getExpenses = async (req, res, next) => {


        let page = req.params.pageno || 1
    
        let limit_items = +(req.body.itemsPerPage) || 5 ;

        let totalItems 

    try {

        let count = await Expense.count({where:{userId:req.user.id}})
        totalItems = count ; 

        let data = await req.user.getExpenses({offset:(page-1)*limit_items , limit:limit_items})
        res.status(200).json({data ,
            info: {
              currentPage: page,
              hasNextPage: totalItems > page * limit_items,
              hasPreviousPage: page > 1,
              nextPage: +page + 1,
              previousPage: +page - 1,
              lastPage: Math.ceil(totalItems / limit_items),
            }})
    } catch (error) {
        res.status(500).json({message:'unable to get expense'})
    }

}

exports.downloadAllUrl = async(req,res,next) => {
    try {
        let urls = await req.user.getDownloadurls() ;
        if(!urls){
            res.status(404).json({ message:'no urls found with this user' , success: false});
        }
        res.status(200).json({ urls , success: true })
    } catch (error) {
        res.status(500).json({ err})
    }
}

exports.downloadExpense = async (req, res, next) => {

    try {
        const userId = req.user.id ;

        const expenses = await UserServices.getExpenses(req)
        // const expenses = await req.user.getExpenses();

        //expenses is an array we cannot write array to file, so we convert to string.
        const stringifyExpense = JSON.stringify(expenses);
        const fileName = `Expense${userId}/${new Date()}.txt`;
        const fileURL = await S3Services.uploadToS3( stringifyExpense , fileName) ;
        console.log("i am inside download")
        const downloadUrlData = await req.user.createDownloadurl({
            fileUrl:fileURL,
            fileName
        })


        res.status(200).json({ fileURL, downloadUrlData , success: true });

    } catch (err) {
        res.status(500).json({fileURL: "", success: false, err: err});
    }
}

exports.deleteExpense = async (req, res, next) => {

    const t = await sequelize.transaction();

    try{
        
        const expenseid = req.params.expenseId;
        const amount = await Expense.findAll({ amount: { where: { id : expenseid }}});
        console.log(amount);

        const totalExpense = Number(req.user.totalExpenses) - Number(amount);
            console.log(totalExpense);

        await Expense.destroy({ where: {id : expenseid, userId : req.user.id}}, {transaction: t});


            await User.update({
                totalExpenses: totalExpense
            },{
                where: {id: req.user.id },
                transaction: t
            })  
            
            await t.commit();
            res.status(204).json({ success: true, message: "Deleted Successfuly"})
        
    }

    catch(err){
        await t.rollback();
        console.log(err);
        return res.status(500).json({ success: false, message: "Failed"})
    }
}