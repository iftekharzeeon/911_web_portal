const oracledb = require('oracledb');
const serverInfo = require('../serverInfomation');
const syRegister = require('../util/syRegister');

let connection;

const add_request = async (req, res) => {

    let responses = {};

    let request_id;
    let result;
    let memberExist;
    let isMyLocation;
    let location_id;
    let servicesObjectArr;
    let locationObj;

    let resolved_status = -1; //Pending 0->Accepted 1-> Finished
    let employee_accepted = -1; //Pending 0->Accepted 1-> Finished
    let vehicle_accepted = -1; //Pending 0->Accepted 1-> Finished

    let service_id;
    let request_people;

    let request_employee_id;

    const requestObj = req.body;
    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        let request_time = new Date();
        citizen_id = requestObj.citizen_id;

        //Check Member Existence
        let memberCheckQuery = 'SELECT * FROM member WHERE member_id = :citizen_id';
        memberExist = await connection.execute(memberCheckQuery, [citizen_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (memberExist.rows.length === 0) {
            responses.ResponseCode = 0;
            responses.ResponseText = 'Member Not Found';
        } else {

            isMyLocation = requestObj.is_my_location;

            servicesObjectArr = requestObj.services;

            if (isMyLocation) {
                location_id = requestObj.location_id;

            } else {
                //Add the New Location

                //Get Location Info
                locationObj = requestObj.location_obj;

                block = locationObj.block;
                street = locationObj.street;
                house_no = locationObj.house_no;

                //Get Next Location Id
                await syRegister.getNextId(connection, 2).then(function (data) {
                    location_id = data;
                });

                let insertLocationQuery = 'INSERT INTO location(location_id, block, street, house_no) VALUES(:location_id, :block, :street, :house_no)';

                result = await connection.execute(insertLocationQuery, [location_id, block, street, house_no]);

            }

            //Get Next Request ID
            await syRegister.getNextId(connection, 3).then(function (data) {
                request_id = data;
            });

            //Insert Into Request Table
            let insertRequestQuery = 'INSERT INTO request(request_id, request_time, citizen_id, location_id, resolved_status) ' +
                'VALUES(:request_id, :request_time, :citizen_id, :location_id, :resolved_status)';

            result = await connection.execute(insertRequestQuery, [request_id, request_time, citizen_id, location_id, resolved_status]);
            
            //Get All The Services
            let serviceIndex = 0;
            do {
                service_id = servicesObjectArr[serviceIndex].service_id;
                request_people = servicesObjectArr[serviceIndex].request_people;
                let m = 0;
                do {
                    await syRegister.getNextId(connection, 4).then(function (data) {
                        request_employee_id = data;
                    });

                    console.log(request_employee_id);
                    m++;

                    // Insert Into Request Employee Table
                    let insertRequestEmployeeQuery = 'INSERT INTO request_employee(request_employee_id, request_id, service_id, employee_accepted, vehicle_accepted) ' +
                        'VALUES(:request_employee_id, :request_id, :service_id, :employee_accepted, :vehicle_accepted)';

                    result = await connection.execute(insertRequestEmployeeQuery, [request_employee_id, request_id, service_id, employee_accepted, vehicle_accepted]);
                } while (m < request_people);
                serviceIndex++;
            } while (serviceIndex < servicesObjectArr.length);

            connection.commit();

            if (result) {
                if (result.rowsAffected == 1) {
                    responses.ResponseCode = 1;
                    responses.ResponseText = 'New Request Added';
                    responses.RequestId = request_id;
                    responses.CitizenId = citizen_id;
                } else {
                    responses.ResponseCode = -1;
                    responses.ResponseText = 'Something Went Wrong.';
                }
            } else {
                responses.ResponseCode = -1;
                responses.ResponseText = 'Something Went Wrong. Data Could Not Be Inserted';
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

                let requestInfoQuery = `SELECT RE.REQUEST_EMPLOYEE_ID, R.REQUEST_ID, R.REQUEST_TIME, M.FIRST_NAME || ' ' || M.LAST_NAME AS CITIZEN_NAME, L.BLOCK, L.HOUSE_NO, L.STREET, M.MEMBER_ID AS CITIZEN_ID, L.LOCATION_ID ` +
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

                    let requestInfoQuery = `SELECT RE.REQUEST_EMPLOYEE_ID, R.REQUEST_ID, R.REQUEST_TIME, M.FIRST_NAME || ' ' || M.LAST_NAME AS CITIZEN_NAME, L.BLOCK, L.HOUSE_NO, L.STREET, M.MEMBER_ID AS CITIZEN_ID, L.LOCATION_ID ` +
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

const finish_request = async (req, res) => {
    let responses = {};
    let result;

    const requestObj = req.body;
    let employee_id;
    let request_id;
    let request_employee_id;
    let employee_occupied;
    let request_info;
    let occupied_info;
    let counter;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        employee_id = requestObj.employee_id;
        request_id = requestObj.request_id;
        request_employee_id = requestObj.request_employee_id;

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

                //Update Request Employee Accept Status
                let updateEmployeeAcceptedStatusQuery = 'UPDATE request_employee SET employee_accepted = 1 WHERE request_employee_id = :request_employee_id';
                result = await connection.execute(updateEmployeeAcceptedStatusQuery, [request_employee_id]);

                //Update Employee Occupied Status
                let updateEmployeeOccupiedStatusQuery = 'UPDATE employees SET occupied = 0 WHERE member_id = :employee_id';
                result = await connection.execute(updateEmployeeOccupiedStatusQuery, [employee_id]);

                connection.commit();

                //Check if all requests been finished
                let employeeAcceptCheckQuery = 'SELECT COUNT(*) AS COUNTER FROM request_employee WHERE request_id = :request_id AND (employee_accepted = -1 OR employee_accepted = 0)';
                counter = await connection.execute(employeeAcceptCheckQuery, [request_id], {outFormat: oracledb.OUT_FORMAT_OBJECT});
                
                counter = counter.rows[0].COUNTER;

                if (counter > 0) {
                    //There

                } else {
                    //Update Request Table
                    let updateRequestStatusQuery = 'UPDATE request SET resolved_status = 1 WHERE request_id = :request_id';
                    result = await connection.execute(updateRequestStatusQuery, [request_id]);

                    connection.commit();
                }

                responses.ResponseCode = 1;
                responses.ResponseText = 'You have successfully finished the request.';

            } else {
                //Employee is free
                responses.ResponseCode = 0;
                responses.ResponseText = 'You are not occupied. Please accept a request first.';
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
    add_request,
    accept_request,
    finish_request
}