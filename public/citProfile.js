const gotoSelectService = async() => {
    window.location.replace("/citLogin/selectService");
}

const backCP = async() => {
    window.location.replace("/citLogin");
}

window.onload = async () => {
    if(sessionStorage.getItem("user") == null){
        window.location.replace("/citLogin")
    }

    const Name = document.getElementById("Name");
    const Location = document.getElementById("Location");
    const Email = document.getElementById("Email");
    const PhoneNumber = document.getElementById("PhoneNumber");

    const Member = JSON.parse(sessionStorage.getItem("user"));

    Name.innerHTML = `${Member.FIRST_NAME + ' ' + Member.LAST_NAME}`
    Location.innerHTML = `H#${Member.LOCATION_INFO.HOUSE_NO}, B#${Member.LOCATION_INFO.BLOCK}, R#${Member.LOCATION_INFO.STREET}`
    Email.innerHTML = `${Member.EMAIL}`
    PhoneNumber.innerHTML = `${Member.PHONE_NUMBER}`
}

const Logout = async() => {
    sessionStorage.removeItem("user")
    window.location.replace("/citLogin");
}