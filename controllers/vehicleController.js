const oracledb = require('oracledb');
const serverInfo = require('../serverInfomation');
const syRegister = require('../util/syRegister');
const queries = require('../util/query');

let connection;

const add_vehicle_to_the_request = async (req, res) => {
    let responses = {};

    const requestObj = req.body;
    let request_id;
    let service_id;
    let service_id_arr;
    let vehicle_occupied_status = 1;//Occupied 0->Free
    let vehicle_accepted_status = 0;//Accepted -1->Pending 1->Finished
    let vehicle_info;
    let vehicle_id;
    let vehicleCount = 0;
    let vehicle_info_obj_arr = [];

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        request_id = requestObj.request_id;
        service_id_arr = requestObj.services;

        responses.ResponseCode = 0;
        responses.VehicleNeeded = service_id_arr.length;

        let i = 0;
        do {
            //Check Service Vehicle
            service_id = service_id_arr[i].service_id;

            
            vehicle_info = await connection.execute(queries.vehicleCheckQuery, [service_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

            if (vehicle_info.rows.length > 0) {
                //Vehicles are available

                vehicle_id = vehicle_info.rows[0].VEHICLE_ID;

                //Update request_employee table vehicle info
                
                let result = await connection.execute(queries.updateRequestVehicleInfoQuery, [vehicle_id, vehicle_accepted_status, request_id, service_id]);

                //Update vehicle_occupied status
                
                let result2 = await connection.execute(queries.updateVehicleOccupiedStatusQuery, [vehicle_occupied_status, vehicle_id]);

                connection.commit();

                vehicleCount++;
                vehicle_info_obj_arr.push(vehicle_info.rows[0]);

                responses.ResponseCode = 1;               

            } else {
                //No available vehicle

            }
            i++;
        } while (i < service_id_arr.length);

        responses.VehicleInfo = vehicle_info_obj_arr;
        responses.VehicleFound = vehicleCount;

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
    add_vehicle_to_the_request
}