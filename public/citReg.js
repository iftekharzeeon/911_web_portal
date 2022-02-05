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

    //console.log(regJSON)

    const response = await fetch('http://localhost:3000/api/addUser',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: regJSON
    });

    const responseJSON = await response.json();
    console.log(responseJSON);
    window.location.replace("/");
}