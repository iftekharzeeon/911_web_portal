const manualLocationHTML =`
<label for="block" id="tblock">Block</label><br>
<input type="text" id="fblock" name="block" class="input"><br>
<label for="street" id="tstreet">Street</label><br>
<input type="text" id="fstreet" name="street" class="input">
<label for="house" id="thouse">House</label><br>
<input type="text" id="fhouse" name="house" class="input"> 
`

const backSL = async() => {
    window.location.replace("/");
}

window.onload = async() => {
    const name = document.getElementById("name");
    name.textContent += ' ' + JSON.parse(sessionStorage.getItem("user")).FIRST_NAME + ', ';

    const block = document.getElementById("block");
    const street = document.getElementById("street");
    const house = document.getElementById("house");

    block.innerHTML += JSON.parse(sessionStorage.getItem("user")).LOCATION_INFO.BLOCK;
    street.innerHTML += JSON.parse(sessionStorage.getItem("user")).LOCATION_INFO.STREET;
    house.innerHTML += JSON.parse(sessionStorage.getItem("user")).LOCATION_INFO.HOUSE_NO;
    console.log(sessionStorage.getItem("user"));
}

const manualLocationToggle = async() => {
    const fixedLocation = document.getElementById("fixedLocation");
    fixedLocation.remove();

    const manualLocation = document.getElementById("manualLocation");
    manualLocation.insertAdjacentHTML("beforeend", manualLocationHTML);
}