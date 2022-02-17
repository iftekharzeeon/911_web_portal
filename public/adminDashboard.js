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
  document.getElementById(
    "mainContents"
  ).innerHTML = `<h4> Welcome, ${Admin_Name} </h4>`;
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
};

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
                        <th scope="col">Shift</th>
                        <th scope="col">Total Request Accepted</th>
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
                        <td>${element.HIRE_DATE}</td>
                        <td>${element.FULL_LOCATION}</td>
                        <td>${element.SERVICE_DESC}</td>
                        <td>${element.DEPARTMENT_NAME}</td>
                        <td>${element.JOB_TITLE}</td>
                        <td>${element.SHIFT_DESC}</td>
                        <td>${element.REQ_COUNT}</td>
                        <td>
                        <button id="employee_id_${element.MEMBER_ID}" value="${element.MEMBER_ID}" onclick="editEmployee(this.value, 1)" class="btn btn-info m-1" data-bs-toggle="modal" data-bs-target="#exampleModal">Edit Info</button>
                        <button id="employee_id_${element.MEMBER_ID}" value="${element.MEMBER_ID}" onclick="actionEmployee(this.value, 0)" class="btn btn-danger">Unapprove</button>
                        </td>
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

  let design = "";

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
                          <th scope="col">Shift</th>
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
                          <td>${element.SHIFT_DESC}</td>
                          <td><button id="employee_id_${element.MEMBER_ID}" value="${element.MEMBER_ID}" onclick="actionEmployee(this.value, 1)" class="btn btn-info">Approve</button></td>
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

  let design = "";

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
                        <th scope="col">Shift</th>
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
                        <td>${element.SHIFT_DESC}</td>
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

const vehicleList = async () => {
  const MainContent = document.getElementById("mainContents");

  const response = await fetch(
    "http://localhost:3000/api/getAllVehicle",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  RequestObj = await response.json();
  console.log(RequestObj);

  let design = "";

  if (RequestObj.ResponseCode) {
    design = `<table class="table" style="font-size:larger">
                    <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Vehicle ID</th>
                        <th scope="col">Driver Member ID</th>
                        <th scope="col">Driver Name</th>
                        <th scope="col">Driver Phone Number</th>
                        <th scope="col">Driver Email</th>
                        <th scope="col">Driver Hire Date</th>
                        <th scope="col">Service Desc</th>
                        <th scope="col">Department Name</th>
                        <th scope="col">Shift</th>
                        <th scope="col">Request Accepted</th>
                    </tr>
                    </thead>
                    <tbody>`;

    let count = 1;
    RequestObj.ResponseData.forEach((element) => {
      design += `<tr>
                        <th scope="row">${count}</th>
                        <td>${element.VEHICLE_ID}</td>
                        <td>${element.MEMBER_ID}</td>
                        <td>${element.DRIVER_NAME}</td>
                        <td>${element.PHONE_NUMBER}</td>
                        <td>${element.EMAIL}</td>
                        <td>${element.HIRE_DATE}</td>
                        <td>${element.SERVICE_DESC}</td>
                        <td>${element.DEPARTMENT_NAME}</td>
                        <td>${element.SHIFT_DESC}</td>
                        <td>${element.REQ_COUNT}</td>
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

  const response = await fetch(
    "http://localhost:3000/api/getServices",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  RequestObj = await response.json();
  console.log(RequestObj);

  let design = `<h4> Services </h4>`;
  let selectDesign = ``;
  design += `<table class="table" style="font-size:larger">
                    <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Service ID</th>
                        <th scope="col">Description</th>
                    </tr>
                    </thead>
                    <tbody>`;

  let count = 1;

  RequestObj.forEach((element) => {
    design += `<tr>
                      <th scope="row">${count}</th>
                      <td>${element.SERVICE_ID}</td>
                      <td>${element.DESCRIPTION}</td>
                  </tr>`;
    selectDesign += `<option value="${element.SERVICE_ID}">${element.DESCRIPTION}</option>`;
    count++;
  });

  design += `</tbody>
                </table>`;

  design += '<hr> <h5> Select a Service to see Departments</h5>';
  design += `<select onchange="showDeptTable(this.value)" id="service_name_2" class="form-control" aria-label="Default select example"></select> <hr> <div id="deptTable"></div>`;


  MainContent.innerHTML = design;
  document.getElementById("service_name_2").innerHTML = selectDesign;
};

const actionEmployee = async (empId, status) => {
  console.log(empId);

  let emplpyeeObj = {
    employee_id: empId,
    approval_status: status,
  };
  emplpyeeObj = JSON.stringify(emplpyeeObj);
  console.log(emplpyeeObj);

  const response = await fetch(
    "http://localhost:3000/api/updateEmployeeStatus",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: emplpyeeObj,
    }
  );
  RequestObj = await response.json();
  console.log(RequestObj);

  if (RequestObj.ResponseCode == 1) {
    window.alert(RequestObj.ResponseText);

    if (status) {
      unapprovedEmployeeList();
    } else {
      employeeList();
    }
  } else if (RequestObj.ResponseCode == -1) {
    window.alert(RequestObj.ResponseText);
    window.alert(RequestObj.ErrorMessage);
  } else {
    window.alert(RequestObj.ResponseText);
  }
};

const editEmployee = async (empId, memType) => {
  console.log(empId, " ", memType);

  //Get Employee Info from API
  let emplpyeeObj = {
    employee_id: empId,
    member_type: memType,
  };
  emplpyeeObj = JSON.stringify(emplpyeeObj);
  console.log(emplpyeeObj);

  const response = await fetch("http://localhost:3000/api/getEmployeeForEdit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: emplpyeeObj,
  });
  RequestObj = await response.json();
  console.log(RequestObj);

  //Get Departments from API
  showDept(
    RequestObj.ResponseData.SERVICE_ID,
    RequestObj.ResponseData.DEPARTMENT_ID
  );

  //Get Jobs from API
  showJob(
    RequestObj.ResponseData.DEPARTMENT_ID,
    RequestObj.ResponseData.JOB_ID
  );

  //Get Shifts from API
  showShift(RequestObj.ResponseData.SHIFT_ID);

  $("#employee_id").val(RequestObj.ResponseData.MEMBER_ID);
  $("#location_id").val(RequestObj.ResponseData.LOCATION_ID);
  $("#first_name").val(RequestObj.ResponseData.FIRST_NAME);
  $("#last_name").val(RequestObj.ResponseData.LAST_NAME);
  $("#username").val(RequestObj.ResponseData.USER_NAME);
  $("#email").val(RequestObj.ResponseData.EMAIL);
  $("#phone_number").val(RequestObj.ResponseData.PHONE_NUMBER);
  $("#hire_date").val(RequestObj.ResponseData.HIRE_DATE);
  $("#house_no").val(RequestObj.ResponseData.HOUSE_NO);
  $("#block").val(RequestObj.ResponseData.BLOCK);
  $("#street").val(RequestObj.ResponseData.STREET);
  $("#service_name").val(RequestObj.ResponseData.SERVICE_DESCRIPTION);
  $("#salary").val(RequestObj.ResponseData.SALARY);
};

const showDept = async (service_id, dept_id) => {
  console.log(service_id, " ", dept_id);

  let serviceObj = {
    service_id: service_id,
  };

  serviceObj = JSON.stringify(serviceObj);

  const responseDepartments = await fetch(
    "http://localhost:3000/api/getServiceDepartments",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: serviceObj,
    }
  );
  DepartmentObj = await responseDepartments.json();

  console.log(DepartmentObj);

  let deptDesign = "";

  DepartmentObj.forEach((dept) => {
    if (dept_id == dept.DEPARTMENT_ID) {
      deptDesign += `<option selected value="${dept.DEPARTMENT_ID}">${dept.DEPARTMENT_NAME}</option>`;
    } else {
      deptDesign += `<option value="${dept.DEPARTMENT_ID}">${dept.DEPARTMENT_NAME}</option>`;
    }
  });

  document.getElementById("dept_name").innerHTML = deptDesign;
};

const showJob = async (dept_id, job_id) => {
  console.log(dept_id);

  let departmentObj = {
    department_id: dept_id,
  };

  departmentObj = JSON.stringify(departmentObj);

  const responseJobs = await fetch(
    "http://localhost:3000/api/getDepartmentJobs",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: departmentObj,
    }
  );
  JobObj = await responseJobs.json();

  console.log(JobObj);

  let jobDesign = "";

  JobObj.forEach((job) => {
    if (job_id == job.JOB_ID) {
      jobDesign += `<option selected value="${job.JOB_ID}">${job.JOB_TITLE}</option>`;
    } else {
      jobDesign += `<option value="${job.JOB_ID}">${job.JOB_TITLE}</option>`;
    }
  });

  document.getElementById("job_title").innerHTML = jobDesign;
};

const showShift = async (shift_id) => {
  console.log(shift_id);

  const responseShift = await fetch("http://localhost:3000/api/getShifts", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  ShiftObj = await responseShift.json();
  console.log(ShiftObj);

  let shiftDesign = "";

  ShiftObj.forEach((shift) => {
    if (shift_id == shift.SHIFT_ID) {
      shiftDesign += `<option selected value="${shift.SHIFT_ID}">${shift.DESCRIPTION}</option>`;
    } else {
      shiftDesign += `<option value="${shift.SHIFT_ID}">${shift.DESCRIPTION}</option>`;
    }
  });

  document.getElementById("shift").innerHTML = shiftDesign;
};

const updateInfo = async (mem_type) => {

  let employee_id = $("#employee_id").val();
  let location_id = $("#location_id").val();
  let first_name = $("#first_name").val();
  let last_name = $("#last_name").val();
  let phone_number = $("#phone_number").val();
  let house_no = $("#house_no").val();
  let block = $("#block").val();
  let street = $("#street").val();
  let job_id = $("#job_title").val();
  let shift_id = $("#shift").val();

  let employeeObj = {
    employee_id: employee_id,
    first_name: first_name,
    last_name: last_name,
    phone_number: phone_number,
    member_type: mem_type,
    location_id: location_id,
    block: block,
    street: street,
    house_no: house_no,
    job_id: job_id,
    shift_id: shift_id
  };

  console.log(employeeObj);

  employeeObj = JSON.stringify(employeeObj);

  const responseEmployee = await fetch(
    "http://localhost:3000/api/updateEmployeeInfo",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: employeeObj
    }
  );

  responseObj = await responseEmployee.json();
  console.log(responseObj);

  if (responseObj.ResponseCode == 1) {
    window.alert(responseObj.ResponseText);
    employeeList();
  } else {
    window.alert(responseObj.ResponseText);
  }
};

const showDeptTable = async (service_id) => {
  console.log(service_id);

  let serviceObj = {
    service_id: service_id,
  };

  serviceObj = JSON.stringify(serviceObj);

  const responseDepartments = await fetch(
    "http://localhost:3000/api/getServiceDepartments",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: serviceObj,
    }
  );
  DepartmentObj = await responseDepartments.json();

  console.log(DepartmentObj);

  let design = `<h4> Departments </h4>`;
  let selectDesign = ``;

  design += `<table class="table" style="font-size:larger">
                    <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Department ID</th>
                        <th scope="col">Department Name</th>
                        <th scope="col">Location</th>
                    </tr>
                    </thead>
                    <tbody>`;

  let count = 1;

  DepartmentObj.forEach((element) => {
    design += `<tr>
                      <th scope="row">${count}</th>
                      <td>${element.DEPARTMENT_ID}</td>
                      <td>${element.DEPARTMENT_NAME}</td>
                      <td>${element.BLOCK + ', ' + element.STREET + ', ' + element.HOUSE_NO}</td>
                  </tr>`;

    selectDesign += `<option value="${element.DEPARTMENT_ID}">${element.DEPARTMENT_NAME}</option>`;
    count++;
  });

  design += `</tbody>
                </table>`;

  design += '<hr> <h5> Select a Department to see Jobs</h5>';
  design += `<select onchange="showJobsTable(this.value)" id="dept_name_2" class="form-control" aria-label="Default select example"></select> <hr> <div id="jobsTable"></div>`;

  document.getElementById("deptTable").innerHTML = design;
  document.getElementById("dept_name_2").innerHTML = selectDesign;
}

const showJobsTable = async (department_id) => {
  console.log(department_id);

  let departmentObj = {
    department_id: department_id,
  };

  departmentObj = JSON.stringify(departmentObj);

  const responseJobs = await fetch(
    "http://localhost:3000/api/getDepartmentJobs",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: departmentObj,
    }
  );
  JobsObj = await responseJobs.json();

  console.log(JobsObj);

  let design = `<h4> Jobs </h4>`;
  let selectDesign = ``;

  design += `<table class="table" style="font-size:larger">
                    <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Job ID</th>
                        <th scope="col">Job Title</th>
                        <th scope="col">Salary</th>
                    </tr>
                    </thead>
                    <tbody>`;

  let count = 1;

  JobsObj.forEach((element) => {
    design += `<tr>
                      <th scope="row">${count}</th>
                      <td>${element.JOB_ID}</td>
                      <td>${element.JOB_TITLE}</td>
                      <td>${element.SALARY}</td>
                  </tr>`;

    selectDesign += `<option value="${element.JOB_ID}">${element.JOB_TITLE}</option>`;
    count++;
  });

  design += `</tbody>
                </table>`;

  document.getElementById("jobsTable").innerHTML = design;
}

const requestLogList = async () => {
  const MainContent = document.getElementById("mainContents");

  const response = await fetch("http://localhost:3000/api/getRequestLog", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  ResponseObj = await response.json();
  console.log(ResponseObj);
  let design = '';

  if (ResponseObj.ResponseCode) {
    design = `<table class="table" style="font-size:larger">
    <thead>
    <tr>
        <th scope="col">#</th>
        <th scope="col">Request ID</th>
        <th scope="col">Request Time</th>
        <th scope="col">Citizen ID</th>
        <th scope="col">Citizen Name</th>
        <th scope="col">Citizen Username</th>
        <th scope="col">Citizen Phone Number</th>
        <th scope="col">Citizen Email</th>
        <th scope="col">Location</th>
        <th scope="col">Action</th>
    </tr>
    </thead>
    <tbody>`;

    let count = 1;
    ResponseObj.ResponseData.forEach((element) => {
      design += `<tr>
        <th scope="row">${count}</th>
        <td>${element.REQUEST_ID}</td>
        <td>${element.REQUEST_TIME}</td>
        <td>${element.CITIZEN_ID}</td>
        <td>${element.CITIZEN_NAME}</td>
        <td>${element.USER_NAME}</td>
        <td>${element.PHONE_NUMBER}</td>
        <td>${element.EMAIL}</td>
        <td>${element.HOUSE_NO + ', ' + element.BLOCK + ', ' + element.STREET}</td>
        <td><button id="details_${element.REQUEST_ID}" value="${element.REQUEST_ID}" onclick="requestDetails(this.value)" class="btn btn-info m-1" data-bs-toggle="modal" data-bs-target="#requestDetailsModal">Details</button></td>
    </tr>`;

      count++;
    });

    design += `</tbody>
</table>`;
  } else {
    design = 'No Data Found';
  }
  MainContent.innerHTML = design;
}

const requestDetails = async (request_id) => {
  console.log(request_id);

  let requestObj = {
    request_id: request_id
  };

  requestObj = JSON.stringify(requestObj);

  const response = await fetch("http://localhost:3000/api/getRequestDetails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: requestObj
  });
  ResponseObj = await response.json();
  console.log(ResponseObj);

  const MainContent = document.getElementById("requestDetailsModalBody");

  let design = `Request ID: ${request_id} <br>`;

  if (ResponseObj.ResponseCode) {
    design = `<table class="table" style="font-size:medium">
    <thead>
    <tr>
        <th scope="col">#</th>
        <th scope="col">Request Employee ID</th>
        <th scope="col">Service Name</th>
        <th scope="col">Employee Name</th>
        <th scope="col">Employee Department</th>
        <th scope="col">Employee Phone Number</th>
        <th scope="col">Employee Job</th>
        <th scope="col">Driver Name</th>
    </tr>
    </thead>
    <tbody>`;

    let count = 1;
    ResponseObj.ResponseData.forEach((element) => {
      design += `<tr>
        <th scope="row">${count}</th>
        <td>${element.REQUEST_EMPLOYEE_ID}</td>
        <td>${element.DESCRIPTION}</td>
        <td>${element.OTHER_EMPLOYEE_NAME}</td>
        <td>${element.DEPARTMENT_NAME}</td>
        <td>${element.OTHER_EMPLOYEE_PHONE}</td>
        <td>${element.EMPLOYEE_JOB}</td>
        <td>${element.DRIVER_NAME}</td>
    </tr>`;

      count++;
    });

    design += `</tbody>
</table>`;
  } else {
    design = 'No Data Found';
  }
  MainContent.innerHTML = design;

}

const ongoingRequestsList = async () => {
  const MainContent = document.getElementById("mainContents");

  const response = await fetch("http://localhost:3000/api/getOngoingRequestLog", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  ResponseObj = await response.json();
  console.log(ResponseObj);
  let design = '';

  if (ResponseObj.ResponseCode) {
    design = `<table class="table" style="font-size:larger">
    <thead>
    <tr>
        <th scope="col">#</th>
        <th scope="col">Request ID</th>
        <th scope="col">Request Time</th>
        <th scope="col">Citizen ID</th>
        <th scope="col">Citizen Name</th>
        <th scope="col">Citizen Username</th>
        <th scope="col">Citizen Phone Number</th>
        <th scope="col">Citizen Email</th>
        <th scope="col">Location</th>
        <th scope="col">Action</th>
    </tr>
    </thead>
    <tbody>`;

    let count = 1;
    ResponseObj.ResponseData.forEach((element) => {
      design += `<tr>
        <th scope="row">${count}</th>
        <td>${element.REQUEST_ID}</td>
        <td>${element.REQUEST_TIME}</td>
        <td>${element.CITIZEN_ID}</td>
        <td>${element.CITIZEN_NAME}</td>
        <td>${element.USER_NAME}</td>
        <td>${element.PHONE_NUMBER}</td>
        <td>${element.EMAIL}</td>
        <td>${element.HOUSE_NO + ', ' + element.BLOCK + ', ' + element.STREET}</td>
        <td><button id="details_${element.REQUEST_ID}" value="${element.REQUEST_ID}" onclick="requestDetails(this.value)" class="btn btn-info m-1" data-bs-toggle="modal" data-bs-target="#requestDetailsModal">Details</button></td>
    </tr>`;

      count++;
    });

    design += `</tbody>
</table>`;
  } else {
    design = 'No Data Found';
  }
  MainContent.innerHTML = design;
}
