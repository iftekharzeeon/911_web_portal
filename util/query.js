//User Controller
//User Create

let insertLocationQuery = 'INSERT INTO location(location_id, block, street, house_no, latitude, longitude) VALUES(:location_id, :block, :street, :house_no, :latitude, :longitude)';

let insertMemberQuery = 'INSERT INTO member(member_id, first_name, last_name, email, phone_number, registration_date, member_type, location_id, user_name) ' +
                        ' VALUES(:member_id, :first_name, :last_name, :email, :phone_number, :registration_date, :member_type, :location_id, :username)';

let memberPasswordQuery = 'INSERT INTO member_password(member_password_id, member_id, password_key) VALUES(:member_id, :member_id, :password_key)';

let memberCheckEmailQuery = 'SELECT * FROM member WHERE email = :email AND member_type = 1';

//User Login
let memberCheckUsernameQuery = 'SELECT * FROM member WHERE user_name = :username AND member_type = 1';

let passwordCheckQuery = 'SELECT password_key FROM member_password WHERE member_id = :memberId';

let locationQuery = 'SELECT * FROM location WHERE location_id = :location_id';

//User Get Request Info
let ongoingRequestCheckQuery = 'SELECT * FROM request WHERE citizen_id = :member_id AND (resolved_status = -1 OR resolved_status = 0)';

let requestCounterQuery = 'SELECT COUNT(*) AS COUNTER FROM request_employee WHERE request_id = :request_id';

let ongoingEmployeeCounterQuery = 'SELECT COUNT(*) AS COUNTER FROM request_employee WHERE request_id = :request_id AND (employee_accepted = 0 OR employee_accepted = 1)';

let ongoingVehicleCounterQuery = 'SELECT DISTINCT COUNT(*) AS COUNTER FROM request_employee WHERE request_id = :request_id AND (vehicle_accepted = 0 OR vehicle_accepted = 1)';

let informationQuery = `SELECT R.REQUEST_TIME, RE.REQUEST_EMPLOYEE_ID, RE.EMPLOYEE_ID, RE.SERVICE_ID, RE.VEHICLE_ID, E.HIRE_DATE, V.DRIVER_ID, J.JOB_ID, J.JOB_TITLE, D.DEPARTMENT_NAME, S.SERVICE_ID, S.DESCRIPTION, M.FIRST_NAME || ' ' || M.LAST_NAME AS EMPLOYEE_NAME, M.PHONE_NUMBER ` +
                        'FROM REQUEST_EMPLOYEE RE, EMPLOYEES E, VEHICLE V, JOBS J, DEPARTMENTS D, SERVICE S, MEMBER M, REQUEST R ' +
                        'WHERE RE.EMPLOYEE_ID = E.MEMBER_ID ' +
                        'AND RE.REQUEST_ID = R.REQUEST_ID ' +
                        'AND RE.VEHICLE_ID = V.VEHICLE_ID ' +
                        'AND E.MEMBER_ID = M.MEMBER_ID ' +
                        'AND E.JOB_ID = J.JOB_ID ' +
                        'AND J.DEPARTMENT_ID = D.DEPARTMENT_ID ' +
                        'AND D.SERVICE_ID = S.SERVICE_ID ' +
                        'AND R.REQUEST_ID = :request_id';


//User RequestHistory List
let userRequestHistoryListQuery = `SELECT R.REQUEST_ID, R.REQUEST_TIME, R.RESOLVED_STATUS, L.LOCATION_ID, L.BLOCK, L.STREET, L.HOUSE_NO ` +
                                'FROM REQUEST R, LOCATION L ' +
                                'WHERE R.CITIZEN_ID = :member_id ' +
                                'AND L.LOCATION_ID = R.LOCATION_ID';


//Check Request Status
let checkRequestStatusQuery = `SELECT COUNT(*) AS counter FROM request WHERE citizen_id = :member_id AND (resolved_status = -1 OR resolved_status = 0)`;


//Employee Controller
//Employee Get Request Info
let employeeCheckQuery = 'SELECT * FROM employees WHERE member_id = :employee_id AND status = 1';

let occupiedInfoQuery = `SELECT RE.REQUEST_EMPLOYEE_ID, R.REQUEST_ID, R.REQUEST_TIME, M.FIRST_NAME || ' ' || M.LAST_NAME AS CITIZEN_NAME, L.BLOCK, L.HOUSE_NO, L.STREET, M.MEMBER_ID AS CITIZEN_ID, L.LOCATION_ID ` +
                        'FROM REQUEST R, MEMBER M, LOCATION L, REQUEST_EMPLOYEE RE, EMPLOYEES E ' +
                        'WHERE R.CITIZEN_ID = M.MEMBER_ID ' +
                        'AND R.LOCATION_ID = L.LOCATION_ID ' +
                        'AND R.REQUEST_ID = RE.REQUEST_ID ' +
                        'AND RE.EMPLOYEE_ID = E.MEMBER_ID ' +
                        'AND E.MEMBER_ID = :employee_id ' +
                        'AND RE.EMPLOYEE_ACCEPTED = 0';

let requestCheckQuery = 'SELECT count(*) AS counter FROM request_employee WHERE employee_accepted = -1';

let getEmployeeInfoQuery = 'SELECT E.HIRE_DATE, E.MEMBER_ID, J.JOB_ID, J.JOB_TITLE, D.DEPARTMENT_ID, D.DEPARTMENT_NAME, S.SERVICE_ID, S.DESCRIPTION AS SERVICE_DESCRIPTION, SH.SHIFT_ID, SH.DESCRIPTION AS SHIFT_DESCRIPTION, J.SALARY, E.STATUS ' +
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

let shiftInfoQuery = 'SELECT * FROM shift WHERE shift_id = :shift_id';

//Employee Login
let employeeCheckUsernameQuery = 'SELECT * FROM member WHERE user_name = :username AND member_type = :member_type';

let serviceIdCheckQuery = 'SELECT S.SERVICE_ID ' +
                        'FROM EMPLOYEES E, JOBS J, DEPARTMENTS D, SERVICE S ' +
                        'WHERE E.JOB_ID = J.JOB_ID ' +
                        'AND J.DEPARTMENT_ID = D.DEPARTMENT_ID ' +
                        'AND D.SERVICE_ID = S.SERVICE_ID ' +
                        'AND E.MEMBER_ID = :member_id';

//Employee Register
let employeeCheckEmailQuery = 'SELECT * FROM member WHERE email = :email';

let insertEmployeeQuery = 'INSERT INTO employees(member_id, hire_date, occupied, job_id, shift_id, status) VALUES(:member_id, :hire_date, :occupied, :job_id, :shift_id, :status)';

//Employee Request History
let employeeRequestHistoryListQuery = `SELECT R.REQUEST_TIME, RE.EMPLOYEE_ID, M.FIRST_NAME || ' ' || M.LAST_NAME AS CITIZEN_NAME, R.RESOLVED_STATUS, S.DESCRIPTION AS SERVICE_NAME, L.LOCATION_ID, L.BLOCK, L.STREET, L.HOUSE_NO ` +
                                    'FROM REQUEST_EMPLOYEE RE, EMPLOYEES E, SERVICE S, MEMBER M, REQUEST R, LOCATION L ' +
                                    'WHERE RE.EMPLOYEE_ID = E.MEMBER_ID ' +
                                    'AND RE.REQUEST_ID = R.REQUEST_ID ' +
                                    'AND R.CITIZEN_ID = M.MEMBER_ID ' +
                                    'AND RE.SERVICE_ID = S.SERVICE_ID ' +
                                    'AND L.LOCATION_ID = R.LOCATION_ID ' +
                                    'AND RE.EMPLOYEE_ID = :employee_id';


//Employee Request History Details
let requestHistoryDetailsQuery = `SELECT R.REQUEST_ID, R.REQUEST_TIME, R.RESOLVED_STATUS, RE.REQUEST_EMPLOYEE_ID, RE.EMPLOYEE_ACCEPTED, RE.EMPLOYEE_ID, RE.SERVICE_ID, S.DESCRIPTION, ` +
                                        `RE.VEHICLE_ID, EX.HIRE_DATE, MEX.FIRST_NAME || ' ' || MEX.LAST_NAME AS OTHER_EMPLOYEE_NAME, ` +
                                        'MEX.PHONE_NUMBER AS OTHER_EMPLOYEE_PHONE, MEX.EMAIL AS OTHER_EMPLOYEE_EMAIL, V.DRIVER_ID, RE.VEHICLE_ACCEPTED, '  +
                                        `DR.FIRST_NAME || ' ' || DR.LAST_NAME AS DRIVER_NAME, DR.PHONE_NUMBER AS DRIVER_PHONE, ` +
                                        'DR.EMAIL AS DRIVER_EMAIL, J.JOB_TITLE, D.DEPARTMENT_NAME, J.JOB_TITLE AS EMPLOYEE_JOB ' +
                                        'FROM REQUEST R, REQUEST_EMPLOYEE RE, EMPLOYEES EX, VEHICLE V, MEMBER MEX, MEMBER DR, JOBS J, DEPARTMENTS D, SERVICE S ' +
                                        'WHERE R.REQUEST_ID = RE.REQUEST_ID ' +
                                        'AND RE.EMPLOYEE_ID = EX.MEMBER_ID ' +
                                        'AND RE.SERVICE_ID = S.SERVICE_ID ' +
                                        'AND EX.MEMBER_ID = MEX.MEMBER_ID ' +
                                        'AND RE.VEHICLE_ID = V.VEHICLE_ID ' +
                                        'AND V.DRIVER_ID = DR.MEMBER_ID ' +
                                        'AND EX.JOB_ID = J.JOB_ID ' +
                                        'AND J.DEPARTMENT_ID = D.DEPARTMENT_ID ' +
                                        'AND R.REQUEST_ID = :request_id';

let employeeCountQuery = 'SELECT COUNT(employee_id) AS COUNTER FROM request_employee WHERE request_id = :request_id';

let vehicleCounterQuery = 'SELECT COUNT(DISTINCT vehicle_id) AS COUNTER FROM request_employee WHERE request_id = :request_id';


//Service Controller
//Get Services
let getServicesQuery = 'SELECT * FROM service ORDER BY service_id ASC';


//Request Controller
//Add Request
let memberIdCheckQuery = 'SELECT * FROM member WHERE member_id = :member_id AND member_type = 1';

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

let updateAllEmployeesAcceptedStatusto1Query = `UPDATE request_employee SET employee_accepted = :employee_accepted_status WHERE request_id = :request_id AND service_id = :service_id`;


//Vehicle Controller
//Add Vehicle Request
let vehicleCheckQuery = 'SELECT * FROM vehicle WHERE service_id = :service_id AND occupied = 0';

let updateRequestVehicleInfoQuery = 'UPDATE request_employee SET vehicle_id = :vehicle_id, vehicle_accepted = :vehicle_accepted_status WHERE request_id = :request_id AND service_id = :service_id';

let updateVehicleOccupiedStatusQuery = 'UPDATE vehicle SET occupied = :vehicle_occupied_status WHERE vehicle_id = :vehicle_id';

let getServiceIdQuery = 'SELECT service_id FROM request_employee WHERE request_employee_id = :request_employee_id';

let updateVehicleAcceptedStatusto1Query = 'UPDATE request_employee SET vehicle_accepted = :vehicle_accepted_status WHERE request_id = :request_id AND service_id = :service_id';


//Department Controller
//Get Departments Service Wise

let getServiceDepartmentQuery = 'SELECT * FROM departments d, location l WHERE service_id = :service_id AND d.location_id = l.location_id';


//Job Controller
//Get Jobs Department Wise

let getDepartmentJobQuery = 'SELECT * FROM jobs WHERE department_id = :department_id';


//Shift Controller
//Get Shifts

let getShiftsQuery = 'SELECT * FROM shift';


//Admin Controller
//Action Employee

let updateApproveQuery = 'UPDATE employees SET status = :status WHERE member_id = :employee_id';

let employeeOccupiedCheckQuery = 'SELECT occupied FROM employees WHERE member_id = :employee_id';

let adminCheckUsernameQuery = 'SELECT * FROM member WHERE user_name = :username AND member_type = 0';

let getAllUsersQuery = `SELECT M.MEMBER_ID, M.FIRST_NAME || ' ' || M.LAST_NAME AS USER_FULLNAME, M.USER_NAME, M.EMAIL, M.PHONE_NUMBER, M.REGISTRATION_DATE, L.LOCATION_ID, L.HOUSE_NO || ' ' || L.BLOCK || ' ' || L.STREET AS FULL_LOCATION, (SELECT COUNT(*) FROM REQUEST R WHERE R.CITIZEN_ID = M.MEMBER_ID) AS REQ_COUNT ` +
                    'FROM MEMBER M, LOCATION L ' +
                    'WHERE M.MEMBER_TYPE = 1 ' +
                    'AND L.LOCATION_ID = M.LOCATION_ID';

let getAllEmployeesQuery = `SELECT M.MEMBER_ID, M.FIRST_NAME || ' ' || M.LAST_NAME AS USER_FULLNAME, M.USER_NAME, M.EMAIL, M.PHONE_NUMBER, M.REGISTRATION_DATE, E.HIRE_DATE, L.LOCATION_ID, L.HOUSE_NO || ' ' || L.BLOCK || ' ' || L.STREET AS FULL_LOCATION, S.SERVICE_ID, S.DESCRIPTION AS SERVICE_DESC, D.DEPARTMENT_ID, D.DEPARTMENT_NAME, J.JOB_ID, J.JOB_TITLE, SH.SHIFT_ID, SH.DESCRIPTION AS SHIFT_DESC, (SELECT COUNT(DISTINCT RE.REQUEST_ID) FROM REQUEST_EMPLOYEE RE WHERE RE.EMPLOYEE_ID = M.MEMBER_ID) AS REQ_COUNT ` +
                            'FROM MEMBER M, EMPLOYEES E, LOCATION L, SERVICE S, DEPARTMENTS D, JOBS J, SHIFT SH ' +
                            'WHERE M.MEMBER_ID = E.MEMBER_ID ' +
                            'AND M.LOCATION_ID = L.LOCATION_ID ' +
                            'AND E.JOB_ID = J.JOB_ID ' +
                            'AND J.DEPARTMENT_ID = D.DEPARTMENT_ID ' +
                            'AND D.SERVICE_ID = S.SERVICE_ID ' +
                            'AND E.SHIFT_ID = SH.SHIFT_ID ' +
                            'AND M.MEMBER_TYPE = 2 AND E.STATUS = 1';

let getAllUnapprovedEmployeeQuery = `SELECT M.MEMBER_ID, M.FIRST_NAME || ' ' || M.LAST_NAME AS USER_FULLNAME, M.USER_NAME, M.EMAIL, M.PHONE_NUMBER, M.REGISTRATION_DATE, E.HIRE_DATE, L.LOCATION_ID, L.HOUSE_NO || ' ' || L.BLOCK || ' ' || L.STREET AS FULL_LOCATION, S.SERVICE_ID, S.DESCRIPTION AS SERVICE_DESC, D.DEPARTMENT_ID, D.DEPARTMENT_NAME, J.JOB_ID, J.JOB_TITLE, SH.SHIFT_ID, SH.DESCRIPTION AS SHIFT_DESC ` +
                            'FROM MEMBER M, EMPLOYEES E, LOCATION L, SERVICE S, DEPARTMENTS D, JOBS J, SHIFT SH ' +
                            'WHERE M.MEMBER_ID = E.MEMBER_ID ' +
                            'AND M.LOCATION_ID = L.LOCATION_ID ' +
                            'AND E.JOB_ID = J.JOB_ID ' +
                            'AND J.DEPARTMENT_ID = D.DEPARTMENT_ID ' +
                            'AND D.SERVICE_ID = S.SERVICE_ID ' +
                            'AND E.SHIFT_ID = SH.SHIFT_ID ' +
                            'AND E.STATUS = 0';


let getAllCCQuery = `SELECT M.MEMBER_ID, M.FIRST_NAME || ' ' || M.LAST_NAME AS USER_FULLNAME, M.USER_NAME, M.EMAIL, M.PHONE_NUMBER, M.REGISTRATION_DATE, L.LOCATION_ID, L.HOUSE_NO || ' ' || L.BLOCK || ' ' || L.STREET AS FULL_LOCATION, S.SERVICE_ID, S.DESCRIPTION AS SERVICE_DESC, D.DEPARTMENT_ID, D.DEPARTMENT_NAME, J.JOB_ID, J.JOB_TITLE, SH.SHIFT_ID, SH.DESCRIPTION AS SHIFT_DESC, (SELECT COUNT(DISTINCT RE.REQUEST_ID) FROM REQUEST_EMPLOYEE RE WHERE RE.EMPLOYEE_ID = M.MEMBER_ID) AS REQ_COUNT ` +
                        'FROM MEMBER M, EMPLOYEES E, LOCATION L, SERVICE S, DEPARTMENTS D, JOBS J, SHIFT SH ' +
                        'WHERE M.MEMBER_ID = E.MEMBER_ID ' +
                        'AND M.LOCATION_ID = L.LOCATION_ID ' +
                        'AND E.JOB_ID = J.JOB_ID ' +
                        'AND J.DEPARTMENT_ID = D.DEPARTMENT_ID ' +
                        'AND D.SERVICE_ID = S.SERVICE_ID ' +
                        'AND E.SHIFT_ID = SH.SHIFT_ID ' +
                        'AND M.MEMBER_TYPE = 3 AND E.STATUS = 1';


let getAllVehicleQuery = `SELECT V.VEHICLE_ID, E.MEMBER_ID, E.HIRE_DATE, E.SHIFT_ID, M.FIRST_NAME || ' ' || M.LAST_NAME AS DRIVER_NAME, M.PHONE_NUMBER, M.EMAIL, S.SERVICE_ID, S.DESCRIPTION AS SERVICE_DESC, D.DEPARTMENT_ID, D.DEPARTMENT_NAME, SH.SHIFT_ID, SH.DESCRIPTION AS SHIFT_DESC, (SELECT COUNT(DISTINCT RE.REQUEST_ID) FROM REQUEST_EMPLOYEE RE WHERE RE.VEHICLE_ID = V.VEHICLE_ID) AS REQ_COUNT 
                            FROM VEHICLE V, EMPLOYEES E, MEMBER M, SERVICE S, DEPARTMENTS D, SHIFT SH 
                            WHERE V.DRIVER_ID = E.MEMBER_ID 
                            AND E.MEMBER_ID = M.MEMBER_ID 
                            AND V.SERVICE_ID = S.SERVICE_ID 
                            AND V.DEPARTMENT_ID = D.DEPARTMENT_ID 
                            AND E.SHIFT_ID = SH.SHIFT_ID 
                            AND E.STATUS = :employee_status`;                        

let getEmployeeInfoForEditQuery = 'SELECT E.HIRE_DATE, E.MEMBER_ID, J.JOB_ID, J.JOB_TITLE, D.DEPARTMENT_ID, D.DEPARTMENT_NAME, S.SERVICE_ID, S.DESCRIPTION AS SERVICE_DESCRIPTION, SH.SHIFT_ID, SH.DESCRIPTION AS SHIFT_DESCRIPTION, J.SALARY, E.STATUS, M.FIRST_NAME, M.LAST_NAME, M.EMAIL, M.PHONE_NUMBER, M.USER_NAME, L.LOCATION_ID, L.BLOCK, L.STREET, L.HOUSE_NO ' +
                                'FROM EMPLOYEES E, JOBS J, DEPARTMENTS D, SERVICE S, SHIFT SH, MEMBER M, LOCATION L ' +
                                'WHERE E.JOB_ID = J.JOB_ID AND E.SHIFT_ID = SH.SHIFT_ID ' +
                                'AND M.MEMBER_ID = E.MEMBER_ID ' +
                                'AND M.LOCATION_ID = L.LOCATION_ID ' +
                                'AND J.DEPARTMENT_ID = D.DEPARTMENT_ID ' +
                                'AND D.SERVICE_ID = S.SERVICE_ID ' +
                                'AND E.MEMBER_ID = :employee_id';

let updateMemberTableQuery = 'UPDATE member SET first_name = :first_name, last_name = :last_name, phone_number = :phone_number WHERE member_id = :employee_id AND member_type = :member_type';

let updateLocationTableQuery = 'UPDATE location SET block = :block, street = :street, house_no = :house_no WHERE location_id = :location_id';

let updateEmployeesTableQuery = 'UPDATE employees SET job_id = :job_id, shift_id = :shift_id WHERE member_id = :employee_id';

let getRequestLogQuery = `SELECT R.REQUEST_ID, R.REQUEST_TIME, R.CITIZEN_ID, R.LOCATION_ID, R.RESOLVED_STATUS, M.FIRST_NAME || ' ' || M.LAST_NAME AS CITIZEN_NAME, M.EMAIL, M.PHONE_NUMBER, M.USER_NAME, L.BLOCK, L.STREET, L.HOUSE_NO 
                        FROM REQUEST R, MEMBER M, LOCATION L 
                        WHERE R.CITIZEN_ID = M.MEMBER_ID 
                        AND R.LOCATION_ID = L.LOCATION_ID 
                        AND R.RESOLVED_STATUS = :resolved_status`;

let getOngoingRequestLogQuery = `SELECT R.REQUEST_ID, R.REQUEST_TIME, R.CITIZEN_ID, R.LOCATION_ID, R.RESOLVED_STATUS, M.FIRST_NAME || ' ' || M.LAST_NAME AS CITIZEN_NAME, M.EMAIL, M.PHONE_NUMBER, M.USER_NAME, L.BLOCK, L.STREET, L.HOUSE_NO 
                        FROM REQUEST R, MEMBER M, LOCATION L 
                        WHERE R.CITIZEN_ID = M.MEMBER_ID 
                        AND R.LOCATION_ID = L.LOCATION_ID 
                        AND R.RESOLVED_STATUS <> :resolved_status`;

let getDepartmentDriversQuery = `SELECT M.MEMBER_ID, M.FIRST_NAME || ' ' || M.LAST_NAME AS DRIVER_NAME 
                                FROM EMPLOYEES E, JOBS J, MEMBER M, DEPARTMENTS D 
                                WHERE E.MEMBER_ID = M.MEMBER_ID 
                                AND E.JOB_ID = J.JOB_ID 
                                AND D.DEPARTMENT_ID = J.DEPARTMENT_ID 
                                AND J.JOB_TITLE = 'Driver' 
                                AND D.DEPARTMENT_ID = :department_id  
                                AND E.STATUS = 1`;

let insertVehicleQuery = 'INSERT INTO vehicle VALUES(:vehicle_id, 0, :driver_id, :service_id, :department_id)';

let insertServiceQuery = 'INSERT INTO service VALUES(:service_id, :service_name)';

let insertDepartmentQuery = 'INSERT INTO departments VALUES(:department_id, :department_name, :location_id, :service_id)';

let insertJobQuery = 'INSERT INTO jobs VALUES(:job_id, :job_title, :salary, :department_id)';


//Chat Controller
//Get Messages

let getMsgsQuery = `SELECT cl.chat_log_id, cl.sent_time, cl.message_text, c.first_name AS citizen_name,
                        e.first_name AS employee_name, cl.sender 
                        FROM chat_log cl, member c, member e 
                        WHERE cl.citizen_id = :citizen_id 
                        AND cl.employee_id = :employee_id 
                        AND c.member_id = cl.citizen_id 
                        AND e.member_id = cl.employee_id 
                        ORDER BY cl.chat_log_id DESC`;

//Add Message
let insertChatLogQuery = 'INSERT INTO chat_log VALUES(:chat_log_id, :citizen_id, :employee_id, :sent_time, :message_text, :sender_id)';

//Get Chat Citizen List
let getChatCitizenListQuery = `SELECT DISTINCT CL.CITIZEN_ID, M.FIRST_NAME || ' ' || M.LAST_NAME AS CITIZEN_NAME
                                FROM CHAT_LOG CL, MEMBER M
                                WHERE CL.CITIZEN_ID = M.MEMBER_ID
                                AND CL.EMPLOYEE_ID = :employee_id`;


//Customer Care Controller
//Get Available Customer Care List

let getAvailableCCListQuery = `SELECT M.MEMBER_ID, M.FIRST_NAME, M.LAST_NAME, M.FIRST_NAME || ' ' || M.LAST_NAME AS user_fullname, M.USER_NAME, M.EMAIL, M.PHONE_NUMBER ` +
                            'FROM MEMBER M, EMPLOYEES E ' +
                            'WHERE M.MEMBER_ID = E.MEMBER_ID ' +
                            'AND E.SHIFT_ID = :shift_id ' +
                            'AND M.MEMBER_TYPE = 3 AND E.STATUS = 1';

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
    employeeCheckEmailQuery,
    ongoingRequestCheckQuery,
    requestCounterQuery,
    ongoingEmployeeCounterQuery,
    ongoingVehicleCounterQuery,
    informationQuery,
    vehicleCheckQuery,
    updateRequestVehicleInfoQuery,
    updateVehicleOccupiedStatusQuery,
    getServiceIdQuery,
    updateVehicleAcceptedStatusto1Query,
    insertEmployeeQuery,
    getServiceDepartmentQuery,
    getDepartmentJobQuery,
    getShiftsQuery,
    updateApproveQuery,
    adminCheckUsernameQuery,
    userRequestHistoryListQuery,
    serviceIdCheckQuery,
    employeeRequestHistoryListQuery,
    requestHistoryDetailsQuery,
    vehicleCounterQuery,
    employeeCountQuery,
    getAllUsersQuery,
    getAllEmployeesQuery,
    getAllCCQuery,
    getAllUnapprovedEmployeeQuery,
    employeeOccupiedCheckQuery,
    getEmployeeInfoForEditQuery,
    updateMemberTableQuery,
    updateLocationTableQuery,
    updateEmployeesTableQuery,
    getAllVehicleQuery,
    getRequestLogQuery,
    getOngoingRequestLogQuery,
    getDepartmentDriversQuery,
    insertVehicleQuery,
    insertServiceQuery,
    insertDepartmentQuery,
    insertJobQuery,
    shiftInfoQuery,
    getMsgsQuery,
    insertChatLogQuery,
    getChatCitizenListQuery,
    updateAllEmployeesAcceptedStatusto1Query,
    checkRequestStatusQuery,
    getAvailableCCListQuery
}