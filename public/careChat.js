var socket = io();
var serviceList;

window.onload = async () => {

    const employee_id = JSON.parse(sessionStorage.getItem("user")).MEMBER_ID;

    let requestObj = {
        "employee_id": employee_id
    }

    console.log(requestObj);
    requestObj = JSON.stringify(requestObj);

    const response = await fetch('http://localhost:3000/api/getCitizenChatList', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: requestObj
    });
    responseObj = await response.json();
    console.log(responseObj);

    let citizenDesign = '';

    if (responseObj.ResponseCode == 1) {
        responseObj.ResponseData.forEach(citizen => {
            citizenDesign += `<div onclick="getMessages(this.id, this.innerHTML)" id="${citizen.CITIZEN_ID}" class="people">${citizen.CITIZEN_NAME}</div>`;
        });
    } else {
        window.alert(responseObj.ResponseText);
    }

    document.getElementById("peopleList").innerHTML = citizenDesign;
};

const getMessages = async (citizenId, citizenName) => {

    console.log(citizenId, ' ', citizenName);

    console.log(document.getElementById("citizen_id").value, '', document.getElementById("topBar").innerHTML)
    

    document.getElementById("citizen_id").value = citizenId;
    const employee_id = JSON.parse(sessionStorage.getItem("user")).MEMBER_ID;
    document.getElementById("topBar").innerHTML = citizenName;

    let requestObj = {
        "citizen_id": citizenId,
        "employee_id": employee_id
    }

    requestObj = JSON.stringify(requestObj);

    const response = await fetch('http://localhost:3000/api/getMessages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: requestObj
    });

    responseObj = await response.json();
    console.log(responseObj);

    if (responseObj.ResponseCode == 1) {
        let msgContentDesign = '';

        responseObj.AllMessages.forEach(message => {
            if (message.SENDER == citizenId) {
                //Citizen Message
                msgContentDesign += `<div class="text User"><i>${message.CITIZEN_NAME}: </i>${message.MESSAGE_TEXT}</div>`;
            } else {
                //Customer Care Message
                msgContentDesign += `<div class="text CustomerCare"><i>You: </i></i>${message.MESSAGE_TEXT}</div>`;
            }
        });

        document.getElementById("chatContent").innerHTML = msgContentDesign;
    } else {
        window.alert(responseObj.ResponseText);
    }

    const ServiceResponse = await fetch('http://localhost:3000/api/getServices',{
            method: 'GET'
        });
    serviceList = await ServiceResponse.json();
    console.log(serviceList);
}

const sendMsg = async () => {
    let message_text = document.getElementById("messageText").value;
    document.getElementById("messageText").value = '';
    const employee_id = JSON.parse(sessionStorage.getItem("user")).MEMBER_ID;
    const citizen_id = document.getElementById("citizen_id").value;
    const citizen_name = document.getElementById("topBar").innerHTML;
    const employee_name = JSON.parse(sessionStorage.getItem("user")).FIRST_NAME;

    let requestObj = {
        "citizen_id": citizen_id,
        "employee_id": employee_id,
        "message_text": message_text,
        "sender_id": employee_id,
        "citizen_name" : citizen_name,
        "employee_name" : employee_name
    }

    requestObj = JSON.stringify(requestObj);

    const response = await fetch('http://localhost:3000/api/sendMessage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: requestObj
    });

    responseObj = await response.json();
    console.log(responseObj);

    if (responseObj.ResponseCode == 1) {
        // getMessages(citizen_id, document.getElementById("topBar").innerHTML);
    } else {
        window.alert(responseObj.ResponseText);
    }
}

const addMessage = async (messageObj) => {
    console.log(messageObj);
    let design = '';
    if (messageObj.sender_id == messageObj.citizen_id) {
        design = `<div class="text CustomerCare"><i>${messageObj.citizen_name}: </i>${messageObj.message_text}</div>`;
    } else {
        design = `<div class="text User"><i>You: </i></i>${messageObj.message_text}</div>`;
    }

    document.getElementById("chatContent").innerHTML = design + document.getElementById("chatContent").innerHTML;
}

socket.on('message', addMessage);

const backCC = async () => {
    window.location.replace("/careLogin");
}

// const textContent = `
// <div class="text ${User / CustomerCare}"><i>${UserName}: </i>${text}</div>
// `

const Logout = async() =>{
    sessionStorage.removeItem("user")
    window.location.replace("/careLogin");
}

const help = async() => {
    var modal = document.getElementById("myModal");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    span.onclick = function() {
        modal.style.display = "none";
    }

    modal.style.display = "block";

    

    const modalContent = document.getElementsByClassName("modal-content")[0];

    for(var i = 0; i < serviceList.length; i++){
        if (serviceList[i].SERVICE_ID == 104) continue;
        modalContent.insertAdjacentHTML("beforeend", `
        <label>${serviceList[i].DESCRIPTION}</label>
        <input type="text" id="${serviceList[i].SERVICE_ID}"><br>
        `)
    }

    modalContent.insertAdjacentHTML("beforeend", `
    <button id="SendData" onclick="SendData()" style="font-family: 'Rajdhani'">
        Send Help
    </button>
    `)
}

const SendData = async() => {
    var ServiceArr =[]
    for(var i = 0; i < serviceList.length; i++){
        if (serviceList[i].SERVICE_ID == 104) continue;
        var serviceRequested = document.getElementById(serviceList[i].SERVICE_ID).value;
        if(serviceRequested == '') continue;
        ServiceArr.push({
            SERVICE_ID : serviceList[i].SERVICE_ID,
            AMOUNT : serviceRequested
        })
    }
    console.log(ServiceArr)
}