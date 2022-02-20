var socket = io();

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
    window.location.replace("/citLogin/selectService");
}

// const textContent = `
// <div class="text ${User / CustomerCare}"><i>${UserName}: </i>${text}</div>
// `