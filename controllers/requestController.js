const oracledb = require('oracledb');
const serverInfo = require('../serverInfomation');
const syRegister = require('../util/syRegister');

let connection;
let result;
let memberExist;
let responses = {};
let request_id;

const add_request = async (req, res) => {

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
            location_id = memberExist.rows[0].LOCATION_ID;

            //Get Next Request ID
            await syRegister.getNextId(connection, 3).then(function (data) {
                request_id = data;
            });

            //Insert Into Request Table
            let insertRequestQuery = 'INSERT INTO request(request_id, request_time, citizen_id, location_id) ' +
                'VALUES(:request_id, :request_time, :citizen_id, :location_id)';

            result = await connection.execute(insertRequestQuery, [request_id, request_time, citizen_id, location_id]);
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
    add_request
}