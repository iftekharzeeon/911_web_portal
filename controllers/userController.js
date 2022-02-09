const oracledb = require('oracledb');
const serverInfo = require('../serverInfomation');
const syRegister = require('../util/syRegister');
const queries = require('../util/query');

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

        memberExist = await connection.execute(queries.memberEmailCheckQuery, [email], { outFormat: oracledb.OUT_FORMAT_OBJECT });

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

            result = await connection.execute(queries.insertLocationQuery, [location_id, block, street, house_no]);

            //Insert Into Member Table

            result = await connection.execute(queries.insertMemberQuery, [member_id, first_name, last_name, email, phone_number, registration_date, member_type, location_id]);

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

        memberInfo = await connection.execute(queries.memberEmailCheckQuery, [userEmail], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (memberInfo.rows.length) {
            memberId = memberInfo.rows[0].MEMBER_ID;

            passwordKey = await connection.execute(queries.passwordCheckQuery, [memberId], { outFormat: oracledb.OUT_FORMAT_OBJECT });

            passwordKey = passwordKey.rows[0].PASSWORD_KEY;

            if (bcrypt.compareSync(userPassword, passwordKey)) {
                responses.ResponseCode = 1;
                responses.ResponseText = 'Login Successful';
                responses.MemberId = memberId;
                responses.MemberInfo = memberInfo.rows[0];
                let location_id = memberInfo.rows[0].LOCATION_ID;

                locationInfo = await connection.execute(queries.locationQuery, [location_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
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
            
            request_info = await connection.execute(queries.ongoingRequestCheckQuery, [member_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

            if (request_info.rows.length) {
                resolved_status = request_info.rows[0].RESOLVED_STATUS;
                request_id = request_info.rows[0].REQUEST_ID;

                //Number of request made
                
                number_of_request = await connection.execute(requestCounterQuery, [request_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

                number_of_request = number_of_request.rows[0].COUNTER;

                //Number of employee accepted
                
                number_of_employees = await connection.execute(queries.employeeCounterQuery, [request_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

                number_of_employees = number_of_employees.rows[0].COUNTER;

                //Number of vehicle accepted
                
                number_of_vehicle = await connection.execute(queries.vehicleCounterQuery, [request_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

                number_of_vehicle = number_of_vehicle.rows[0].COUNTER;

                if (number_of_employees && number_of_vehicle) {
                    //Get Employees and Vehicle Information

                    information = await connection.execute(queries.informationQuery, [request_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
                    responses.RequestInformation = information.rows[0];
                    responses.ResponseCode = 1;
                    responses.ResponseText = 'Data found';
                } else {
                    responses.RequestInformation = {};
                    responses.ResponseText = 'No Data Found';
                    responses.ResponseCode = 0;
                }

                numbers = {
                    "NumberOfRequest": number_of_request,
                    "NumberOfEmployees": number_of_employees,
                    "NumberOfVehicle": number_of_vehicle
                }

                responses.Numbers = numbers;

            } else {
                //No ongoing request
                responses.ResponseCode = -2;
                responses.ResponseText = 'You have no on going requests.'

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