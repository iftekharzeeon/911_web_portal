const showData = async() => {
    var regObj = {
        first_name : document.getElementById("ffirstname").value,
        last_name : document.getElementById("flastname").value,
        email : document.getElementById("femail").value,
        phone_number: document.getElementById("fphoneNumber").value,
        block : document.getElementById("fblock").value,
        street : document.getElementById("fstreet").value,
        house_no : document.getElementById("fhouse").value,
        password : document.getElementById("fpassword").value
    }

    var regJSON = JSON.stringify(regObj);
    var response;
    var isEmpty = false;
    for(const mem in regObj){
        if(regObj[mem] == "") isEmpty = true;
    }

    if(isEmpty){
        window.alert("No field can be empty");
    }else{
        response = await fetch('http://localhost:3000/api/addUser',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: regJSON
        });
        const responseObj = await response.json();
        console.log(responseObj);
        if(responseObj.ResponseCode == 0){
            window.alert("Member Already Exists");
        }else if(responseObj.ResponseCode == 1){
            window.alert("Member Added");
            window.location.replace("/");
        }
    } 
}