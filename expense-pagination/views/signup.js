async function signup(e){

    try{

        e.preventDefault();
        console.log(e.target.email.value);

            const userDetails = {
            name : e.target.name.value,
            email: e.target.email.value,
            password: e.target.password.value
        
            }

            console.log(userDetails)
        

            const response = await axios.post("http://localhost:3000/user/signup",userDetails)
            
            if(response.status === 201){
                console.log(response.status);
                window.location.href='./login.html'
            }

            else{
                throw new Error('Failed to login');
            }
            
            
        }

        catch(err){

                document.body.innerHTML = document.body.innerHTML + `<h4> <div style='color:red';> ${err} </div></h4>`
                console.log(JSON.stringify(err));
            }

    
  
  }