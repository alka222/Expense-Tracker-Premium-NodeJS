async function login(event){

    try{

        event.preventDefault();

        const loginDetails = {
            email: event.target.email.value,
            password: event.target.password.value
        }

        console.log(loginDetails);

        const response = await axios.post("http://localhost:3000/user/login",loginDetails)

            console.log(response)
            if(response.status === 201){
                console.log(response.data);
                alert('Login Successful');
                localStorage.setItem('token', response.data.token)
                window.location.href='./expense.html'

            }

            else if(response.status === 401){
                console.log(response);
                alert('user not authorized');
            }

            else if(response.status === 404){
                console.log(response);
                alert('user not found');
            }
           

    }

    catch(err){
        document.body.innerHTML += `<h4> <div style="color:red;"> ${err} </div> </h4>`
        console.log(err)
    }


}