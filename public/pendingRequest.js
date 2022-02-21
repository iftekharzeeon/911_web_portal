const employeeStat = `
<div class="employeeStat">Name: ${"Hello"} Job: ${"Service"}<br>Department: ${"Dept"}</div>
`

var ResponseCode = 0

window.onload = async () => {
    if (sessionStorage.getItem("user") == null) {
        window.location.replace("/citLogin")
    }
    
    var requestObj = {
        "citizen_id": JSON.parse(sessionStorage.getItem("user")).MEMBER_ID
    }

    response = await fetch('http://localhost:3000/api/checkRequestStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestObj)
    });
    var responseObj = await response.json();
    console.log(responseObj);

    ResponseCode = responseObj.ResponseCode;
    if(ResponseCode == 0){
        window.location.replace("/citLogin/selectService")
    }

    requestObj = {
        "member_id": JSON.parse(sessionStorage.getItem("user")).MEMBER_ID
    }

    response = await fetch('http://localhost:3000/api/getCitizenRequestInfo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestObj)
    });
    responseObj = await response.json();
    console.log(responseObj);
    ResponseCode = responseObj.ResponseCode;

    if(ResponseCode == 0){
        const topText = document.getElementById("topText");
        topText.innerHTML = "Your request is stil being processed";
    }else{
        const topText = document.getElementById("topText");
        topText.innerHTML = "Help is on the way";
    }

    const employeeArray = responseObj.RequestInformation;
    const listContent = document.getElementById('listContent');
    for(var i = 0; i < employeeArray.length; i++){
        listContent.insertAdjacentHTML('beforeend', `
        <div class="employeeStat">Name: ${employeeArray[i].EMPLOYEE_NAME} Job: ${employeeArray[i].JOB_TITLE}<br>Department: ${employeeArray[i].DEPARTMENT_NAME}</div>
        `);
    }
}

const Refresh = async() => {
    window.location.reload();
}

const Chat = async () => {
    window.location.replace("/citLogin/citChat")
}

const Logout = async () => {
    window.location.replace("/")
}