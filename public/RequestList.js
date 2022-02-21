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
    if(sessionStorage.getItem("user") == null){
        window.location.replace("/empLogin")
    }

    const Member_Id = JSON.parse(sessionStorage.getItem("user")).MEMBER_ID;
    console.log(Member_Id)
    const fetchObj = {
        "employee_id": Member_Id
    }
    const fetchJSON = JSON.stringify(fetchObj);
    const response = await fetch('http://localhost:3000/api/getEmployeeRequestInfo',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: fetchJSON
    });
    RequestObj = await response.json();
    console.log(RequestObj);

    if(RequestObj.ResponseCode == 2){
        const MainText = document.getElementById("readyToHelp");
        MainText.innerHTML = RequestObj.ResponseText
        const MainContent = document.getElementById("MainContent");
        let Time = RequestObj.RequestInfo.REQUEST_TIME;
        var dateArr = Time.split(' ');
        var timeArr = dateArr[1].split('.');
        Time = dateArr[0] + ' ' + timeArr[0] + ':' + timeArr[1] + ' ' + dateArr[2];
        if(RequestObj.RequestInfo.LATITUDE != null){
            MainContent.innerHTML = `
            <div class="option">
                <div class="content">
                    Citizen Name : ${RequestObj.RequestInfo.CITIZEN_NAME} &nbsp&nbsp&nbsp
                    Location : Latitude#${RequestObj.RequestInfo.LATITUDE}, Longitude#${RequestObj.RequestInfo.LONGITUDE}&nbsp&nbsp
                    Request Time : ${Time}&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp
                    <button onclick ="finish(${RequestObj.RequestInfo.REQUEST_ID}, ${RequestObj.RequestInfo.REQUEST_EMPLOYEE_ID})" class="AcceptButton" style="font-family: 'Rajdhani'">Finish</button>
                </div>
            </div>
            `
        }else{
            MainContent.innerHTML = `
            <div class="option">
                <div class="content">
                    Citizen Name : ${RequestObj.RequestInfo.CITIZEN_NAME} &nbsp&nbsp&nbsp
                    Location : Block#${RequestObj.RequestInfo.BLOCK}, Street#${RequestObj.RequestInfo.STREET}, House#${RequestObj.RequestInfo.HOUSE_NO}&nbsp&nbsp
                    Request Time : ${Time}&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp
                    <button onclick ="finish(${RequestObj.RequestInfo.REQUEST_ID}, ${RequestObj.RequestInfo.REQUEST_EMPLOYEE_ID})" class="AcceptButton" style="font-family: 'Rajdhani'">Finish</button>
                </div>
            </div>
            `
        }
    }else if(RequestObj.ResponseCode == 0){
        const MainText = document.getElementById("readyToHelp");
        MainText.innerHTML = RequestObj.ResponseText
    }else{
        const MainContent = document.getElementById("MainContent");
        const arrContent = []
        for(var i = 0; i < RequestObj.RequestInfo.length; i++){
            let Time = RequestObj.RequestInfo[i].REQUEST_TIME;
            var dateArr = Time.split(' ');
            var timeArr = dateArr[1].split('.');
            Time = dateArr[0] + ' ' + timeArr[0] + ':' + timeArr[1] + ' ' + dateArr[2];
            if(block == ''){
                arrContent.push(`
                <div class="option">
                        <div class="content">
                            Citizen Name : ${RequestObj.RequestInfos[i].CITIZEN_NAME} &nbsp&nbsp&nbsp
                            Location : Latitude: ${lat}, Longitude: ${long}&nbsp&nbsp
                            Request Time : ${Time}&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp
                            <button onclick ="requestDetails(${RequestObj.RequestInfos[i].REQUEST_ID})" class="AcceptButton" style="font-family: 'Rajdhani'">Details</button>
                        </div>
                </div>
                `)
            }else{
                arrContent.push(`
                <div class="option">
                        <div class="content">
                            Citizen Name : ${RequestObj.RequestInfos[i].CITIZEN_NAME} &nbsp&nbsp&nbsp
                            Location : Block#${block}, Street#${street}, House#${house_no}&nbsp&nbsp
                            Request Time : ${Time}&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp
                            <button onclick ="requestDetails(${RequestObj.RequestInfos[i].REQUEST_ID})" class="AcceptButton" style="font-family: 'Rajdhani'">Details</button>
                        </div>
                </div>
                `)
            }
        }
        MainContent.insertAdjacentHTML("beforeend", arrContent.join(' '))
    }
}

const accept = async(requestID) => {
    const acceptObj = {
        "employee_id" : JSON.parse(sessionStorage.getItem("user")).MEMBER_ID,
        "request_id" : requestID,
        "service_id" : JSON.parse(sessionStorage.getItem("user")).EMPLOYEE_INFO.SERVICE_ID
    }
    const acceptJSON = JSON.stringify(acceptObj);
    console.log(acceptJSON)
    
    const response = await fetch('http://localhost:3000/api/acceptRequest',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: acceptJSON
    });
    RequestObj = await response.json();
    console.log(RequestObj);
}

const finish = async(requestID, requestEmployeeId) => {
    const acceptObj = {
        "employee_id" : JSON.parse(sessionStorage.getItem("user")).MEMBER_ID,
        "request_id" : requestID,
        "request_employee_id" : requestEmployeeId
    }
    const acceptJSON = JSON.stringify(acceptObj);
    console.log(acceptJSON)
    
    const response = await fetch('http://localhost:3000/api/finishRequest',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: acceptJSON
    });
    RequestObj = await response.json();
    console.log(RequestObj);
    location.reload();
    
}

const Refresh = async() => {
    location.reload();
}

const History = async() => {
    window.location.replace("/empLogin/empHistory")
}

const Logout = async() => {
    sessionStorage.removeItem("user")
    window.location.replace("/empLogin")
}