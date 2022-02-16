window.onload = async () => {
    if(sessionStorage.getItem("user") == null){
        window.location.replace("/")
    }

    const Member_Id = JSON.parse(sessionStorage.getItem("user")).MEMBER_ID;
    const Admin_Name = JSON.parse(sessionStorage.getItem("user")).FIRST_NAME + ' ' + JSON.parse(sessionStorage.getItem("user")).LAST_NAME;

    document.getElementById('admin_name').innerHTML = Admin_Name;
}

const logout = async () => {
    if(sessionStorage.getItem("user") != null){
        sessionStorage.removeItem("user");
        window.location.replace("/adminPanel");
    }
}

$(function() {
    $("li").click(function() {
       // remove classes from all
       $("li").removeClass("nav-item");
       $("li").children().removeClass("active");
       $("li").children().addClass("text-white");
       // add class to the one we clicked
       $(this).children().removeClass("text-white");
       $(this).children().addClass("active");
    });
 });

const usersList = async () => {

    const MainContent = document.getElementById("mainContents");

    const response = await fetch('http://localhost:3000/api/getAllUsers',{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
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
    RequestObj.ResponseData.forEach(element => {
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
  
    let design = `Coming Soon`;
      MainContent.innerHTML = design;
  };

  const customerCareList = async () => {
    const MainContent = document.getElementById("mainContents");
  
    let design = `Coming Soon`;
      MainContent.innerHTML = design;
  };

  const serviceDetails = async () => {
    const MainContent = document.getElementById("mainContents");
  
    let design = `Coming Soon`;
      MainContent.innerHTML = design;
  };
