const oracledb = require('oracledb');
const serverInfo = require('../serverInfomation');

let connection;

const get_employee_request_info = async (req, res) => {

    let responses = {};

    const requestObj = req.body;
    let request_id;
    let employee_id;
    let memberExist;
    let requestCounter;
    let employee_dept_id;
    let employee_service_id;
    let employee_job_id;
    let employee_info;
    let request_employee_info;
    let request_info;
    let employee_occupied;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        employee_id = requestObj.employee_id;

        //Check Employee Existence
        let memberCheckQuery = 'SELECT * FROM employees WHERE member_id = :employee_id';
        memberExist = await connection.execute(memberCheckQuery, [employee_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (memberExist.rows.length === 0) {
            //Employee Not Found
            responses.ResponseCode = 0;
            responses.ResponseText = 'Employee Not Found';

        } else {
            //Check if Occupied
            employee_occupied = memberExist.rows[0].OCCUPIED;
            if (employee_occupied) {

                //Employee is occupied
                let occupiedInfoQuery = `SELECT R.REQUEST_ID, R.REQUEST_TIME, M.FIRST_NAME || ' ' || M.LAST_NAME AS CITIZEN_NAME, L.BLOCK, L.HOUSE_NO, L.STREET, M.MEMBER_ID AS CITIZEN_ID, L.LOCATION_ID ` +
                    'FROM REQUEST R, MEMBER M, LOCATION L, REQUEST_EMPLOYEE RE, EMPLOYEES E ' +
                    'WHERE R.CITIZEN_ID = M.MEMBER_ID ' +
                    'AND R.LOCATION_ID = L.LOCATION_ID ' +
                    'AND R.REQUEST_ID = RE.REQUEST_ID ' +
                    'AND RE.EMPLOYEE_ID = E.MEMBER_ID ' +
                    'AND E.MEMBER_ID = :employee_id ' +
                    'AND RE.EMPLOYEE_ACCEPTED = 0';

                request_info = await connection.execute(occupiedInfoQuery, [employee_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

                responses.ResponseCode = 2;
                responses.ResponseText = 'You have a request on going';
                responses.RequestInfo = request_info.rows[0];

            } else {
                //Employee is free
                let requestCheckQuery = 'SELECT count(*) AS counter FROM request_employee WHERE employee_accepted = -1';
                requestCounter = await connection.execute(requestCheckQuery, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

                requestCounter = requestCounter.rows[0].COUNTER;
                console.log(requestCounter);

                if (requestCounter > 0) {
                    //Check if same service

                    let getEmployeeInfoQuery = 'SELECT E.MEMBER_ID, J.JOB_ID, D.DEPARTMENT_ID, S.SERVICE_ID ' +
                        'FROM EMPLOYEES E, JOBS J, DEPARTMENTS D, SERVICE S ' +
                        'WHERE E.JOB_ID = J.JOB_ID ' +
                        'AND J.DEPARTMENT_ID = D.DEPARTMENT_ID ' +
                        'AND D.SERVICE_ID = S.SERVICE_ID ' +
                        'AND E.MEMBER_ID = :employee_id';

                    employee_info = await connection.execute(getEmployeeInfoQuery, [employee_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

                    employee_dept_id = employee_info.rows[0].DEPARTMENT_ID;
                    employee_job_id = employee_info.rows[0].JOB_ID;
                    employee_service_id = employee_info.rows[0].SERVICE_ID;

                    let getRequestIdQuery = 'SELECT request_id, service_id FROM request_employee WHERE employee_accepted = -1 AND service_id = :employee_service_id';
                    request_employee_info = await connection.execute(getRequestIdQuery, [employee_service_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

                    if (request_employee_info.rows.length > 0) {
                        request_id = request_employee_info.rows[0].REQUEST_ID;

                        let requestInfoQuery = `SELECT R.REQUEST_ID, R.REQUEST_TIME, M.FIRST_NAME || ' ' || M.LAST_NAME AS CITIZEN_NAME, L.BLOCK, L.HOUSE_NO, L.STREET, M.MEMBER_ID AS CITIZEN_ID, L.LOCATION_ID ` +
                            'FROM REQUEST R, MEMBER M, LOCATION L ' +
                            'WHERE R.CITIZEN_ID = M.MEMBER_ID ' +
                            'AND R.LOCATION_ID = L.LOCATION_ID ' +
                            'AND R.REQUEST_ID = :request_id';

                        request_info = await connection.execute(requestInfoQuery, [request_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

                        responses.ResponseCode = 1;
                        responses.ResponseText = 'There are pending requests at the moment. Please respond.';
                        responses.RequestInfo = request_info.rows;

                    } else {
                        //No same service request available
                        responses.ResponseCode = 0;
                        responses.ResponseText = 'No available request at this moment.';

                    }

                } else {
                    //No Request At This Moment
                    responses.ResponseCode = 0;
                    responses.ResponseText = 'No available request at this moment.';

                }
            }
        }

    } catch (err) {
        console.log(err);
        responses.ResponseCode = -1;
        responses.ResponseText = 'Internal Database Error. Oracle Error Number ' + err.errorNum + ', offset ' + err.offset;
        responses.ErrorMessage = err.message;
    } finally {
        if (connection) {
            await connection.close();
            console.log('Connection Closed');
        }
        res.send(responses);

    }
}

const accept_request = async (req, res) => {

    let responses = {};
    let result;

    const requestObj = req.body;
    let employee_id;
    let request_id;
    let employee_occupied;
    let service_id;
    let request_info;
    let request_employee_id;
    let occupied_info;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        employee_id = requestObj.employee_id;
        request_id = requestObj.request_id;
        service_id = requestObj.service_id;

        //Check Employee Existence
        let memberCheckQuery = 'SELECT * FROM employees WHERE member_id = :employee_id';
        memberExist = await connection.execute(memberCheckQuery, [employee_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (memberExist.rows.length === 0) {
            //Employee Not Found
            responses.ResponseCode = 0;
            responses.ResponseText = 'Employee Not Found';

        } else {
            //Check Employee Occupied
            employee_occupied = memberExist.rows[0].OCCUPIED;
            if (employee_occupied) {
                //Employee is occupied

                let requestInfoQuery = `SELECT R.REQUEST_ID, R.REQUEST_TIME, M.FIRST_NAME || ' ' || M.LAST_NAME AS CITIZEN_NAME, L.BLOCK, L.HOUSE_NO, L.STREET, M.MEMBER_ID AS CITIZEN_ID, L.LOCATION_ID ` +
                    'FROM REQUEST R, MEMBER M, LOCATION L, REQUEST_EMPLOYEE RE, EMPLOYEES E ' +
                    'WHERE R.CITIZEN_ID = M.MEMBER_ID ' +
                    'AND R.LOCATION_ID = L.LOCATION_ID ' +
                    'AND R.REQUEST_ID = RE.REQUEST_ID ' +
                    'AND RE.EMPLOYEE_ID = E.MEMBER_ID ' +
                    'AND E.MEMBER_ID = :employee_id ' +
                    'AND RE.EMPLOYEE_ACCEPTED = 0';

                occupied_info = await connection.execute(requestInfoQuery, [employee_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

                responses.ResponseCode = 2;
                responses.ResponseText = 'You are already occupied.';
                responses.RequestInfo = occupied_info.rows[0];

            } else {
                //Employee is free

                //Check if request is available
                let requestAvailableInfoQuery = 'SELECT REQUEST_EMPLOYEE_ID FROM REQUEST_EMPLOYEE ' +
                    'WHERE EMPLOYEE_ACCEPTED = -1 AND SERVICE_ID = :service_id AND REQUEST_ID = :request_id';
                request_info = await connection.execute(requestAvailableInfoQuery, [service_id, request_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

                console.log(request_info.rows);

                if (request_info.rows.length > 0) {
                    request_employee_id = request_info.rows[0].REQUEST_EMPLOYEE_ID;

                    //Update Employee Accepted Status
                    let updateEmployeeAcceptStatusQuery = 'UPDATE request_employee SET employee_accepted = 0, employee_id = :employee_id WHERE request_employee_id = :request_employee_id';
                    result = await connection.execute(updateEmployeeAcceptStatusQuery, [employee_id, request_employee_id]);

                    //Update Request Resolved Status
                    let updateRequestStatusQuery = 'UPDATE request SET resolved_status = 0 WHERE request_id = :request_id';
                    result = await connection.execute(updateRequestStatusQuery, [request_id]);

                    //Update Employee Occupied Status
                    let updateEmployeeOccupiedStatusQuery = 'UPDATE employees SET occupied = 1 WHERE member_id = :employee_id';
                    result = await connection.execute(updateEmployeeOccupiedStatusQuery, [employee_id]);

                    connection.commit();

                    let requestInfoQuery = `SELECT R.REQUEST_ID, R.REQUEST_TIME, M.FIRST_NAME || ' ' || M.LAST_NAME AS CITIZEN_NAME, L.BLOCK, L.HOUSE_NO, L.STREET, M.MEMBER_ID AS CITIZEN_ID, L.LOCATION_ID ` +
                        'FROM REQUEST R, MEMBER M, LOCATION L, REQUEST_EMPLOYEE RE, EMPLOYEES E ' +
                        'WHERE R.CITIZEN_ID = M.MEMBER_ID ' +
                        'AND R.LOCATION_ID = L.LOCATION_ID ' +
                        'AND R.REQUEST_ID = RE.REQUEST_ID ' +
                        'AND RE.EMPLOYEE_ID = E.MEMBER_ID ' +
                        'AND E.MEMBER_ID = :employee_id ' +
                        'AND RE.EMPLOYEE_ACCEPTED = 0';

                    occupied_info = await connection.execute(requestInfoQuery, [employee_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

                    console.log(occupied_info);

                    responses.ResponseCode = 1;
                    responses.ResponseText = 'You have accepted the request. You are on persuit now.';
                    responses.RequestInfo = occupied_info.rows[0];

                } else {
                    //No request is available
                    responses.ResponseCode = 0;
                    responses.ResponseText = 'No request is available at this moment';
                }
            }
        }

    } catch (err) {
        console.log(err);
        responses.ResponseCode = -1;
        responses.ResponseText = 'Internal Database Error. Oracle Error Number ' + err.errorNum + ', offset ' + err.offset;
        responses.ErrorMessage = err.message;
    } finally {
        if (connection) {
            await connection.close();
            console.log('Connection Closed');
        }
        res.send(responses);
    }

}

module.exports = {
    get_employee_request_info,
    accept_request
}