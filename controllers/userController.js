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
    let memberEmailExist = 0;
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
        block = user.block;
        street = user.street;
        house_no = user.house_no;
        let latitude = '';
        let longitude = '';

        //User Info
        first_name = user.first_name;
        last_name = user.last_name;
        username = user.username;
        email = user.email;
        phone_number = user.phone_number;
        registration_date = new Date();
        member_type = 1;
        member_password = user.password;

        console.log(user);

        //Check username existence

        usernameExist = await connection.execute(queries.memberCheckUsernameQuery, [username], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        usernameExist = usernameExist.rows.length;

        if (usernameExist === 0) {

            memberEmailExist = await connection.execute(queries.memberCheckEmailQuery, [email], { outFormat: oracledb.OUT_FORMAT_OBJECT });

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
                responses.ResponseText = 'Member With Same Email Already Exists';
            }
        } else {
            //Username Found
            responses.ResponseCode = 0;
            responses.ResponseText = 'Member With Same Username Already Exists';
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

        let username = user.username;
        let userPassword = user.password;

        //User existence check
        memberInfo = await connection.execute(queries.memberCheckUsernameQuery, [username], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (memberInfo.rows.length) {
            memberId = memberInfo.rows[0].MEMBER_ID;

            //Password check
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
    let memberEmailExist;
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

                number_of_employees = await connection.execute(queries.ongoingEmployeeCounterQuery, [request_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

                number_of_employees = number_of_employees.rows[0].COUNTER;

                //Number of vehicle accepted

                number_of_vehicle = await connection.execute(queries.ongoingVehicleCounterQuery, [request_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

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

const user_request_history = async (req, res) => {
    let responses = {};

    const user = req.body;

    let result;

    let member_id;
    let member_exist;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        member_id = user.member_id;

        member_exist = await connection.execute(queries.memberIdCheckQuery, [member_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (member_exist.rows.length > 0) {

            result = await connection.execute(queries.userRequestHistoryListQuery, [member_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

            if (result.rows.length) {
                responses.ResponseCode = 1;
                responses.ResponseText = 'Data found';
                responses.RequestInfos = result.rows;
            } else {
                responses.ResponseCode = 0;
                responses.ResponseText = 'No Data Found';
            }

        } else {
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

const update_user_info = async (req, res) => {
    let responses = {};

    const user = req.body;

    console.log(user);

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        //Location Info
        let block = user.block;
        let street = user.street;
        let house_no = user.house_no;
        let location_id = user.location_id;

        //User Info
        let member_id = user.member_id;
        let first_name = user.first_name;
        let last_name = user.last_name;
        let phone_number = user.phone_number;
        let member_type = 1; //0->Admin 1-> Citizen 2->Employee 3->Customer Care

        //Check Member Existence
        let member_exist = await connection.execute(queries.memberIdCheckQuery, [member_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (member_exist.rows.length > 0) {

            //Update Member Table
            let result1 = await connection.execute(queries.updateMemberTableQuery, [first_name, last_name, phone_number, member_id, member_type])

            //Update Location Table
            let result2 = await connection.execute(queries.updateLocationTableQuery, [block, street, house_no, location_id]);


            connection.commit();

            if (result1.rowsAffected && result2.rowsAffected) {
                responses.ResponseCode = 1;
                responses.ResponseText = 'Member Data Updated';
            } else {
                responses.ResponseCode = 0;
                responses.ResponseText = 'There was an error updating data';
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


module.exports = {
    user_create,
    login_user,
    get_user_request_info,
    user_request_history,
    update_user_info
}