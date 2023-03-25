const myForm = document.getElementById('my-form');
const amountInput = document.getElementById('amount');
const descriptionInput = document.getElementById('description');
const categoryInput = document.getElementById('category');
let itemsPerPage = Number(localStorage.getItem('itemsperpage')) ;
const perpage = document.getElementById('perpage');
const pagination = document.getElementById('pagination');

const btn = document.getElementById('btn');


window.addEventListener('DOMContentLoaded', () => {
    
    const token  = localStorage.getItem('token');
    const decodeToken = parseJwt(token)
    console.log(decodeToken)
    const ispremiumuser = decodeToken.ispremiumuser
    if(ispremiumuser){
        showPremiumuserMessage();
        showLeaderboard();
        const val =document.getElementById('perpagebutton');
        console.log(localStorage.getItem('itemsperpage'));
        val.value = localStorage.getItem('itemsperpage');
      

        console.log(val.value);
    }

    let page = 1;
   
    getLoadExpenses(page , itemsPerPage) ;



    // axios.get('http://localhost:3000/expense/getexpenses', { headers: { "Authorization": token } })
    // .then(response => {

    //     console.log(response.data);
        
    //     response.data.expenses.forEach(expense => {
    //         showExpenses(expense);
    //     });

        
    // })
    // .catch((err) => console.log(err));
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

            amountInput.value ='';
            descriptionInput.value= '';
            categoryInput.value= '';
        })
        .catch((err) => console.log(err))

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

function download(){
    const token = localStorage.getItem('token')
      axios.get('http://localhost:3000/expense/download',{headers : {'Authorization': token}})
      .then((response)=>{
        if(response.status===200){
          var a = document.createElement("a");
          a.href= response.data.fileURL
          a.download= 'myexpense.csv';
          a.click();
        }
        else{
          throw new Error(response.data.message)
        }
      })
      .catch((err)=>{
        console.log(err)
      })
}

async function getLoadExpenses(page , itemsPerPage){
    const token = localStorage.getItem('token')
    try {
        let response = await axios.post(`http://localhost:3000/expense/${page}` ,{itemsPerPage:itemsPerPage}  ,{headers: {"Authorization" : token}})
        // console.log(response.data.info)
        let parentNode = document.getElementById('expenses');
        parentNode.innerHTML=''
        for(var i=0;i<response.data.data.length;i++){
          
          console.log(response.data.data[0])
          showExpenses(response.data.data[i])
          showPagination(response.data.info)
        }

  
    } catch (error) {
        console.log(error);
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
        leaderboardElem.innerHTML += '<h4> Leader Board </<h4>'
        userLeaderBoardArray.data.forEach((userDetails) => {
            leaderboardElem.innerHTML += `<li>Name - ${userDetails.name} : Total Expense - ${userDetails.totalExpenses || 0} </li>`
        })
    }
    document.getElementById("message").appendChild(inputElement);

}


document.getElementById('rzp-button1').onclick = async function (e){

    const token = localStorage.getItem('token');
    try {
        const response = await axios.get('http://localhost:3000/purchase/premiummembership', { headers: { "Authorization": token } });
        console.log(response);
        checkout(response.data);
    } catch (error) {
        console.log(error)
    }

}

function checkout(order){
    const token = localStorage.getItem('token');
    
    
    var options = {
        "key": order.key_id, // Enter the KEY ID generated from the Dashboard
        "amount": order.order.amount,
        "currency": "INR",
        "order_id": order.order.id, // For one time payment
        // This handler function will handle the success payment
        "handler": async function (response){

            alert(`Payment successfull . Payment Id:- ${response.razorpay_payment_id} ` );

            await axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
            order_id: options.order_id,
            payment_id: response.razorpay_payment_id
            }, { headers: {'Authorization': token } })

            .then(res => {
                console.log("done");
                console.log(res);
                alert('You are a Premium User Now');
                showPremiumuserMessage();
                
                localStorage.setItem('user' , "true");
                // localStorage.setItem('token', res.data.token);
                // premiumUser();
                showLeaderboard();
            })

            .catch(err => console.log(err));
        
        },
        "prefill": {
            "name": "Test User",
            "email": "test.user@example.com",
            "contact": "7113447036"
          },
        "theme": {
            "color": "#3399cc",
        },

        "callback_url": "expense.html"
    }

    const rzp1 = new Razorpay(options);
    // e.preventDefault();

    rzp1.on('payment.failed', function(res) {
        alert(res.error.code);
        alert(res.error.description);
    });

    rzp1.open();

}


function showPagination({
    currentPage,
    hasNextPage,
    nextPage,
    hasPreviousPage,
    previousPage,
    lastPage
}) 
    {
        pagination.innerHTML = '';

        if(hasPreviousPage){
            const btn2 = document.createElement('button');
            btn2.innerHTML = previousPage;
            btn2.addEventListener('click', () => getLoadExpenses(previousPage , itemsPerPage));
            pagination.appendChild(btn2);
        }

        const btn1 = document.createElement('button');
        btn1.innerHTML = currentPage;
        btn1.addEventListener('click', () => getLoadExpenses(currentPage , itemsPerPage));
        pagination.appendChild(btn1);

        if(hasNextPage){
            const btn3 = document.createElement('button');
            btn3.innerHTML = nextPage;
            btn3.addEventListener('click', () => getLoadExpenses(nextPage , itemsPerPage));
            pagination.appendChild(btn3);
        }

        if( currentPage!=lastPage && nextPage!=lastPage && lastPage != 0){
            const btn3 = document.createElement('button');
            btn3.innerHTML = lastPage ;
            btn3.addEventListener('click' , ()=>getLoadExpenses(lastPage , itemsPerPage))
            pagination.appendChild(button3)
        }

    }

    perpage.addEventListener('submit' , (e)=>{
        e.preventDefault();
        console.log(typeof(+e.target.itemsPerPage.value));
        localStorage.setItem('itemsperpage' , +e.target.itemsPerPage.value )
        itemsPerPage = localStorage.getItem('itemsperpage')
        getLoadExpenses(1 , +e.target.itemsPerPage.value);
    })