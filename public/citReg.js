const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const showData = async () => {
    var regObj = {
        first_name: document.getElementById("ffirstname").value,
        last_name: document.getElementById("flastname").value,
        email: document.getElementById("femail").value,
        username: document.getElementById("fusername").value,
        phone_number: document.getElementById("fphoneNumber").value,
        block: document.getElementById("fblock").value,
        street: document.getElementById("fstreet").value,
        house_no: document.getElementById("fhouse").value,
        password: document.getElementById("fpassword").value
    }

    if(!validateEmail(regObj.email)){
        window.alert('Not a valid email address');
        return;
    }
    if(isNaN(regObj.phone_number)){
        window.alert('Not a valid phone number');
        return;
    }

    var regJSON = JSON.stringify(regObj);
    var response;
    var isEmpty = false;
    for (const mem in regObj) {
        if (regObj[mem] == "") isEmpty = true;
    }

    if (isEmpty) {
        window.alert("No field can be empty");
    } else {
        response = await fetch('http://localhost:3000/api/addUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: regJSON
        });
        const responseObj = await response.json();
        console.log(responseObj);

        if (responseObj.ResponseCode == 1) {
            window.alert(responseObj.ResponseText);
            window.location.replace("/citLogin");
        } else {
            window.alert(responseObj.ResponseText);
        }
    }
}

const back = async () => {
    window.location.replace("/");
}