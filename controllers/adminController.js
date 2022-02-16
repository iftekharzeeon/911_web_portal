const oracledb = require('oracledb');
const serverInfo = require('../serverInfomation');
const syRegister = require('../util/syRegister');
const queries = require('../util/query');

const bcrypt = require('bcrypt');
const saltRounds = 10;

let connection;

const admin_login = async (req, res) => {
    let responses = {};
    const admin = req.body;
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

        let username = admin.username;
        let userPassword = admin.password;

        //User existence check
        memberInfo = await connection.execute(queries.adminCheckUsernameQuery, [username], { outFormat: oracledb.OUT_FORMAT_OBJECT });

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
            responses.ResponseText = 'Admin Not Found';
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

const admin_create = async (req, res) => {

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

        //User Info
        first_name = user.first_name;
        last_name = user.last_name;
        username = user.username;
        email = user.email;
        phone_number = user.phone_number;
        registration_date = new Date();
        member_type = 0;
        member_password = user.password;

        console.log(user);

        //Check username existence

        usernameExist = await connection.execute(queries.adminCheckUsernameQuery, [username], { outFormat: oracledb.OUT_FORMAT_OBJECT });

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

                result = await connection.execute(queries.insertLocationQuery, [location_id, block, street, house_no]);

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
                responses.ResponseText = 'Admin With Same Email Already Exists';
            }
        } else {
            //Username Found
            responses.ResponseCode = 0;
            responses.ResponseText = 'Admin With Same Username Already Exists';
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

const action_employee = async (req, res) => {
    let responses = {};

    const employee = req.body;

    let result;

    let employee_id;
    let status;
    let occupied;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        employee_id = employee.employee_id;
        status = employee.approval_status;//0-> Disapproved 1->Approved

        if (status) {
            //Approve the employee
            result = await connection.execute(queries.updateApproveQuery, [status, employee_id]);

            connection.commit();
            if (result.rowsAffected === 1) {
                responses.ResponseCode = 1;
                responses.ResponseText = 'Employee Status Successfully Updated';
            } else {
                responses.ResponseCode = 0;
                responses.ResponseText = 'Employee Status Could Not Be Updated';
            }

        } else {
            //Check if the employee is in persuit or not

            occupied = await connection.execute(queries.employeeOccupiedCheckQuery, [employee_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

            occupied = occupied.rows[0].OCCUPIED;

            if (occupied) {
                //Employee is occupied, can not disapprove

                responses.ResponseCode = 0;
                responses.ResponseText = 'Employee is occupied, can not disapprove now.';

            } else {
                //Employee is not occupied, can approve

                result = await connection.execute(queries.updateApproveQuery, [status, employee_id]);

                connection.commit();
                if (result.rowsAffected === 1) {
                    responses.ResponseCode = 1;
                    responses.ResponseText = 'Employee Status Successfully Updated';
                } else {
                    responses.ResponseCode = 0;
                    responses.ResponseText = 'Employee Status Could Not Be Updated';
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

const get_all_users = async (req, res) => {
    let result;

    let responses = {};

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        result = await connection.execute(queries.getAllUsersQuery, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (result.rows.length) {
            responses.ResponseCode = 1;
            responses.ResponseData = result.rows;
        } else {
            responses.ResponseCode = 0;
        }

    } catch (err) {
        console.log(err);
        res.send(err);
    } finally {
        if (connection) {
            await connection.close();
            console.log('Connection Closed');
        }
        res.send(responses);
    }
}

const get_all_employees = async (req, res) => {
    let result;

    let responses = {};

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        result = await connection.execute(queries.getAllEmployeesQuery, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (result.rows.length) {
            responses.ResponseCode = 1;
            responses.ResponseData = result.rows;
        } else {
            responses.ResponseCode = 0;
        }

    } catch (err) {
        console.log(err);
        res.send(err);
    } finally {
        if (connection) {
            await connection.close();
            console.log('Connection Closed');
        }
        res.send(responses);
    }
}

const get_all_customer_care = async (req, res) => {
    let result;

    let responses = {};

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        result = await connection.execute(queries.getAllCCQuery, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (result.rows.length) {
            responses.ResponseCode = 1;
            responses.ResponseData = result.rows;
        } else {
            responses.ResponseCode = 0;
        }

    } catch (err) {
        console.log(err);
        res.send(err);
    } finally {
        if (connection) {
            await connection.close();
            console.log('Connection Closed');
        }
        res.send(responses);
    }
}

const get_all_unapproved_employees = async (req, res) => {
    let result;

    let responses = {};

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        result = await connection.execute(queries.getAllUnapployedEmployeesQuery, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (result.rows.length) {
            responses.ResponseCode = 1;
            responses.ResponseData = result.rows;
        } else {
            responses.ResponseCode = 0;
        }

    } catch (err) {
        console.log(err);
        res.send(err);
    } finally {
        if (connection) {
            await connection.close();
            console.log('Connection Closed');
        }
        res.send(responses);
    }
}


module.exports = {
    admin_login,
    admin_create,
    action_employee,
    get_all_users,
    get_all_employees,
    get_all_customer_care,
    get_all_unapproved_employees
}