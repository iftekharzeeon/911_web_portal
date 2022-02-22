const oracledb = require('oracledb');
const serverInfo = require('../serverInfomation');
const syRegister = require('../util/syRegister');
const queries = require('../util/query');

const bcrypt = require('bcrypt');
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
    let shift_id;
    let shift_info;

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

                    //Shift check
                    shift_id = memberExist.rows[0].SHIFT_ID;

                    shift_info = await connection.execute(queries.shiftInfoQuery, [shift_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

                    shift_info = shift_info.rows[0].DESCRIPTION;

                    let timeInfo = shift_info.split(":")[0].trim();
                    let dayInfo = shift_info.split(":")[1].trim();

                    let firstDay = dayInfo.split("to")[0].trim();
                    let lastDay = dayInfo.split("to")[1].trim();

                    let startTime = timeInfo.split("to")[0].trim();
                    let endTime = timeInfo.split("to")[1].trim();

                    let current_time = new Date();
                    hour = current_time.getHours();
                    minute = current_time.getMinutes();

                    let nowTime = String(hour) + String(minute);

                    let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    let firstDayNo;
                    let lastDayNo;

                    for (let i = 0; i < days.length; i++) {
                        if (days[i] == firstDay) firstDayNo = i;
                        if (days[i] == lastDay) lastDayNo = i;
                    }

                    if ((nowTime >= startTime && nowTime <= endTime) && (current_time.getDay() >= firstDayNo && current_time.getDay() <= lastDayNo)) {
                        //Running shift
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
                            responses.RequestInfo = request_info_arr;

                        } else {
                            //No same service request available
                            responses.ResponseCode = 0;
                            responses.ResponseText = 'No available request at this moment.';

                        }
                    } else {
                        //Not running shift
                        responses.ResponseCode = 0;
                        responses.ResponseText = 'Current time is not your shift.';
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
    let employee_service_id;
    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        let username = user.username;
        let userPassword = user.password;
        let member_type = user.member_type;
        let service_id = user.service_id;

        //Check Employee Existence
        memberInfo = await connection.execute(queries.employeeCheckUsernameQuery, [username, member_type], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (memberInfo.rows.length) {
            memberId = memberInfo.rows[0].MEMBER_ID;
            employee_id = memberId;

            //Service Id Check
            employee_service_id = await connection.execute(queries.serviceIdCheckQuery, [memberId], { outFormat: oracledb.OUT_FORMAT_OBJECT });
            employee_service_id = employee_service_id.rows[0].SERVICE_ID;

            if (service_id == employee_service_id) {
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

                    if (employeeInfo.rows[0].STATUS) {
                        responses.MemberInfo.LOCATION_INFO = locationInfo.rows[0];
                        responses.MemberInfo.EMPLOYEE_INFO = employeeInfo.rows[0];
                    } else {
                        responses.ResponseCode = -4;
                        responses.ResponseText = 'You are not approved yet. Please contact with your department manager.';
                    }

                } else {
                    //Password Incorrect
                    responses.ResponseCode = -2;
                    responses.ResponseText = 'Incorrect Password';
                }

            } else {
                //Not same service id
                responses.ResponseCode = -3;
                responses.ResponseText = 'Not in this service';
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

const employee_register = async (req, res) => {
    let responses = {};

    const employee = req.body;

    let memberEmailExist;
    let usernameExist;
    let member_id;
    let location_id;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        //Location Info
        let block = employee.block;
        let street = employee.street;
        let house_no = employee.house_no;
        let latitude = '';
        let longitude = '';

        //Employee Info
        let first_name = employee.first_name;
        let last_name = employee.last_name;
        let username = employee.username;
        let email = employee.email;
        let phone_number = employee.phone_number;
        let registration_date = new Date();
        let member_type = employee.member_type; //1-> Citizen 2->Employee 3->Customer Care
        let member_password = employee.password;
        let occupied = 0; //Free 1->Occupied
        let job_id = employee.job_id;
        let shift_id = employee.shift_id;
        let status = 0; //Unapproved 1->Approved

        console.log(employee);

        //Check username existence

        usernameExist = await connection.execute(queries.employeeCheckUsernameQuery, [username, member_type], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        usernameExist = usernameExist.rows.length;

        if (usernameExist === 0) {

            memberEmailExist = await connection.execute(queries.employeeCheckEmailQuery, [email], { outFormat: oracledb.OUT_FORMAT_OBJECT });

            memberEmailExist = memberEmailExist.rows.length;

            if (memberEmailExist === 0) {

                //Get Next Location Id
                await syRegister.getNextId(connection, 2).then(function (data) {
                    location_id = data;
                });

                //Get Next Member Id
                await syRegister.getNextId(connection, 1).then(function (data) {
                    member_id = data;
                });

                //Insert Into Location Table

                result = await connection.execute(queries.insertLocationQuery, [location_id, block, street, house_no, latitude, longitude]);

                //Insert Into Member Table

                result = await connection.execute(queries.insertMemberQuery, [member_id, first_name, last_name, email, phone_number, registration_date, member_type, location_id, username]);

                //Insert Into Employee Table

                result = await connection.execute(queries.insertEmployeeQuery, [member_id, registration_date, occupied, job_id, shift_id, status], { outFormat: oracledb.OUT_FORMAT_OBJECT });

                //Insert Password Info
                let salt = '';
                let password_key = '';
                salt = bcrypt.genSaltSync(saltRounds);
                password_key = bcrypt.hashSync(member_password, salt);

                result = await connection.execute(queries.memberPasswordQuery, [member_id, member_id, password_key]);
                connection.commit();

                if (result) {
                    if (result.rowsAffected == 1) {
                        responses.ResponseCode = 1;
                        responses.ResponseText = 'Sign up successful';
                        responses.MemberId = member_id;
                    } else {
                        responses.ResponseCode = -1;
                        responses.ResponseText = 'Something Went Wrong.';
                    }
                } else {
                    responses.ResponseCode = -1;
                    responses.ResponseText = 'Something Went Wrong. Data Could Not Be Inserted';
                }
            } else {
                //Email Found
                responses.ResponseCode = 0;
                responses.ResponseText = 'Employee With Same Email Already Exists';
            }
        } else {
            //Username Found
            responses.ResponseCode = 0;
            responses.ResponseText = 'Employee With Same Username Already Exists';
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

const employee_request_history = async (req, res) => {
    let responses = {};

    const employee = req.body;

    let result;

    let employee_id;
    let member_exist;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        employee_id = employee.employee_id;

        member_exist = await connection.execute(queries.employeeCheckQuery, [employee_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (member_exist.rows.length > 0) {

            result = await connection.execute(queries.employeeRequestHistoryListQuery, [employee_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

            if (result.rows.length) {
                responses.ResponseCode = 1;
                responses.ResponseText = 'Data found';
                responses.RequestInfos = result.rows;
            } else {
                responses.ResponseCode = 0;
                responses.ResponseText = 'No Data found';
            }

        } else {
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

const password_change_employee = async (req, res) => {
    let responses = {};
    const user = req.body;
    let memberId;
    let memberInfo;
    let passwordKey;
    let locationInfo;
    let employeeInfo;
    let employee_id;
    let employee_service_id;
    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        let username = user.username;
        let userPassword = user.new_password;
        let member_type = user.member_type;

        //Check Employee Existence
        memberInfo = await connection.execute(queries.employeeCheckUsernameQuery, [username, member_type], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (memberInfo.rows.length) {
            memberId = memberInfo.rows[0].MEMBER_ID;
            employee_id = memberId;
            let member_password_key = memberId;

            let salt = '';
            let password_key = '';
            salt = bcrypt.genSaltSync(saltRounds);
            password_key = bcrypt.hashSync(userPassword, salt);

            result = await connection.execute(queries.passwordUpdateQuery, [password_key, member_password_key]);
            connection.commit();

            if (result.rowsAffected) {
                responses.ResponseCode = 1;
                responses.ResponseText = 'Password Updated Successfully';
            } else {
                responses.ResponseCode = 0;
                responses.ResponseText = 'There was an error updating the password';
            }

        } else {
            //Employee Not Found
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
    login_employee,
    employee_register,
    employee_request_history,
    password_change_employee
}