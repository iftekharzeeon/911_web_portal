const medicleHTML =`
<div id="2Add">
    <input type="radio" id="Medicle1" name="Medicle" value="1">
    <label> 1</label>
    <input type="radio" id="Medicle3" name="Medicle" value="3">
    <label> 3</label>
    <input type="radio" id="Medicle5" name="Medicle" value="5">
    <label> 5</label><br>
</div>
`;
const fireHTML = `
<div id="4Add">
    <input type="radio" id="Fire1" name="Fire" value="1">
    <label> 1</label>
    <input type="radio" id="Fire3" name="Fire" value="3">
    <label> 3</label>
    <input type="radio" id="Fire5" name="Fire" value="5">
    <label> 5</label><br>
</div>
`;
const lawHTML =`
<div id ="6Add">
    <input type="radio" id="Law1" name="Law" value="1">
    <label> 1</label>
    <input type="radio" id="Law3" name="Law" value="3">
    <label> 3</label>
    <input type="radio" id="Law5" name="Law" value="5">
    <label> 5</label><br>
</div>
`;
const superHeroHTML = `
<div id="8Add">
    <input type="radio" id="SuperHero1" name="SuperHero" value="1">
    <label> 1</label>
    <input type="radio" id="SuperHero2" name="SuperHero" value="2">
    <label> 2</label>
</div>
`;


const displayMedicle = async() => {
    const medicle = document.getElementById('Medicle');
    if(medicle.checked){
        console.log("Medicle Checked");
        const addBox = document.getElementById('2');
        addBox.insertAdjacentHTML("beforeend", medicleHTML);
    }else{
        console.log("Medicle Unchecked");
        var myobj = document.getElementById("2Add");
        myobj.remove();
    }
}
const displayFire = async() => {
    const fire = document.getElementById('Fire');
    if(fire.checked){
        console.log("Fire Checked");
        const addBox = document.getElementById('4');
        addBox.insertAdjacentHTML("beforeend", fireHTML);
    }else{
        console.log("Fire Unchecked");
        var myobj = document.getElementById("4Add");
        myobj.remove();
    }
}
const displayLaw = async() => {
    const law = document.getElementById('Law');
    if(law.checked){
        console.log("Law Checked");
        const addBox = document.getElementById('6');
        addBox.insertAdjacentHTML("beforeend", lawHTML);
    }else{
        console.log("Law Unchecked");
        var myobj = document.getElementById("6Add");
        myobj.remove();
    }
}
const displaySuper = async() => {
    const superhero = document.getElementById('SuperHero');
    if(superhero.checked){
        console.log("SuperHero Checked");
        const addBox = document.getElementById('8');
        addBox.insertAdjacentHTML("beforeend", superHeroHTML);
    }else{
        console.log("SuperHero Unchecked");
        var myobj = document.getElementById("8Add");
        myobj.remove();
    }
}

var serviceList;
window.onload = async () => {
    const response = await fetch('http://localhost:3000/api/getServices',{
            method: 'GET'
        });
    serviceList = await response.json();
    console.log(serviceList);
}

const backS = async() => {
    window.location.replace("/");
}

const confirmService = async() => {
    var requestedService = [];
    const medical = document.getElementById('Medicle');
    if(medical.checked){
        var ele = document.getElementsByName('Medicle');
        for(i = 0; i < ele.length; i++){
            if(ele[i].checked){
                requestedService.push({
                    "service_id" : serviceList[0].SERVICE_ID,
                    "request_people" : parseInt(ele[i].value)
                }
                )
                
            }
        }
    }
    const fire = document.getElementById('Fire');
    if(fire.checked){
        var ele = document.getElementsByName('Fire');
        for(i = 0; i < ele.length; i++){
            if(ele[i].checked){
                requestedService.push({
                    "service_id" : serviceList[1].SERVICE_ID,
                    "request_people" : parseInt(ele[i].value)
                }
                )
                
            }
        }
    }
    const law = document.getElementById('Law');
    if(law.checked){
        var ele = document.getElementsByName('Law');
        for(i = 0; i < ele.length; i++){
            if(ele[i].checked){
                requestedService.push({
                    "service_id" : serviceList[2].SERVICE_ID,
                    "request_people" : parseInt(ele[i].value)
                }
                )
                
            }
        }
    }
    const superhero = document.getElementById('SuperHero');
    if(superhero.checked){
        var ele = document.getElementsByName('SuperHero');
        for(i = 0; i < ele.length; i++){
            if(ele[i].checked){
                requestedService.push({
                    "service_id" : serviceList[3].SERVICE_ID,
                    "request_people" : parseInt(ele[i].value)
                }
                )
                
            }
        }
    }

    //console.log(requestedService);
    sessionStorage.setItem("services", JSON.stringify(requestedService));
    console.log(sessionStorage.getItem("services"));
    console.log(sessionStorage.getItem("user"));

    window.location.replace("/userLogin/selectLocation")
}