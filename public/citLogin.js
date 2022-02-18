const loginUser = async() => {
    var responseObj;
    var loginObj = {
        username : document.getElementById("fusername").value,
        password : document.getElementById("fpassword").value
    }
    var loginJSON = JSON.stringify(loginObj);
    console.log(loginJSON);
    var response;
    if(loginObj.email == ""){
        window.alert("Email field empty");
        return;
    }else if(loginObj.password == ""){
        window.alert("Password field empty");
        return;
    }else{
        response = await fetch('http://localhost:3000/api/loginUser',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: loginJSON
        });
        responseObj = await response.json();
        console.log(responseObj);

        if(responseObj.ResponseCode == -2){
            window.alert("Wrong Password");
        }else if(responseObj.ResponseCode == 0){
            window.alert("Member Not Found");
        }else if(responseObj.ResponseCode == 1){
            window.alert("Login Successful");
            sessionStorage.setItem("user", JSON.stringify(responseObj.MemberInfo));
            console.log(JSON.parse(sessionStorage.getItem("user")).MEMBER_ID);
            window.location.replace("/citLogin/selectService");
        }
    }  
}

const GoToProfile = async() => {
    var responseObj;
    var loginObj = {
        username : document.getElementById("fusername").value,
        password : document.getElementById("fpassword").value
    }
    var loginJSON = JSON.stringify(loginObj);
    console.log(loginJSON);
    var response;
    if(loginObj.email == ""){
        window.alert("Email field empty");
        return;
    }else if(loginObj.password == ""){
        window.alert("Password field empty");
        return;
    }else{
        response = await fetch('http://localhost:3000/api/loginUser',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: loginJSON
        });
        responseObj = await response.json();
        console.log(responseObj);

        if(responseObj.ResponseCode == -2){
            window.alert("Wrong Password");
        }else if(responseObj.ResponseCode == 0){
            window.alert("Member Not Found");
        }else if(responseObj.ResponseCode == 1){
            window.alert("Login Successful");
            sessionStorage.setItem("user", JSON.stringify(responseObj.MemberInfo));
            console.log(JSON.parse(sessionStorage.getItem("user")).MEMBER_ID);
            window.location.replace("/citLogin/citProfile");
        }
    } 
}

const backL = async() => {
    window.location.replace("/");
}
