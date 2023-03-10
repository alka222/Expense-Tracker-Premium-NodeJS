const myForm = document.getElementById('my-form');
const amountInput = document.getElementById('amount');
const descriptionInput = document.getElementById('description');
const categoryInput = document.getElementById('category');

const btn = document.getElementById('btn');


window.addEventListener('DOMContentLoaded', () => {

    const token  = localStorage.getItem('token');
    const decodeToken = parseJwt(token)
    console.log(decodeToken)
    const ispremiumuser = decodeToken.ispremiumuser
    if(ispremiumuser){
        showPremiumuserMessage()
        showLeaderboard()
    }

    axios.get('http://localhost:3000/expense/getexpenses', { headers: { "Authorization": token } })
    .then(response => {

        console.log(response.data);
        
        response.data.expenses.forEach(expense => {
            showExpenses(expense);
        });
    })
    .catch((err) => console.log(err));
})

function showPremiumuserMessage() {
    document.getElementById('rzp-button1').style.visibility = "hidden"
    document.getElementById('message').innerHTML = "You are a premium user "
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// myForm.addEventListener('submit', addForm)

function saveexpense(event){
    event.preventDefault();

    let myExpenses = {
        amount : event.target.amount.value,
        description : event.target.description.value,
        category : event.target.category.value,
        userId: localStorage.getItem('token')
    }

    const token = localStorage.getItem('token');

    console.log(myExpenses);
    let serilized_Obj = JSON.stringify(myExpenses);

    axios.post('http://localhost:3000/expense/addexpense', myExpenses, { headers: {"Authorization": token }})
        .then((response) => {
            console.log(response.data.expense);
            showExpenses(response.data.expense);
        })
        .catch((err) => console.log(err))

    amountInput.value ='';
    descriptionInput.value= '';
    categoryInput.value= '';

}

function showExpenses(expense){

    console.log(expense);

    const parentEle = document.getElementById('expenses');
    const childEle = `<li id='${expense.id}'> ${expense.amount} : ${expense.description} : ${expense.category}

                        <button onclick = deleteExpense('${expense.id}')> Delete </button>
                        </li>`

    parentEle.innerHTML = parentEle.innerHTML + childEle;

}

function deleteExpense(expenseId){
    const token = localStorage.getItem('token');
    axios.delete(`http://localhost:3000/expense/deleteexpense/${expenseId}`, { headers : {"Authorization": token }})
            .then(() => {
                // console.log(' id ' + expenseId + ' expense deleted ');
                removeExpenseFromScreen(expenseId);
            })
            .catch((err) => console.log(err));
}


function removeExpenseFromScreen(expenseId){

    let parentNode = document.getElementById('expenses');
    let childNodeToBeDeleted = document.getElementById(expenseId);

    console.log(childNodeToBeDeleted);
    if(childNodeToBeDeleted){

        parentNode.removeChild(childNodeToBeDeleted);
     }
}

function showLeaderboard(){
    const inputElement = document.createElement("input")
    inputElement.type = "button"
    inputElement.value = 'Show Leaderboard'
    inputElement.onclick = async() => {
        const token = localStorage.getItem('token')
        const userLeaderBoardArray = await axios.get('http://localhost:3000/premium/showLeaderBoard', { headers: {"Authorization" : token} })
        console.log(userLeaderBoardArray)

        var leaderboardElem = document.getElementById('leaderboard')
        leaderboardElem.innerHTML += '<h2> Leader Board </<h2>'
        userLeaderBoardArray.data.forEach((userDetails) => {
            leaderboardElem.innerHTML += `<li>Name - ${userDetails.name} : Total Expense - ${userDetails.totalExpenses || 0} </li>`
        })
    }
    document.getElementById("message").appendChild(inputElement);

}


document.getElementById('rzp-button1').onclick = async function (e){
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:3000/purchase/premiummembership', { headers: { "Authorization": token } });
    console.log(response);

    var options = {
        "key": response.data.key_id, // Enter the KEY ID generated from the Dashboard
        "order_id": response.data.order.id, // For one time payment
        // This handler function will handle the success payment
        "handler": async function (response){
            const res = await axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
            order_id: options.order_id,
            payment_id: response.razorpay_payment_id
            }, { headers: {'Authorization': token } })

            alert('You are a Premium User Now');
            document.getElementById('rzp-button1').style.visibility = "hidden"
            document.getElementById('message').innerHTML = "You are a premium user "
            localStorage.setItem('token', res.data.token);
            showLeaderboard();
        }
    }

    const rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();

    rzp1.on('payment.failed', function(response){
        console.log(response);
        alert('something went wrong');
    })


}