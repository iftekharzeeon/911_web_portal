//User Controller
//User Create

let insertLocationQuery = 'INSERT INTO location(location_id, block, street, house_no) VALUES(:location_id, :block, :street, :house_no)';

let insertMemberQuery = 'INSERT INTO member(member_id, first_name, last_name, email, phone_number, registration_date, member_type, location_id) ' +
                        ' VALUES(:member_id, :first_name, :last_name, :email, :phone_number, :registration_date, :member_type, :location_id)';

let memberPasswordQuery = 'INSERT INTO member_password(member_password_id, member_id, password_key) VALUES(:member_id, :member_id, :password_key)';

let memberCheckEmailQuery = 'SELECT * FROM member WHERE email = :email AND member_type = 1';

//User Login
let memberCheckUsernameQuery = 'SELECT * FROM member WHERE user_name = :username AND member_type = 1';

let passwordCheckQuery = 'SELECT password_key FROM member_password WHERE member_id = :memberId';

let locationQuery = 'SELECT * FROM location WHERE location_id = :location_id';

//User Get Request Info
let ongoingRequestCheckQuery = 'SELECT * FROM request WHERE citizen_id = :member_id AND (resolved_status = -1 OR resolved_status = 0)';

let requestCounterQuery = 'SELECT COUNT(*) AS COUNTER FROM request_employee WHERE request_id = :request_id';

let employeeCounterQuery = 'SELECT COUNT(*) AS COUNTER FROM request_employee WHERE request_id = :request_id AND (employee_accepted = 0 OR employee_accepted = 1)';

let vehicleCounterQuery = 'SELECT DISTINCT COUNT(*) AS COUNTER FROM request_employee WHERE request_id = :request_id AND (vehicle_accepted = 0 OR vehicle_accepted = 1)';

let informationQuery = `SELECT R.REQUEST_TIME, RE.REQUEST_EMPLOYEE_ID, RE.EMPLOYEE_ID, RE.SERVICE_ID, RE.VEHICLE_ID, E.HIRE_DATE, V.VEHICLE_TYPE, V.DRIVER_ID, J.JOB_ID, J.JOB_TITLE, D.DEPARTMENT_NAME, D.DEPARTMENT_TYPE, S.SERVICE_ID, S.DESCRIPTION, M.FIRST_NAME || ' ' || M.LAST_NAME AS EMPLOYEE_NAME, M.PHONE_NUMBER ` +
                        'FROM REQUEST_EMPLOYEE RE, EMPLOYEES E, VEHICLE V, JOBS J, DEPARTMENTS D, SERVICE S, MEMBER M, REQUEST R ' +
                        'WHERE RE.EMPLOYEE_ID = E.MEMBER_ID ' +
                        'AND RE.REQUEST_ID = R.REQUEST_ID ' +
                        'AND RE.VEHICLE_ID = V.VEHICLE_ID ' +
                        'AND E.MEMBER_ID = M.MEMBER_ID ' +
                        'AND E.JOB_ID = J.JOB_ID ' +
                        'AND J.DEPARTMENT_ID = D.DEPARTMENT_ID ' +
                        'AND D.SERVICE_ID = S.SERVICE_ID ' +
                        'AND R.REQUEST_ID = :request_id';
//Employee Controller
//Employee Get Request Info
let employeeCheckQuery = 'SELECT * FROM employees WHERE member_id = :employee_id';

let occupiedInfoQuery = `SELECT RE.REQUEST_EMPLOYEE_ID, R.REQUEST_ID, R.REQUEST_TIME, M.FIRST_NAME || ' ' || M.LAST_NAME AS CITIZEN_NAME, L.BLOCK, L.HOUSE_NO, L.STREET, M.MEMBER_ID AS CITIZEN_ID, L.LOCATION_ID ` +
                        'FROM REQUEST R, MEMBER M, LOCATION L, REQUEST_EMPLOYEE RE, EMPLOYEES E ' +
                        'WHERE R.CITIZEN_ID = M.MEMBER_ID ' +
                        'AND R.LOCATION_ID = L.LOCATION_ID ' +
                        'AND R.REQUEST_ID = RE.REQUEST_ID ' +
                        'AND RE.EMPLOYEE_ID = E.MEMBER_ID ' +
                        'AND E.MEMBER_ID = :employee_id ' +
                        'AND RE.EMPLOYEE_ACCEPTED = 0';

let requestCheckQuery = 'SELECT count(*) AS counter FROM request_employee WHERE employee_accepted = -1';

let getEmployeeInfoQuery = 'SELECT E.HIRE_DATE, E.MEMBER_ID, J.JOB_ID, J.JOB_TITLE, D.DEPARTMENT_ID, D.DEPARTMENT_NAME, S.SERVICE_ID, S.DESCRIPTION AS SERVICE_DESCRIPTION, SH.SHIFT_ID, SH.DESCRIPTION AS SHIFT_DESCRIPTION, J.SALARY ' +
                            'FROM EMPLOYEES E, JOBS J, DEPARTMENTS D, SERVICE S, SHIFT SH ' +
                            'WHERE E.JOB_ID = J.JOB_ID AND E.SHIFT_ID = SH.SHIFT_ID ' +
                            'AND J.DEPARTMENT_ID = D.DEPARTMENT_ID ' +
                            'AND D.SERVICE_ID = S.SERVICE_ID ' +
                            'AND E.MEMBER_ID = :employee_id';


let getRequestIdQuery = 'SELECT DISTINCT service_id, request_id FROM request_employee WHERE employee_accepted = -1 AND service_id = :employee_service_id ORDER BY request_id ASC';

let requestInfoQuery = `SELECT R.REQUEST_ID, R.REQUEST_TIME, M.FIRST_NAME || ' ' || M.LAST_NAME AS CITIZEN_NAME, L.BLOCK, L.HOUSE_NO, L.STREET, M.MEMBER_ID AS CITIZEN_ID, L.LOCATION_ID ` +
                        'FROM REQUEST R, MEMBER M, LOCATION L ' +
                        'WHERE R.CITIZEN_ID = M.MEMBER_ID ' +
                        'AND R.LOCATION_ID = L.LOCATION_ID ' +
                        'AND R.REQUEST_ID = :request_id ';

//Employee Login
let employeeCheckUsernameQuery = 'SELECT * FROM member WHERE user_name = :username AND member_type = 2';


//Service Controller
//Get Services
let getServicesQuery = 'SELECT * FROM service';


//Request Controller
//Add Request
let memberIdCheckQuery = 'SELECT * FROM member WHERE member_id = :member_id';

let insertRequestQuery = 'INSERT INTO request(request_id, request_time, citizen_id, location_id, resolved_status) ' +
                        'VALUES(:request_id, :request_time, :member_id, :location_id, :resolved_status)';

let insertRequestEmployeeQuery = 'INSERT INTO request_employee(request_employee_id, request_id, service_id, employee_accepted, vehicle_accepted) ' +
                        'VALUES(:request_employee_id, :request_id, :service_id, :employee_accepted, :vehicle_accepted)';


//Accept Request
let longRequestInfoQuery = `SELECT RE.REQUEST_EMPLOYEE_ID, R.REQUEST_ID, R.REQUEST_TIME, M.FIRST_NAME || ' ' || M.LAST_NAME AS CITIZEN_NAME, L.BLOCK, L.HOUSE_NO, L.STREET, M.MEMBER_ID AS CITIZEN_ID, L.LOCATION_ID ` +
                            'FROM REQUEST R, MEMBER M, LOCATION L, REQUEST_EMPLOYEE RE, EMPLOYEES E ' +
                            'WHERE R.CITIZEN_ID = M.MEMBER_ID ' +
                            'AND R.LOCATION_ID = L.LOCATION_ID ' +
                            'AND R.REQUEST_ID = RE.REQUEST_ID ' +
                            'AND RE.EMPLOYEE_ID = E.MEMBER_ID ' +
                            'AND E.MEMBER_ID = :employee_id ' +
                            'AND RE.EMPLOYEE_ACCEPTED = 0';

let requestAvailableInfoQuery = 'SELECT REQUEST_EMPLOYEE_ID FROM REQUEST_EMPLOYEE ' +
                                'WHERE EMPLOYEE_ACCEPTED = -1 AND SERVICE_ID = :service_id AND REQUEST_ID = :request_id';

let updateEmployeeAcceptStatusQuery = 'UPDATE request_employee SET employee_accepted = :employee_accepted_status, employee_id = :employee_id WHERE request_employee_id = :request_employee_id';

let updateRequestStatusQuery = 'UPDATE request SET resolved_status = :resolved_status WHERE request_id = :request_id';

let updateEmployeeOccupiedStatusQuery = 'UPDATE employees SET occupied = :occupied_status WHERE member_id = :employee_id';


//Finish Request
let updateEmployeeAcceptedStatusto1Query = 'UPDATE request_employee SET employee_accepted = :employee_accepted_status WHERE request_employee_id = :request_employee_id';

let employeeAcceptCheckQuery = 'SELECT COUNT(*) AS COUNTER FROM request_employee WHERE request_id = :request_id AND (employee_accepted = -1 OR employee_accepted = 0)';


//Vehicle Controller
//Add Vehicle Request
let vehicleCheckQuery = 'SELECT * FROM vehicle WHERE service_id = :service_id AND occupied = 0';

let updateRequestVehicleInfoQuery = 'UPDATE request_employee SET vehicle_id = :vehicle_id, vehicle_accepted = :vehicle_accepted_status WHERE request_id = :request_id AND service_id = :service_id';

let updateVehicleOccupiedStatusQuery = 'UPDATE vehicle SET occupied_status = :vehicle_occupied_status WHERE vehicle_id = :vehicle_id';

let getServiceIdQuery = 'SELECT service_id FROM request_employee WHERE request_employee_id = :request_employee_id';

let updateVehicleAcceptedStatusto1Query = 'UPDATE request_employee SET vehicle_accepted = :vehicle_accepted_status WHERE request_id = :request_id AND service_id = :service_id';

module.exports = {
    memberCheckUsernameQuery,
    memberCheckEmailQuery,
    insertLocationQuery,
    insertMemberQuery,
    memberPasswordQuery,
    passwordCheckQuery,
    locationQuery,
    employeeCheckQuery,
    occupiedInfoQuery,
    requestCheckQuery,
    getEmployeeInfoQuery,
    getRequestIdQuery,
    requestInfoQuery,
    employeeCheckUsernameQuery,
    getServicesQuery,
    memberIdCheckQuery,
    insertRequestQuery,
    insertRequestEmployeeQuery,
    longRequestInfoQuery,
    requestAvailableInfoQuery,
    updateEmployeeAcceptStatusQuery,
    updateRequestStatusQuery,
    updateEmployeeOccupiedStatusQuery,
    updateEmployeeAcceptedStatusto1Query,
    employeeAcceptCheckQuery,
    ongoingRequestCheckQuery,
    requestCounterQuery,
    employeeCounterQuery,
    vehicleCounterQuery,
    informationQuery,
    vehicleCheckQuery,
    updateRequestVehicleInfoQuery,
    updateVehicleOccupiedStatusQuery,
    getServiceIdQuery,
    updateVehicleAcceptedStatusto1Query
}