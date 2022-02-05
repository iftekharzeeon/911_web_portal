var serviceList;

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

const superHeroHTML = `
<div id="8Add">
    <input type="radio" id="SuperHero1" name="SuperHero" value="1">
    <label> 1</label>
    <input type="radio" id="SuperHero2" name="SuperHero" value="2">
    <label> 2</label>
</div>
`;

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

window.onload = async () => {
    const response = await fetch('http://localhost:3000/api/getServices',{
            method: 'GET'
        });
    serviceList = await response.json();
    console.log(serviceList);
};

const backS = async() => {
    window.location.replace("/");
}

//left to code
var requestedService =[];
const confirmService = async() => {
    const medical = document.getElementById('Medicle');
    if(medical.checked){
        var ele = document.getElementByName('Medicle');
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
}