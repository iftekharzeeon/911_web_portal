const manualLocationHTML =`
<label for="block" id="tblock">Block</label><br>
<input type="text" id="fblock" name="block" class="input"><br>
<label for="street" id="tstreet">Street</label><br>
<input type="text" id="fstreet" name="street" class="input">
<label for="house" id="thouse">House</label><br>
<input type="text" id="fhouse" name="house" class="input"> 
`
var is_my_location;
const backSL = async() => {
    window.location.replace("/citLogin/selectService");
}

window.onload = async() => {
    if(sessionStorage.getItem("user") == null){
        window.location.replace("/citLogin")
    }

    const name = document.getElementById("name");
    name.textContent += ' ' + JSON.parse(sessionStorage.getItem("user")).FIRST_NAME + ', ';

    const block = document.getElementById("block");
    const street = document.getElementById("street");
    const house = document.getElementById("house");

    block.innerHTML += JSON.parse(sessionStorage.getItem("user")).LOCATION_INFO.BLOCK;
    street.innerHTML += JSON.parse(sessionStorage.getItem("user")).LOCATION_INFO.STREET;
    house.innerHTML += JSON.parse(sessionStorage.getItem("user")).LOCATION_INFO.HOUSE_NO;
    console.log(sessionStorage.getItem("user"));
    is_my_location = true;
}

const manualLocationToggle = async() => {
    const fixedLocation = document.getElementById("fixedLocation");
    fixedLocation.remove();

    const manualLocation = document.getElementById("manualLocation");
    manualLocation.insertAdjacentHTML("beforeend", manualLocationHTML);
    is_my_location = false;
}

const sendRequest = async() => {
    var requestObj;
    var is_ok = true;
    if(!is_my_location){
        const block = document.getElementById("fblock").value;
        const street = document.getElementById("fstreet").value;
        const house = document.getElementById("fhouse").value;
        if(block == "" || street == "" || house == ""){
            window.alert("No field can be empty");
            is_ok = false;
        }else{
            const location_obj = {
                "block": block,
                "street": street,
                "house_no": house
            }
            requestObj = {
                "citizen_id": JSON.parse(sessionStorage.getItem("user")).MEMBER_ID,
                "is_my_location": 0,
                "location_obj": location_obj,
                "services": JSON.parse(sessionStorage.getItem("services"))
            }
        }
    }else{
        requestObj = {
            "citizen_id": JSON.parse(sessionStorage.getItem("user")).MEMBER_ID,
            "is_my_location": 1,
            "location_id": JSON.parse(sessionStorage.getItem("user")).LOCATION_ID,
            "services": JSON.parse(sessionStorage.getItem("services"))
        }
    }
    console.log(requestObj);
    if(is_ok){
        response = await fetch('http://localhost:3000/api/addRequest',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestObj)
            });
        const responseObj = await response.json();
        console.log(responseObj.body);
        window.alert("Request sent");
    }
}