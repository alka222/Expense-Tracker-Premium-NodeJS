const express = require('express');
const sequelize = require('./util/database');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// app.use(bodyParser.urlencoded());  ////this is for handling forms
app.use(express.json());  //this is for handling jsons


const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const premiumFeatureRoutes = require('./routes/premiumFeature');
const resetPasswordRoutes = require('./routes/resetPassword');
const Expense = require('./models/expenses');
const User = require('./models/users');
const Order = require('./models/orders');
const Forgotpassword = require('./models/forgotpassword');
const Downloadurl = require('./models/downloadurls');


const dotenv = require('dotenv');

// get config vars
dotenv.config();


app.use(cors());

app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumFeatureRoutes);
app.use('/password', resetPasswordRoutes);


User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

Downloadurl.belongsTo(User);
User.hasMany(Downloadurl);

sequelize.sync()
.then(result => {
    app.listen(process.env.PORT || 3000 ,()=>{
        console.log('running');
    })
})
.catch(err => console.log(err));

