window.onload = async () => {
  if (sessionStorage.getItem("user") == null) {
    window.location.replace("/");
  }

  const Member_Id = JSON.parse(sessionStorage.getItem("user")).MEMBER_ID;
  const Admin_Name =
    JSON.parse(sessionStorage.getItem("user")).FIRST_NAME +
    " " +
    JSON.parse(sessionStorage.getItem("user")).LAST_NAME;

  document.getElementById("admin_name").innerHTML = Admin_Name;
  document.getElementById("mainContents").innerHTML = `<h4> Welcome, ${Admin_Name} </h4>`;
};

const logout = async () => {
  if (sessionStorage.getItem("user") != null) {
    sessionStorage.removeItem("user");
    window.location.replace("/adminPanel");
  }
};

$(function () {
  $("li").click(function () {
    // remove classes from all
    $("li").removeClass("nav-item");
    $("li").children().removeClass("active");
    $("li").children().addClass("text-white");
    // add class to the one we clicked
    $(this).children().removeClass("text-white");
    $(this).children().addClass("active");
  });
});

const home = async () => {
    const MainContent = document.getElementById("mainContents");
    const Admin_Name =
    JSON.parse(sessionStorage.getItem("user")).FIRST_NAME +
    " " +
    JSON.parse(sessionStorage.getItem("user")).LAST_NAME;
    let design = `<h4> Welcome, ${Admin_Name} </h4>`;

    MainContent.innerHTML = design;
}

const usersList = async () => {
  const MainContent = document.getElementById("mainContents");

  const response = await fetch("http://localhost:3000/api/getAllUsers", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  RequestObj = await response.json();
  console.log(RequestObj);

  let design = `<table class="table" style="font-size:larger">
                    <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Member ID</th>
                        <th scope="col">Member Full Name</th>
                        <th scope="col">Member Username</th>
                        <th scope="col">Member Email</th>
                        <th scope="col">Member Phone Number</th>
                        <th scope="col">Member Registration Date</th>
                        <th scope="col">Member Full Location</th>
                        <th scope="col">Total Request Called</th>
                    </tr>
                    </thead>
                    <tbody>`;

  let count = 1;
  RequestObj.ResponseData.forEach((element) => {
    design += `<tr>
                        <th scope="row">${count}</th>
                        <td>${element.MEMBER_ID}</td>
                        <td>${element.USER_FULLNAME}</td>
                        <td>${element.USER_NAME}</td>
                        <td>${element.EMAIL}</td>
                        <td>${element.PHONE_NUMBER}</td>
                        <td>${element.REGISTRATION_DATE}</td>
                        <td>${element.FULL_LOCATION}</td>
                        <td>${element.REQ_COUNT}</td>
                    </tr>`;

    count++;
  });

  design += `</tbody>
                </table>`;
  MainContent.innerHTML = design;
};

const employeeList = async () => {
  const MainContent = document.getElementById("mainContents");

  const response = await fetch("http://localhost:3000/api/getAllEmployees", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  RequestObj = await response.json();
  console.log(RequestObj);

  let design = `<table class="table" style="font-size:larger">
                    <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Employee ID</th>
                        <th scope="col">Full Name</th>
                        <th scope="col">Username</th>
                        <th scope="col">Email</th>
                        <th scope="col">Phone Number</th>
                        <th scope="col">Hire Date</th>
                        <th scope="col">Full Location</th>
                        <th scope="col">Service Desc</th>
                        <th scope="col">Department Name</th>
                        <th scope="col">Job Title</th>
                        <th scope="col">Total Request Accepted</th>
                    </tr>
                    </thead>
                    <tbody>`;

  let count = 1;
  RequestObj.ResponseData.forEach((element) => {
    design += `<tr>
                        <th scope="row">${count}</th>
                        <td>${element.MEMBER_ID}</td>
                        <td>${element.USER_FULLNAME}</td>
                        <td>${element.USER_NAME}</td>
                        <td>${element.EMAIL}</td>
                        <td>${element.PHONE_NUMBER}</td>
                        <td>${element.HIRE_DATE}</td>
                        <td>${element.FULL_LOCATION}</td>
                        <td>${element.SERVICE_DESC}</td>
                        <td>${element.DEPARTMENT_NAME}</td>
                        <td>${element.JOB_TITLE}</td>
                        <td>${element.REQ_COUNT}</td>
                    </tr>`;

    count++;
  });

  design += `</tbody>
                </table>`;
  MainContent.innerHTML = design;
};

const unapprovedEmployeeList = async () => {
  const MainContent = document.getElementById("mainContents");

  const response = await fetch(
    "http://localhost:3000/api/getAllUnapprovedEmployees",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  RequestObj = await response.json();
  console.log(RequestObj);

  let design = '';

  if (RequestObj.ResponseCode) {
    design = `<table class="table" style="font-size:larger">
                      <thead>
                      <tr>
                          <th scope="col">#</th>
                          <th scope="col">Employee ID</th>
                          <th scope="col">Full Name</th>
                          <th scope="col">Username</th>
                          <th scope="col">Email</th>
                          <th scope="col">Phone Number</th>
                          <th scope="col">Registration Date</th>
                          <th scope="col">Full Location</th>
                          <th scope="col">Service Desc</th>
                          <th scope="col">Department Name</th>
                          <th scope="col">Job Title</th>
                          <th scope="col">Action</th>
                      </tr>
                      </thead>
                      <tbody>`;

    let count = 1;
    RequestObj.ResponseData.forEach((element) => {
      design += `<tr>
                          <th scope="row">${count}</th>
                          <td>${element.MEMBER_ID}</td>
                          <td>${element.USER_FULLNAME}</td>
                          <td>${element.USER_NAME}</td>
                          <td>${element.EMAIL}</td>
                          <td>${element.PHONE_NUMBER}</td>
                          <td>${element.REGISTRATION_DATE}</td>
                          <td>${element.FULL_LOCATION}</td>
                          <td>${element.SERVICE_DESC}</td>
                          <td>${element.DEPARTMENT_NAME}</td>
                          <td>${element.JOB_TITLE}</td>
                          <td><button id="employee_id_${element.MEMBER_ID}" value="${element.MEMBER_ID}" onclick="approveEmployee(this.value)" class="btn btn-info">Approve</button></td>
                      </tr>`;

      count++;
    });

    design += `</tbody>
                  </table>`;
  } else {
    design = "No Data Found";
  }

  MainContent.innerHTML = design;
};

const customerCareList = async () => {
  const MainContent = document.getElementById("mainContents");

  const response = await fetch(
    "http://localhost:3000/api/getAllCustomerCares",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  RequestObj = await response.json();
  console.log(RequestObj);

  let design = '';

  if (RequestObj.ResponseCode) {
    design = `<table class="table" style="font-size:larger">
                    <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Employee ID</th>
                        <th scope="col">Full Name</th>
                        <th scope="col">Username</th>
                        <th scope="col">Email</th>
                        <th scope="col">Phone Number</th>
                        <th scope="col">Hire Date</th>
                        <th scope="col">Full Location</th>
                        <th scope="col">Service Desc</th>
                        <th scope="col">Department Name</th>
                        <th scope="col">Job Title</th>
                    </tr>
                    </thead>
                    <tbody>`;

    let count = 1;
    RequestObj.ResponseData.forEach((element) => {
      design += `<tr>
                        <th scope="row">${count}</th>
                        <td>${element.MEMBER_ID}</td>
                        <td>${element.USER_FULLNAME}</td>
                        <td>${element.USER_NAME}</td>
                        <td>${element.EMAIL}</td>
                        <td>${element.PHONE_NUMBER}</td>
                        <td>${element.HIRE_DATE}</td>
                        <td>${element.FULL_LOCATION}</td>
                        <td>${element.SERVICE_DESC}</td>
                        <td>${element.DEPARTMENT_NAME}</td>
                        <td>${element.JOB_TITLE}</td>
                    </tr>`;

      count++;
    });

    design += `</tbody>
                </table>`;
  } else {
    design = "No Data Found";
  }
  MainContent.innerHTML = design;
};

const serviceDetails = async () => {
  const MainContent = document.getElementById("mainContents");

  let design = `Coming Soon`;
  MainContent.innerHTML = design;
};

const approveEmployee = async (value) => {
    console.log(value);

    let emplpyeeObj = {
        "employee_id" : value,
        "approval_status" : 1
    }
    emplpyeeObj = JSON.stringify(emplpyeeObj);
    console.log(emplpyeeObj)
    
    const response = await fetch('http://localhost:3000/api/updateEmployeeStatus',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: emplpyeeObj
    });
    RequestObj = await response.json();
    console.log(RequestObj);

    if(RequestObj.ResponseCode == 1) {
        window.alert(RequestObj.ResponseText);
        unapprovedEmployeeList();
    } else if(RequestObj.ResponseCode == -1){
        window.alert(RequestObj.ResponseText);
        window.alert(RequestObj.ErrorMessage);
    } else {
        window.alert(RequestObj.ResponseText);
    }
}
