const loginUser = async() => {
    var loginObj = {
        email : document.getElementById("femail").value,
        password : document.getElementById("fpassword").value
    }
    var loginJSON = JSON.stringify(loginObj);
    console.log(loginJSON);
    const response = await fetch('http://localhost:3000/api/loginUser',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: loginJSON
    });

    const responseJSON = await response.json();
    console.log(responseJSON);
}