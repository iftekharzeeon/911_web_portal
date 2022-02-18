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

const get_all_vehicle = async (req, res) => {
    let result;

    let responses = {};

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        let employee_status = 1;

        result = await connection.execute(queries.getAllVehicleQuery, [employee_status], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (result.rows.length) {
            responses.ResponseCode = 1;
            responses.ResponseData = result.rows;
        } else {
            responses.ResponseCode = 0;
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

        result = await connection.execute(queries.getAllUnapprovedEmployeeQuery, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (result.rows.length) {
            responses.ResponseCode = 1;
            responses.ResponseData = result.rows;
        } else {
            responses.ResponseCode = 0;
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

const get_employee_info_for_edit = async (req, res) => {
    let result;

    let responses = {};

    let employee_id;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        employee_id = req.body.employee_id;

        result = await connection.execute(queries.getEmployeeInfoForEditQuery, [employee_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (result.rows.length) {
            responses.ResponseCode = 1;
            responses.ResponseData = result.rows[0];
        } else {
            responses.ResponseCode = 0;
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

const update_employee_info = async (req, res) => {
    let responses = {};

    const employee = req.body;

    console.log(employee);

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
        let location_id = employee.location_id;

        //Employee Info
        let employee_id = employee.employee_id;
        let first_name = employee.first_name;
        let last_name = employee.last_name;
        let phone_number = employee.phone_number;
        let member_type = employee.member_type; //0->Admin 1-> Citizen 2->Employee 3->Customer Care

        //Job Info
        let job_id = employee.job_id;

        //Shift Info
        let shift_id = employee.shift_id;

        //Update Member Table

        let result1 = await connection.execute(queries.updateMemberTableQuery, [first_name, last_name, phone_number, employee_id, member_type])

        //Update Location Table
        let result2 = await connection.execute(queries.updateLocationTableQuery, [block, street, house_no, location_id]);
        
        //Update Employees Table
        let result3 = await connection.execute(queries.updateEmployeesTableQuery, [job_id, shift_id, employee_id]);

        connection.commit();

        if (result1.rowsAffected && result2.rowsAffected && result3.rowsAffected) {
            responses.ResponseCode = 1;
            responses.ResponseText = 'Employee Data Updated';
        } else {
            responses.ResponseCode = 0;
            responses.ResponseText = 'There was an error updating data';
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

const get_request_log = async (req, res) => {
    let result;

    let responses = {};

    let resolved_status = 1;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        result = await connection.execute(queries.getRequestLogQuery, [resolved_status], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (result.rows.length) {
            responses.ResponseCode = 1;
            responses.ResponseData = result.rows;
        } else {
            responses.ResponseCode = 0;
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

const get_request_details = async (req, res) => {
    let result;

    let responses = {};

    let request_id = req.body.request_id;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        result = await connection.execute(queries.requestHistoryDetailsQuery, [request_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (result.rows.length) {
            responses.ResponseCode = 1;
            responses.ResponseData = result.rows;
        } else {
            responses.ResponseCode = 0;
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

const get_ongoing_request_list = async (req, res) => {
    let result;

    let responses = {};

    let resolved_status = 1;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        result = await connection.execute(queries.getOngoingRequestLogQuery, [resolved_status], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (result.rows.length) {
            responses.ResponseCode = 1;
            responses.ResponseData = result.rows;
        } else {
            responses.ResponseCode = 0;
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

const get_department_drivers = async (req, res) => {
    let result;

    let responses = {};

    let department_id;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        department_id = req.body.department_id;

        result = await connection.execute(queries.getDepartmentDriversQuery, [department_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (result.rows.length) {
            responses.ResponseCode = 1;
            responses.ResponseData = result.rows;
        } else {
            responses.ResponseCode = 0;
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

const add_vehicle = async (req, res) => {
    let result;

    let responses = {};

    let department_id;
    let driver_id;
    let service_id;
    let vehicle_id;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        driver_id = req.body.driver_id;
        service_id = req.body.service_id;
        department_id = req.body.department_id;

        //Get a new vehicle id
        await syRegister.getNextId(connection, 5).then(function (data) {
            vehicle_id = data;
        });

        //Insert into vehicle
        result = await connection.execute(queries.insertVehicleQuery, [vehicle_id, driver_id, service_id, department_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        connection.commit();

        if (result.rowsAffected) {
            responses.ResponseCode = 1;
            responses.ResponseText = 'New Vehicle Added';
        } else {
            responses.ResponseCode = 0;
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

const add_service = async (req, res) => {
    let result;

    let responses = {};

    let service_name;
    let service_id;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        service_name = req.body.service_name;

        //Get a new Service id
        await syRegister.getNextId(connection, 6).then(function (data) {
            service_id = data;
        });

        //Insert into Service
        result = await connection.execute(queries.insertServiceQuery, [service_id, service_name], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        connection.commit();

        if (result.rowsAffected) {
            responses.ResponseCode = 1;
            responses.ResponseText = 'New Service Added';
        } else {
            responses.ResponseCode = 0;
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

const add_department = async (req, res) => {
    let result;

    let responses = {};

    let department_name;
    let service_id;
    let block;
    let street;
    let house_no;
    let department_id;
    let location_id;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        department_name = req.body.department_name;
        service_id = req.body.service_id;
        block = req.body.block;
        street = req.body.street;
        house_no = req.body.house_no;

        //Get a new Department id
        await syRegister.getNextId(connection, 7).then(function (data) {
            department_id = data;
        });

        //Get Next Location Id
        await syRegister.getNextId(connection, 2).then(function (data) {
            location_id = data;
        });

        //Insert Into Location Table

        result = await connection.execute(queries.insertLocationQuery, [location_id, block, street, house_no]);

        //Insert into Department
        result = await connection.execute(queries.insertDepartmentQuery, [department_id, department_name, location_id, service_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        connection.commit();

        if (result.rowsAffected) {
            responses.ResponseCode = 1;
            responses.ResponseText = 'New Department Added';
        } else {
            responses.ResponseCode = 0;
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

const add_job = async (req, res) => {
    let result;

    let responses = {};

    let job_title;
    let job_id;
    let salary;
    let department_id;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        job_title = req.body.job_title;
        department_id = req.body.department_id;
        salary = req.body.salary;

        //Get a new Job id
        await syRegister.getNextId(connection, 8).then(function (data) {
            job_id = data;
        });


        //Insert into Job
        result = await connection.execute(queries.insertJobQuery, [job_id, job_title, salary, department_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        connection.commit();

        if (result.rowsAffected) {
            responses.ResponseCode = 1;
            responses.ResponseText = 'New Job Added';
        } else {
            responses.ResponseCode = 0;
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
    admin_login,
    admin_create,
    action_employee,
    get_all_users,
    get_all_employees,
    get_all_customer_care,
    get_all_vehicle,
    get_all_unapproved_employees,
    get_employee_info_for_edit,
    update_employee_info,
    get_request_log,
    get_request_details,
    get_ongoing_request_list,
    get_department_drivers,
    add_vehicle,
    add_service,
    add_department,
    add_job
}