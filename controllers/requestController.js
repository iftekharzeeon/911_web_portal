const oracledb = require('oracledb');
const serverInfo = require('../serverInfomation');
const syRegister = require('../util/syRegister');
const queries = require('../util/query');

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
        member_id = requestObj.citizen_id;

        //Check Member Existence
        
        memberExist = await connection.execute(queries.memberIdCheckQuery, [member_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

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
                
                //Insert into Location Table

                result = await connection.execute(queries.insertLocationQuery, [location_id, block, street, house_no]);

            }

            //Get Next Request ID
            await syRegister.getNextId(connection, 3).then(function (data) {
                request_id = data;
            });

            //Insert Into Request Table

            result = await connection.execute(queries.insertRequestQuery, [request_id, request_time, member_id, location_id, resolved_status]);
            
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

                    result = await connection.execute(queries.insertRequestEmployeeQuery, [request_employee_id, request_id, service_id, employee_accepted, vehicle_accepted]);
                } while (m < request_people);
                serviceIndex++;
            } while (serviceIndex < servicesObjectArr.length);

            connection.commit();

            if (result) {
                if (result.rowsAffected == 1) {
                    responses.ResponseCode = 1;
                    responses.ResponseText = 'New Request Added';
                    responses.RequestId = request_id;
                    responses.CitizenId = member_id;
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

    let employee_accepted_status = 0; //Accepted -1->Pending 1-> Finished
    let resolved_status = 0; //Accepted -1-> Pending 1->Finished
    let occupied_status = 1;//Occupied 0-> Free

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

        memberExist = await connection.execute(queries.employeeCheckQuery, [employee_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (memberExist.rows.length === 0) {
            //Employee Not Found
            responses.ResponseCode = 0;
            responses.ResponseText = 'Employee Not Found';

        } else {
            //Check Employee Occupied
            employee_occupied = memberExist.rows[0].OCCUPIED;
            if (employee_occupied) {
                //Employee is occupied

                occupied_info = await connection.execute(queries.longRequestInfoQuery, [employee_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

                responses.ResponseCode = 2;
                responses.ResponseText = 'You are already occupied.';
                responses.RequestInfo = occupied_info.rows[0];

            } else {
                //Employee is free

                //Check if request is available
                
                request_info = await connection.execute(queries.requestAvailableInfoQuery, [service_id, request_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

                console.log(request_info.rows);

                if (request_info.rows.length > 0) {
                    request_employee_id = request_info.rows[0].REQUEST_EMPLOYEE_ID;

                    //Update Employee Accepted Status
                    
                    result = await connection.execute(queries.updateEmployeeAcceptStatusQuery, [employee_accepted_status, employee_id, request_employee_id]);

                    //Update Request Resolved Status
                    
                    result = await connection.execute(queries.updateRequestStatusQuery, [resolved_status, request_id]);

                    //Update Employee Occupied Status
                    
                    result = await connection.execute(queries.updateEmployeeOccupiedStatusQuery, [occupied_status, employee_id]);

                    connection.commit();

                    occupied_info = await connection.execute(queries.longRequestInfoQuery, [employee_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

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

    let employee_accepted_status = 1; //Finished 0->Accepted -1->Pending
    let resolved_status = 1; //Finished 0->Accepted -1-> Pending
    let occupied_status = 0;//Free, 0->Occupied

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

        memberExist = await connection.execute(queries.employeeCheckQuery, [employee_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

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
                
                result = await connection.execute(queries.updateEmployeeAcceptedStatusto1Query, [employee_accepted_status, request_employee_id]);

                //Update Employee Occupied Status

                result = await connection.execute(queries.updateEmployeeOccupiedStatusQuery, [occupied_status, employee_id]);

                connection.commit();

                //Check if all requests been finished
                
                counter = await connection.execute(queries.employeeAcceptCheckQuery, [request_id], {outFormat: oracledb.OUT_FORMAT_OBJECT});
                
                counter = counter.rows[0].COUNTER;

                if (counter > 0) {
                    //There are other employees busy

                } else {
                    //Update Request Table
                    
                    result = await connection.execute(queries.updateRequestStatusQuery, [resolved_status, request_id]);

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