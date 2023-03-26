async function sendpassword(e){

    try{

        e.preventDefault();

        const passwordRecoveryDetails= {
            email: e.target.email.value
        }

        console.log(passwordRecoveryDetails);

        await axios.post('http://localhost:3000/password/forgotpassword',passwordRecoveryDetails)
        .then((Response)=>{
            if(Response.status === 202){
              alert('check your Mail')
              document.body.innerHTML += '<div style="color:red;text-align:center;margin-top:70px;">Mail Successfuly sent <div>'
          }else {
              throw new Error('Something went wrong!!!')
          }
          
          })
          
          .catch((err)=>{
             throw new Error('Failed to send link');
          })

    }

    catch(err){
        document.body.innerHTML += `<h4> <div style="color:red;"> ${err} </div> </h4>`
        console.log(err);
    }

}

