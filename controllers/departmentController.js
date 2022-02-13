const oracledb = require('oracledb');
const serverInfo = require('../serverInfomation');
const syRegister = require('../util/syRegister');
const queries = require('../util/query');

let connection;

const get_departments_service_wise = async (req, res) => {

    let result;

    let responses = {};

    const service = req.body;

    let service_id;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        service_id = service.service_id;
        
        result = await connection.execute(queries.getServiceDepartmentQuery, [service_id], {outFormat: oracledb.OUT_FORMAT_OBJECT});

        if (result) {
            responses = result.rows;
        }

    } catch(err) {
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
    get_departments_service_wise
}