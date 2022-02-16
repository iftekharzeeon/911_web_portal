const changeMessage = async() => {
    console.log(document.getElementById("Service").value)
    const Department = document.getElementById("Department")
    const requestBody = {
        "service_id" : document.getElementById("Service").value
    }
    const requestJSON = JSON.stringify(requestBody)
    const response = await fetch('http://localhost:3000/api/getServiceDepartments',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: requestJSON
        });
        responseObj = await response.json();
        console.log(responseObj);
    var stringHTML = '';
    for(var i = 0; i < responseObj.length; i++){
        stringHTML = stringHTML + `<option value="${responseObj[i].DEPARTMENT_ID}">${responseObj[i].DEPARTMENT_NAME}</option>`
    }
    Department.innerHTML = `
    <option selected disabled>Department</option>
    ` + stringHTML
}

const changeMessageDept = async() => {
    console.log(document.getElementById("Department").value)
    const Job = document.getElementById("Job")
    const requestBody = {
        "department_id" : document.getElementById("Department").value
    }
    const requestJSON = JSON.stringify(requestBody)
    const response = await fetch('http://localhost:3000/api/getDepartmentJobs',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: requestJSON
    });
    responseObj = await response.json();
    console.log(responseObj);
    var stringHTML = '';
    for(var i = 0; i < responseObj.length; i++){
        stringHTML = stringHTML + `<option value="${responseObj[i].JOB_ID}">${responseObj[i].JOB_TITLE}</option>`
    }
    Job.innerHTML = `
    <option selected disabled>Jobs</option>
    ` + stringHTML
}

const showData = async() => {
    window.alert("Hello")
}

const empReg = async() => {
    var member_type = 2
    if(document.getElementById("Job").value == 145){
        member_type = 3
    }
    const regObj = {
            "first_name" : document.getElementById("ffirstname").value,
            "last_name" : document.getElementById("flastname").value,
            "username" : document.getElementById("fusername").value,
            "email" : document.getElementById("femail").value,
            "phone_number" : document.getElementById("fphoneNumber").value,
            "block" : document.getElementById("fblock").value,
            "street" : document.getElementById("fstreet").value,
            "house_no" : document.getElementById("fhouse").value,
            "password" : document.getElementById("fpassword").value,
            "job_id" : document.getElementById("Job").value,
            "shift_id" : document.getElementById("Shift").value,
            "member_type" : member_type
    }
    const regJSON = JSON.stringify(regObj)
    var isEmpty = false;
    for(const mem in regObj){
        if(regObj[mem] == "") isEmpty = true;
    }
    if(regObj.job_id == "Job"){
        window.alert("Select Job")
    }else if(regObj.shift_id == "Shift"){
        window.alert("Select Shift")
    }else if(isEmpty){
        window.alert("No field can be empty")
    }else{
        const response = await fetch('http://localhost:3000/api/addEmployee',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: regJSON
        });
        console.log(response)
        window.location.replace("/empLogin");
    }
}

const backER = async() => {
    window.location.replace('/empLogin')
}