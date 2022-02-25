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
            // window.alert("Login Successful");
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
            // window.alert("Login Successful");
            sessionStorage.setItem("user", JSON.stringify(responseObj.MemberInfo));
            console.log(JSON.parse(sessionStorage.getItem("user")).MEMBER_ID);
            window.location.replace("/citLogin/citProfile");
        }
    } 
}

const backL = async() => {
    window.location.replace("/");
}

const Update = async() => {
    var modal = document.getElementById("myModal");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    span.onclick = function() {
        modal.style.display = "none";
    }

    modal.style.display = "block";
}

function onlySpaces(str) {
    return str.trim().length === 0;
}

const SendData = async() => {
    var updateObj = {
        username : document.getElementById("Fnewusername").value,
        new_password : document.getElementById("Fnewpassword").value
    }

    if(onlySpaces(updateObj.username) || updateObj.username == '') window.alert("Can't have empty fields");
    if(onlySpaces(updateObj.new_password) || updateObj.new_password == '') window.alert("Can't have empty fields");

    const updateJSON = JSON.stringify(updateObj);
    console.log(updateJSON)
    const response = await fetch('http://localhost:3000/api/userUpdatePassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: updateJSON
    });
    const responseObj = await response.json();
    console.log(responseObj);

    window.alert(responseObj.ResponseText)
    window.location.reload()
}