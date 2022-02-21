const gotoSelectService = async() => {
    window.location.replace("/citLogin/selectService");
}

const backCP = async() => {
    window.location.replace("/citLogin");
}


var defaultMember_Id;
var defaultLocation_Id;
var defaultPhoneNumber;
var defaultHouse;
var defaultBlock;
var defaultStreet;
var defaultFirstName;
var defaultLastName;

window.onload = async () => {
    if(sessionStorage.getItem("user") == null){
        window.location.replace("/citLogin")
    }

    //if request is ongoing
    const requestObja = {
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

    //done

    const Name = document.getElementById("Name");
    const Location = document.getElementById("Location");
    const Email = document.getElementById("Email");
    const PhoneNumber = document.getElementById("PhoneNumber");

    const Member = JSON.parse(sessionStorage.getItem("user"));

    Name.innerHTML = `${Member.FIRST_NAME + ' ' + Member.LAST_NAME}`
    Location.innerHTML = `H#${Member.LOCATION_INFO.HOUSE_NO}, B#${Member.LOCATION_INFO.BLOCK}, R#${Member.LOCATION_INFO.STREET}`
    Email.innerHTML = `${Member.EMAIL}`
    PhoneNumber.innerHTML = `${Member.PHONE_NUMBER}`

    defaultMember_Id = Member.MEMBER_ID;
    defaultLocation_Id = Member.LOCATION_ID;
    defaultPhoneNumber = Member.PHONE_NUMBER;
    defaultHouse = Member.LOCATION_INFO.HOUSE_NO;
    defaultBlock = Member.LOCATION_INFO.BLOCK;
    defaultStreet = Member.LOCATION_INFO.STREET;
    defaultFirstName = Member.FIRST_NAME;
    defaultLastName = Member.LAST_NAME;

    console.log(defaultMember_Id);

    //update history of user
    const requestObjB = {
        "member_id" : JSON.parse(sessionStorage.getItem("user")).MEMBER_ID
    }

    const responseB = await fetch('http://localhost:3000/api/getUserRequestHistoryList', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestObjB)
    });
    var responseObjB = await responseB.json();
    
    const historyList = responseObjB.RequestInfos;
    console.log(historyList)

    const history = document.getElementById("history");
    for(var i = 0; i < historyList.length; i++){
        let Time = historyList[i].REQUEST_TIME;
        var dateArr = Time.split(' ');
        var timeArr = dateArr[1].split('.');
        Time = dateArr[0] + ' ' + timeArr[0] + ':' + timeArr[1] + ' ' + dateArr[2];
        history.insertAdjacentHTML("beforeend", `
        <div class="HistoryContent">
        Request Id : ${historyList[i].REQUEST_ID}<br>
        Location Id : ${historyList[i].LOCATION_ID}<br>
        Time : ${Time}
        </div>
        `)
    }

}

const Logout = async() => {
    sessionStorage.removeItem("user")
    window.location.replace("/citLogin");
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
        member_id : defaultMember_Id,
        first_name : document.getElementById("ffirstname").value,
        last_name : document.getElementById("flastname").value,
        phone_number : document.getElementById("fphoneNumber").value,
        location_id : defaultLocation_Id,
        block : document.getElementById("fblock").value,
        street : document.getElementById("fstreet").value,
        house_no : document.getElementById("fhouse").value
    }

    if(onlySpaces(updateObj.first_name) || updateObj.first_name == '') updateObj.first_name = defaultFirstName;
    if(onlySpaces(updateObj.last_name) || updateObj.last_name == '') updateObj.last_name = defaultLastName;
    if(onlySpaces(updateObj.phone_number) || updateObj.phone_number == '') updateObj.phone_number = defaultPhoneNumber;
    if(onlySpaces(updateObj.block) || updateObj.block == '') updateObj.block = defaultBlock;
    if(onlySpaces(updateObj.street) || updateObj.street == '') updateObj.street = defaultStreet;
    if(onlySpaces(updateObj.house_no) || updateObj.house_no == '') updateObj.house_no = defaultHouse;

    const updateJSON = JSON.stringify(updateObj);
    console.log(updateJSON)
    const response = await fetch('http://localhost:3000/api/updateUserInfo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: updateJSON
    });
    const responseObj = await response.json();
    console.log(responseObj);
    sessionStorage.setItem("user", JSON.stringify(responseObj.MemberInfo));

    window.location.reload()
}