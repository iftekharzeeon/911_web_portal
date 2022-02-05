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

module.exports = {
    add_request
}