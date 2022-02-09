const oracledb = require('oracledb');
const serverInfo = require('../serverInfomation');
const syRegister = require('../util/syRegister');

const bcrypt = require('bcrypt');
const saltRounds = 10;

let connection;
let result;

const user_create = async (req, res) => {

    let responses = {};

    const user = req.body;
    let memberExist = 0;
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
        block = user.block;
        street = user.street;
        house_no = user.house_no;

        //User Info
        first_name = user.first_name;
        last_name = user.last_name;
        email = user.email;
        phone_number = user.phone_number;
        registration_date = new Date();
        member_type = 1;
        member_password = user.password;

        console.log(user);

        let memberCheckQuery = 'SELECT * FROM member WHERE email = :email';
        memberExist = await connection.execute(memberCheckQuery, [email], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        memberExist = memberExist.rows.length;

        if (memberExist === 0) {

            //Get Next Location Id
            await syRegister.getNextId(connection, 2).then(function (data) {
                location_id = data;
            });

            //Get Next Member Id
            await syRegister.getNextId(connection, 1).then(function (data) {
                member_id = data;
            });

            //Insert Into Location Table
            let insertLocationQuery = 'INSERT INTO location(location_id, block, street, house_no) VALUES(:location_id, :block, :street, :house_no)';

            result = await connection.execute(insertLocationQuery, [location_id, block, street, house_no]);

            //Insert Into Member Table
            let insertMemberQuery = 'INSERT INTO member(member_id, first_name, last_name, email, phone_number, registration_date, member_type, location_id) ' +
                ' VALUES(:member_id, :first_name, :last_name, :email, :phone_number, :registration_date, :member_type, :location_id)';

            result = await connection.execute(insertMemberQuery, [member_id, first_name, last_name, email, phone_number, registration_date, member_type, location_id]);

            //Insert Password Info
            let salt = '';
            let password_key = '';
            salt = bcrypt.genSaltSync(saltRounds);
            password_key = bcrypt.hashSync(member_password, salt);
            let memberPasswordQuery = 'INSERT INTO member_password(member_password_id, member_id, password_key) VALUES(:member_id, :member_id, :password_key)';

            result = await connection.execute(memberPasswordQuery, [member_id, member_id, password_key]);
            connection.commit();

            if (result) {
                if (result.rowsAffected == 1) {
                    responses.ResponseCode = 1;
                    responses.ResponseText = 'New Member Added';
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
            //Member Not Found
            responses.ResponseCode = 0;
            responses.ResponseText = 'Member Already Exists';
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
};

const login_user = async (req, res) => {
    let responses = {};
    const user = req.body;
    let memberId;
    let memberInfo;
    let passwordKey;
    let locationInfo;
    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        let userEmail = user.email;
        let userPassword = user.password;

        let memberCheckQuery = 'SELECT * FROM member WHERE email = :userEmail AND member_type = 1';
        memberInfo = await connection.execute(memberCheckQuery, [userEmail], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (memberInfo.rows.length) {
            memberId = memberInfo.rows[0].MEMBER_ID;
            let passwordCheckQuery = 'SELECT password_key FROM member_password WHERE member_id = :memberId';
            passwordKey = await connection.execute(passwordCheckQuery, [memberId], { outFormat: oracledb.OUT_FORMAT_OBJECT });

            passwordKey = passwordKey.rows[0].PASSWORD_KEY;

            if (bcrypt.compareSync(userPassword, passwordKey)) {
                responses.ResponseCode = 1;
                responses.ResponseText = 'Login Successful';
                responses.MemberId = memberId;
                responses.MemberInfo = memberInfo.rows[0];
                let location_id = memberInfo.rows[0].LOCATION_ID;
                let locationQuery = 'SELECT * FROM location WHERE location_id = :location_id';
                locationInfo = await connection.execute(locationQuery, [location_id], {outFormat: oracledb.OUT_FORMAT_OBJECT});
                responses.MemberInfo.LOCATION_INFO = locationInfo.rows[0];
            } else {
                //Password Incorrect
                responses.ResponseCode = -2;
                responses.ResponseText = 'Incorrect Password';
            }

        } else {
            //Member Not Found
            responses.ResponseCode = 0;
            responses.ResponseText = 'Member Not Found';
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

const get_user_request_info = async (req, res) => {

    let responses = {};

    const requestObj = req.body;
    let request_id;
    let member_id;
    let memberExist;
    let requestCounter;
    let employee_dept_id;
    let employee_service_id;
    let employee_job_id;
    let employee_info;
    let request_employee_info;
    let request_info;
    let employee_occupied;
    let resolved_status;
    let number_of_request;
    let number_of_employees;
    let number_of_vehicle;
    let information;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        member_id = requestObj.member_id;

        //Check Member Existence
        let memberCheckQuery = 'SELECT * FROM member WHERE member_id = :member_id AND member_type = 1';
        memberExist = await connection.execute(memberCheckQuery, [member_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (memberExist.rows.length === 0) {
            //Member Not Found
            responses.ResponseCode = 0;
            responses.ResponseText = 'Member Not Found';

        } else {

            //Check for ongoing request
            let ongoingRequestCheckQuery = 'SELECT * FROM request WHERE citizen_id = :member_id AND (resolved_status = -1 OR resolved_status = 0)';
            request_info = await connection.execute(ongoingRequestCheckQuery, [member_id], {outFormat: oracledb.OUT_FORMAT_OBJECT});
            
            if (request_info.rows.length) {
                resolved_status = request_info.rows[0].RESOLVED_STATUS;
                request_id = request_info.rows[0].REQUEST_ID;

                //Number of request made
                let requestCounterQuery = 'SELECT COUNT(*) AS COUNTER FROM request_employee WHERE request_id = :request_id';
                number_of_request = await connection.execute(requestCounterQuery, [request_id], {outFormat: oracledb.OUT_FORMAT_OBJECT});

                number_of_request = number_of_request.rows[0].COUNTER;

                //Number of employee accepted
                let employeeCounterQuery= 'SELECT COUNT(*) AS COUNTER FROM request_employee WHERE request_id = :request_id AND (employee_accepted = 0 OR employee_accepted = 1)';
                number_of_employees = await connection.execute(employeeCounterQuery, [request_id], {outFormat: oracledb.OUT_FORMAT_OBJECT});

                number_of_employees = number_of_employees.rows[0].COUNTER;

                //Number of vehicle accepted
                let vehicleCounterQuery = 'SELECT DISTINCT COUNT(*) AS COUNTER FROM request_employee WHERE request_id = :request_id AND (vehicle_accepted = 0 OR vehicle_accepted = 1)';
                number_of_vehicle = await connection.execute(vehicleCounterQuery, [request_id], {outFormat: oracledb.OUT_FORMAT_OBJECT});

                number_of_vehicle = number_of_vehicle.rows[0].COUNTER;

                //Get Employees and Vehicle Information
                let informationQuery = `SELECT R.REQUEST_TIME, RE.REQUEST_EMPLOYEE_ID, RE.EMPLOYEE_ID, RE.SERVICE_ID, RE.VEHICLE_ID, E.HIRE_DATE, V.VEHICLE_TYPE, V.DRIVER_ID, J.JOB_ID, J.JOB_TITLE, D.DEPARTMENT_NAME, D.DEPARTMENT_TYPE, S.SERVICE_ID, S.DESCRIPTION, M.FIRST_NAME || ' ' || M.LAST_NAME AS EMPLOYEE_NAME, M.PHONE_NUMBER `
                'FROM REQUEST_EMPLOYEE RE, EMPLOYEES E, VEHICLE V, JOBS J, DEPARTMENTS D, SERVICE S, MEMBER M, REQUEST R '
                'WHERE RE.EMPLOYEE_ID = E.MEMBER_ID ' +
                'AND RE.REQUEST_ID = R.REQUEST_ID '
                'AND RE.VEHICLE_ID = V.VEHICLE_ID ' +
                'AND E.MEMBER_ID = M.MEMBER_ID ' +
                'AND E.JOB_ID = J.JOB_ID ' +
                'AND J.DEPARTMENT_ID = D.DEPARTMENT_ID ' +
                'AND D.SERVICE_ID = S.SERVICE_ID ' +
                'AND R.REQUEST_ID = :request_id;';

                information = await connection.execute(informationQuery, [], {outFormat: oracledb.OUT_FORMAT_OBJECT});
                responses.RequestInformation = information.rows[0];

            } else {
                //No ongoing request

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
    user_create,
    login_user,
    get_user_request_info
}