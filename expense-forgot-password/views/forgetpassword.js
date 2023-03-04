async function sendpassword(e){

    try{

        e.preventDefault();

        const passwordRecoveryDetails= {
            email: e.target.email.value
        }

        console.log(email);

        const response = await axios.post('http://localhost:3000/password/forgotpassword',passwordRecoveryDetails);

        console.log(response);
        if(response.status == 201){
            console.log(response)
            alert('link sent to mail successfull')
            window.location.href = 'login.html';
        }

        else{
            throw new Error('Failed to send link')
        }

    }

    catch(err){
        document.body.innerHTML += `<h4> <div style="color:red;"> ${err} </div> </h4>`
        console.log(err);
    }

}