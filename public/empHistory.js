const RequestList = async() => {
    window.location.replace("/empLogin/RequestList")
}

window.onload = async() => {
    if(sessionStorage.getItem("user") == null){
        window.location.replace("/empLogin")
    }

    const Member_Id = JSON.parse(sessionStorage.getItem("user")).MEMBER_ID;
    const fetchObj = {
        "employee_id": Member_Id
    }
    const fetchJSON = JSON.stringify(fetchObj);
    const response = await fetch('http://localhost:3000/api/getEmployeeRequestHistoryList',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: fetchJSON
    });
    RequestObj = await response.json();
    console.log(RequestObj);
    const MainContent = document.getElementById("MainContent");
    const arrContent = []
    for(var i = 0; i < RequestObj.RequestInfos.length; i++){

        let street = '';
        let block = '';
        let house_no = '';
        let lat = '';
        let long = '';
        
        if (RequestObj.RequestInfos[i].BLOCK) block = RequestObj.RequestInfos[i].BLOCK;
        if (RequestObj.RequestInfos[i].STREET) street = RequestObj.RequestInfos[i].STREET;
        if (RequestObj.RequestInfos[i].HOUSE_NO) house_no = RequestObj.RequestInfos[i].HOUSE_NO;
        if (RequestObj.RequestInfos[i].LATITUDE) lat = RequestObj.RequestInfos[i].LATITUDE;
        if (RequestObj.RequestInfos[i].LONGITUDE) long = RequestObj.RequestInfos[i].LONGITUDE;

        let Time = RequestObj.RequestInfos[i].REQUEST_TIME;
        var dateArr = Time.split(' ');
        var timeArr = dateArr[1].split('.');
        Time = dateArr[0] + ' ' + timeArr[0] + ':' + timeArr[1] + ' ' + dateArr[2];
        arrContent.push(`
        <div class="option">
                <div class="content">
                    Citizen Name : ${RequestObj.RequestInfos[i].CITIZEN_NAME} &nbsp&nbsp&nbsp
                    Location : Block#${block}, Street#${street}, House#${house_no}, Latitude: ${lat}, Longitude: ${long}&nbsp&nbsp
                    Request Time : ${Time}&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp
                    <button onclick ="requestDetails(${RequestObj.RequestInfos[i].REQUEST_ID})" class="AcceptButton" style="font-family: 'Rajdhani'">Details</button>
                </div>
        </div>
        `)
    }
    MainContent.insertAdjacentHTML("beforeend", arrContent.join(' '))
}

const requestDetails = async (requestId) => {
    console.log(requestId);

    var modal = document.getElementById("myModal");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    span.onclick = function() {
        modal.style.display = "none";
    }

    modal.style.display = "block";

    const requestObj = {
        "request_id" : requestId
    }


    const response = await fetch('http://localhost:3000/api/getRequestHistoryDetails',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestObj)
    });
    const ResponseObj = await response.json();
    console.log(ResponseObj)

    const employeeList = ResponseObj.ResponseData
    var HTMLstring = ''

    if(ResponseObj.ResponseCode == 1) HTMLstring += `<i>Request still being processed</i><br><br>`
    else HTMLstring += 'Request finished'
    HTMLstring += `
    Request id: ${requestId}<br>
    Employee Requested: ${ResponseObj.TotalEmployeesRequested}<br>
    Employee accepted: ${ResponseObj.NumberofEmployeesAccepted}<br>
    Vehicle allocated: ${ResponseObj.NumberofVehicleAccepted}<br><br>
    `
    HTMLstring += 'Co-worker joined:<br><br>'

    for(var i = 0; i < employeeList.length; i++){
        HTMLstring += `
        ${i + 1}.${employeeList[i].OTHER_EMPLOYEE_NAME}, Department: ${employeeList[i].DEPARTMENT_NAME}<br>
        `
    }

    const modal_text = document.getElementById("modal_text");
    modal_text.innerHTML = HTMLstring 
}

