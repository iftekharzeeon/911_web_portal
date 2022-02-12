const oracledb = require('oracledb');
const serverInfo = require('../serverInfomation');
const queries = require('../util/query');

const bcrypt = require('bcrypt');
const e = require('express');
const saltRounds = 10;

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
    let request_info_arr = [];

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        employee_id = requestObj.employee_id;

        //Check Employee Existence
        
        memberExist = await connection.execute(queries.employeeCheckQuery, [employee_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (memberExist.rows.length === 0) {
            //Employee Not Found
            responses.ResponseCode = 0;
            responses.ResponseText = 'Employee Not Found';

        } else {
            //Check if Occupied
            employee_occupied = memberExist.rows[0].OCCUPIED;
            if (employee_occupied) {

                //Employee is occupied

                request_info = await connection.execute(queries.occupiedInfoQuery, [employee_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

                responses.ResponseCode = 2;
                responses.ResponseText = 'You have a request on going';
                responses.RequestInfo = request_info.rows[0];

            } else {
                //Employee is free
                
                requestCounter = await connection.execute(queries.requestCheckQuery, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

                requestCounter = requestCounter.rows[0].COUNTER;
                console.log(requestCounter);

                if (requestCounter > 0) {
                    //Check if same service

                    employee_info = await connection.execute(queries.getEmployeeInfoQuery, [employee_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

                    employee_dept_id = employee_info.rows[0].DEPARTMENT_ID;
                    employee_job_id = employee_info.rows[0].JOB_ID;
                    employee_service_id = employee_info.rows[0].SERVICE_ID;

                    request_employee_info = await connection.execute(queries.getRequestIdQuery, [employee_service_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
                    console.log(request_employee_info);
                    if (request_employee_info.rows.length > 0) {

                        let i = 0;
                        do {
                            request_id = request_employee_info.rows[i].REQUEST_ID;

                            request_info = await connection.execute(queries.requestInfoQuery, [request_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
                            i++;
                            console.log(request_info.rows);
                            request_info_arr.push(request_info.rows[0]);
                        } while (i < request_employee_info.rows.length);

                        responses.ResponseCode = 1;
                        responses.ResponseText = 'There are pending requests at the moment. Please respond.';
                        responses.EmployeeServiceId = employee_service_id;
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

const login_employee = async (req, res) => {
    let responses = {};
    const user = req.body;
    let memberId;
    let memberInfo;
    let passwordKey;
    let locationInfo;
    let employeeInfo;
    let employee_id;
    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        let username = user.username;
        let userPassword = user.password;

        //Check Employee Existence
        memberInfo = await connection.execute(queries.employeeCheckUsernameQuery, [username], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (memberInfo.rows.length) {
            memberId = memberInfo.rows[0].MEMBER_ID;
            employee_id = memberId;

            //Password Check
            passwordKey = await connection.execute(queries.passwordCheckQuery, [memberId], { outFormat: oracledb.OUT_FORMAT_OBJECT });

            passwordKey = passwordKey.rows[0].PASSWORD_KEY;

            if (bcrypt.compareSync(userPassword, passwordKey)) {
                responses.ResponseCode = 1;
                responses.ResponseText = 'Login Successful';
                responses.MemberId = memberId;
                responses.MemberInfo = memberInfo.rows[0];

                let location_id = memberInfo.rows[0].LOCATION_ID;

                locationInfo = await connection.execute(queries.locationQuery, [location_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

                employeeInfo = await connection.execute(queries.getEmployeeInfoQuery, [employee_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

                responses.MemberInfo.LOCATION_INFO = locationInfo.rows[0];
                responses.MemberInfo.EMPLOYEE_INFO = employeeInfo.rows[0];

            } else {
                //Password Incorrect
                responses.ResponseCode = -2;
                responses.ResponseText = 'Incorrect Password';
            }

        } else {
            //Member Not Found
            responses.ResponseCode = 0;
            responses.ResponseText = 'Employee Not Found';
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
    login_employee
}