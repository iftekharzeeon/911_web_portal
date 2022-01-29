const oracledb = require('oracledb');
const serverInfo = require('../serverInfomation');
const syRegister = require('../util/syRegister');

let connection;
let result;

let responses = {};

const get_services = async (req, res) => {

    const requestObj = req.body;

    try {
        connection = await oracledb.getConnection({
            user: serverInfo.dbUser,
            password: serverInfo.dbPassword,
            connectionString: serverInfo.connectionString
        });

        console.log('Database Connected');

        

        let getServicesQuery = 'SELECT * FROM service';
        result = await connection.execute(getServicesQuery, [], {outFormat: oracledb.OUT_FORMAT_OBJECT});

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
    get_services
}