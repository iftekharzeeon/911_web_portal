// const RequestObj = {
//     "ResponseCode": 1,
//     "ResponseText": "There are pending requests at the moment. Please respond.",
//     "RequestInfo": [
//         {
//             "REQUEST_ID": 123,
//             "REQUEST_TIME": "06-FEB-22 11.16.35.986000000 AM",
//             "CITIZEN_NAME": "Shamit Fatin",
//             "BLOCK": "A",
//             "HOUSE_NO": "144",
//             "STREET": "1",
//             "CITIZEN_ID": 110,
//             "LOCATION_ID": 110
//         }
//     ]
// }

window.onload = async() => {
    const Member_Id = JSON.parse(sessionStorage.getItem("user")).MEMBER_ID;
    const fetchObj = {
        "employee_id": Member_Id
    }
    const fetchJSON = JSON.stringify(fetchObj);
    const response = await fetch('http://localhost:3000/api/getEmployeeRequestInfo',{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        body: fetchJSON
    });
    const RequestObj = JSON.parse(response);
    const MainContent = document.getElementById("MainContent");
    for(var i = 0; i < RequestObj.RequestInfo.length; i++){
        const Time = RequestObj.RequestInfo[i].REQUEST_TIME;
        MainContent.insertAdjacentHTML("beforeend", `
        <div class="option">
                <div class="content">
                    Citizen Name = ${RequestObj.RequestInfo[i].CITIZEN_NAME}; 
                    Location = B#${RequestObj.RequestInfo[i].BLOCK}, S#${RequestObj.RequestInfo[i].STREET}, H#${RequestObj.RequestInfo[i].HOUSE_NO}; 
                    Request Time = #${Time}; 
                    <button onclick ="accept(${RequestObj.RequestInfo[i].REQUEST_ID})" class="AcceptButton">Accept</button>
                </div>
        </div>
        `)
    }
}

const accept = async(requestID) => {
    window.alert(requestID + ' ' + JSON.parse(sessionStorage.getItem("user")).MEMBER_ID);
}