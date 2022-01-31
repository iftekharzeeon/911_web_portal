const showData = async() => {
    var citizenFirstName = document.getElementById("ffirstname").value;
    var citizenLastName = document.getElementById("flastname").value;
    var citizenEmail = document.getElementById("femail").value;
    var citizenPassword = document.getElementById("fpassword").value;
    var citizenBlock = document.getElementById("fblock").value;
    var citizenStreet = document.getElementById("fstreet").value;
    var citizenHouse = document.getElementById("fhouse").value;
    var citizenPhone = document.getElementById("fphoneNumber").value;

    var regObj = {
        first_name : citizenFirstName,
        last_name : citizenLastName,
        email : citizenEmail,
        phone_number: citizenPhone,
        block : citizenBlock,
        street : citizenStreet,
        house_no : citizenHouse,
        password : citizenPassword
    }

    var regJSON = JSON.stringify(regObj);

    console.log(regJSON)

    const response = await fetch('http://localhost:3000/api/addUser',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: regJSON
    });

    const responseJSON = await response.json();
    console.log(responseJSON);
    
    //window.location.replace("/");
}