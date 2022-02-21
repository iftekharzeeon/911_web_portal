var socket = io();

window.onload = async () => {
    if (sessionStorage.getItem("user") == null) {
        window.location.replace("/citLogin")
    }

    ///if request is ongoing
    var requestObja = {
        "citizen_id": JSON.parse(sessionStorage.getItem("user")).MEMBER_ID
    }

    const responsea = await fetch('http://localhost:3000/api/checkRequestStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestObja)
    });
    var responseObja = await responsea.json();
    console.log(responseObja);

    const ResponseCodea = responseObja.ResponseCode;
    if(ResponseCodea == 1){
        window.location.replace("/citLogin/pendingRequest")
    }
    ///done

    const response = await fetch('http://localhost:3000/api/getAvailableCCList', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    responseObj = await response.json();
    console.log(responseObj);

    let ccDesign = '';

    responseObj.ResponseData.forEach(customerCare => {
        ccDesign += `<div onclick="getMessages(this.id, this.innerHTML)" id="${customerCare.MEMBER_ID}" class="people">${customerCare.USER_FULLNAME}</div>`;
    });

    document.getElementById("peopleList").innerHTML = ccDesign;
};

const getMessages = async (ccID, ccName) => {

    console.log(ccID, ' ', ccName);
    console.log(document.getElementById("employee_id").value, '', document.getElementById("topBar").innerHTML)
   

    document.getElementById("employee_id").value = ccID;
    const citizen_id = JSON.parse(sessionStorage.getItem("user")).MEMBER_ID;
    document.getElementById("topBar").innerHTML = ccName;

    let requestObj = {
        "citizen_id" : citizen_id,
        "employee_id" : ccID
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
            if (message.SENDER == ccID) {
                //Customer Care Message
                msgContentDesign += `<div class="text CustomerCare"><i><b>${message.EMPLOYEE_NAME}: </b></i>${message.MESSAGE_TEXT}</div>`;
            } else {
                //Citizen Message
                msgContentDesign += `<div class="text User"><i><b>You: </b></i>${message.MESSAGE_TEXT}</div>`;
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
    const citizen_id = JSON.parse(sessionStorage.getItem("user")).MEMBER_ID;
    const employee_id = document.getElementById("employee_id").value;

    const citizen_name = JSON.parse(sessionStorage.getItem("user")).FIRST_NAME;
    const employee_name = document.getElementById("topBar").innerHTML;
    
    let requestObj = {
        "citizen_id" : citizen_id,
        "employee_id" : employee_id,
        "message_text" : message_text,
        "sender_id" : citizen_id,
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
        // getMessages(employee_id, document.getElementById("topBar").innerHTML);
    } else {
        window.alert(responseObj.ResponseText);
    }
}

const addMessage = async (messageObj) => {
    console.log(messageObj);
    let design = '';
    if (messageObj.sender_id == messageObj.citizen_id) {
        design = `<div class="text User"><i>You: </i></i>${messageObj.message_text}</div>`;
    } else {
        design = `<div class="text CustomerCare"><i>${messageObj.employee_name}: </i>${messageObj.message_text}</div>`;
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