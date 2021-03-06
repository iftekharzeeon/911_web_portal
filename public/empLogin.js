const backE = async() => {
    window.location.replace("/");
}

const loginEmp = async() => {
    const loginObj = {
        "username" : document.getElementById("fusername").value,
        "password" : document.getElementById("fpassword").value,
        "member_type" : 2,
        "service_id" : document.getElementById("Service").value
    }
    var loginJSON = JSON.stringify(loginObj);
    console.log(loginJSON);
    if(loginObj.email == ""){
        window.alert("Email field empty");
        return;
    }else if(loginObj.password == "") {
        window.alert("Password field empty");
        return;
    }else if (loginObj.service_id == "") {
        window.alert("Service field empty");
        return;
    } else {
        const response = await fetch('http://localhost:3000/api/loginEmployee',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: loginJSON
        });
        responseObj = await response.json();
        console.log(responseObj);

        if(responseObj.ResponseCode != 1){
            window.alert(responseObj.ResponseText);
        }else if(responseObj.ResponseCode == 1){
            // window.alert("Login Successful");
            sessionStorage.setItem("user", JSON.stringify(responseObj.MemberInfo));
            console.log(JSON.parse(sessionStorage.getItem("user")).MEMBER_ID);
            window.location.replace("/empLogin/RequestList");
        }
    }  
}

const RegisterEmp = async() => {
    window.location.replace("/empReg");
}