const express = require('express');
const sequelize = require('./util/database');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();

// app.use(bodyParser.urlencoded());  ////this is for handling forms
app.use(express.json());  //this is for handling jsons
app.use(bodyParser.json({extended:false}))
app.use(express.static(path.join(__dirname, "public")));

const accessLogStream = fs.createWriteStream('access.log', {flags: 'a'})


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
app.use(helmet());
app.use(compression());
app.use(morgan('combined', {stream : accessLogStream}))

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

